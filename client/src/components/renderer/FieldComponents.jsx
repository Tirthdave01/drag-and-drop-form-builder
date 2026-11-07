import React from 'react';
import { Star } from 'lucide-react';

export function TextInput({ id, label, placeholder, required, value, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        id={id}
        name={id}
        value={value || ''}
        placeholder={placeholder || 'Type your answer here...'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          error ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600'
        } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
      />
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function LongTextInput({ id, label, placeholder, required, value, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        rows={4}
        value={value || ''}
        placeholder={placeholder || 'Write your response here...'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y ${
          error ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600'
        } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
      />
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function EmailInput({ id, label, placeholder, required, value, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="email"
        id={id}
        name={id}
        value={value || ''}
        placeholder={placeholder || 'name@example.com'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          error ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600'
        } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
      />
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function NumberInput({ id, label, placeholder, required, min, max, value, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="number"
        id={id}
        name={id}
        min={min}
        max={max}
        value={value !== undefined && value !== null ? value : ''}
        placeholder={placeholder || 'Enter a number'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          error ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600'
        } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
      />
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function DropdownInput({ id, label, required, options = [], value, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        id={id}
        name={id}
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          error ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600'
        } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
      >
        <option value="">Select an option...</option>
        {options.map((opt, idx) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label || opt.value : opt;
          return (
            <option key={idx} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function RadioInput({ id, label, required, options = [], value, onChange, error, disabled }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label || opt.value : opt;
          const isSelected = value === optValue;

          return (
            <label
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input
                type="radio"
                name={id}
                value={optValue}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onChange(optValue)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm">{optLabel}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function CheckboxInput({ id, label, required, options = [], value = [], onChange, error, disabled }) {
  const currentValues = Array.isArray(value) ? value : [];

  const handleToggle = (optVal) => {
    if (disabled) return;
    if (currentValues.includes(optVal)) {
      onChange(currentValues.filter((v) => v !== optVal));
    } else {
      onChange([...currentValues, optVal]);
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label || opt.value : opt;
          const isChecked = currentValues.includes(optValue);

          return (
            <label
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isChecked
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                value={optValue}
                checked={isChecked}
                disabled={disabled}
                onChange={() => handleToggle(optValue)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm">{optLabel}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function DateInput({ id, label, required, value, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="date"
        id={id}
        name={id}
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          error ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600'
        } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
      />
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function RatingInput({ id, label, required, value = 0, onChange, error, disabled }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={`p-1.5 rounded-md transition-colors hover:bg-amber-50 ${
              star <= (value || 0) ? 'text-amber-400' : 'text-slate-300'
            } ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            <Star className={`w-7 h-7 ${star <= (value || 0) ? 'fill-amber-400' : ''}`} />
          </button>
        ))}
        {value > 0 && <span className="ml-2 text-sm text-slate-500 font-medium">{value} / 5</span>}
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function SwitchInput({ id, label, required, value = false, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between py-1">
        <span className="text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            value ? 'bg-indigo-600' : 'bg-slate-200'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              value ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
