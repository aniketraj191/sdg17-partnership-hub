import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Handshake,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FolderGit2,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { StatusBadge, DemoDataBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const Partnerships = () => {
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId');

  const { user, isAuthenticated, isAdmin } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [activeTab, setActiveTab] = useState(preselectedProjectId ? 'propose' : 'opportunities');
  const [partnerships, setPartnerships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [statusFilter, setStatusFilter] = useState('All');

  // Proposal Form State
  const [targetProjectId, setTargetProjectId] = useState(preselectedProjectId || '');
  const [requestingOrgId, setRequestingOrgId] = useState('');
  const [selectedSupportTypes, setSelectedSupportTypes] = useState(['Volunteers', 'Technology']);
  const [proposalMessage, setProposalMessage] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Status Change State
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [partnerRes, projRes, orgRes] = await Promise.all([
        api.get(`/partnerships${statusFilter !== 'All' ? `?status=${statusFilter}` : ''}`),
        api.get('/projects?limit=50&status=Active'),
        api.get('/organizations?limit=50'),
      ]);

      if (partnerRes.data?.success) setPartnerships(partnerRes.data.data);
      if (projRes.data?.success) setProjects(projRes.data.data);
      if (orgRes.data?.success) {
        setOrganizations(orgRes.data.data);
        if (orgRes.data.data.length > 0 && !requestingOrgId) {
          setRequestingOrgId(orgRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load partnership data:', err);
      notifyError('Failed to fetch partnership information.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, requestingOrgId, notifyError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (preselectedProjectId) {
      setTargetProjectId(preselectedProjectId);
      setActiveTab('propose');
    }
  }, [preselectedProjectId]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notifyError('Please sign in to submit a partnership proposal.');
      return;
    }

    if (!targetProjectId || !requestingOrgId) {
      notifyError('Please select both a target project and your collaborating organization.');
      return;
    }

    if (selectedSupportTypes.length === 0) {
      notifyError('Please select at least one type of support to provide.');
      return;
    }

    try {
      setSubmittingProposal(true);
      await api.post('/partnerships', {
        projectId: targetProjectId,
        organizationId: requestingOrgId,
        message: proposalMessage,
        supportTypes: selectedSupportTypes,
      });

      notifySuccess('Partnership proposal submitted successfully!');
      setProposalMessage('');
      setActiveTab('requests');
      fetchData();
    } catch (err) {
      console.error('Submission failed:', err);
      notifyError(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleStatusUpdate = async (partnershipId, newStatus) => {
    try {
      setUpdatingStatusId(partnershipId);
      await api.patch(`/partnerships/${partnershipId}/status`, {
        status: newStatus,
        responseNotes: `Status changed to ${newStatus} by authorized user.`,
      });
      notifySuccess(`Partnership request marked as ${newStatus}.`);
      fetchData();
    } catch (err) {
      console.error('Status update failed:', err);
      notifyError(err.response?.data?.message || 'Unauthorized or failed to update status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const supportOptions = ['Funding', 'Volunteers', 'Technology', 'Equipment', 'Expertise'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Partnership Opportunities & Exchange
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-slate-500">
            Discover resource gaps across sustainability projects and establish multi-stakeholder collaboration agreements.
          </p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'opportunities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Open Needs ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Collaboration Requests ({partnerships.length})
          </button>
          <button
            onClick={() => setActiveTab('propose')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'propose'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'text-forest-700 hover:text-forest-800'
            }`}
          >
            + Express Interest
          </button>
        </div>
      </div>

      {/* Tab 1: Open Needs Opportunities Cards */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <b>SDG 17 Matchmaking:</b> These active initiatives are explicitly seeking partner support. Review their objectives and express interest directly.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-700 border border-forest-200">
                      SDG {p.sdgNumber} • {p.category}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-forest-700 transition">
                    <Link to={`/projects/${p._id}`}>{p.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Location: <b>{p.location}</b>
                  </p>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Required support list */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Support Required:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.requiredSupportTypes?.map((s, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Funding Target</span>
                    <span className="font-bold text-slate-800">${(p.fundingTarget || 0).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      setTargetProjectId(p._id);
                      setActiveTab('propose');
                    }}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    <Handshake className="w-3.5 h-3.5 mr-1" />
                    Express Interest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Collaboration Requests List */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Submitted Partnership Requests ({partnerships.length})
              </h2>
              <p className="text-xs text-slate-500">
                All multi-stakeholder proposals submitted through the platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input text-xs py-1"
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : partnerships.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="No partnership requests found"
              description="Be the first organization to submit a collaboration proposal for an active project."
              actionLabel="Submit Partnership Proposal"
              onAction={() => setActiveTab('propose')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnerships.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Initiative:
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 hover:text-forest-700 transition">
                          <Link to={`/projects/${req.projectId?._id}`}>{req.projectId?.title || 'Project'}</Link>
                        </h3>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="text-xs text-slate-600">
                      <span>Proposing Partner: </span>
                      <b className="text-slate-800">{req.organizationId?.name}</b>
                      <span className="text-slate-400"> ({req.organizationId?.type} • {req.organizationId?.country})</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                      "{req.message}"
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Offered Capabilities:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {req.supportTypes?.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {req.responseNotes && (
                      <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-900">
                        <b>Response Note:</b> {req.responseNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions for Host Org or Admin */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    {/* Authorized status controls */}
                    {isAuthenticated && req.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'Accepted')}
                          disabled={updatingStatusId === req._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                          disabled={updatingStatusId === req._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Propose Partnership Form */}
      {activeTab === 'propose' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Submit a Partnership Proposal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Offer your organization's expertise, funding, technology, or volunteers to an active initiative.
            </p>
          </div>

          <form onSubmit={handleSubmitProposal} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Project Initiative *
              </label>
              <select
                required
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="form-input"
              >
                <option value="">-- Choose Project to Support --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Organization *
              </label>
              <select
                required
                value={requestingOrgId}
                onChange={(e) => setRequestingOrgId(e.target.value)}
                className="form-input"
              >
                <option value="">-- Choose Your Organization --</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.type} • {org.city})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400">
                Don't see your organization? <Link to="/organizations" className="text-forest-700 underline">Register it here first.</Link>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Offered Support Modalities *
              </label>
              <div className="flex flex-wrap gap-2">
                {supportOptions.map((opt) => {
                  const isSelected = selectedSupportTypes.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSupportTypes(selectedSupportTypes.filter((x) => x !== opt));
                        } else {
                          setSelectedSupportTypes([...selectedSupportTypes, opt]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-forest-700 text-white border-forest-800 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Proposal Details & Value Proposition *
              </label>
              <textarea
                required
                rows={4}
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                className="form-input"
                placeholder="Explain what resources, technical capability, or field presence your organization is pledging..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('opportunities')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingProposal}
                className="btn-primary"
              >
                {submittingProposal ? 'Submitting...' : 'Submit Partnership Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
