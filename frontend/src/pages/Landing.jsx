import React, { useState } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Link2, 
  ArrowRight, 
  BarChart3, 
  QrCode, 
  Clock, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

export default function Landing({ navigate }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [shortenedResult, setShortenedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl) return;

    setLoading(true);
    setShortenedResult(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/url/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          originalUrl: longUrl,
          customAlias: customAlias || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setShortenedResult(data.data);
        toast.success('Link shortened successfully!');
      } else {
        toast.error(data.message || 'Failed to shorten URL');
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortenedResult) return;
    const shortUrl = `${window.location.origin}/${shortenedResult.shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getShortUrlString = () => {
    if (!shortenedResult) return '';
    return `${window.location.origin}/${shortenedResult.shortCode}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 grid-bg-dark text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[650px] h-[650px] rounded-full bg-fuchsia-600/18 blur-[120px] pointer-events-none animate-float-2" />
      <div className="absolute top-[35%] left-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[110px] pointer-events-none animate-float-3" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Link2 className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            <span className="text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
  LinkNova
</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center z-10 relative">
        
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-8 animate-bounce-subtle">
          <Sparkles className="w-4 h-4" />
          <span>Track and optimize your audience engagement</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mb-6 leading-tight">
          Shorten Links. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Analyze Visitor Pulse.
          </span>
        </h1>
        
        <p className="text-slate-400 text-base md:text-lg max-w-xl mb-12">
          Create instantly shortened links, build custom aliases, and watch your visitor insights flow in real time with beautiful visual dashboards.
        </p>

        {/* Shortener card */}
        <div className="w-full max-w-2xl bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl mb-16">
          <form onSubmit={handleShorten} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="Paste your long link here..."
                required
                className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="Alias (optional)"
                className="w-full md:w-48 px-4 py-3.5 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {loading ? 'Shortening...' : 'Pulse Shorten'}
                <Zap className="w-4 h-4 fill-white text-indigo-600" />
              </button>
            </div>
          </form>

          {/* Shortener output result */}
          {shortenedResult && (
            <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-left space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Short Link</div>
                  <a
                    href={getShortUrlString()}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-300 font-semibold hover:underline break-all"
                  >
                    {getShortUrlString()}
                  </a>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all flex-shrink-0"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-indigo-500/10">
                <div className="p-3 bg-white rounded-lg flex-shrink-0">
                  <QRCodeSVG value={getShortUrlString()} size={80} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Scan & Download QR Code</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    This QR code is generated dynamically. Log in to download high-quality assets and view real-time maps of scan events.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl text-left mt-8">
          <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Deep Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track clicks, referrers, operating systems, browsers, and simulated geolocations in real time.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl w-fit mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Dynamic QR Codes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every short link comes with an auto-generated QR code you can save as PNG for brochures, packaging, and ads.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl">
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl w-fit mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Expiration Controls</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Define access windows by specifying custom link durations or dates. Automatically handles expired clicks.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
     <footer className="border-t border-slate-800/60 bg-slate-950/40 py-8 z-10 relative">
  <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between text-center gap-4">
    <span className="text-xs text-slate-500">
      &copy; {new Date().getFullYear()} LinkNova - Transforming URLs into Actionable Insights.
    </span>
  </div>
</footer>
    </div>
  );
}
