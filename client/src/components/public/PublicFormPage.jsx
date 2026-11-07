import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import DynamicFormRenderer, { evaluateCondition } from '../renderer/DynamicFormRenderer';
import { apiClient } from '../../api/apiClient';

export default function PublicFormPage({ slug }) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Load public form
  useEffect(() => {
    async function loadForm() {
      try {
        setLoading(true);
        setGlobalError('');
        const data = await apiClient.getPublicForm(slug);
        setForm(data.form);
      } catch (err) {
        console.error('Error loading public form:', err);
        setGlobalError('Form not found or link has expired.');
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [slug]);

  // Handle answer change
  const handleAnswerChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for that field as user types
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Client-side validation before hitting backend
  const validateClient = () => {
    const newErrors = {};
    const fields = form.fields || [];

    for (const field of fields) {
      // If conditional logic hides field, ignore validation
      if (!evaluateCondition(field, answers)) {
        continue;
      }

      const val = answers[field.id];
      const isEmpty =
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0);

      // Check required
      if (field.required && isEmpty) {
        newErrors[field.id] = `${field.label || 'This question'} is required.`;
        continue;
      }

      if (isEmpty) continue;

      // Email format
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val).trim())) {
          newErrors[field.id] = 'Please enter a valid email address.';
        }
      }

      // Min/Max for number
      if (field.type === 'number') {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          newErrors[field.id] = 'Must be a valid number.';
        } else {
          if (field.min !== undefined && field.min !== '' && numVal < Number(field.min)) {
            newErrors[field.id] = `Cannot be less than ${field.min}.`;
          }
          if (field.max !== undefined && field.max !== '' && numVal > Number(field.max)) {
            newErrors[field.id] = `Cannot be greater than ${field.max}.`;
          }
        }
      }

      // Min/Max length for text
      if (['text', 'longtext'].includes(field.type)) {
        const str = String(val);
        if (field.minLength && str.length < Number(field.minLength)) {
          newErrors[field.id] = `Must be at least ${field.minLength} characters.`;
        }
        if (field.maxLength && str.length > Number(field.maxLength)) {
          newErrors[field.id] = `Cannot exceed ${field.maxLength} characters.`;
        }
      }
    }

    return newErrors;
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    // Run client validation
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      // Scroll first invalid field into view
      const firstErrorKey = Object.keys(clientErrors)[0];
      const el = document.getElementById(firstErrorKey);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.submitResponse(slug, answers);

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
        setGlobalError(err.data.message || 'Validation failed on server.');
      } else {
        setGlobalError(err.message || 'Failed to submit form. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setErrors({});
    setSubmitted(false);
    setGlobalError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading form...</span>
        </div>
      </div>
    );
  }

  if (globalError && !form) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Form Not Available</h2>
          <p className="text-xs text-slate-500">{globalError}</p>
        </div>
      </div>
    );
  }

  const primaryColor = form?.theme?.primaryColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Accent Bar */}
          <div className="h-3 w-full" style={{ backgroundColor: primaryColor }} />

          <div className="p-8 sm:p-10">
            {submitted ? (
              /* Success Screen */
              <div className="py-8 text-center space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold text-slate-800">Response Recorded!</h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    {form.settings?.successMessage || 'Thank you! Your response has been securely submitted.'}
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200 hover:border-indigo-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Submit another response</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Dynamic Form */
              <div className="space-y-8">
                <div className="space-y-2 border-b border-slate-100 pb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {form.title || 'Untitled Form'}
                  </h1>
                  {form.description && (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {form.description}
                    </p>
                  )}
                </div>

                {globalError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{globalError}</span>
                  </div>
                )}

                <DynamicFormRenderer
                  fields={form.fields || []}
                  answers={answers}
                  errors={errors}
                  theme={form.theme || {}}
                  settings={form.settings || {}}
                  onChange={handleAnswerChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isInteractive={true}
                  showProgress={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>Powered by Drag-and-Drop Form Builder</p>
        </div>
      </div>
    </div>
  );
}
