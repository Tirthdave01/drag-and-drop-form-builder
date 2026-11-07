import React, { useState } from 'react';
import {
  Trash2,
  Copy,
  Plus,
  X,
  Settings2,
  GitBranch,
  Sparkles,
  Info
} from 'lucide-react';

export default function FieldProperties({
  selectedField,
  allFields = [],
  onUpdateField,
  onDeleteField,
  onDuplicateField
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'logic'

  if (!selectedField) {
    return (
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-400 select-none">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Settings2 className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">No field selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          Click on any field on the canvas to configure its label, options, and rules.
        </p>
      </aside>
    );
  }

  const { id, type, label, placeholder, required, options = [], min, max, minLength, maxLength, condition } = selectedField;

  // Potential fields to depend on (exclude current field)
  const candidateParentFields = allFields.filter((f) => f.id !== id);

  // Helper to handle partial updates
  const handleChange = (key, value) => {
    onUpdateField(id, { ...selectedField, [key]: value });
  };

  // Options management
  const handleAddOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    handleChange('options', newOptions);
  };

  const handleUpdateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 1) return;
    const newOptions = options.filter((_, idx) => idx !== index);
    handleChange('options', newOptions);
  };

  // Conditional Logic handling
  const hasCondition = Boolean(condition && condition.fieldId);

  const handleToggleCondition = (enabled) => {
    if (!enabled) {
      handleChange('condition', null);
    } else {
      handleChange('condition', {
        fieldId: candidateParentFields[0]?.id || '',
        operator: 'equals',
        value: ''
      });
    }
  };

  const handleUpdateCondition = (key, value) => {
    handleChange('condition', {
      ...(condition || { fieldId: '', operator: 'equals', value: '' }),
      [key]: value
    });
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
            {type}
          </span>
          <h2 className="text-sm font-semibold text-slate-800 mt-1 truncate max-w-[170px]">
            {label || 'Field Properties'}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Duplicate Field"
            onClick={() => onDuplicateField(selectedField)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            title="Delete Field"
            onClick={() => onDeleteField(id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-4">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-2 text-xs font-semibold border-b-2 mr-4 transition-colors ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('logic')}
          className={`py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'logic'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Conditional Logic</span>
          {hasCondition && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 flex-1">
        {activeTab === 'general' ? (
          <>
            {/* Field Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Field Question / Label</label>
              <input
                type="text"
                value={label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="e.g. What is your full name?"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            {/* Placeholder (if applicable) */}
            {['text', 'longtext', 'email', 'number'].includes(type) && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Placeholder Text</label>
                <input
                  type="text"
                  value={placeholder || ''}
                  onChange={(e) => handleChange('placeholder', e.target.value)}
                  placeholder="e.g. Type something..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Required Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Required Field</span>
                <span className="text-[11px] text-slate-500">Respondents must answer this</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(required)}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
            </div>

            {/* Options Management for Dropdown, Radio, Checkbox */}
            {['dropdown', 'radio', 'checkbox'].includes(type) && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Options List</label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-1.5">
                  {options.map((opt, idx) => {
                    const optText = typeof opt === 'object' ? opt.value : opt;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 w-4">{idx + 1}.</span>
                        <input
                          type="text"
                          value={optText}
                          onChange={(e) => handleUpdateOption(idx, e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
                        />
                        <button
                          type="button"
                          disabled={options.length <= 1}
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bounds for Number */}
            {type === 'number' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Min Value</label>
                  <input
                    type="number"
                    value={min !== undefined ? min : ''}
                    onChange={(e) => handleChange('min', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md"
                    placeholder="None"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Max Value</label>
                  <input
                    type="number"
                    value={max !== undefined ? max : ''}
                    onChange={(e) => handleChange('max', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md"
                    placeholder="None"
                  />
                </div>
              </div>
            )}

            {/* Bounds for Text */}
            {['text', 'longtext'].includes(type) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Min Length</label>
                  <input
                    type="number"
                    value={minLength !== undefined ? minLength : ''}
                    onChange={(e) => handleChange('minLength', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Max Length</label>
                  <input
                    type="number"
                    value={maxLength !== undefined ? maxLength : ''}
                    onChange={(e) => handleChange('maxLength', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md"
                    placeholder="500"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Conditional Logic Tab */
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <strong>Smart Branching:</strong> Only display this field when an answer to a previous question matches your condition.
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Enable Condition</span>
              <input
                type="checkbox"
                checked={hasCondition}
                onChange={(e) => handleToggleCondition(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
            </div>

            {hasCondition && (
              <div className="space-y-3">
                {candidateParentFields.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
                    Add another field first before configuring conditional logic.
                  </p>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Show this question if:</label>
                      <select
                        value={condition.fieldId || ''}
                        onChange={(e) => handleUpdateCondition('fieldId', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white"
                      >
                        {candidateParentFields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label || `Field (${f.type})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Condition Operator:</label>
                      <select
                        value={condition.operator || 'equals'}
                        onChange={(e) => handleUpdateCondition('operator', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white"
                      >
                        <option value="equals">Equals (exact match)</option>
                        <option value="notEquals">Does not equal</option>
                        <option value="contains">Contains substring / choice</option>
                        <option value="isNotEmpty">Is not empty (any answer)</option>
                      </select>
                    </div>

                    {condition.operator !== 'isNotEmpty' && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Target Value:</label>
                        <input
                          type="text"
                          value={condition.value || ''}
                          onChange={(e) => handleUpdateCondition('value', e.target.value)}
                          placeholder="e.g. Yes, Frontend, 100"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        <span>Field ID: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">{id}</code></span>
      </div>
    </aside>
  );
}
