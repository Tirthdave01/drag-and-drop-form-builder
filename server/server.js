const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { generateToken, authMiddleware } = require('./auth');
const { validateAnswers } = require('./validator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// SSE Clients mapped by formId -> Set of res objects
const sseClients = new Map();

function notifyFormSubscribers(formId, data) {
  const clients = sseClients.get(String(formId));
  if (clients) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      res.write(payload);
    }
  }
}

// Helper to generate readable public slugs
function generateSlug() {
  return crypto.randomBytes(4).toString('hex'); // 8 hex characters, e.g. "a3f89b12"
}

// -------------------------------------------------------------
// Auth Endpoints
// -------------------------------------------------------------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email.toLowerCase().trim(), passwordHash, name || 'Creator']
    );

    const user = { id: result.lastInsertRowid, email: email.toLowerCase().trim(), name: name || 'Creator' };
    const token = generateToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Failed to register user.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userData = { id: user.id, email: user.email, name: user.name };
    const token = generateToken(userData);
    return res.json({ user: userData, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Failed to log in.' });
  }
});

// Quick Demo Login for instant testing without registration
app.post('/api/auth/demo', async (req, res) => {
  try {
    let demoUser = await db.get('SELECT * FROM users WHERE email = ?', ['demo@formbuilder.local']);
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('demo123456', 10);
      const result = await db.run(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        ['demo@formbuilder.local', passwordHash, 'Demo Creator']
      );
      demoUser = { id: result.lastInsertRowid, email: 'demo@formbuilder.local', name: 'Demo Creator' };

      // Pre-seed a sample form with answers for demonstration
      const sampleSlug = 'demo1234';
      const sampleFields = [
        { id: 'f1', type: 'text', label: 'Full name', placeholder: 'Jane Doe', required: true },
        { id: 'f2', type: 'email', label: 'Email address', placeholder: 'jane@example.com', required: true },
        { id: 'f3', type: 'dropdown', label: 'Desired Position', options: ['Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'UI/UX Designer'], required: true },
        { id: 'f4', type: 'radio', label: 'Experience Level', options: ['Junior (0-2 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5+ yrs)'], required: true },
        { id: 'f5', type: 'checkbox', label: 'Skills & Proficiencies', options: ['React', 'Node.js', 'TypeScript', 'SQL', 'Docker', 'GraphQL'], required: false },
        { id: 'f6', type: 'number', label: 'Expected Salary (k USD)', min: 30, max: 250, required: false },
        { id: 'f7', type: 'date', label: 'Available Start Date', required: false },
        {
          id: 'f8',
          type: 'longtext',
          label: 'Why do you want to join our team?',
          placeholder: 'Tell us a bit about your motivations...',
          required: false,
          condition: { fieldId: 'f3', operator: 'isNotEmpty' }
        }
      ];

      const formRes = await db.run(
        `INSERT INTO forms (user_id, title, description, fields_json, theme_json, settings_json, public_slug)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          demoUser.id,
          'Tech Fellowship & Internship Application',
          'Join our engineering fellowship! Fill out the application below to be considered for our upcoming cohort.',
          JSON.stringify(sampleFields),
          JSON.stringify({ primaryColor: '#4f46e5', font: 'Inter', headerStyle: 'modern' }),
          JSON.stringify({ submitButtonText: 'Submit Application', successMessage: 'Thank you! Your application has been received.' }),
          sampleSlug
        ]
      );

      // Seed 3 realistic responses
      const formId = formRes.lastInsertRowid;
      const sampleResponses = [
        {
          f1: 'Alice Smith',
          f2: 'alice@example.com',
          f3: 'Frontend Developer',
          f4: 'Mid-level (3-5 yrs)',
          f5: ['React', 'TypeScript'],
          f6: 95,
          f7: '2026-12-01',
          f8: 'I love building intuitive, snappy client interfaces.'
        },
        {
          f1: 'Bob Martinez',
          f2: 'bob.m@company.org',
          f3: 'Backend Developer',
          f4: 'Senior (5+ yrs)',
          f5: ['Node.js', 'SQL', 'Docker'],
          f6: 130,
          f7: '2026-11-20',
          f8: 'Passionate about scalable distributed backend architectures.'
        },
        {
          f1: 'Carol Zhang',
          f2: 'carol@designhub.io',
          f3: 'UI/UX Designer',
          f4: 'Junior (0-2 yrs)',
          f5: ['React'],
          f6: 70,
          f7: '2026-12-15',
          f8: 'Bridging the gap between high fidelity design and production code.'
        }
      ];

      for (const resItem of sampleResponses) {
        await db.run(
          'INSERT INTO responses (form_id, answers_json) VALUES (?, ?)',
          [formId, JSON.stringify(resItem)]
        );
      }
    }

    const userData = { id: demoUser.id, email: demoUser.email, name: demoUser.name };
    const token = generateToken(userData);
    return res.json({ user: userData, token });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ message: 'Failed demo login.' });
  }
});

// Current User Me
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching user profile.' });
  }
});

// -------------------------------------------------------------
// Forms Endpoints
// -------------------------------------------------------------

// List all forms created by current user (with response count)
app.get('/api/forms', authMiddleware, async (req, res) => {
  try {
    const forms = await db.query(
      `SELECT f.id, f.title, f.description, f.public_slug, f.created_at, f.updated_at,
              COUNT(r.id) as response_count
       FROM forms f
       LEFT JOIN responses r ON f.id = r.form_id
       WHERE f.user_id = ?
       GROUP BY f.id
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    return res.json({ forms });
  } catch (err) {
    console.error('Error fetching forms:', err);
    return res.status(500).json({ message: 'Failed to retrieve forms.' });
  }
});

// Create a new form
app.post('/api/forms', authMiddleware, async (req, res) => {
  try {
    const { title, description, fields, theme, settings } = req.body;
    const publicSlug = generateSlug();

    const defaultFields = fields || [
      { id: 'f1', type: 'text', label: 'Full name', placeholder: 'Enter your name', required: true },
      { id: 'f2', type: 'email', label: 'Email address', placeholder: 'your@email.com', required: true }
    ];

    const result = await db.run(
      `INSERT INTO forms (user_id, title, description, fields_json, theme_json, settings_json, public_slug)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title || 'Untitled Form',
        description || '',
        JSON.stringify(defaultFields),
        JSON.stringify(theme || { primaryColor: '#4f46e5', font: 'Inter', headerStyle: 'modern' }),
        JSON.stringify(settings || { submitButtonText: 'Submit Form', successMessage: 'Your response has been recorded.' }),
        publicSlug
      ]
    );

    const newForm = {
      id: result.lastInsertRowid,
      title: title || 'Untitled Form',
      description: description || '',
      fields: defaultFields,
      theme: theme || { primaryColor: '#4f46e5', font: 'Inter', headerStyle: 'modern' },
      settings: settings || { submitButtonText: 'Submit Form', successMessage: 'Your response has been recorded.' },
      public_slug: publicSlug
    };

    return res.status(201).json({ form: newForm });
  } catch (err) {
    console.error('Error creating form:', err);
    return res.status(500).json({ message: 'Failed to create form.' });
  }
});

// Public Form Fetch by Slug (No Auth needed)
app.get('/api/forms/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const form = await db.get(
      'SELECT id, title, description, fields_json, theme_json, settings_json, public_slug FROM forms WHERE public_slug = ?',
      [slug]
    );

    if (!form) {
      return res.status(404).json({ message: 'Form not found or link has expired.' });
    }

    return res.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        fields: JSON.parse(form.fields_json || '[]'),
        theme: JSON.parse(form.theme_json || '{}'),
        settings: JSON.parse(form.settings_json || '{}'),
        public_slug: form.public_slug
      }
    });
  } catch (err) {
    console.error('Error getting public form:', err);
    return res.status(500).json({ message: 'Failed to load form.' });
  }
});

// Alternative route for slug fetch matching syllabus table GET /api/forms/:slug
app.get('/api/forms/:identifier', async (req, res, next) => {
  // If numeric and contains auth header, might be owner requesting by ID
  const isNumeric = /^\d+$/.test(req.params.identifier);
  if (isNumeric && req.headers.authorization) {
    return authMiddleware(req, res, async () => {
      try {
        const form = await db.get('SELECT * FROM forms WHERE id = ? AND user_id = ?', [req.params.identifier, req.user.id]);
        if (!form) return res.status(404).json({ message: 'Form not found' });
        return res.json({
          form: {
            ...form,
            fields: JSON.parse(form.fields_json || '[]'),
            theme: JSON.parse(form.theme_json || '{}'),
            settings: JSON.parse(form.settings_json || '{}')
          }
        });
      } catch (e) {
        return res.status(500).json({ message: 'Error retrieving form' });
      }
    });
  }

  // Otherwise treat as public slug
  try {
    const form = await db.get(
      'SELECT id, title, description, fields_json, theme_json, settings_json, public_slug FROM forms WHERE public_slug = ?',
      [req.params.identifier]
    );
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }
    return res.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        fields: JSON.parse(form.fields_json || '[]'),
        theme: JSON.parse(form.theme_json || '{}'),
        settings: JSON.parse(form.settings_json || '{}'),
        public_slug: form.public_slug
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching form.' });
  }
});

// Update Form (Owner Only)
app.put('/api/forms/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fields, theme, settings } = req.body;

    const existing = await db.get('SELECT id FROM forms WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Form not found or unauthorized.' });
    }

    await db.run(
      `UPDATE forms
       SET title = ?, description = ?, fields_json = ?, theme_json = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title || 'Untitled Form',
        description || '',
        JSON.stringify(fields || []),
        JSON.stringify(theme || {}),
        JSON.stringify(settings || {}),
        id
      ]
    );

    return res.json({ message: 'Form saved successfully.' });
  } catch (err) {
    console.error('Error updating form:', err);
    return res.status(500).json({ message: 'Failed to save form.' });
  }
});

// Delete Form (Owner Only)
app.delete('/api/forms/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const form = await db.get('SELECT id FROM forms WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    await db.run('DELETE FROM forms WHERE id = ?', [id]);
    return res.json({ message: 'Form deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete form.' });
  }
});

