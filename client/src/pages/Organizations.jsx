import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MapPin,
  Mail,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { DemoDataBadge } from '../components/Badge';

export const Organizations = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [area, setArea] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [deletingOrg, setDeletingOrg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    type: 'NGO',
    description: '',
    city: '',
    country: '',
    contributionAreas: 'Climate Action, Partnerships for the Goals',
    contactEmail: '',
    website: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchOrganizations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 9);
      if (search.trim()) params.append('search', search.trim());
      if (type !== 'All') params.append('type', type);
      if (area !== 'All') params.append('area', area);

      const res = await api.get(`/organizations?${params.toString()}`);
      if (res.data?.success) {
        setOrganizations(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      notifyError('Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  }, [search, type, area, notifyError]);

  useEffect(() => {
    fetchOrganizations(1);
  }, [fetchOrganizations]);

  const handleOpenAddModal = () => {
    setFormData(initialForm);
    setEditingOrg(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      description: org.description,
      city: org.city,
      country: org.country,
      contributionAreas: org.contributionAreas ? org.contributionAreas.join(', ') : '',
      contactEmail: org.contactEmail,
      website: org.website || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      const payload = {
        ...formData,
        contributionAreas: formData.contributionAreas
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingOrg) {
        await api.put(`/organizations/${editingOrg._id}`, payload);
        notifySuccess('Organization updated successfully.');
      } else {
        await api.post('/organizations', payload);
        notifySuccess('Organization registered successfully.');
      }

      setIsAddModalOpen(false);
      fetchOrganizations(currentPage);
    } catch (err) {
      console.error('Error saving organization:', err);
      const msg = err.response?.data?.message || 'Failed to save organization.';
      notifyError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrg) return;
    try {
      setFormLoading(true);
      await api.delete(`/organizations/${deletingOrg._id}`);
      notifySuccess('Organization removed successfully.');
      setDeletingOrg(null);
      fetchOrganizations(currentPage);
    } catch (err) {
      console.error('Error deleting organization:', err);
      notifyError(err.response?.data?.message || 'Failed to delete organization.');
    } finally {
      setFormLoading(false);
    }
  };

  const canModifyOrg = (org) => {
    if (!isAuthenticated) return false;
    if (isAdmin) return true;
    return org.ownerId?._id === user?.id || org.ownerId === user?.id;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Partner Organizations
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-slate-500">
            Discover NGOs, companies, government bodies, and communities collaborating on SDG 17.
          </p>
        </div>

        <div>
          {isAuthenticated ? (
            <button onClick={handleOpenAddModal} className="btn-primary">
              <Plus className="w-4 h-4" />
              Register Organization
            </button>
          ) : (
            <Link to="/login" className="btn-secondary text-xs">
              Sign In to Register Organization
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, description, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="form-input"
          >
            <option value="All">All Organization Types</option>
            <option value="NGO">NGO (Non-Governmental)</option>
            <option value="Company">Company / Social Enterprise</option>
            <option value="Government">Government / Public Agency</option>
            <option value="Community">Community Group</option>
          </select>
        </div>

        {/* Sector Filter */}
        <div className="relative">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="form-input"
          >
            <option value="All">All Contribution Areas</option>
            <option value="Climate Action">Climate Action</option>
            <option value="Clean Energy">Clean Energy</option>
            <option value="Education">Education</option>
            <option value="Food Security">Food Security</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Partnerships for the Goals">Partnerships for the Goals</option>
          </select>
        </div>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations found"
          description="Try modifying your search keywords or filter dropdowns."
          actionLabel={isAuthenticated ? 'Register an Organization' : null}
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => {
            const hasModifyAccess = canModifyOrg(org);
            return (
              <div
                key={org._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                      {org.type}
                    </span>
                    {hasModifyAccess && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(org)}
                          className="p-1 rounded-lg text-slate-400 hover:text-forest-700 hover:bg-slate-100 transition"
                          title="Edit organization"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingOrg(org)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                          title="Delete organization"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-forest-700 transition">
                    <Link to={`/organizations/${org._id}`}>{org.name}</Link>
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{org.city}, {org.country}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {org.description}
                  </p>

                  {/* Contribution Areas Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {org.contributionAreas?.slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {a}
                      </span>
                    ))}
                    {org.contributionAreas?.length > 3 && (
                      <span className="text-[11px] font-medium text-slate-400 self-center">
                        +{org.contributionAreas.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[150px]">{org.contactEmail}</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      {org.totalProjects || 0} projects
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(org.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/organizations/${org._id}`}
                      className="text-xs font-semibold text-forest-700 hover:text-forest-800"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchOrganizations(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary p-2 text-xs disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-600 px-2">
            Page {currentPage} of {totalPages} ({total} organizations)
          </span>
          <button
            onClick={() => fetchOrganizations(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary p-2 text-xs disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingOrg ? 'Edit Organization' : 'Register Organization'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="e.g. Green Horizons Environmental Alliance"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Organization Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form-input"
              >
                <option value="NGO">NGO (Non-Governmental)</option>
                <option value="Company">Company / Enterprise</option>
                <option value="Government">Government / Public Agency</option>
                <option value="Community">Community Group</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="form-input"
                placeholder="contact@org.org"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
                placeholder="e.g. Nairobi"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="form-input"
                placeholder="e.g. Kenya"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Main Areas of Contribution (comma separated) *
            </label>
            <input
              type="text"
              required
              value={formData.contributionAreas}
              onChange={(e) => setFormData({ ...formData, contributionAreas: e.target.value })}
              className="form-input"
              placeholder="e.g. Climate Action, Clean Energy, Education"
            />
            <span className="text-[11px] text-slate-400">
              Separate multiple areas with commas.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              placeholder="Describe your organization's mission, sustainable development goals, and collaborative focus..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Website URL (Optional)
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="form-input"
              placeholder="https://example.org"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary"
            >
              {formLoading ? 'Saving...' : editingOrg ? 'Update Organization' : 'Register Organization'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingOrg}
        onClose={() => setDeletingOrg(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
        message={`Are you sure you want to remove "${deletingOrg?.name}"? All associated data will be removed.`}
        confirmText="Confirm Delete"
        loading={formLoading}
      />
    </div>
  );
};
