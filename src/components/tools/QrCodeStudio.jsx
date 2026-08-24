import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Wifi, Phone, IndianRupee, Link, FileText, Copy, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../3d/TiltCard';
import { downloadSingleFile } from '../../utils/zipHelper';

export default function QrCodeStudio() {
  const [qrType, setQrType] = useState('url'); // 'url', 'wifi', 'whatsapp', 'upi', 'text'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // QR Fields
  const [urlVal, setUrlVal] = useState('https://privamedia.app');
  
  // WiFi Fields
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState('WPA');

  // WhatsApp Fields
  const [waPhone, setWaPhone] = useState('');
  const [waMsg, setWaMsg] = useState('Hello! I would like to inquire about your services.');

  // UPI Fields
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiAmount, setUpiAmount] = useState('');

  // Plain Text
  const [textVal, setTextVal] = useState('');

  // Styles
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrSize, setQrSize] = useState(300);

  const colorPresets = [
    { label: 'Classic Black', fg: '#000000', bg: '#FFFFFF' },
    { label: 'Cyber Indigo', fg: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Neon Cyan', fg: '#0891B2', bg: '#ECFEFF' },
    { label: 'Royal Violet', fg: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Emerald Green', fg: '#059669', bg: '#ECFDF5' },
  ];

  const generateQrString = () => {
    switch (qrType) {
      case 'url':
        return urlVal || 'https://google.com';
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};;`;
      case 'whatsapp':
        const cleanPhone = waPhone.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
      case 'upi':
        let upi = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName || 'Payee')}&cu=INR`;
        if (upiAmount) upi += `&am=${upiAmount}`;
        return upi;
      case 'text':
        return textVal || 'Hello World';
      default:
        return urlVal;
    }
  };

  const renderQr = async () => {
    const rawContent = generateQrString();
    if (!rawContent) return;

    try {
      const dataUrl = await QRCode.toDataURL(rawContent, {
        width: qrSize,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR Generation failed:', err);
    }
  };

  useEffect(() => {
    renderQr();
  }, [qrType, urlVal, wifiSsid, wifiPass, wifiType, waPhone, waMsg, upiId, upiName, upiAmount, textVal, fgColor, bgColor, qrSize]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    // Convert data URL to Blob
    fetch(qrDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        downloadSingleFile(blob, `QRCode_${qrType}.png`);
      });
  };

  return (
    <div className="space-y-8">
      <TiltCard glowColor="cyan" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <QrCode className="w-4 h-4" />
              Dynamic Vector QR Engine
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Custom Styled QR Code Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Generate branded QR codes for UPI Payments, WiFi Auto-Connect, WhatsApp chats, and URLs with custom colors.
            </p>
          </div>

          {/* Presets Picker */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'url', label: 'Website URL', icon: Link },
              { id: 'upi', label: 'UPI Payment', icon: IndianRupee },
              { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
              { id: 'wifi', label: 'WiFi Connect', icon: Wifi },
              { id: 'text', label: 'Plain Text', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = qrType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setQrType(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </TiltCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings / Inputs Form */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold text-sm text-white">QR Code Content</h3>

          {/* URL Input */}
          {qrType === 'url' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Website URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* UPI Input */}
          {qrType === 'upi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">UPI ID / VPA (Required)</label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Payee Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Azad Store"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Preset Amount (₹ INR - Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* WhatsApp Input */}
          {qrType === 'whatsapp' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Phone Number with Country Code (e.g. 919876543210)</label>
                <input
                  type="text"
                  placeholder="919876543210"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Pre-filled Chat Message</label>
                <textarea
                  rows={2}
                  value={waMsg}
                  onChange={(e) => setWaMsg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* WiFi Input */}
          {qrType === 'wifi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Network Name (SSID)</label>
                  <input
                    type="text"
                    placeholder="MyHome_WiFi"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">WiFi Password</label>
                  <input
                    type="text"
                    placeholder="WiFi Password"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Plain Text Input */}
          {qrType === 'text' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Text Content</label>
              <textarea
                rows={3}
                placeholder="Enter any text or note..."
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Styling Options */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h4 className="text-xs font-semibold text-slate-300">Custom Colors & Size</h4>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">QR Color:</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Background:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>

              {/* Color Preset Pills */}
              <div className="flex flex-wrap gap-1.5">
                {colorPresets.map((cp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFgColor(cp.fg);
                      setBgColor(cp.bg);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 text-[11px] font-medium border border-white/10 hover:border-cyan-400 transition-all text-slate-300"
                  >
                    {cp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live QR Output Preview */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between items-center space-y-6">
          <div className="space-y-4 w-full flex flex-col items-center">
            <h3 className="font-semibold text-sm text-white">Live QR Code Preview</h3>

            <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-slate-800">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Generated QR" className="w-56 h-56 object-contain" />
              )}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-neon-cyan transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download High-Res PNG QR
          </button>
        </div>
      </div>
    </div>
  );
}
