import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  User,
  Users,
  Mail,
  Calendar,
  Building2,
  FolderGit2,
  Coins,
  Handshake,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Database,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { StatusBadge, DemoDataBadge } from '../components/Badge';

export const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const [contactMessages, setContactMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAdmin) {
      setLoading(true);
      Promise.all([
        api.get('/contact'),
        api.get('/auth/users'),
      ])
        .then(([contactRes, usersRes]) => {
          if (contactRes.data?.success) setContactMessages(contactRes.data.data);
          if (usersRes.data?.success) setUsersList(usersRes.data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    notifySuccess('Logged out successfully.');
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hub Account & Administrative Suite
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-slate-500">
            Manage your credentials, view registered users, inspect data storage, and review contact inquiries.
          </p>
        </div>

        <button onClick={handleLogout} className="btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50 text-xs">
          <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
        </button>
      </div>

      {/* User Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-100 text-forest-800 font-black text-2xl flex items-center justify-center border border-forest-200">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            <span>Account created: </span>
            <b className="text-slate-600">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</b>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Link
            to="/organizations"
            className="p-4 rounded-xl border border-slate-200 hover:border-forest-400 hover:bg-forest-50/50 transition group"
          >
            <Building2 className="w-5 h-5 text-forest-700 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-800">Organizations</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Register & edit partners</p>
          </Link>

          <Link
            to="/projects"
            className="p-4 rounded-xl border border-slate-200 hover:border-forest-400 hover:bg-forest-50/50 transition group"
          >
            <FolderGit2 className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-800">Projects</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Publish new initiatives</p>
          </Link>

          <Link
            to="/partnerships"
            className="p-4 rounded-xl border border-slate-200 hover:border-forest-400 hover:bg-forest-50/50 transition group"
          >
            <Handshake className="w-5 h-5 text-blue-700 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-800">Partnerships</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Review collaborative requests</p>
          </Link>

          <Link
            to="/contributions"
            className="p-4 rounded-xl border border-slate-200 hover:border-forest-400 hover:bg-forest-50/50 transition group"
          >
            <Coins className="w-5 h-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-slate-800">Contributions</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Audit & verify pledges</p>
          </Link>
        </div>
      </div>

      {/* Where Is Data Saved Guide Card */}
      <div className="bg-gradient-to-r from-slate-900 to-forest-950 rounded-3xl p-8 text-white shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-forest-800/80 border border-emerald-500/30 text-emerald-300">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Where Is Your Data Saved?</h3>
            <p className="text-xs text-emerald-200/80">
              MongoDB Database Architecture & Data Inspection Guide
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xs space-y-1">
            <span className="font-bold text-emerald-300 block text-sm">Database Name</span>
            <p className="text-slate-200 font-mono text-xs">sdg17_hub</p>
            <p className="text-slate-400 text-[11px] pt-1">
              Set in your connection string in <code className="text-emerald-300">server/.env</code> (MONGODB_URI).
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xs space-y-1">
            <span className="font-bold text-emerald-300 block text-sm">MongoDB Collections</span>
            <ul className="text-slate-200 font-mono text-[11px] space-y-0.5">
              <li>• users (Registrations)</li>
              <li>• organizations (Partners)</li>
              <li>• projects (Initiatives)</li>
              <li>• contributions (Ledger)</li>
              <li>• partnerships (Proposals)</li>
              <li>• contactmessages (Inquiries)</li>
            </ul>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xs space-y-1">
            <span className="font-bold text-emerald-300 block text-sm">How to Inspect Records</span>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              <b>1. Web App UI:</b> Right here on this page, or on <Link to="/organizations" className="text-emerald-300 underline">Organizations</Link>, <Link to="/projects" className="text-emerald-300 underline">Projects</Link>, and <Link to="/contributions" className="text-emerald-300 underline">Contributions</Link>.<br />
              <b>2. MongoDB Atlas Console:</b> Database &gt; Browse Collections.<br />
              <b>3. Shell (mongosh):</b> Run <code className="text-emerald-300">db.users.find()</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Exclusive: Registered Users Table */}
      {isAdmin && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-forest-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Registered Platform Users ({usersList.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Live records from the MongoDB <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">users</code> collection. Whenever a new user registers, they appear here.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
              Live MongoDB Data
            </span>
          </div>

          {usersList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No users registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Date Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {u.name}
                        {u._id === user?.id && (
                          <span className="ml-2 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : u.role === 'org_admin'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {u.organizationId?.name || <span className="text-slate-400 italic">None assigned</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin Exclusive: Contact Messages Received */}
      {isAdmin && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-forest-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Contact Inquiries Received (Admin Access)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Messages submitted through the public Contact page and recorded in the MongoDB <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">contactmessages</code> collection.
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {contactMessages.length} Messages
            </span>
          </div>

          {contactMessages.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No contact inquiries recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contactMessages.map((msg) => (
                <div key={msg._id} className="py-4 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{msg.subject}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    From: <b>{msg.name}</b> ({msg.email})
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
