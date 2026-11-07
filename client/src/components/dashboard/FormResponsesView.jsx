import React, { useState, useEffect } from 'react';
import {
  Download,
  ArrowLeft,
  Search,
  Trash2,
  BarChart3,
  Table as TableIcon,
  RefreshCw,
  ExternalLink,
  Clock,
  Radio,
  Eye,
  X
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

export default function FormResponsesView({ formId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Fetch responses
  const fetchResponses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getResponses(formId);
      setFormData(data.form);
      setResponses(data.responses || []);
    } catch (err) {
      console.error('Error fetching responses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();

    // Setup Live SSE updates
    const eventSource = new EventSource(`/api/forms/${formId}/live`);

    eventSource.onopen = () => {
      setIsLiveConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_RESPONSE') {
          // Add new response to state at top
          setResponses((prev) => [payload.response, ...prev]);
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    };

    eventSource.onerror = () => {
      setIsLiveConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [formId]);

  // Delete single response
  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      await apiClient.deleteResponse(formId, responseId);
      setResponses((prev) => prev.filter((r) => r.id !== responseId));
      if (selectedSubmission?.id === responseId) {
        setSelectedSubmission(null);
      }
    } catch (err) {
      alert('Failed to delete response.');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    window.open(apiClient.getExportUrl(formId), '_blank');
  };

  if (loading && !formData) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading responses...</span>
        </div>
      </div>
    );
  }

  const fields = formData?.fields || [];

  // Filter responses by search query
  const filteredResponses = responses.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(r.answers).some((val) => {
      if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(query));
      return String(val).toLowerCase().includes(query);
    });
  });

  // Calculate statistics for choice-based questions (Dropdown, Radio, Checkbox)
  const choiceStats = fields
    .filter((f) => ['dropdown', 'radio', 'checkbox'].includes(f.type))
    .map((field) => {
      const counts = {};
      const options = field.options || [];

      // Initialize with 0
      options.forEach((opt) => {
        const key = typeof opt === 'object' ? opt.value : opt;
        counts[key] = 0;
      });

      let totalAnswers = 0;

      responses.forEach((r) => {
        const val = r.answers[field.id];
        if (val) {
          if (Array.isArray(val)) {
            val.forEach((item) => {
              counts[item] = (counts[item] || 0) + 1;
              totalAnswers += 1;
            });
          } else {
            counts[val] = (counts[val] || 0) + 1;
            totalAnswers += 1;
          }
        }
      });

      return {
        field,
        counts,
        totalAnswers
      };
    });

  // Numeric fields stats (Number, Rating)
  const numericStats = fields
    .filter((f) => ['number', 'rating'].includes(f.type))
    .map((field) => {
      const values = responses
        .map((r) => Number(r.answers[field.id]))
        .filter((v) => !isNaN(v) && v !== null && v !== undefined);

      if (values.length === 0) return { field, count: 0, avg: 0, min: 0, max: 0 };

      const sum = values.reduce((acc, curr) => acc + curr, 0);
      const avg = (sum / values.length).toFixed(1);
      const min = Math.min(...values);
      const max = Math.max(...values);

      return {
        field,
        count: values.length,
        avg,
        min,
        max
      };
    });

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all forms</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">{formData?.title || 'Form Responses'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                {responses.length} {responses.length === 1 ? 'submission' : 'submissions'}
              </span>
              {isLiveConnected && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`/f/${formData?.public_slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Link</span>
            </a>

            <button
              onClick={handleExportCSV}
              disabled={responses.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Visual Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'table'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Data Submissions ({filteredResponses.length})</span>
            </button>
          </div>

          {activeTab === 'table' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-56"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Visual Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {responses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <BarChart3 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-semibold text-slate-700">No submissions yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Share your public form link to start collecting answers.
                </p>
              </div>
            ) : (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Responses</span>
                    <div className="text-3xl font-extrabold text-slate-800 mt-1">{responses.length}</div>
                    <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">100% completion rate</span>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Submission</span>
                    <div className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{new Date(responses[0]?.submitted_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Count</span>
                    <div className="text-3xl font-extrabold text-slate-800 mt-1">{fields.length}</div>
                    <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Active dynamic fields</span>
                  </div>
                </div>

                {/* Choice-based Bar Charts */}
                {choiceStats.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {choiceStats.map(({ field, counts, totalAnswers }) => (
                      <div key={field.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {field.type}
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 mt-1">{field.label}</h3>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{totalAnswers} answers</span>
                        </div>

                        <div className="space-y-3 pt-2">
                          {Object.entries(counts).map(([option, count]) => {
                            const percent = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                            return (
                              <div key={option} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium text-slate-700">
                                  <span className="truncate max-w-[240px]">{option}</span>
                                  <span className="text-slate-500 font-mono">
                                    {count} ({percent}%)
                                  </span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Numeric Field Stats */}
                {numericStats.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {numericStats.map(({ field, count, avg, min, max }) => (
                      <div key={field.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                          {field.type}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800">{field.label}</h3>
                        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="text-[11px] text-slate-400 font-medium">Average</span>
                            <div className="text-xl font-bold text-indigo-600 mt-0.5">{avg}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="text-[11px] text-slate-400 font-medium">Minimum</span>
                            <div className="text-xl font-bold text-slate-700 mt-0.5">{min}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="text-[11px] text-slate-400 font-medium">Maximum</span>
                            <div className="text-xl font-bold text-slate-700 mt-0.5">{max}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Data Table */}
        {activeTab === 'table' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-40">Submitted At</th>
                    {fields.map((f) => (
                      <th key={f.id} className="py-3 px-4 min-w-[150px]">
                        {f.label}
                      </th>
                    ))}
                    <th className="py-3 px-4 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResponses.length === 0 ? (
                    <tr>
                      <td colSpan={fields.length + 3} className="py-12 text-center text-slate-400">
                        No submissions matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredResponses.map((r, idx) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => setSelectedSubmission(r)}
                      >
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(r.submitted_at).toLocaleString()}
                        </td>
                        {fields.map((f) => {
                          const val = r.answers[f.id];
                          let display = '-';
                          if (val !== undefined && val !== null && val !== '') {
                            display = Array.isArray(val) ? val.join(', ') : String(val);
                          }
                          return (
                            <td key={f.id} className="py-3 px-4 text-slate-700 font-medium truncate max-w-xs">
                              {display}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedSubmission(r)}
                              title="View details"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteResponse(r.id)}
                              title="Delete submission"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Submission Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {fields.map((f) => {
                const val = selectedSubmission.answers[f.id];
                const display = val ? (Array.isArray(val) ? val.join(', ') : String(val)) : '—';
                return (
                  <div key={f.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 block mb-1">{f.label}</span>
                    <span className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{display}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => handleDeleteResponse(selectedSubmission.id)}
                className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Submission
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
