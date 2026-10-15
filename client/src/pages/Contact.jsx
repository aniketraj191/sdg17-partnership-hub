import React, { useState } from 'react';
import {
  Mail,
  Send,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Globe2,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useNotification } from '../context/NotificationContext';

export const Contact = () => {
  const { notifySuccess, notifyError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      notifyError('Please complete all required fields.');
      return;
    }

    // Client email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      notifyError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/contact', formData);

      if (res.data?.success) {
        setSubmittedMessage(res.data.message);
        notifySuccess('Inquiry successfully recorded in MongoDB!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      const msg = err.response?.data?.message || 'Failed to submit contact message.';
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How are organizations verified on the SDG 17 Hub?',
      a: 'Organizations register their legal structure (NGO, Enterprise, Government, Community) and provide organizational credentials, contact emails, and contribution scope for secretariat review.',
    },
    {
      q: 'Does the platform process credit card payments?',
      a: 'No. The platform serves as a verified transparent recording ledger for institutional grants, co-financing, and non-monetary aid. We do not store card details or claim automated payment processing.',
    },
    {
      q: 'Can grassroots initiatives without official legal status join?',
      a: 'Yes, informal community groups can register under the "Community" category and collaborate on localized climate, education, or food distribution projects.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
          Secretariat & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Connect With Our Coordination Team
        </h1>
        <p className="text-sm text-slate-600">
          Have questions about multi-stakeholder partnerships, registering your agency, or submitting sample initiatives? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information & Office Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Hub Coordination Center
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 border border-forest-100">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Global Secretariat</span>
                  <p className="text-slate-500 mt-0.5">International Partnership Pavilion, UN Avenue, Nairobi & Geneva</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">General Support</span>
                  <p className="text-slate-500 mt-0.5">coordination@sdg17hub.demo</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Review Windows</span>
                  <p className="text-slate-500 mt-0.5">Monday – Friday, 08:00 – 17:00 UTC</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <b>Database Notice:</b> Submitting this form directly records your message into the MongoDB `contactmessages` collection for administrator triage.
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Send an Inquiry
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              All messages are logged securely to the server and reviewed by the partnership directorate.
            </p>

            {submittedMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Inquiry Recorded</span>
                  <p>{submittedMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Full name or representative title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    placeholder="name@organization.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Cross-Border Clean Energy Consortium Proposal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-input"
                  placeholder="Please describe your inquiry, your organization type, or the project collaboration you wish to establish..."
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Protected by input sanitization and rate limiting.
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-forest-700" />
          <h2 className="text-base font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
