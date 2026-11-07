import React, { useState, useEffect } from 'react';
import {
  Save,
  Eye,
  Edit3,
  Share2,
  Palette,
  LayoutTemplate,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import FieldPalette, { FIELD_DEFINITIONS } from './FieldPalette';
import FormCanvas from './FormCanvas';
import FieldProperties from './FieldProperties';
import DynamicFormRenderer from '../renderer/DynamicFormRenderer';
import ThemeEditorModal from './ThemeEditorModal';
import ShareModal from './ShareModal';
import TemplatesModal from './TemplatesModal';
import { apiClient } from '../../api/apiClient';

export default function BuilderLayout({ formId, onBackToDashboard }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [currentId, setCurrentId] = useState(formId);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [theme, setTheme] = useState({ primaryColor: '#4f46e5', font: 'Inter' });
  const [settings, setSettings] = useState({ submitButtonText: 'Submit Response', successMessage: 'Thank you! Your response has been recorded.' });

  // Builder UI State
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Load existing form or initialize new form
  useEffect(() => {
    async function loadForm() {
      if (!formId) {
        // Brand new form
        setFields([
          { id: `f_${Date.now()}_1`, type: 'text', label: 'Full name', placeholder: 'Jane Doe', required: true },
          { id: `f_${Date.now()}_2`, type: 'email', label: 'Email address', placeholder: 'jane@example.com', required: true }
        ]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.getForm(formId);
        const f = data.form;
        setTitle(f.title || 'Untitled Form');
        setDescription(f.description || '');
        setFields(f.fields || []);
        setTheme(f.theme || { primaryColor: '#4f46e5' });
        setSettings(f.settings || {});
        setSlug(f.public_slug || '');
        setCurrentId(f.id);
      } catch (err) {
        console.error('Failed to load form:', err);
        setErrorMsg('Failed to load form details.');
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [formId]);

  // Save handler
  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg('');

      const payload = {
        title,
        description,
        fields,
        theme,
        settings
      };

      if (currentId) {
        await apiClient.updateForm(currentId, payload);
      } else {
        const res = await apiClient.createForm(payload);
        setCurrentId(res.form.id);
        setSlug(res.form.public_slug);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMsg(err.message || 'Failed to save form changes.');
    } finally {
      setSaving(false);
    }
  };

  // Add field from palette click or drop
  const handleAddField = (fieldDef) => {
    const newId = `f_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newField = {
      id: newId,
      type: fieldDef.type,
      ...fieldDef.defaultProps
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newId);
  };

  // Update specific field properties
  const handleUpdateField = (id, updatedField) => {
    setFields((prev) => prev.map((f) => (f.id === id ? updatedField : f)));
  };

  // Delete field
  const handleDeleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  // Duplicate field
  const handleDuplicateField = (field) => {
    const newId = `f_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const duplicated = {
      ...field,
      id: newId,
      label: `${field.label} (Copy)`
    };
    setFields((prev) => [...prev, duplicated]);
    setSelectedFieldId(newId);
  };

  // Reorder fields
  const handleReorderFields = (reorderedList) => {
    setFields(reorderedList);
  };

  // Select template
  const handleSelectTemplate = (template) => {
    setTitle(template.title);
    setDescription(template.description);
    setFields(template.fields);
    setSelectedFieldId(null);
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading form editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Forms</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
              {title || 'Untitled Form'}
            </span>
            {saveSuccess ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </span>
            ) : saving ? (
              <span className="text-[11px] text-indigo-600 font-medium">Saving...</span>
            ) : null}
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Templates button */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Templates</span>
          </button>

          {/* Theme styling */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Theme</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPreviewMode
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {isPreviewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreviewMode ? 'Exit Preview' : 'Live Preview'}</span>
          </button>

          {/* Share / Publish */}
          <button
            onClick={async () => {
              if (!slug) {
                await handleSave();
              }
              setShowShareModal(true);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share / Publish</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Error notice if any */}
      {errorMsg && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Body */}
      {isPreviewMode ? (
        /* Live Interactive Preview Container */
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 sm:p-12">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
              <span>
                👁️ <strong>Live Preview Mode:</strong> Test input interactions and smart conditional branching exactly as respondents will see it.
              </span>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="font-bold underline hover:text-amber-950 ml-2"
              >
                Back to Editor
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="h-3 w-full" style={{ backgroundColor: theme.primaryColor || '#4f46e5' }} />
              <div className="p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{title || 'Untitled Form'}</h1>
                {description && <p className="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-wrap">{description}</p>}

                <DynamicFormRenderer
                  fields={fields}
                  answers={previewAnswers}
                  theme={theme}
                  settings={settings}
                  onChange={(fieldId, val) => setPreviewAnswers((prev) => ({ ...prev, [fieldId]: val }))}
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Preview submission: Form looks great! All rules satisfied.');
                  }}
                  isInteractive={true}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode: Left Palette | Center Canvas | Right Properties */
        <div className="flex-1 flex overflow-hidden">
          <FieldPalette onAddField={handleAddField} />

          <FormCanvas
            title={title}
            description={description}
            onUpdateTitle={setTitle}
            onUpdateDescription={setDescription}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onReorderFields={handleReorderFields}
            onAddFieldFromDrop={handleAddField}
            onDeleteField={handleDeleteField}
            onDuplicateField={handleDuplicateField}
            theme={theme}
          />

          <FieldProperties
            selectedField={selectedField}
            allFields={fields}
            onUpdateField={handleUpdateField}
            onDeleteField={handleDeleteField}
            onDuplicateField={handleDuplicateField}
          />
        </div>
      )}

      {/* Modals */}
      <ThemeEditorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        theme={theme}
        onUpdateTheme={setTheme}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        slug={slug}
        title={title}
      />

      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
