import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  ArrowRight,
  Sparkles,
  Building2,
  FolderGit2,
  Coins,
  ShieldCheck,
  Users2,
  Leaf,
  Sun,
  GraduationCap,
  HeartPulse,
  Apple,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import api from '../api/axiosClient';
import { StatusBadge, SdgCategoryBadge, DemoDataBadge } from '../components/Badge';
import { CardSkeleton } from '../components/LoadingSkeleton';

export const Home = () => {
  const [stats, setStats] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/projects?limit=3&sortBy=funding-progress'),
        ]);

        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (projectsRes.data?.success) setFeaturedProjects(projectsRes.data.data);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const categories = [
    { name: 'Climate Action', sdg: 13, icon: Leaf, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { name: 'Clean Energy', sdg: 7, icon: Sun, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { name: 'Education', sdg: 4, icon: GraduationCap, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { name: 'Healthcare', sdg: 3, icon: HeartPulse, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { name: 'Food Security', sdg: 2, icon: Apple, color: 'text-green-700 bg-green-50 border-green-200' },
    { name: 'Partnerships for the Goals', sdg: 17, icon: Globe2, color: 'text-forest-700 bg-forest-50 border-forest-200' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Register Your Organization',
      desc: 'Join as an NGO, social company, government entity, or community group to establish your verified profile.',
    },
    {
      num: '02',
      title: 'Publish or Discover Projects',
      desc: 'List sustainable development initiatives needing funding, equipment, technology, or specialized volunteers.',
    },
    {
      num: '03',
      title: 'Propose Collaborative Partnerships',
      desc: 'Connect with partners across sectors, align resources, and formalize cooperative action agreements.',
    },
    {
      num: '04',
      title: 'Track Verified Progress & Impact',
      desc: 'Transparently record monetary and in-kind contributions, celebrate milestones, and measure progress toward UN Goals.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-900 via-forest-800 to-forest-950 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-700/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>UN Sustainable Development Goal 17 Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
            Together, We Can Achieve More.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-emerald-100/90 font-normal leading-relaxed">
            The <b>SDG 17 Partnership Hub</b> unites NGOs, visionary enterprises, educational institutions, and public agencies to mobilize resources, share expertise, and accelerate sustainable development worldwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 px-6 py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
            >
              Explore Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/organizations"
              className="inline-flex items-center gap-2 rounded-xl bg-forest-800/80 hover:bg-forest-700/80 text-white border border-emerald-400/30 px-6 py-3.5 text-sm font-semibold backdrop-blur transition-all"
            >
              Become a Partner
            </Link>
          </div>

          {/* Demonstration Notice Banner */}
          <div className="pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Live Demonstration Platform: Statistics & records reflect database sample initiatives.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-lg shadow-slate-200/50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 flex-shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Registered Partners
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {loading ? '...' : stats?.totalOrganizations || 0}
                </span>
                <span className="text-xs text-forest-600 font-medium">NGOs & Enterprises</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-lg shadow-slate-200/50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Initiatives
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {loading ? '...' : stats?.activeProjects || 0}
                </span>
                <span className="text-xs text-emerald-600 font-medium">of {stats?.totalProjects || 0} total</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-lg shadow-slate-200/50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
              <Coins className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recorded Funding
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {loading ? '...' : `$${(stats?.contributions?.totalMonetaryConfirmed || 0).toLocaleString()}`}
                </span>
                <span className="text-xs text-blue-600 font-medium">Confirmed grants</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories for SDG Collaboration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700 block mb-2">
            Priority Sectors
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Key Sustainable Development Goals
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Targeting systemic challenges across human rights, planetary boundaries, and socioeconomic equity.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/projects?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-forest-400 transition-all text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-3 group-hover:scale-110 transition-transform ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SDG {cat.sdg}
                </span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 group-hover:text-forest-700 transition">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Sustainability Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700 block mb-1">
              Active Collaborations
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Sustainability Projects
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              High-impact initiatives actively seeking partner engagement, in-kind aid, and funding.
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-800"
          >
            Browse all projects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            No projects found. Seed or create projects to see them here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SdgCategoryBadge category={project.category} sdgNumber={project.sdgNumber} />
                    <StatusBadge status={project.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-forest-700 transition">
                    <Link to={`/projects/${project._id}`}>{project.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Host: <b className="text-slate-700">{project.organizationId?.name || 'Partner Org'}</b></span>
                    <span>{project.location}</span>
                  </div>
                </div>

                {/* Funding Progress Bar */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">
                      ${(project.recordedContributions || 0).toLocaleString()}
                      <span className="font-normal text-slate-400"> / ${(project.fundingTarget || 0).toLocaleString()}</span>
                    </span>
                    <span className="font-bold text-forest-700">{project.fundingProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, project.fundingProgress || 0)}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Remaining: ${((project.remainingFunding || 0)).toLocaleString()}
                    </span>
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-xs font-semibold text-forest-700 hover:text-forest-800"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why SDG 17 Matters Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
                The Cornerstone of the 2030 Agenda
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Why SDG 17 is the Engine of Sustainable Transformation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                The United Nations established 17 Sustainable Development Goals to end poverty, protect our biosphere, and ensure prosperity for all. Yet none of the first 16 goals can be achieved in isolation.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                SDG 17: <b>Partnerships for the Goals</b> recognizes that sustainable solutions require multi-sectoral mobilization: combining the local trust of NGOs, the technical innovation of business, the policy mandates of governments, and the grassroots energy of community groups.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Knowledge Transfer</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Open access to research, digital technologies, and field-tested solutions.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Resource Synergies</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Combining financial grants, volunteer hours, equipment, and expertise.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/about" className="btn-primary text-xs">
                  Learn More About SDG 17
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Visual Callout Graphic */}
            <div className="bg-gradient-to-tr from-forest-800 to-emerald-700 rounded-3xl p-8 text-white shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-6 h-6 text-emerald-300" />
                  <span className="font-bold text-base">SDG 17 Nexus Model</span>
                </div>
                <span className="text-[11px] bg-forest-900/60 px-2.5 py-1 rounded-full border border-emerald-400/20 text-emerald-200">
                  United Nations Framework
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-50 leading-relaxed">
                    <b>Cross-Sector Synergy:</b> Non-profits identify community priorities while corporate and philanthropic partners inject scalable capacity.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-50 leading-relaxed">
                    <b>Transparent Contribution Auditing:</b> Differentiating verified financial backing from non-monetary aid such as specialized equipment and volunteer service.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-50 leading-relaxed">
                    <b>Open Collaboration Requests:</b> Any registered institution can browse project resource gaps and submit formal partnership proposals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Organizations Join the Platform */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700 block mb-2">
            Step-by-Step Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How to Engage With the Hub
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A frictionless workflow designed to get organizations aligned, collaborating, and tracking outcomes quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-black text-forest-700/30 block mb-3">
                  {s.num}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-forest-800 to-emerald-700 text-white p-10 sm:p-14 shadow-xl text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build Meaningful Partnerships?
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100 leading-relaxed">
            Register your organization today, explore open collaborative opportunities, and track your contribution toward the United Nations 2030 Agenda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="rounded-xl bg-white hover:bg-slate-100 text-forest-800 px-6 py-3 text-sm font-bold shadow-md transition"
            >
              Register Organization
            </Link>
            <Link
              to="/partnerships"
              className="rounded-xl bg-forest-900/60 hover:bg-forest-900/80 text-white border border-emerald-300/40 px-6 py-3 text-sm font-semibold transition"
            >
              Explore Partnerships
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
