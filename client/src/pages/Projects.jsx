import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  Building2,
  Coins,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Handshake,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge, SdgCategoryBadge, DemoDataBadge } from '../components/Badge';

export const Projects = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    sdgNumber: 17,
    category: 'Partnerships for the Goals',
    location: '',
    organizationId: '',
    budget: '',
    fundingTarget: '',
    startDate: '',
    endDate: '',
    status: 'Planned',
    requiredSupportTypes: ['Funding', 'Volunteers'],
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchProjects = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 9);
      params.append('sortBy', sortBy);
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.data?.success) {
        setProjects(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      notifyError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, sortBy, notifyError]);

  // Load organizations for dropdown
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const res = await api.get('/organizations?limit=100');
        if (res.data?.success) {
          setOrganizations(res.data.data);
          if (res.data.data.length > 0 && !formData.organizationId) {
            setFormData((prev) => ({ ...prev, organizationId: res.data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load organizations for dropdown:', err);
      }
    };
    loadOrgs();
  }, []);

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const handleOpenAddModal = () => {
    setFormData({
      ...initialForm,
      organizationId: organizations[0]?._id || '',
    });
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      sdgNumber: project.sdgNumber || 17,
      category: project.category,
      location: project.location,
      organizationId: project.organizationId?._id || project.organizationId,
      budget: project.budget,
      fundingTarget: project.fundingTarget,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: project.status,
      requiredSupportTypes: project.requiredSupportTypes || ['Funding'],
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (Number(formData.budget) < 0 || Number(formData.fundingTarget) < 0) {
      notifyError('Budget and Funding Target must be positive numbers.');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      notifyError('End date must be greater than or equal to start date.');
      return;
    }

    try {
      setFormLoading(true);

      const payload = {
        ...formData,
        budget: Number(formData.budget),
        fundingTarget: Number(formData.fundingTarget),
        sdgNumber: Number(formData.sdgNumber),
      };

      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, payload);
        notifySuccess('Project updated successfully.');
      } else {
        await api.post('/projects', payload);
        notifySuccess('Project created successfully.');
      }

      setIsModalOpen(false);
      fetchProjects(currentPage);
    } catch (err) {
      console.error('Error saving project:', err);
      notifyError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    try {
      setFormLoading(true);
      await api.delete(`/projects/${deletingProject._id}`);
      notifySuccess('Project removed successfully.');
      setDeletingProject(null);
      fetchProjects(currentPage);
    } catch (err) {
      console.error('Error deleting project:', err);
      notifyError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setFormLoading(false);
    }
  };

  const canModifyProject = (p) => {
    if (!isAuthenticated) return false;
    if (isAdmin) return true;
    const org = organizations.find((o) => o._id === (p.organizationId?._id || p.organizationId));
    return org?.ownerId?._id === user?.id || org?.ownerId === user?.id;
  };

  const supportOptions = ['Funding', 'Volunteers', 'Technology', 'Equipment', 'Expertise'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sustainability Projects
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-slate-500">
            Browse multi-stakeholder initiatives driving climate resilience, education, clean energy, and poverty alleviation.
          </p>
        </div>

        <div>
          {isAuthenticated ? (
            <button onClick={handleOpenAddModal} className="btn-primary">
              <Plus className="w-4 h-4" />
              Publish New Project
            </button>
          ) : (
            <Link to="/login" className="btn-secondary text-xs">
              Sign In to Create Project
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
          >
            <option value="All">All SDG Categories</option>
            <option value="Climate Action">Climate Action (SDG 13)</option>
            <option value="Clean Energy">Clean Energy (SDG 7)</option>
            <option value="Education">Education (SDG 4)</option>
            <option value="Food Security">Food Security (SDG 2)</option>
            <option value="Healthcare">Healthcare (SDG 3)</option>
            <option value="Water & Sanitation">Water & Sanitation (SDG 6)</option>
            <option value="Economic Growth">Economic Growth (SDG 8)</option>
            <option value="Partnerships for the Goals">Partnerships for the Goals (SDG 17)</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="funding-progress">Sort: Highest Funding %</option>
            <option value="budget-desc">Sort: Highest Budget</option>
            <option value="budget-asc">Sort: Lowest Budget</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects match your filter"
          description="Adjust your search terms, select 'All Categories', or reset the status dropdown."
          actionLabel={isAuthenticated ? 'Publish a Project' : null}
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const hasModifyAccess = canModifyProject(project);
            return (
              <div
                key={project._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SdgCategoryBadge category={project.category} sdgNumber={project.sdgNumber} />
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={project.status} />
                      {hasModifyAccess && (
                        <div className="flex items-center ml-1">
                          <button
                            onClick={() => handleOpenEditModal(project)}
                            className="p-1 rounded text-slate-400 hover:text-forest-700 hover:bg-slate-100 transition"
                            title="Edit project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProject(project)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-forest-700 transition">
                    <Link to={`/projects/${project._id}`}>{project.title}</Link>
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{project.organizationId?.name || 'Responsible Organization'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Required support pills */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.requiredSupportTypes?.map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Funding Progress Section */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">
                      ${(project.recordedContributions || 0).toLocaleString()}
                      <span className="text-slate-400 font-normal"> / ${(project.fundingTarget || 0).toLocaleString()}</span>
                    </span>
                    <span className="font-bold text-forest-700">{project.fundingProgress || 0}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, project.fundingProgress || 0)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span>Remaining: ${(project.remainingFunding || 0).toLocaleString()}</span>
                    <span>Budget: ${(project.budget || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to={`/partnerships?projectId=${project._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      Partner Up
                    </Link>
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-xs font-semibold text-forest-700 hover:text-forest-800"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchProjects(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary p-2 text-xs disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-600 px-2">
            Page {currentPage} of {totalPages} ({total} initiatives)
          </span>
          <button
            onClick={() => fetchProjects(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary p-2 text-xs disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Publish Sustainability Project'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="e.g. Solar Microgrids for Rural Community Clinics"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hosting Organization *
              </label>
              <select
                required
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                className="form-input"
              >
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                SDG Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const val = e.target.value;
                  let num = 17;
                  if (val === 'Climate Action') num = 13;
                  if (val === 'Clean Energy') num = 7;
                  if (val === 'Education') num = 4;
                  if (val === 'Food Security') num = 2;
                  if (val === 'Healthcare') num = 3;
                  if (val === 'Water & Sanitation') num = 6;
                  if (val === 'Economic Growth') num = 8;
                  setFormData({ ...formData, category: val, sdgNumber: num });
                }}
                className="form-input"
              >
                <option value="Climate Action">Climate Action (SDG 13)</option>
                <option value="Clean Energy">Clean Energy (SDG 7)</option>
                <option value="Education">Education (SDG 4)</option>
                <option value="Food Security">Food Security (SDG 2)</option>
                <option value="Healthcare">Healthcare (SDG 3)</option>
                <option value="Water & Sanitation">Water & Sanitation (SDG 6)</option>
                <option value="Economic Growth">Economic Growth (SDG 8)</option>
                <option value="Partnerships for the Goals">Partnerships for the Goals (SDG 17)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
                placeholder="e.g. Mombasa Coastal Zone, Kenya"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lifecycle Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Budget (USD) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="form-input"
                placeholder="e.g. 50000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Funding Target (USD) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.fundingTarget}
                onChange={(e) => setFormData({ ...formData, fundingTarget: e.target.value })}
                className="form-input"
                placeholder="e.g. 40000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Support Types
            </label>
            <div className="flex flex-wrap gap-2">
              {supportOptions.map((opt) => {
                const isSelected = formData.requiredSupportTypes?.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => {
                      const updated = isSelected
                        ? formData.requiredSupportTypes.filter((x) => x !== opt)
                        : [...(formData.requiredSupportTypes || []), opt];
                      setFormData({ ...formData, requiredSupportTypes: updated });
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
              Project Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              placeholder="Detail the project's SDG objectives, target population, timeline, and collaboration requirements..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary"
            >
              {formLoading ? 'Saving...' : editingProject ? 'Update Project' : 'Publish Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.title}"? All associated contributions and partnership records will also be permanently deleted.`}
        confirmText="Confirm Delete"
        loading={formLoading}
      />
    </div>
  );
};
