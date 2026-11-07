import React from 'react';
import { X, Check } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Indigo Dream', value: '#4f46e5' },
  { name: 'Emerald Forest', value: '#059669' },
  { name: 'Electric Violet', value: '#7c3aed' },
  { name: 'Ocean Cyan', value: '#0284c7' },
  { name: 'Sunset Rose', value: '#e11d48' },
  { name: 'Warm Amber', value: '#d97706' },
  { name: 'Midnight Slate', value: '#334155' }
];

export default function ThemeEditorModal({ isOpen, onClose, theme = {}, onUpdateTheme }) {
  if (!isOpen) return null;

  const currentPrimary = theme.primaryColor || '#4f46e5';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Customize Theme & Styling</h3>
            <p className="text-xs text-slate-500 mt-0.5">Adjust brand colors and typography for your public form</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Accent Color */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">Primary Accent Color</label>
            <div className="grid grid-cols-4 gap-2.5">
              {COLOR_PRESETS.map((color) => {
                const isSelected = currentPrimary.toLowerCase() === color.value.toLowerCase();
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => onUpdateTheme({ ...theme, primaryColor: color.value })}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: color.value }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span className="truncate">{color.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-600">Custom Hex Color:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentPrimary}
                onChange={(e) => onUpdateTheme({ ...theme, primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={currentPrimary}
                onChange={(e) => onUpdateTheme({ ...theme, primaryColor: e.target.value })}
                className="w-24 px-2 py-1 text-xs border border-slate-300 rounded font-mono"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
