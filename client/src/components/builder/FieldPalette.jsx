import React from 'react';
import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  ChevronDown,
  CircleDot,
  CheckSquare,
  Calendar,
  Star,
  ToggleLeft,
  Plus
} from 'lucide-react';

export const FIELD_DEFINITIONS = [
  {
    type: 'text',
    label: 'Short Text',
    icon: Type,
    description: 'Single-line text input for names, titles, etc.',
    defaultProps: { label: 'Short question', placeholder: 'Enter short answer', required: false }
  },
  {
    type: 'longtext',
    label: 'Long Text',
    icon: AlignLeft,
    description: 'Multi-line text area for feedback, essays, notes.',
    defaultProps: { label: 'Detailed response', placeholder: 'Enter your answer here...', required: false }
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email input with format validation.',
    defaultProps: { label: 'Email Address', placeholder: 'name@example.com', required: true }
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric values, ratings, quantities.',
    defaultProps: { label: 'Quantity / Number', placeholder: '0', min: 0, required: false }
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: ChevronDown,
    description: 'Single choice from a compact drop-down list.',
    defaultProps: {
      label: 'Select an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false
    }
  },
  {
    type: 'radio',
    label: 'Radio Choices',
    icon: CircleDot,
    description: 'Single choice displayed as radio buttons.',
    defaultProps: {
      label: 'Choose one option',
      options: ['First Choice', 'Second Choice', 'Third Choice'],
      required: false
    }
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckSquare,
    description: 'Multiple choice checkboxes.',
    defaultProps: {
      label: 'Select all that apply',
      options: ['Feature A', 'Feature B', 'Feature C'],
      required: false
    }
  },
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    description: 'Calendar date picker.',
    defaultProps: { label: 'Select a Date', required: false }
  },
  {
    type: 'rating',
    label: 'Star Rating',
    icon: Star,
    description: '1 to 5 star rating widget.',
    defaultProps: { label: 'How would you rate your experience?', required: false }
  },
  {
    type: 'switch',
    label: 'Yes / No Toggle',
    icon: ToggleLeft,
    description: 'Simple boolean toggle switch.',
    defaultProps: { label: 'Do you agree to the terms?', required: false }
  }
];

export default function FieldPalette({ onAddField }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Field Palette</h2>
        <p className="text-xs text-slate-500 mt-0.5">Click or drag onto canvas</p>
      </div>

      <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
        {FIELD_DEFINITIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              onClick={() => onAddField(item)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(item));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-grab active:cursor-grabbing transition-all text-slate-700 hover:text-indigo-900 shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold">{item.label}</div>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
        💡 Tip: Reorder fields on the canvas anytime
      </div>
    </aside>
  );
}
