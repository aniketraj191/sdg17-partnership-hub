import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Handshake,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Building2,
  Layers,
  Leaf,
  Sun,
  GraduationCap,
  HeartPulse,
  Apple,
  Droplets,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export const AboutSDG17 = () => {
  const sdgInterconnections = [
    {
      sdg: 'SDG 13',
      name: 'Climate Action',
      icon: Leaf,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description:
        'Mitigating global greenhouse gases and enhancing community adaptation requires multinational carbon standards, green climate financing, and transfer of renewable clean-tech patents.',
    },
    {
      sdg: 'SDG 7',
      name: 'Affordable & Clean Energy',
      icon: Sun,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      description:
        'Decarbonizing energy access in developing nations requires blended finance between public multilateral banks and private renewable micro-grid developers.',
    },
    {
      sdg: 'SDG 4',
      name: 'Quality Education',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      description:
        'Closing the global digital divide demands open educational resources (OER), broadband connectivity partnerships, and teacher mentorship exchanges across borders.',
    },
    {
      sdg: 'SDG 2',
      name: 'Zero Hunger & Food Security',
      icon: Apple,
      color: 'bg-green-50 text-green-800 border-green-200',
      description:
        'Resilient food systems depend on smallholder farmer cooperatives partnering with agro-ecological scientists, cold-chain logistics providers, and fair-trade retailers.',
    },
    {
      sdg: 'SDG 6',
      name: 'Clean Water & Sanitation',
      icon: Droplets,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      description:
        'Watershed protection and municipal desalination require cross-border river basin treaties, public utility modernization, and community-led catchment monitoring.',
    },
    {
      sdg: 'SDG 3',
      name: 'Good Health & Well-Being',
      icon: HeartPulse,
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      description:
        'Global pandemic preparedness, vaccine manufacturing, and rural primary clinic operations rely upon synchronized international medical supply chains.',
    },
  ];

  const stakeholderRoles = [
    {
      role: 'Non-Governmental Organizations (NGOs)',
      icon: Users,
      desc: 'Ground-level advocacy, community trust, needs assessment, field implementation, and social accountability.',
    },
    {
      role: 'Private Sector & Social Enterprises',
      icon: Building2,
      desc: 'Technological innovation, scalable logistics, capital investment, supply chain integration, and operational efficiency.',
    },
    {
      role: 'Governments & Public Authorities',
      icon: ShieldCheck,
      desc: 'Enabling regulatory frameworks, legal protections, national infrastructure investments, and international diplomatic cooperation.',
    },
    {
      role: 'Local Communities & Academia',
      icon: GraduationCap,
      desc: 'Empirical research, Indigenous ecological wisdom, localized prioritization, and long-term stewardship of regional assets.',
    },
  ];

  return (
    <div className="space-y-16 py-10 pb-20">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Globe2 className="w-3.5 h-3.5" />
              United Nations 2030 Agenda Framework
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              SDG 17: Partnerships for the Goals
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-light">
              "Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development."
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary bg-emerald-500 text-forest-950 hover:bg-emerald-400 text-xs">
                Browse Active Partnerships
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/organizations" className="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs">
                Meet Partner Entities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Mission & Rationale */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
              The Essential Catalyst
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Solutions Require Multi-Stakeholder Coalitions
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Achieving the UN Sustainable Development Goals by 2030 requires an estimated annual financing gap of over $4 trillion in developing economies alone. No single government, philanthropic foundation, or multinational corporation can bridge this gap independently.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              SDG 17 acts as the fundamental bridge across all goals. It addresses systemic implementation bottlenecks across five crucial pillars:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <b>Finance:</b> Domestic revenue mobilization, foreign direct investment, and debt sustainability.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <b>Technology:</b> Open science, environmentally sound technologies, and innovation transfer.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <b>Capacity-Building:</b> National sustainable development planning and workforce readiness.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <b>Trade & Systemic Issues:</b> Equitable multilateral trading systems and open macroeconomic stability.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-forest-700" />
              Key SDG 17 Target Metrics
            </h3>

            <div className="space-y-4 divide-y divide-slate-100 text-xs">
              <div className="pt-3">
                <span className="font-bold text-slate-800 block text-sm">Target 17.6</span>
                <p className="text-slate-500 mt-0.5">
                  Enhance North-South, South-South and triangular regional and international cooperation on and access to science, technology, and innovation.
                </p>
              </div>

              <div className="pt-3">
                <span className="font-bold text-slate-800 block text-sm">Target 17.16</span>
                <p className="text-slate-500 mt-0.5">
                  Enhance the Global Partnership for Sustainable Development, complemented by multi-stakeholder partnerships that mobilize and share knowledge, expertise, technology, and financial resources.
                </p>
              </div>

              <div className="pt-3">
                <span className="font-bold text-slate-800 block text-sm">Target 17.17</span>
                <p className="text-slate-500 mt-0.5">
                  Encourage and promote effective public, public-private and civil society partnerships, building on the experience and resourcing strategies of partnerships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Roles Grid */}
      <section className="bg-slate-100/60 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700 block mb-1">
              Multi-Sector Synergies
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Distinct Roles in Collaborative Partnerships
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              How different sectors align their core competencies on the SDG 17 Partnership Hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stakeholderRoles.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">{s.role}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interconnections with Other Goals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700 block mb-1">
            Systemic Interlinkages
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How SDG 17 Powers Other Global Goals
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Real-world examples showing how cross-sector partnerships catalyze direct impact across specialized SDGs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sdgInterconnections.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.sdg}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {item.sdg}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Features Explainer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-10 sm:p-14 shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Platform Architecture & Values
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Built for Transparent, Accountable Impact
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              The SDG 17 Partnership Hub provides institutional verification, open APIs, verifiable MongoDB aggregation ledgers, and role-based permissions to ensure that collaborative commitments translate into tangible, verifiable human and ecological benefits.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary bg-emerald-500 text-forest-950 hover:bg-emerald-400 text-xs">
                Register Your Entity
              </Link>
              <Link to="/projects" className="btn-secondary bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs">
                Browse Initiatives
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
