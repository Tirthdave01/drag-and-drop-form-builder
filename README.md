# ⚡ Drag-and-Drop Form Builder (FormCraft)

A full-stack dynamic form creation and response analytics platform inspired by Google Forms & Typeform. Form creators assemble forms via drag-and-drop, publish a public link, and inspect submissions in real-time with visual analytics and CSV export.

---

## 🌟 The Core Concept: "The Form is Just JSON"

In traditional web applications, each form requires hardcoded HTML/React components. FormCraft decouples the structure of a form from its presentation:

1. **State as Data**: Every form is represented as a structured JSON object specifying field types, validation constraints, options, and conditional display rules.
2. **Unified Renderer**: A single polymorphic React component (`DynamicFormRenderer.jsx`) interprets the JSON schema and dynamically renders the appropriate UI widgets (`TextInput`, `DropdownInput`, `RadioInput`, `CheckboxInput`, `DateInput`, `RatingInput`, etc.).
3. **Reusability**: The exact same dynamic renderer drives **Canvas edit mode**, **Live preview mode**, and the **Respondent public page (`/f/:slug`)**.

```json
{
  "title": "Tech Fellowship Application",
  "fields": [
    { "id": "f1", "type": "text", "label": "Full name", "required": true },
    { "id": "f2", "type": "email", "label": "Email address", "required": true },
    { 
      "id": "f3", 
      "type": "dropdown", 
      "label": "Role", 
      "options": ["Frontend", "Backend", "Full Stack"], 
      "required": true 
    },
    {
      "id": "f4",
      "type": "longtext",
      "label": "Why do you want to join?",
      "condition": { "fieldId": "f3", "operator": "isNotEmpty" }
    }
  ]
}
```

---

## 🚀 Key Features

### 1. Visual Drag-and-Drop Form Builder (`/`)
- **Left Panel (Field Palette)**: 10 field types (Short text, Long text, Email, Number, Dropdown, Radio choices, Checkboxes, Date picker, Star Rating, Yes/No toggle). Drag onto canvas or click to add.
- **Center Canvas**: Interactive canvas powered by `@dnd-kit/core` & `@dnd-kit/sortable` for reordering fields. Includes inline title/description editing and quick action toolbars (duplicate, delete, reorder).
- **Right Panel (Inspector)**: Configure field label, placeholder, required toggle, min/max length, bounds, option choices, and **smart conditional branching**.
- **Live Preview Toggle**: Instant side-by-side verification of field behavior and conditional branching without leaving the builder.
- **Theme Customizer**: Pick brand accent colors (Indigo, Emerald, Violet, Rose, Amber, Cyan, Slate, or custom Hex) and styling.
- **Prebuilt Templates**: One-click starter templates (Job Application, Customer Feedback & NPS, Event RSVP, Contact Form).
- **Share & Embed Modal**: Copy public link, preview QR code, or copy responsive `<iframe src="...">` embed snippet.

### 2. Public Respondent Form (`/f/:slug`)
- Accessible via clean public link (`/f/:slug`) without login.
- Dynamic JSON rendering and real-time completion progress bar.
- Dual-layer validation (client-side feedback + strict server-side schema verification).
- Animated celebration confetti (`canvas-confetti`) on successful submission.
- Option to submit multiple responses.

### 3. Creator Responses Dashboard (`/api/forms/:id/responses`)
- **Visual Analytics**:
  - Horizontal/vertical frequency distribution bar charts for Dropdown, Radio, and Checkbox answers.
  - Summary metrics for numeric and rating fields (average, minimum, maximum).
  - Real-time indicator: connects via Server-Sent Events (SSE) so incoming submissions appear instantly without page refresh!
- **Data Submissions Table**:
  - Full dynamic table listing every submission timestamp and field answer.
  - Search and filter responses.
  - Detail modal to inspect individual responses.
  - Single submission deletion.
- **One-Click CSV Export**:
  - Direct download via `/api/forms/:id/export` with UTF-8 encoding and sanitized column headers.

