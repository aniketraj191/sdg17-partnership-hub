import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Building2,
  FolderGit2,
  Coins,
  Clock,
  Wrench,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../api/axiosClient';
import { StatCard } from '../components/StatCard';
import { StatusBadge, SdgCategoryBadge, DemoDataBadge } from '../components/Badge';
import { Spinner, TableSkeleton } from '../components/LoadingSkeleton';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (chartsRes.data?.success) setCharts(chartsRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard metrics. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const STATUS_COLORS = {
    Active: '#10b981',
    Planned: '#3b82f6',
    Completed: '#047857',
  };

  const ORG_TYPE_COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="w-10 h-10" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Aggregating SDG 17 partnership metrics from MongoDB...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-red-900">Dashboard Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button onClick={fetchDashboardData} className="mt-4 btn-primary text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Impact & Analytics Dashboard
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-slate-500">
            Real-time MongoDB aggregation metrics for projects, partner organizations, and confirmed resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="btn-secondary text-xs"
            title="Refresh statistics from database"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Data
          </button>
          <Link to="/projects" className="btn-primary text-xs">
            Explore All Projects
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Organizations"
          value={stats?.totalOrganizations || 0}
          subtitle="Registered across 4 sectors"
          icon={Building2}
          color="forest"
          badgeText="Verified"
        />
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          subtitle={`${stats?.activeProjects || 0} active, ${stats?.completedProjects || 0} completed`}
          icon={FolderGit2}
          color="emerald"
        />
        <StatCard
          title="Confirmed Funding"
          value={`$${(stats?.contributions?.totalMonetaryConfirmed || 0).toLocaleString()}`}
          subtitle="Monetary grants confirmed"
          icon={Coins}
          color="blue"
          badgeText="Single Source"
        />
        <StatCard
          title="Active Partnerships"
          value={stats?.totalPartnerships || 0}
          subtitle="Multi-stakeholder proposals"
          icon={HeartHandshake}
          color="amber"
        />
      </div>

      {/* Non-Monetary In-Kind Support Counters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Non-Monetary In-Kind Contribution Totals
            </h3>
            <p className="text-xs text-slate-500">
              Separately tracked non-monetary commitments (not converted into or double-counted as cash).
            </p>
          </div>
          <span className="text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
            Strict Separation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Volunteer Hours</span>
              <p className="text-xl font-bold text-slate-900">
                {(stats?.contributions?.volunteerHours || 0).toLocaleString()} hrs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-800">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Equipment Units</span>
              <p className="text-xl font-bold text-slate-900">
                {(stats?.contributions?.equipmentCount || 0).toLocaleString()} items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-3 rounded-lg bg-amber-100 text-amber-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Services & Mentorship</span>
              <p className="text-xl font-bold text-slate-900">
                {(stats?.contributions?.servicesCount || 0).toLocaleString()} packages
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Status Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Project Status Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown of initiatives by current lifecycle state
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.statusDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={5}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(charts?.statusDistribution || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} projects`, name]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Organizations by Type Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Partner Entities by Sector
              </h3>
              <p className="text-xs text-slate-500">
                Multi-sector distribution of registered collaborators
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts?.organizationsByType || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} entities`, 'Organizations']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#047857" radius={[6, 6, 0, 0]}>
                  {(charts?.organizationsByType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ORG_TYPE_COLORS[index % ORG_TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Contributions by Project Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Confirmed Monetary Contributions vs Funding Targets
            </h3>
            <p className="text-xs text-slate-500">
              Comparison of verified grants received against original funding targets across top projects (USD)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Top 6 Initiatives</span>
        </div>

        <div className="h-72">
          {charts?.contributionsByProject?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts?.contributionsByProject}
                margin={{ top: 10, right: 15, left: 10, bottom: 25 }}
              >
                <XAxis
                  dataKey="title"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  tickFormatter={(val) => (val.length > 20 ? `${val.substring(0, 18)}...` : val)}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'confirmedMonetary' ? 'Confirmed Funding' : 'Funding Target']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="confirmedMonetary" name="Confirmed Funding ($)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fundingTarget" name="Funding Target ($)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No confirmed project contributions recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Recent Projects Published</h3>
              <Link to="/projects" className="text-xs font-semibold text-forest-700 hover:text-forest-800">
                View all &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {charts?.recentProjects?.map((p) => (
                <div key={p._id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/projects/${p._id}`}
                      className="text-xs font-bold text-slate-900 hover:text-forest-700 transition line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.organizationId?.name} • {p.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Contribution Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Recent Contribution Records</h3>
              <Link to="/contributions" className="text-xs font-semibold text-forest-700 hover:text-forest-800">
                View ledger &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {charts?.recentContributions?.map((c) => (
                <div key={c._id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block line-clamp-1">
                      {c.contributorName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      For: {c.projectId?.title || 'SDG Initiative'}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-700 block">
                      {c.contributionType === 'Monetary'
                        ? `$${c.amount.toLocaleString()}`
                        : `${c.quantity.toLocaleString()} ${c.unit || ''}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.contributionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
