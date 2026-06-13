import React, { useState } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Link2, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function CreateUrl({ navigate }) {
  const { token } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  
  // Single Link state
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryOption, setExpiryOption] = useState(''); // '', '1', '7', '30', 'custom'
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  // Bulk state
  const [csvFile, setCsvFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  // QR Code download
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas-download');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${createdUrl.shortCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success('QR Code downloaded!');
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl) return;

    setLoading(true);
    setCreatedUrl(null);

    const expirySelection = expiryOption === 'custom' ? customDate : expiryOption;

    try {
      const res = await fetch(`${API_BASE_URL}/url/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalUrl: longUrl,
          customAlias: customAlias || undefined,
          expiryOption: expirySelection || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setCreatedUrl(data.data);
        toast.success('URL shortened successfully!');
      } else {
        toast.error(data.message || 'Failed to shorten URL');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Parse CSV File in Frontend
  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const parsed = [];

      // Start parsing from index 0 or 1 depending on headers
      const hasHeaders = lines[0].toLowerCase().includes('url') || lines[0].toLowerCase().includes('link');
      const startIndex = hasHeaders ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.trim());
        if (columns[0]) {
          parsed.push({
            originalUrl: columns[0],
            customAlias: columns[1] || '',
            expiryOption: columns[2] || ''
          });
        }
      }

      setBulkPreview(parsed);
      toast.info(`Parsed ${parsed.length} rows from CSV`);
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (bulkPreview.length === 0) return;

    setBulkLoading(true);
    setBulkResults(null);

    try {
      const res = await fetch(`${API_BASE_URL}/url/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ urls: bulkPreview })
      });

      const data = await res.json();
      if (data.success) {
        setBulkResults(data.data);
        toast.success('Bulk shortening complete!');
      } else {
        toast.error(data.message || 'Bulk shortening failed');
      }
    } catch (err) {
      toast.error('Server error during bulk processing');
    } finally {
      setBulkLoading(false);
    }
  };

  const getShortUrlString = () => {
    if (!createdUrl) return '';
    return `${window.location.origin}/${createdUrl.shortCode}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={() => { setActiveTab('single'); setCreatedUrl(null); }}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'single'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Single Link
        </button>
        <button
          onClick={() => { setActiveTab('bulk'); setBulkResults(null); }}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'bulk'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Bulk URL Shortening
        </button>
      </div>

      {/* Single Link Tab Content */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Shorten a Link
            </h3>

            <form onSubmit={handleSingleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destination URL</label>
                <input
                  type="text"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://example.com/very/long/destination/path"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custom Alias (Optional)</label>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="e.g. spring-sale"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link Expiration</label>
                  <select
                    value={expiryOption}
                    onChange={(e) => setExpiryOption(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Never Expire</option>
                    <option value="1">1 Day</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="custom">Custom Date</option>
                  </select>
                </div>
              </div>

              {expiryOption === 'custom' && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custom Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Shorten Link'}
              </button>
            </form>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-1">
            {createdUrl ? (
              <div className="glass-panel p-6 rounded-2xl space-y-6 text-center animate-fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Your Short Link</h4>
                  <div className="mt-4 p-3 bg-indigo-500/10 rounded-xl flex items-center justify-between border border-indigo-500/10 gap-3">
                    <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 truncate">
                      {getShortUrlString()}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getShortUrlString());
                        setCopied(true);
                        toast.success('Copied to clipboard!');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-150 rounded-lg text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block mb-3">
                    {/* Render standard canvas QR so that we can easily download it as PNG */}
                    <QRCodeSVG id="qr-canvas-download" value={getShortUrlString()} size={150} includeMargin={true} />
                  </div>
                  
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR (.png)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl h-full flex flex-col items-center justify-center text-center text-slate-400 min-h-[300px]">
                <Info className="w-8 h-8 text-indigo-400/80 mb-2" />
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Shortened Output</h4>
                <p className="text-xs mt-1 max-w-[200px]">
                  Fill out the form and shorten a link to generate your short URL and QR code here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Shortening Tab Content */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Bulk URL Shortening</h3>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Upload a CSV file containing your long destination URLs. The system will process each link and return shortened codes.
            </p>

            {/* CSV Specification note */}
            <div className="mt-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-slate-400 space-y-2 max-w-2xl">
              <div className="font-semibold text-indigo-400 uppercase tracking-wider">CSV File Format Requirements:</div>
              <p>Your CSV must contain one record per line. Columns should follow this exact order:</p>
              <code className="block bg-slate-900/60 p-2 rounded text-indigo-300">
                originalUrl, customAlias (optional), expiryOption (optional - 1, 7, 30, or ISO date)
              </code>
              <p className="mt-1">Example line: <code className="text-slate-300">https://google.com,google-search,7</code> (Expires in 7 days)</p>
            </div>

            {/* File Input */}
            <div className="mt-6 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <label className="cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Select CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400 mt-1">
                {csvFile ? csvFile.name : 'No file selected (max 5MB)'}
              </span>
            </div>

            {/* Bulk Actions & Preview */}
            {bulkPreview.length > 0 && !bulkResults && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    Ready to shorten ({bulkPreview.length} links)
                  </h4>
                  <button
                    onClick={handleBulkSubmit}
                    disabled={bulkLoading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-md shadow-indigo-600/10"
                  >
                    {bulkLoading ? 'Processing Bulk Shortening...' : 'Generate Short Links'}
                  </button>
                </div>

                <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900/40 sticky top-0 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Destination URL</th>
                        <th className="p-3">Suggested Alias</th>
                        <th className="p-3">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-slate-400">
                      {bulkPreview.map((item, index) => (
                        <tr key={index}>
                          <td className="p-3 font-semibold">{index + 1}</td>
                          <td className="p-3 truncate max-w-xs">{item.originalUrl}</td>
                          <td className="p-3 font-mono">{item.customAlias || '-'}</td>
                          <td className="p-3">{item.expiryOption ? `${item.expiryOption} days` : 'Never'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Processing Results */}
          {bulkResults && (
            <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Bulk Shortening Results</h3>

              <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Original Link</th>
                      <th className="p-3">Shortened Link</th>
                      <th className="p-3">Remarks / Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                    {bulkResults.map((result, idx) => {
                      const linkStr = result.success ? `${window.location.origin}/${result.shortUrl.shortCode}` : '';
                      return (
                        <tr key={idx} className="hover:bg-slate-100/10 transition-colors">
                          <td className="p-3">
                            {result.success ? (
                              <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" /> Success
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                                <XCircle className="w-3.5 h-3.5" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="p-3 truncate max-w-xs text-slate-500">{result.originalUrl}</td>
                          <td className="p-3 font-semibold text-indigo-500 dark:text-indigo-400">
                            {result.success ? (
                              <a href={linkStr} target="_blank" rel="noreferrer" className="hover:underline">
                                /{result.shortUrl.shortCode}
                              </a>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-slate-400">
                            {result.success ? (
                              result.warning ? (
                                <span className="flex items-center gap-1 text-amber-500">
                                  <AlertTriangle className="w-3.5 h-3.5" /> {result.warning}
                                </span>
                              ) : 'None'
                            ) : (
                              <span className="text-rose-500">{result.error}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
