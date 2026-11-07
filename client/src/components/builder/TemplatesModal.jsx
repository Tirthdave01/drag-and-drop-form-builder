import React from 'react';
import { X, Briefcase, MessageSquare, Calendar, Mail, ArrowRight } from 'lucide-react';

const PREBUILT_TEMPLATES = [
  {
    id: 'internship',
    title: 'Internship & Job Application',
    description: 'Collect applicant details, desired roles, years of experience, and portfolio links.',
    icon: Briefcase,
    color: 'bg-blue-50 text-blue-600',
    fields: [
      { id: 'f_name', type: 'text', label: 'Full name', placeholder: 'Jane Doe', required: true },
      { id: 'f_email', type: 'email', label: 'Email address', placeholder: 'jane@example.com', required: true },
      { id: 'f_role', type: 'dropdown', label: 'Position applying for', options: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Product Designer'], required: true },
      { id: 'f_exp', type: 'radio', label: 'Years of Experience', options: ['0-1 years', '2-4 years', '5+ years'], required: true },
      { id: 'f_skills', type: 'checkbox', label: 'Skills & Stack', options: ['React', 'Node.js', 'SQL', 'TypeScript', 'Docker', 'AWS'], required: false },
      { id: 'f_date', type: 'date', label: 'Earliest Start Date', required: false },
      {
        id: 'f_why',
        type: 'longtext',
        label: 'Why are you interested in this position?',
        placeholder: 'Tell us about your aspirations...',
        required: false,
        condition: { fieldId: 'f_role', operator: 'isNotEmpty' }
      }
    ]
  },
  {
    id: 'feedback',
    title: 'Customer Satisfaction & NPS',
    description: 'Gather user ratings, sentiment, product feedback, and recommendation probability.',
    icon: MessageSquare,
    color: 'bg-emerald-50 text-emerald-600',
    fields: [
      { id: 'f_name', type: 'text', label: 'Your Name (Optional)', placeholder: 'Alex', required: false },
      { id: 'f_rating', type: 'rating', label: 'Overall Satisfaction', required: true },
      { id: 'f_recommend', type: 'radio', label: 'Would you recommend our product to a colleague?', options: ['Definitely', 'Maybe', 'Unlikely'], required: true },
      {
        id: 'f_reason',
        type: 'longtext',
        label: 'What could we do to improve your experience?',
        placeholder: 'Your candid thoughts...',
        required: false,
        condition: { fieldId: 'f_recommend', operator: 'notEquals', value: 'Definitely' }
      },
      { id: 'f_contact_back', type: 'switch', label: 'May our product team contact you for follow-up questions?', required: false }
    ]
  },
  {
    id: 'event',
    title: 'Conference & Event RSVP',
    description: 'Register attendees, dietary preferences, ticket counts, and attendance confirmations.',
    icon: Calendar,
    color: 'bg-purple-50 text-purple-600',
    fields: [
      { id: 'f_name', type: 'text', label: 'Attendee Name', placeholder: 'John Smith', required: true },
      { id: 'f_email', type: 'email', label: 'Confirmation Email', placeholder: 'john@smith.org', required: true },
      { id: 'f_tickets', type: 'number', label: 'Number of Tickets', min: 1, max: 5, placeholder: '1', required: true },
      { id: 'f_attendance', type: 'radio', label: 'Will you attend in-person or virtually?', options: ['In-Person (San Francisco)', 'Virtual Livestream'], required: true },
      {
        id: 'f_diet',
        type: 'dropdown',
        label: 'Dietary Restrictions (Lunch provided)',
        options: ['None / Standard', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher'],
        required: false,
        condition: { fieldId: 'f_attendance', operator: 'contains', value: 'In-Person' }
      }
    ]
  },
  {
    id: 'contact',
    title: 'Simple Contact & Inquiry Form',
    description: 'A clean, universally useful lead capture and contact form.',
    icon: Mail,
    color: 'bg-amber-50 text-amber-600',
    fields: [
      { id: 'f_name', type: 'text', label: 'Your Name', placeholder: 'Sarah Connor', required: true },
      { id: 'f_email', type: 'email', label: 'Email Address', placeholder: 'sarah@example.com', required: true },
      { id: 'f_subject', type: 'text', label: 'Subject', placeholder: 'Partnership Inquiry', required: true },
      { id: 'f_message', type: 'longtext', label: 'Your Message', placeholder: 'How can we help you?', required: true }
    ]
  }
];

export default function TemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Start with a Template</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pre-configured forms with fields, validation, and logic</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {PREBUILT_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="group p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`p-2 rounded-lg ${tmpl.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {tmpl.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{tmpl.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-600 font-medium">
                  <span>{tmpl.fields.length} pre-built fields</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
