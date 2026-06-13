import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  ArrowLeft, 
  Calendar, 
  MousePointerClick, 
  Clock, 
  QrCode, 
  Copy, 
  Check, 
  Globe, 
  ExternalLink,
  Laptop,
  Compass,
  Link
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Color Palette for Pie Chart Cells
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export default function Analytics({ navigate }) {
  const { id } = useParams();
  const { token } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast.error(json.message || 'Failed to fetch analytics');
        }
      } catch (err) {
        toast.error('Server error fetching analytics');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchAnalytics();
  }, [id, token]);

  const handleCopy = () => {
    if (!data) return;
    const link = `${window.location.origin}/${data.shortUrl.shortCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Copied URL!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getShortUrlString = () => {
    if (!data) return '';
    return `${window.location.origin}/${data.shortUrl.shortCode}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12 glass-panel rounded-2xl">
        <h3 className="text-lg font-bold">Analytics not found</h3>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { shortUrl, analytics } = data;
  const hasClicks = analytics.totalClicks > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to links</span>
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/stats/${shortUrl.shortCode}`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-semibold transition-all"
          >
            <Link className="w-3.5 h-3.5" />
            <span>Public Stats Page</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-600/10"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy short URL</span>
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 min-w-0">
          <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Short Code: /{shortUrl.shortCode}</div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate pr-2">
            {shortUrl.originalUrl}
          </h2>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created: {new Date(shortUrl.createdAt).toLocaleDateString()}
            </span>
            {shortUrl.expiryDate && (
              <span className="flex items-center gap-1 text-amber-500">
                <Clock className="w-3.5 h-3.5" />
                Expires: {new Date(shortUrl.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* QR Code preview block */}
        <div className="p-3 bg-white rounded-xl flex-shrink-0 border border-slate-200">
          <QRCodeSVG value={getShortUrlString()} size={64} />
        </div>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clicks</div>
            <div className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{analytics.totalClicks}</div>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Visited</div>
            <div className="text-sm font-bold mt-2 text-slate-800 dark:text-slate-100">
              {analytics.lastVisited ? new Date(analytics.lastVisited).toLocaleString() : 'Never'}
            </div>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-500 dark:text-violet-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</div>
            <div className="text-sm font-bold mt-2">
              {shortUrl.expiryDate && new Date(shortUrl.expiryDate) < new Date() ? (
                <span className="text-rose-500">Expired</span>
              ) : (
                <span className="text-emerald-500">Active</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-pink-500/10 text-pink-500 dark:text-pink-400 rounded-xl">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main trends chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Daily Clicks Trend</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.dailyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3341551A" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#f8fafc'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution breakdowns */}
      {hasClicks ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Browser Distribution */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Browser Distribution</h3>
            <div className="h-64 flex-1 flex flex-col md:flex-row items-center justify-center">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.browsers}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {analytics.browsers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-2 text-xs">
                {analytics.browsers.slice(0, 5).map((entry, idx) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-500">{entry.value} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Device Distribution</h3>
            <div className="h-64 flex-1 flex flex-col md:flex-row items-center justify-center">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {analytics.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-2 text-xs">
                {analytics.devices.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-500">{entry.value} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OS Breakdown & Referrer List */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Operating Systems</h3>
            <div className="space-y-4">
              {analytics.operatingSystems.slice(0, 5).map((entry, idx) => {
                const percentage = (entry.value / analytics.totalClicks) * 100;
                return (
                  <div key={entry.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.name}</span>
                      <span className="text-slate-400">{entry.value} clicks ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referrers List */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Top Referrers</h3>
            <div className="space-y-4">
              {analytics.referrers.slice(0, 5).map((entry) => {
                const percentage = (entry.value / analytics.totalClicks) * 100;
                return (
                  <div key={entry.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.name}</span>
                      <span className="text-slate-400">{entry.value} clicks ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
          <p className="text-sm font-semibold">No visitor clicks recorded yet</p>
          <p className="text-xs mt-1">Visit your short link locally to record and display visitor trends.</p>
        </div>
      )}

      {/* Recent Activity Table */}
      {hasClicks && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Clicks Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-slate-100/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/50 dark:border-slate-800/50">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Country / City</th>
                  <th className="px-6 py-3">Browser</th>
                  <th className="px-6 py-3">Device & OS</th>
                  <th className="px-6 py-3">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
                {analytics.recentVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-100/10 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 text-xs">
                      {new Date(visit.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-medium flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{visit.country}</span>
                      {visit.city && visit.city !== 'Unknown' && <span className="text-slate-400 text-xs">({visit.city})</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-slate-400" />
                        {visit.browser}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span>{visit.device}</span>
                        <span className="text-slate-400 text-xs">({visit.os})</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs max-w-xs truncate">
                      {visit.referrer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
