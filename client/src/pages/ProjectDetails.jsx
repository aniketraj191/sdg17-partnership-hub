import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Coins,
  Clock,
  Wrench,
  Handshake,
  CheckCircle2,
  PlusCircle,
  FileText,
  AlertCircle,
  Users,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { StatusBadge, SdgCategoryBadge, DemoDataBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/LoadingSkeleton';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contribute Modal
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contribType, setContribType] = useState('Monetary');
  const [contribAmount, setContribAmount] = useState('');
  const [contribQuantity, setContribQuantity] = useState('');
  const [contribUnit, setContribUnit] = useState('USD');
  const [contribName, setContribName] = useState(user?.name || '');
  const [contribEmail, setContribEmail] = useState(user?.email || '');
  const [contribDesc, setContribDesc] = useState('');
  const [submittingContrib, setSubmittingContrib] = useState(false);

  // Partnership Proposal Modal
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerMessage, setPartnerMessage] = useState('');
  const [selectedSupport, setSelectedSupport] = useState(['Volunteers']);
  const [partnerOrgId, setPartnerOrgId] = useState('');
  const [userOrgs, setUserOrgs] = useState([]);
  const [submittingPartner, setSubmittingPartner] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data?.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      setError('Project not found or invalid identifier.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Load organizations for partnership proposal
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/organizations').then((res) => {
        if (res.data?.success) {
          setUserOrgs(res.data.data);
          if (res.data.data.length > 0) {
            setPartnerOrgId(res.data.data[0]._id);
          }
        }
      }).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleRecordContribution = async (e) => {
    e.preventDefault();
    try {
      setSubmittingContrib(true);
      const payload = {
        projectId: id,
        contributorName: contribName,
        contributorEmail: contribEmail,
        contributionType: contribType,
        amount: contribType === 'Monetary' ? Number(contribAmount) : 0,
        quantity: contribType !== 'Monetary' ? Number(contribQuantity) : 0,
        unit: contribType === 'Monetary' ? 'USD' : contribUnit,
        description: contribDesc,
      };

      const res = await api.post('/contributions', payload);
      notifySuccess(res.data.message || 'Contribution recorded successfully.');
      setIsContributeModalOpen(false);
      setContribAmount('');
      setContribQuantity('');
      setContribDesc('');
      fetchProjectDetails();
    } catch (err) {
      console.error('Failed to record contribution:', err);
      notifyError(err.response?.data?.message || 'Failed to submit contribution.');
    } finally {
      setSubmittingContrib(false);
    }
  };

  const handleExpressInterest = async (e) => {
    e.preventDefault();
    if (!partnerOrgId) {
      notifyError('Please select or register an organization before proposing a partnership.');
      return;
    }

    try {
      setSubmittingPartner(true);
      const res = await api.post('/partnerships', {
        projectId: id,
        organizationId: partnerOrgId,
        message: partnerMessage,
        supportTypes: selectedSupport,
      });

      notifySuccess('Partnership expression of interest sent successfully!');
      setIsPartnerModalOpen(false);
      setPartnerMessage('');
      fetchProjectDetails();
    } catch (err) {
      console.error('Failed to express interest:', err);
      notifyError(err.response?.data?.message || 'Failed to submit partnership request.');
    } finally {
      setSubmittingPartner(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
        <Spinner size="w-8 h-8" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">{error || 'Project not found'}</h2>
        <Link to="/projects" className="mt-4 btn-primary inline-flex text-xs">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all projects
        </Link>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <SdgCategoryBadge category={project.category} sdgNumber={project.sdgNumber} />
              <StatusBadge status={project.status} />
              {project.isSampleData && <DemoDataBadge />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <Link
                to={`/organizations/${project.organizationId?._id}`}
                className="flex items-center gap-1.5 text-forest-700 font-semibold hover:underline"
              >
                <Building2 className="w-3.5 h-3.5" />
                {project.organizationId?.name}
              </Link>

              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.location}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(project.startDate).toLocaleDateString()}
                {project.endDate && ` – ${new Date(project.endDate).toLocaleDateString()}`}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsContributeModalOpen(true)}
              className="btn-primary"
            >
              <Coins className="w-4 h-4" />
              Record Contribution
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  notifyError('Please sign in to propose a partnership.');
                  navigate('/login');
                  return;
                }
                setIsPartnerModalOpen(true);
              }}
              className="btn-secondary"
            >
              <Handshake className="w-4 h-4 text-emerald-700" />
              Express Interest
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Project Overview & Objectives
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* Required Support Badges */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Requested Partnership Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.requiredSupportTypes?.map((s, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-forest-50 text-forest-800 border border-forest-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Metrics & Resource Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Budget
          </span>
          <p className="text-2xl font-black text-slate-900">
            ${(project.budget || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Full project estimated cost</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Funding Target
          </span>
          <p className="text-2xl font-black text-slate-900">
            ${(project.fundingTarget || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Sought external co-financing</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
            Confirmed Grants
          </span>
          <p className="text-2xl font-black text-emerald-700">
            ${(project.recordedContributions || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">{project.fundingProgress || 0}% funded</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Remaining Target
          </span>
          <p className="text-2xl font-black text-slate-900">
            ${(project.remainingFunding || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Still open for co-sponsors</p>
        </div>
      </div>

      {/* Progress Bar Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Funding Mobilization Progress</span>
          <span className="text-forest-700 text-sm font-bold">{project.fundingProgress || 0}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, project.fundingProgress || 0)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 pt-1">
          *Note: Per UN SDG 17 platform rules, reaching 100% funding target does not automatically close an initiative; status remains active until final project execution is completed.
        </p>
      </div>

      {/* Non-Monetary Resource Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recorded Volunteer Service
            </span>
            <p className="text-2xl font-black text-slate-900">
              {(project.totalVolunteerHours || 0).toLocaleString()} Hours
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Donated Equipment Items
            </span>
            <p className="text-2xl font-black text-slate-900">
              {(project.totalEquipmentItems || 0).toLocaleString()} Units
            </p>
          </div>
        </div>
      </div>

      {/* Contributions History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recorded Contributions History ({project.contributions?.length || 0})
            </h2>
            <p className="text-xs text-slate-500">
              Transparent, audited ledger of financial grants and in-kind commitments.
            </p>
          </div>
          <button
            onClick={() => setIsContributeModalOpen(true)}
            className="btn-secondary text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-forest-700 mr-1" /> Add Record
          </button>
        </div>

        {!project.contributions || project.contributions.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No contributions recorded yet for this project. Be the first partner to pledge!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Contributor</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount / Qty</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.contributions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{c.contributorName}</span>
                      {c.description && (
                        <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                          {c.description}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{c.contributionType}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.contributionType === 'Monetary'
                        ? `$${c.amount.toLocaleString()} USD`
                        : `${c.quantity.toLocaleString()} ${c.unit || ''}`}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.contributionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Contribution Modal */}
      <Modal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title="Record Contribution to Project"
      >
        <form onSubmit={handleRecordContribution} className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
            <b>Transparency Notice:</b> This platform is a verified contribution logging system. No payment card data is captured. Submissions are audited by the project host organization.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contribution Type *
            </label>
            <select
              value={contribType}
              onChange={(e) => setContribType(e.target.value)}
              className="form-input"
            >
              <option value="Monetary">Monetary Grant (USD)</option>
              <option value="Volunteer Hours">Volunteer Hours</option>
              <option value="Equipment">Equipment / Hardware</option>
              <option value="Services">Professional Services / Software</option>
            </select>
          </div>

          {contribType === 'Monetary' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monetary Amount (USD) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                className="form-input"
                placeholder="e.g. 5000"
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
                  value={contribQuantity}
                  onChange={(e) => setContribQuantity(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit Label *
                </label>
                <input
                  type="text"
                  required
                  value={contribUnit}
                  onChange={(e) => setContribUnit(e.target.value)}
                  className="form-input"
                  placeholder={contribType === 'Volunteer Hours' ? 'Hours' : 'Panels, Laptops, Licenses'}
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
                value={contribName}
                onChange={(e) => setContribName(e.target.value)}
                className="form-input"
                placeholder="Individual or Organization name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contributor Email *
              </label>
              <input
                type="email"
                required
                value={contribEmail}
                onChange={(e) => setContribEmail(e.target.value)}
                className="form-input"
                placeholder="contributor@example.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Allocation Note (Optional)
            </label>
            <textarea
              rows={2}
              value={contribDesc}
              onChange={(e) => setContribDesc(e.target.value)}
              className="form-input"
              placeholder="e.g. Earmarked for phase 1 clinic solar panel deployment."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsContributeModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingContrib}
              className="btn-primary"
            >
              {submittingContrib ? 'Recording...' : 'Submit Contribution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Express Interest Modal */}
      <Modal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        title="Express Partnership Interest"
      >
        <form onSubmit={handleExpressInterest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Registered Organization *
            </label>
            <select
              required
              value={partnerOrgId}
              onChange={(e) => setPartnerOrgId(e.target.value)}
              className="form-input"
            >
              {userOrgs.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name} ({org.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Offered Support Types *
            </label>
            <div className="flex flex-wrap gap-2">
              {['Funding', 'Volunteers', 'Technology', 'Equipment', 'Expertise'].map((opt) => {
                const isSelected = selectedSupport.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSupport(selectedSupport.filter((x) => x !== opt));
                      } else {
                        setSelectedSupport([...selectedSupport, opt]);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-forest-700 text-white border-forest-800'
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
              Collaboration Proposal Message *
            </label>
            <textarea
              required
              rows={4}
              value={partnerMessage}
              onChange={(e) => setPartnerMessage(e.target.value)}
              className="form-input"
              placeholder="Explain how your organization can support this initiative, what assets or expertise you bring, and your preferred timeline..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPartnerModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPartner}
              className="btn-primary"
            >
              {submittingPartner ? 'Sending...' : 'Send Partnership Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
