import React, { useState, useEffect } from 'react';
import {
  Plus,
  FileText,
  BarChart2,
  ExternalLink,
  Copy,
  Trash2,
  Check,
  Search,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

export default function FormsList({ onCreateForm, onEditForm, onViewResponses }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getForms();
      setForms(data.forms || []);
    } catch (err) {
      console.error('Failed to load forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form and all its responses?')) return;
    try {
      await apiClient.deleteForm(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert('Failed to delete form.');
    }
  };

  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredForms = forms.filter((f) =>
    (f.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Your Forms</h1>
            <p className="text-xs text-slate-500 mt-1">
              Build drag-and-drop forms, publish links, and analyze real-time responses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onCreateForm()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Form</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Search & Stats Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Showing {filteredForms.length} of {forms.length} forms
          </span>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading forms...</span>
            </div>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No forms found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search ? 'Try another search term or clear the filter.' : 'Create your very first form in seconds!'}
              </p>
            </div>
            <button
              onClick={() => onCreateForm()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Building</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      /f/{form.public_slug}
                    </span>
                    <button
                      onClick={() => handleCopyLink(form.public_slug)}
                      title="Copy Public Link"
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 transition-colors"
                    >
                      {copiedSlug === form.public_slug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {form.title || 'Untitled Form'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {form.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onViewResponses(form.id)}
                    className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                    <span>{form.response_count || 0} Responses</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/f/${form.public_slug}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open Public Link"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onEditForm(form.id)}
                      className="px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form.id)}
                      title="Delete Form"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
