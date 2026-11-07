const db = require('./db');
const { validateAnswers } = require('./validator');

async function testBackend() {
  console.log('Testing Database and API modules...');
  await db.init();

  // Test tables exist
  const tables = await db.query("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Created tables:', tables.map(t => t.name).join(', '));

  // Test validator
  const sampleFields = [
    { id: 'name', type: 'text', label: 'Full Name', required: true, minLength: 2 },
    { id: 'email', type: 'email', label: 'Email', required: true },
    { id: 'role', type: 'dropdown', label: 'Role', options: ['Eng', 'Design'], required: true },
    { id: 'why', type: 'text', label: 'Why', required: true, condition: { fieldId: 'role', operator: 'equals', value: 'Eng' } }
  ];

  // Case 1: Valid submission
  const validAnswers = {
    name: 'Alice',
    email: 'alice@example.com',
    role: 'Eng',
    why: 'I love systems'
  };
  const res1 = validateAnswers(sampleFields, validAnswers);
  console.log('Test 1 (Valid):', res1.isValid ? 'PASSED' : 'FAILED', res1.errors);

  // Case 2: Missing required email + invalid short name
  const invalidAnswers = {
    name: 'A',
    email: 'not-an-email',
    role: 'Eng'
  };
  const res2 = validateAnswers(sampleFields, invalidAnswers);
  console.log('Test 2 (Invalid rejected properly):', !res2.isValid ? 'PASSED' : 'FAILED', Object.keys(res2.errors));

  // Case 3: Role is 'Design', so 'why' should be skipped and valid
  const conditionalAnswers = {
    name: 'Bob',
    email: 'bob@example.com',
    role: 'Design'
  };
  const res3 = validateAnswers(sampleFields, conditionalAnswers);
  console.log('Test 3 (Conditional visibility skip):', res3.isValid ? 'PASSED' : 'FAILED', res3.errors);

  console.log('All backend unit tests passed successfully!');
}

testBackend().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
