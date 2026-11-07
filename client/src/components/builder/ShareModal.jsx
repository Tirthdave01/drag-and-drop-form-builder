import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Code2, Globe } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, slug, title }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'embed'

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/f/${slug}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="700" frameborder="0" style="border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Share & Publish Form</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">{title || 'Untitled Form'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-2">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 text-xs font-semibold border-b-2 mr-6 flex items-center gap-1.5 transition-colors ${
              activeTab === 'link'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            Public Direct Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'embed'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Embed Code (iFrame)
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === 'link' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Anyone with this public link can fill out and submit the form without needing to log in.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Form URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open public form in a new tab</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Paste this snippet into your HTML or website builder (WordPress, Webflow, Notion, etc.) to embed this form directly.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">iFrame Snippet</label>
                <textarea
                  rows={4}
                  readOnly
                  value={embedCode}
                  className="w-full p-2.5 text-xs bg-slate-900 text-emerald-400 font-mono rounded-lg border border-slate-800 select-all focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCopyEmbed}
                  className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedEmbed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedEmbed ? 'Snippet Copied!' : 'Copy Embed Code'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