### 4. Authentication & Security
- User registration and login with bcrypt password hashing and JWT tokens.
- **Instant Demo Mode**: 1-click "Explore as Demo Creator" button with pre-seeded forms and responses for effortless grading and evaluation.
- Protected creator endpoints with JWT authentication middleware.
- Strict server-side validation rejecting tampered or invalid payloads.

---

## 🏗️ Architecture & Database

### Database Engine Support
The backend supports **both SQLite (default, zero setup required)** and **MySQL 8.0**:
- By default, Node 24's native `node:sqlite` initializes automatically in `server/data/forms.db`.
- To switch to MySQL, set `DB_TYPE=mysql` in `server/.env` and import `server/schema.sql`.

### Relational Schema

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) DEFAULT 'Creator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forms table
CREATE TABLE forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Form',
  description TEXT,
  fields_json LONGTEXT NOT NULL,
  theme_json LONGTEXT,
  settings_json LONGTEXT,
  public_slug VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Responses table
CREATE TABLE responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  answers_json LONGTEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
```

### API Endpoints

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new creator |
| `POST` | `/api/auth/login` | Public | Login creator, return JWT |
| `POST` | `/api/auth/demo` | Public | Instant demo login with pre-seeded data |
| `GET` | `/api/auth/me` | JWT | Get current authenticated user |
| `GET` | `/api/forms` | JWT | List creator's forms with response counts |
| `POST` | `/api/forms` | JWT | Create a new form |
| `GET` | `/api/forms/public/:slug` | Public | Fetch form definition by public slug |
| `GET` | `/api/forms/:id` | JWT | Fetch form by ID for editing |
| `PUT` | `/api/forms/:id` | JWT | Update form schema, theme, and settings |
| `DELETE` | `/api/forms/:id` | JWT | Delete a form and all its responses |
| `POST` | `/api/forms/:slug/responses` | Public | Submit response with server validation |
| `GET` | `/api/forms/:id/responses` | JWT | Get all responses for a form |
| `DELETE` | `/api/forms/:id/responses/:resId` | JWT | Delete a specific submission |
| `GET` | `/api/forms/:id/export` | JWT | Download submissions as CSV file |
| `GET` | `/api/forms/:id/live` | Public/SSE | Server-Sent Events stream for live responses |

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 2. Quick Start (Runs both Frontend & Backend concurrently)

From the project root:

```bash
# 1. Install dependencies across root, client, and server
npm run install:all

# 2. Start both server (port 5000) and client (port 5173)
npm run dev
```

Open your browser at **`http://localhost:5173`**.

- Click **"⚡ Explore as Demo Creator"** to immediately test with preloaded forms, conditional logic, and submission charts.
- Or sign up with any email and password.

---

## 🧪 Switching to MySQL (Optional)

If you wish to use a local or remote MySQL server instead of the embedded SQLite database:

1. Create the database and tables using the provided script:
   ```bash
   mysql -u root -p < server/schema.sql
   ```
2. Edit `server/.env`:
   ```env
   PORT=5000
   JWT_SECRET=super_secret_jwt_key
   DB_TYPE=mysql
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=form_builder_db
   ```
3. Restart the server (`npm run dev`).

---

## 💡 Web Tech Syllabus Mapping & Interview Talking Points

| Feature | Syllabus Topic | Implementation Detail |
|---|---|---|
| Dynamic Renderer | React components & controlled inputs | `DynamicFormRenderer.jsx` mapping JSON type strings to field widgets |
| Drag-and-Drop Reordering | React State & DOM events | `@dnd-kit/core` + `@dnd-kit/sortable` for declarative reordering |
| Dual-Layer Validation | Web Tech Form Validation | Client-side reactive checks + server-side `validator.js` preventing tampered submissions |
| Public Link Sharing | RESTful routing | `/f/:slug` public route serving decoupled JSON to respondent clients |
| Real-Time Dashboard | Server-Sent Events (SSE) / WebSockets | `/api/forms/:id/live` pushes instant updates on new submissions |
| CSV Data Export | Node.js Streaming & HTTP Response Headers | `Content-Type: text/csv` with RFC 4180 escaping and attachment disposition |
| Relational Storage | MySQL / SQL CRUD | Foreign keys, cascading deletes, JSON stringification, indexed lookups |
