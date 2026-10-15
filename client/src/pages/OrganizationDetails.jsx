import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Mail,
  Globe,
  Calendar,
  Layers,
  ArrowLeft,
  Plus,
  FolderGit2,
  ExternalLink,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, SdgCategoryBadge, DemoDataBadge } from '../components/Badge';
import { Spinner } from '../components/LoadingSkeleton';

export const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/organizations/${id}`);
        if (res.data?.success) {
          setOrg(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load organization:', err);
        setError('Organization not found or invalid identifier.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
        <Spinner size="w-8 h-8" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">{error || 'Organization not found'}</h2>
        <Link to="/organizations" className="mt-4 btn-primary inline-flex text-xs">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/organizations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all organizations
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 flex-shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {org.name}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200">
                  {org.type}
                </span>
                {org.isSampleData && <DemoDataBadge />}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {org.city}, {org.country}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {org.contactEmail}
                </span>
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-forest-700 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(org.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Mission & Scope
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
            {org.description}
          </p>
        </div>

        {/* Contribution Areas */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Areas of Contribution
          </h3>
          <div className="flex flex-wrap gap-2">
            {org.contributionAreas?.map((area, i) => (
              <span
                key={i}
                className="text-xs font-medium px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Projects by this Organization */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Projects Managed ({org.projects?.length || 0})
            </h2>
            <p className="text-xs text-slate-500">
              Active and planned initiatives launched by {org.name}.
            </p>
          </div>
        </div>

        {!org.projects || org.projects.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No projects have been registered by this organization yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {org.projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SdgCategoryBadge category={project.category} sdgNumber={project.sdgNumber} />
                    <StatusBadge status={project.status} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-forest-700 transition">
                    <Link to={`/projects/${project._id}`}>{project.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Budget: <b className="text-slate-800">${(project.budget || 0).toLocaleString()}</b>
                  </span>
                  <Link
                    to={`/projects/${project._id}`}
                    className="font-semibold text-forest-700 hover:text-forest-800"
                  >
                    View Project &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