// -------------------------------------------------------------
// Response Submissions & Dashboard Endpoints
// -------------------------------------------------------------

// Submit Answers for a Form (Public - With Strict Server-Side Validation)
app.post('/api/forms/:slug/responses', async (req, res) => {
  try {
    const { slug } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Invalid payload: answers object is required.' });
    }

    // Find form by slug or id
    const form = await db.get(
      'SELECT id, fields_json, title FROM forms WHERE public_slug = ? OR id = ?',
      [slug, slug]
    );

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    const fields = JSON.parse(form.fields_json || '[]');

    // Server-side validation against field rules (required, types, options, bounds)
    const validationResult = validateAnswers(fields, answers);
    if (!validationResult.isValid) {
      return res.status(422).json({
        message: 'Validation failed. Please correct the highlighted errors.',
        errors: validationResult.errors
      });
    }

    const result = await db.run(
      'INSERT INTO responses (form_id, answers_json) VALUES (?, ?)',
      [form.id, JSON.stringify(validationResult.cleanedAnswers)]
    );

    const newResponse = {
      id: result.lastInsertRowid,
      form_id: form.id,
      answers: validationResult.cleanedAnswers,
      submitted_at: new Date().toISOString()
    };

    // Notify any active dashboard SSE connections
    notifyFormSubscribers(form.id, {
      type: 'NEW_RESPONSE',
      response: newResponse
    });

    return res.status(201).json({
      message: 'Response submitted successfully!',
      responseId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Error submitting response:', err);
    return res.status(500).json({ message: 'Failed to submit response. Please try again.' });
  }
});

// View Responses for a Form (Owner Only)
app.get('/api/forms/:id/responses', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const form = await db.get('SELECT id, title, fields_json, public_slug FROM forms WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!form) {
      return res.status(404).json({ message: 'Form not found or unauthorized.' });
    }

    const rawResponses = await db.query(
      'SELECT id, answers_json, submitted_at FROM responses WHERE form_id = ? ORDER BY submitted_at DESC',
      [id]
    );

    const responses = rawResponses.map(r => ({
      id: r.id,
      submitted_at: r.submitted_at,
      answers: JSON.parse(r.answers_json || '{}')
    }));

    return res.json({
      form: {
        id: form.id,
        title: form.title,
        fields: JSON.parse(form.fields_json || '[]'),
        public_slug: form.public_slug
      },
      responses,
      totalResponses: responses.length
    });
  } catch (err) {
    console.error('Error fetching responses:', err);
    return res.status(500).json({ message: 'Failed to retrieve responses.' });
  }
});

