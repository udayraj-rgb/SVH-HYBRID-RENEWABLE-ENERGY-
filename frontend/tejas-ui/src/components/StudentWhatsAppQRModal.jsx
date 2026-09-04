import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, MessageSquare, Smartphone, ExternalLink, RefreshCw, CheckCircle2, Shield } from 'lucide-react';

export default function StudentWhatsAppQRModal({ isOpen, onClose, studentPhone = '918238893551', studentName = 'Udayraj' }) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'callmebot' | 'companion'
  const [qrDirectUrl, setQrDirectUrl] = useState('');
  const [qrCallMeBotUrl, setQrCallMeBotUrl] = useState('');
  const [gatewayQr, setGatewayQr] = useState('');
  const [loadingGateway, setLoadingGateway] = useState(false);

  const cleanDispatcherNumber = '918238893551';
  const directChatLink = `https://wa.me/${cleanDispatcherNumber}?text=${encodeURIComponent(`Hi TEJAS GRID! I am ${studentName} (${studentPhone}). Please opt me into Hostel Green Hour electricity deficit alerts.`)}`;
  const callMeBotLink = `https://wa.me/34644442084?text=${encodeURIComponent('I allow callmebot to send me messages')}`;

  // Generate crisp client-side QR codes
  useEffect(() => {
    QRCode.toDataURL(directChatLink, {
      width: 260,
      margin: 2,
      color: { dark: '#047857', light: '#ffffff' },
    }).then(setQrDirectUrl);

    QRCode.toDataURL(callMeBotLink, {
      width: 260,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then(setQrCallMeBotUrl);
  }, [studentPhone, studentName]);

  // Poll companion gateway QR if on gateway tab
  const fetchGatewayQr = async () => {
    setLoadingGateway(true);
    try {
      const res = await fetch('http://localhost:5001/api/qr');
      const data = await res.json();
      if (data.qr) setGatewayQr(data.qr);
    } catch (e) {
      console.warn('Gateway offline or unreachable:', e);
    } finally {
      setLoadingGateway(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'companion' && isOpen) {
      fetchGatewayQr();
      const interval = setInterval(fetchGatewayQr, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
            <QrCode size={24} />
          </div>
          <h2 className="text-xl font-black text-white">Join WhatsApp Deficit Alerts</h2>
          <p className="text-xs text-slate-400 mt-1">
            Scan with your phone camera or click to connect instantly!
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'direct'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            ⚡ Instant Chat
          </button>
          <button
            onClick={() => setActiveTab('callmebot')}
            className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'callmebot'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🤖 Bot Alerts
          </button>
          <button
            onClick={() => setActiveTab('companion')}
            className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'companion'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🔗 Gateway
          </button>
        </div>

        {/* TAB 1: Direct Instant Chat QR */}
        {activeTab === 'direct' && (
          <div className="text-center">
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-xl border-4 border-emerald-500/30 mb-4">
              {qrDirectUrl ? (
                <img src={qrDirectUrl} alt="WhatsApp Click-to-Chat QR" className="w-52 h-52 mx-auto block" />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">Generating QR...</div>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium mb-3">
              📱 Point your <strong>Phone Camera</strong> or <strong>WhatsApp Camera</strong> at this code:
            </p>

            <a
              href={directChatLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Or Tap to Open WhatsApp Directly</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* TAB 2: CallMeBot QR */}
        {activeTab === 'callmebot' && (
          <div className="text-center">
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-xl border-4 border-slate-600 mb-4">
              {qrCallMeBotUrl ? (
                <img src={qrCallMeBotUrl} alt="CallMeBot QR" className="w-52 h-52 mx-auto block" />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">Generating QR...</div>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium mb-3">
              Sends <code>I allow callmebot to send me messages</code> to <strong>+34 644 44 20 84</strong>:
            </p>

            <a
              href={callMeBotLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
            >
              <Smartphone size={16} />
              <span>Open CallMeBot in WhatsApp</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* TAB 3: Local Gateway Scanner */}
        {activeTab === 'companion' && (
          <div className="text-center">
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-xl border-4 border-amber-500/40 mb-4">
              {gatewayQr ? (
                <img src={gatewayQr} alt="WhatsApp Gateway QR" className="w-52 h-52 mx-auto block" />
              ) : (
                <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-500 text-xs p-4">
                  <span>{loadingGateway ? 'Fetching Live QR...' : 'Gateway is already linked, or socket is initializing.'}</span>
                  <button
                    onClick={fetchGatewayQr}
                    className="mt-3 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 font-bold"
                  >
                    <RefreshCw size={11} className={loadingGateway ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium mb-3">
              Scan from WhatsApp: <strong>Linked Devices &gt; Link a Device</strong>
            </p>

            <a
              href="http://localhost:5001"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
            >
              <span>Open Full Gateway Pairing Portal (:5001)</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Modal Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
          TEJAS GRID WhatsApp Service • Auto-broadcasts when solar generation drops
        </div>
      </div>
    </div>
  );
}
