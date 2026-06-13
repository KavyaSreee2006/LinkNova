import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Link2, 
  MousePointerClick, 
  TrendingUp, 
  Calendar, 
  Copy, 
  Check, 
  BarChart3, 
  Trash2, 
  Edit2, 
  Search,
  ExternalLink,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ navigate }) {
  const { token } = useAuth();
  const toast = useToast();
  
  const [summary, setSummary] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modals state
  const [editUrl, setEditUrl] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editAlias, setEditAlias] = useState('');
  const [editExpiryOption, setEditExpiryOption] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [summaryRes, urlsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/summary`, { headers }),
        fetch(`${API_BASE_URL}/url/all`, { headers })
      ]);

      const summaryData = await summaryRes.json();
      const urlsData = await urlsRes.json();

      if (summaryData.success) setSummary(summaryData.data);
      if (urlsData.success) setUrls(urlsData.data);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleCopy = (id, shortCode) => {
    const link = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('Shortened URL copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/url/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setDeleteId(null);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to delete URL');
    }
  };

  const handleEditOpen = (url) => {
    setEditUrl(url);
    setEditOriginalUrl(url.originalUrl);
    setEditAlias(url.customAlias || '');
    setEditExpiryOption('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editUrl) return;

    try {
      const res = await fetch(`${API_BASE_URL}/url/${editUrl._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalUrl: editOriginalUrl,
          customAlias: editAlias || undefined,
          expiryOption: editExpiryOption || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('URL updated successfully!');
        setEditUrl(null);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update URL');
      }
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  const filteredUrls = urls.filter((url) => {
    const term = searchQuery.toLowerCase();
    return (
      url.originalUrl.toLowerCase().includes(term) ||
      url.shortCode.toLowerCase().includes(term) ||
      (url.customAlias && url.customAlias.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (expiryDate) => {
    if (!expiryDate) return <span className="px-2 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">Active</span>;
    
    const isExpired = new Date(expiryDate) < new Date();
    if (isExpired) {
      return <span className="px-2 py-1 text-xs rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">Expired</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">Scheduled</span>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total URLs */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Links</div>
            <div className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{summary?.totalUrls || 0}</div>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
            <Link2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Clicks */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Clicks</div>
            <div className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{summary?.totalClicks || 0}</div>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-500 dark:text-violet-400 rounded-xl">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        {/* Top Performer */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Performer</div>
            <div className="text-sm font-bold mt-1 text-indigo-600 dark:text-indigo-400 truncate">
              {summary?.mostClickedUrl ? `/${summary.mostClickedUrl.shortCode}` : 'None'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {summary?.mostClickedUrl ? `${summary.mostClickedUrl.clickCount} clicks` : '0 clicks'}
            </div>
          </div>
          <div className="p-3 bg-pink-500/10 text-pink-500 dark:text-pink-400 rounded-xl flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Click Through */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Clicks</div>
            <div className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
              {summary?.totalUrls ? (summary.totalClicks / summary.totalUrls).toFixed(1) : '0.0'}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Header toolbar */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by alias, original URL or code..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Shorten New Link</span>
          </button>
        </div>

        {/* Table Content */}
        {filteredUrls.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-500 mb-4">
              <Link2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No shortened links found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              {searchQuery ? "We couldn't find any URLs matching your search query." : "Shorten your first destination link to get started!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                  <th className="px-6 py-4">Original Destination URL</th>
                  <th className="px-6 py-4">Short URL</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Clicks</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-sm">
                {filteredUrls.map((url) => {
                  const shortLink = `${window.location.origin}/${url.shortCode}`;
                  return (
                    <tr key={url._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-colors">
                      {/* Original URL */}
                      <td className="px-6 py-4 max-w-xs md:max-w-md truncate text-slate-600 dark:text-slate-300">
                        <a href={url.originalUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1.5 inline-flex">
                          <span className="truncate">{url.originalUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                        </a>
                      </td>
                      
                      {/* Shortened URL */}
                      <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        <a href={shortLink} target="_blank" rel="noreferrer" className="hover:underline">
                          /{url.shortCode}
                        </a>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>

                      {/* Expiry / Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(url.expiryDate)}
                          {url.expiryDate && (
                            <span className="text-[10px] text-slate-400">
                              Exp: {new Date(url.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Click Count */}
                      <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-200">
                        {url.clickCount}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-1.5 flex justify-end items-center">
                        <button
                          onClick={() => handleCopy(url._id, url.shortCode)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 rounded-lg transition-all"
                          title="Copy Link"
                        >
                          {copiedId === url._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => navigate(`/analytics/${url._id}`)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-violet-500/10 text-slate-500 dark:text-slate-400 hover:text-violet-500 rounded-lg transition-all"
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOpen(url)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(url._id)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-500 dark:text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Link Modal */}
      {editUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditUrl(null)} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 animate-scale-in">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Edit Short URL</h3>
            
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Original URL</label>
                <input
                  type="text"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Custom Alias</label>
                <input
                  type="text"
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  placeholder="e.g. twitterdocs"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Update Expiration</label>
                <select
                  value={editExpiryOption}
                  onChange={(e) => setEditExpiryOption(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Keep current setting</option>
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="never">Remove Expiration</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setEditUrl(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete URL confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 animate-scale-in text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-500 mb-4 border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Delete URL</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure? This will delete the shortened URL and permanently erase all visitor analytics data. This action is irreversible.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex-1"
              >
                No, Keep it
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all flex-1"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
