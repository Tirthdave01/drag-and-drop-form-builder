import React from 'react';
import {
  TextInput,
  LongTextInput,
  EmailInput,
  NumberInput,
  DropdownInput,
  RadioInput,
  CheckboxInput,
  DateInput,
  RatingInput,
  SwitchInput
} from './FieldComponents';

/**
 * Checks if a field should be shown based on conditional logic
 */
export function evaluateCondition(field, answers) {
  if (!field.condition || !field.condition.fieldId) {
    return true; // No condition, always visible
  }

  const parentAnswer = answers[field.condition.fieldId];
  const targetValue = field.condition.value;
  const operator = field.condition.operator || 'equals';

  if (parentAnswer === undefined || parentAnswer === null) {
    return false;
  }

  switch (operator) {
    case 'equals':
      return String(parentAnswer).trim().toLowerCase() === String(targetValue).trim().toLowerCase();
    case 'notEquals':
      return String(parentAnswer).trim().toLowerCase() !== String(targetValue).trim().toLowerCase();
    case 'contains':
      if (Array.isArray(parentAnswer)) {
        return parentAnswer.some((item) => String(item).toLowerCase() === String(targetValue).toLowerCase());
      }
      return String(parentAnswer).toLowerCase().includes(String(targetValue).toLowerCase());
    case 'isNotEmpty':
      return String(parentAnswer).trim().length > 0;
    default:
      return true;
  }
}

export default function DynamicFormRenderer({
  fields = [],
  answers = {},
  errors = {},
  onChange = () => {},
  onSubmit = () => {},
  isSubmitting = false,
  isInteractive = true,
  theme = {},
  settings = {},
  showProgress = true
}) {
  // Filter visible fields based on conditional logic
  const visibleFields = fields.filter((field) => evaluateCondition(field, answers));

  // Calculate required progress
  const requiredFields = visibleFields.filter((f) => f.required);
  const filledRequiredFields = requiredFields.filter((f) => {
    const val = answers[f.id];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  });

  const progressPercent =
    requiredFields.length > 0 ? Math.round((filledRequiredFields.length / requiredFields.length) * 100) : 100;

  const primaryColor = theme.primaryColor || '#4f46e5';

  const renderField = (field) => {
    const commonProps = {
      key: field.id,
      ...field,
      value: answers[field.id],
      error: errors[field.id],
      disabled: !isInteractive || isSubmitting,
      onChange: (val) => onChange(field.id, val)
    };

    switch (field.type) {
      case 'text':
        return <TextInput {...commonProps} />;
      case 'longtext':
        return <LongTextInput {...commonProps} />;
      case 'email':
        return <EmailInput {...commonProps} />;
      case 'number':
        return <NumberInput {...commonProps} />;
      case 'dropdown':
        return <DropdownInput {...commonProps} />;
      case 'radio':
        return <RadioInput {...commonProps} />;
      case 'checkbox':
        return <CheckboxInput {...commonProps} />;
      case 'date':
        return <DateInput {...commonProps} />;
      case 'rating':
        return <RatingInput {...commonProps} />;
      case 'switch':
        return <SwitchInput {...commonProps} />;
      default:
        return (
          <div key={field.id} className="p-3 border border-dashed border-amber-300 rounded bg-amber-50 text-xs text-amber-800">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Optional Progress Bar */}
      {showProgress && requiredFields.length > 0 && (
        <div className="space-y-1.5 pb-2 border-b border-slate-100">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500">
            <span>Progress ({filledRequiredFields.length}/{requiredFields.length} required fields)</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: primaryColor
              }}
            />
          </div>
        </div>
      )}

      {/* Render all visible fields dynamically */}
      <div className="space-y-6">
        {visibleFields.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            This form has no active fields.
          </div>
        ) : (
          visibleFields.map((field) => renderField(field))
        )}
      </div>

      {/* Submit button when interactive */}
      {isInteractive && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting || visibleFields.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-white font-medium text-sm shadow-sm transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 4px 14px 0 ${primaryColor}40`
            }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              settings.submitButtonText || 'Submit'
            )}
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline">Never submit sensitive passwords</span>
        </div>
      )}
    </form>
  );
}