// Delete Single Response (Owner Only)
app.delete('/api/forms/:id/responses/:responseId', authMiddleware, async (req, res) => {
  try {
    const { id, responseId } = req.params;
    const form = await db.get('SELECT id FROM forms WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!form) {
      return res.status(404).json({ message: 'Form not found or unauthorized.' });
    }

    await db.run('DELETE FROM responses WHERE id = ? AND form_id = ?', [responseId, id]);
    return res.json({ message: 'Response deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete response.' });
  }
});

// Export Responses to CSV (Owner Only)
app.get('/api/forms/:id/export', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const form = await db.get('SELECT id, title, fields_json FROM forms WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!form) {
      return res.status(404).json({ message: 'Form not found or unauthorized.' });
    }

    const fields = JSON.parse(form.fields_json || '[]');
    const responses = await db.query('SELECT id, answers_json, submitted_at FROM responses WHERE form_id = ? ORDER BY submitted_at ASC', [id]);

    // Build CSV Headers
    const headers = ['Submission ID', 'Submitted At', ...fields.map(f => `"${(f.label || f.id).replace(/"/g, '""')}"`)];
    const csvRows = [headers.join(',')];

    for (const r of responses) {
      const answers = JSON.parse(r.answers_json || '{}');
      const row = [
        r.id,
        `"${r.submitted_at}"`,
        ...fields.map(f => {
          let val = answers[f.id];
          if (val === undefined || val === null) val = '';
          if (Array.isArray(val)) val = val.join('; ');
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        })
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const safeTitle = form.title.toLowerCase().replace(/[^a-z0-9]/gi, '_');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_responses.csv"`);
    return res.send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    return res.status(500).json({ message: 'Failed to export CSV.' });
  }
});

// Real-Time Server-Sent Events (SSE) for Live Responses
app.get('/api/forms/:id/live', (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!sseClients.has(String(id))) {
    sseClients.set(String(id), new Set());
  }
  sseClients.get(String(id)).add(res);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', formId: id })}\n\n`);

  req.on('close', () => {
    const clients = sseClients.get(String(id));
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(String(id));
      }
    }
  });
});

// Initialize database and start server
async function startServer() {
  await db.init();
  app.listen(PORT, () => {
    console.log(`Form Builder API server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
