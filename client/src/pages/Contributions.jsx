import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Search,
  Filter,
  Plus,
  Clock,
  Wrench,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { StatusBadge, DemoDataBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const Contributions = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [contributions, setContributions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Add Contribution Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formType, setFormType] = useState('Monetary');
  const [formProject, setFormProject] = useState('');
  const [formName, setFormName] = useState(user?.name || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formAmount, setFormAmount] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState('USD');
  const [formDesc, setFormDesc] = useState('');

  const fetchContributions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (typeFilter !== 'All') params.append('contributionType', typeFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (projectIdFilter) params.append('projectId', projectIdFilter);

      const res = await api.get(`/contributions?${params.toString()}`);
      if (res.data?.success) {
        setContributions(res.data.data);
        setSummary(res.data.summary);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      }
    } catch (err) {
      console.error('Failed to load contributions:', err);
      notifyError('Failed to fetch contribution ledger.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, projectIdFilter, notifyError]);

  useEffect(() => {
    fetchContributions(1);
  }, [fetchContributions]);

  const handleOpenModal = () => {
    api.get('/projects?limit=100').then((res) => {
      if (res.data?.success && res.data.data.length > 0) {
        setProjects(res.data.data);
        if (!formProject || !res.data.data.some((p) => p._id === formProject)) {
          setFormProject(res.data.data[0]._id);
        }
      }
    }).catch(console.error);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Load projects for dropdown
    api.get('/projects?limit=100').then((res) => {
      if (res.data?.success && res.data.data.length > 0) {
        setProjects(res.data.data);
        if (!formProject) {
          setFormProject(res.data.data[0]._id);
        }
      }
    }).catch(console.error);
  }, []);

  const handleAddContribution = async (e) => {
    e.preventDefault();

    if (formType === 'Monetary' && (!formAmount || Number(formAmount) <= 0)) {
      notifyError('Please enter a valid positive monetary amount.');
      return;
    }

    if (formType !== 'Monetary' && (!formQuantity || Number(formQuantity) <= 0)) {
      notifyError('Please enter a valid positive quantity.');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        projectId: formProject,
        contributorName: formName,
        contributorEmail: formEmail,
        contributionType: formType,
        amount: formType === 'Monetary' ? Number(formAmount) : 0,
        quantity: formType !== 'Monetary' ? Number(formQuantity) : 0,
        unit: formType === 'Monetary' ? 'USD' : formUnit,
        description: formDesc,
      };

      const res = await api.post('/contributions', payload);
      notifySuccess(res.data.message || 'Contribution recorded.');
      setIsModalOpen(false);
      setFormAmount('');
      setFormQuantity('');
      setFormDesc('');
      fetchContributions(currentPage);
    } catch (err) {
      console.error('Submission failed:', err);
      notifyError(err.response?.data?.message || 'Failed to record contribution.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleVerifyStatus = async (contributionId, newStatus) => {
    try {
      await api.put(`/contributions/${contributionId}`, { status: newStatus });
      notifySuccess(`Contribution record updated to ${newStatus}.`);
      fetchContributions(currentPage);
    } catch (err) {
      console.error('Error updating status:', err);
      notifyError(err.response?.data?.message || 'Unauthorized or failed to update record.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transparent Contribution Ledger
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-slate-500">
            Open, verifiable tracking of financial grants and non-monetary commitments across SDG projects.
          </p>
        </div>

        <div>
          <button onClick={handleOpenModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Record Contribution
          </button>
        </div>
      </div>

      {/* Audit & Transparency Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>Auditing Principles:</b> This is an institutional contribution-recording system. No card transactions are captured. Confirmed monetary amounts reflect verified institutional disbursements. Non-monetary items (volunteer hours, hardware, mentorship) are audited separately without converting to arbitrary monetary values.
        </div>
      </div>

      {/* Aggregate Verified Totals Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">
            Confirmed Funding
          </span>
          <p className="text-2xl font-black text-slate-900">
            ${(summary?.totalMonetaryConfirmed || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">USD confirmed</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Volunteer Service
          </span>
          <p className="text-2xl font-black text-slate-900">
            {(summary?.totalVolunteerHours || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Hours audited</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Equipment Donated
          </span>
          <p className="text-2xl font-black text-slate-900">
            {(summary?.totalEquipmentUnits || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Physical hardware units</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Services & Mentorship
          </span>
          <p className="text-2xl font-black text-slate-900">
            {(summary?.totalServicesCount || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Committed packages</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search contributor or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        {/* Contribution Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-input"
          >
            <option value="All">All Contribution Types</option>
            <option value="Monetary">Monetary (USD)</option>
            <option value="Volunteer Hours">Volunteer Hours</option>
            <option value="Equipment">Equipment / Goods</option>
            <option value="Services">Professional Services</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending Audit</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <select
            value={projectIdFilter}
            onChange={(e) => setProjectIdFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : contributions.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="No contributions matching criteria"
          description="Try resetting your filters or record a new contribution."
          actionLabel="Record Contribution"
          onAction={handleOpenModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Contributor</th>
                  <th className="py-3.5 px-4">Project Initiative</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount / Quantity</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAuthenticated && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{c.contributorName}</span>
                      {c.description && (
                        <span className="text-[11px] text-slate-500 max-w-xs truncate block">
                          {c.description}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/projects/${c.projectId?._id}`}
                        className="font-medium text-slate-800 hover:text-forest-700 line-clamp-1"
                      >
                        {c.projectId?.title || 'SDG Project'}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {c.contributionType}
                    </td>

                    <td className="py-3.5 px-4">
                      {c.contributionType === 'Monetary' ? (
                        <span className="font-black text-emerald-700">
                          ${c.amount.toLocaleString()} USD
                        </span>
                      ) : (
                        <span className="font-bold text-slate-800">
                          {c.quantity.toLocaleString()} {c.unit || ''}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(c.contributionDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    {isAuthenticated && (
                      <td className="py-3.5 px-4 text-right">
                        {c.status === 'Pending' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyStatus(c._id, 'Confirmed')}
                              className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyStatus(c._id, 'Rejected')}
                              className="px-2 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchContributions(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary p-2 text-xs disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-600 px-2">
            Page {currentPage} of {totalPages} ({total} records)
          </span>
          <button
            onClick={() => fetchContributions(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary p-2 text-xs disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Record Contribution Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Contribution"
      >
        <form onSubmit={handleAddContribution} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Initiative *
            </label>
            {projects.length === 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  No initiatives found in the database yet.
                </p>
                <p className="text-slate-600">
                  Please publish a project or run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">npm run seed</code> first.
                </p>
                <div className="pt-2">
                  <Link
                    to="/projects"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center gap-1 font-bold text-forest-700 hover:underline"
                  >
                    Go to Projects &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <select
                required
                value={formProject}
                onChange={(e) => setFormProject(e.target.value)}
                className="form-input"
              >
                <option value="">-- Choose an Initiative to Support --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.location})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contribution Type *
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="form-input"
            >
              <option value="Monetary">Monetary Grant (USD)</option>
              <option value="Volunteer Hours">Volunteer Hours</option>
              <option value="Equipment">Equipment / Hardware</option>
              <option value="Services">Services / Tech Support</option>
            </select>
          </div>

          {formType === 'Monetary' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monetary Amount (USD) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="form-input"
                placeholder="e.g. 10000"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit Label *
                </label>
                <input
                  type="text"
                  required
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="form-input"
                  placeholder="Hours, Tablets, Kits, Modules"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contributor / Partner Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="form-input"
                placeholder="e.g. Horizon Aid Trust"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contributor Email *
              </label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="form-input"
                placeholder="giving@organization.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Intended Use (Optional)
            </label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="form-input"
              placeholder="e.g. Earmarked for purchasing offline tablets and solar chargers."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || projects.length === 0}
              className="btn-primary"
            >
              {formLoading ? 'Recording...' : projects.length === 0 ? 'No Initiative Available' : 'Record Contribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
