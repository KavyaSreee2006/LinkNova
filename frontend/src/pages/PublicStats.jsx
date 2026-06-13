import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Link2, 
  MousePointerClick, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';

export default function PublicStats() {
  const { shortCode } = useParams();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/public/${shortCode}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast.error('Could not find public stats for this link.');
        }
      } catch (err) {
        toast.error('Network error loading statistics');
      } finally {
        setLoading(false);
      }
    };

    if (shortCode) fetchPublicStats();
  }, [shortCode]);

  const handleCopy = () => {
    const link = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas-public');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${shortCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success('QR Code downloaded!');
  };

  const getShortUrlString = () => {
    return `${window.location.origin}/${shortCode}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <h2 className="text-xl font-bold text-rose-500">Link Statistics Not Found</h2>
          <p className="text-slate-400 text-sm">
            We couldn't retrieve statistics. The shortened URL may have been deleted, or is spelling-incorrect.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Create Your Own Links
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-955 to-slate-950 grid-bg-dark text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px] pointer-events-none animate-float-2" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Link2 className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            LinkNova
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main card */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:py-16 flex items-center justify-center z-10 relative">
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
          
          {/* Header detail */}
          <div className="space-y-2 text-center border-b border-white/5 pb-6">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
              Public Link Stats
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">
              /{data.shortCode}
            </h1>
            <p className="text-slate-400 text-xs truncate max-w-md mx-auto pt-1">
              Destination: {data.originalUrl}
            </p>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Click Count */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Clicks</span>
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-indigo-400" />
                <span className="text-2xl font-bold">{data.clickCount}</span>
              </div>
            </div>

            {/* Created At */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Created Date</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                <span className="text-sm font-semibold">{new Date(data.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Link Expiration */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Link Expiry</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-400" />
                <span className="text-sm font-semibold">
                  {data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>

          </div>

          {/* Link action & QR download */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
            
            {/* Short code block */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-200 text-sm">Shortened URL</h3>
              
              <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                <span className="font-semibold text-sm text-indigo-400 truncate select-all">
                  {getShortUrlString()}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase">Original Target</h4>
                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-300 hover:underline flex items-center gap-1.5"
                >
                  <span className="truncate max-w-[280px]">{data.originalUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* QR Code details */}
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 inline-block">
                <QRCodeSVG id="qr-canvas-public" value={getShortUrlString()} size={120} includeMargin={true} />
              </div>
              
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR Code (.png)</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 z-10 relative">
        &copy; {new Date().getFullYear()} LinkPulse URL analytics reporting.
      </footer>
    </div>
  );
}
