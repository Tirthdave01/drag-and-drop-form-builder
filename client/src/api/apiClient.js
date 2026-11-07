const BASE_URL = ''; // Uses Vite proxy to http://localhost:5000 in dev

export const apiClient = {
  getToken() {
    return localStorage.getItem('form_builder_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('form_builder_token', token);
    } else {
      localStorage.removeItem('form_builder_token');
    }
  },

  getUser() {
    const raw = localStorage.getItem('form_builder_user');
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('form_builder_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('form_builder_user');
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  // Auth
  register(email, password, name) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  },

  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  loginDemo() {
    return this.request('/api/auth/demo', {
      method: 'POST'
    });
  },

  getMe() {
    return this.request('/api/auth/me');
  },

  // Forms
  getForms() {
    return this.request('/api/forms');
  },

  getForm(id) {
    return this.request(`/api/forms/${id}`);
  },

  createForm(formData) {
    return this.request('/api/forms', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  updateForm(id, formData) {
    return this.request(`/api/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
  },

  deleteForm(id) {
    return this.request(`/api/forms/${id}`, {
      method: 'DELETE'
    });
  },

  // Public Form
  getPublicForm(slug) {
    return this.request(`/api/forms/public/${slug}`);
  },

  submitResponse(slug, answers) {
    return this.request(`/api/forms/${slug}/responses`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  // Responses & CSV
  getResponses(formId) {
    return this.request(`/api/forms/${formId}/responses`);
  },

  deleteResponse(formId, responseId) {
    return this.request(`/api/forms/${formId}/responses/${responseId}`, {
      method: 'DELETE'
    });
  },

  getExportUrl(formId) {
    return `/api/forms/${formId}/export`;
  }
};
