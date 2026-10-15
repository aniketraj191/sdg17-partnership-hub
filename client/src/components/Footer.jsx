import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Heart, ExternalLink, ShieldCheck, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white">
                <Globe2 className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                SDG 17 <span className="text-emerald-400">Partnership Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering global multi-stakeholder partnerships between NGOs, companies, academia, and governments in pursuit of the UN 2030 Sustainable Development Goals.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-800 border border-slate-700 text-slate-300">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Demonstration dataset active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/projects" className="hover:text-emerald-400 transition">
                  Sustainable Projects
                </Link>
              </li>
              <li>
                <Link to="/organizations" className="hover:text-emerald-400 transition">
                  Registered Partners
                </Link>
              </li>
              <li>
                <Link to="/partnerships" className="hover:text-emerald-400 transition">
                  Collaborative Opportunities
                </Link>
              </li>
              <li>
                <Link to="/contributions" className="hover:text-emerald-400 transition">
                  Contribution Ledger
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition">
                  Impact Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* UN Goals Related */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              United Nations SDGs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  SDG 17: Partnerships for Goals
                </Link>
              </li>
              <li>
                <Link to="/projects?sdgNumber=13" className="hover:text-emerald-400 transition">
                  SDG 13: Climate Action
                </Link>
              </li>
              <li>
                <Link to="/projects?sdgNumber=7" className="hover:text-emerald-400 transition">
                  SDG 7: Affordable Clean Energy
                </Link>
              </li>
              <li>
                <Link to="/projects?sdgNumber=4" className="hover:text-emerald-400 transition">
                  SDG 4: Quality Education
                </Link>
              </li>
              <li>
                <Link to="/projects?sdgNumber=2" className="hover:text-emerald-400 transition">
                  SDG 2: Zero Hunger
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Transparency & Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This application is an educational & organizational partnership coordination hub. It tracks confirmed contributions without processing live card transactions.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack MongoDB & Express Architecture</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SDG 17 Partnership Hub. Developed for UN SDG 17 collaboration.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400 transition">About SDG 17</Link>
            <Link to="/contact" className="hover:text-slate-400 transition">Contact & Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
