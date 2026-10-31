import React, { useState } from 'react';
import { Contact } from '../types/chat';
import { X, ShieldCheck, QrCode, CheckCircle2, Lock, Copy } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface SecurityCodeModalProps {
  contact: Contact;
  onClose: () => void;
}

export const SecurityCodeModal: React.FC<SecurityCodeModalProps> = ({ contact, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Generate deterministic 60-digit WhatsApp security code based on contact id
  const codeBlocks = React.useMemo(() => {
    const seed = (contact.id + contact.name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 1337);
    const blocks: string[] = [];
    for (let i = 0; i < 12; i++) {
      const val = ((seed * (i + 13) * 997) % 90000) + 10000;
      blocks.push(val.toString());
    }
    return blocks;
  }, [contact.id, contact.name]);

  const fullCode = codeBlocks.join(' ');

  const handleCopy = () => {
    soundFX.playTap();
    navigator.clipboard?.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    soundFX.playCallConnected();
    setIsVerified(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222e35] bg-[#0b141a]">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#25d366]" />
            <h3 className="text-base font-bold text-[#e9edef]">Verify Security Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          <div className="text-xs text-[#8696a0] leading-relaxed max-w-sm">
            Messages and calls with <span className="text-[#e9edef] font-semibold">{contact.name}</span> are encrypted end-to-end. Scan this QR code or compare the 60-digit number below with their device.
          </div>

          {/* QR Code Graphic */}
          <div className="relative p-4 rounded-2xl bg-white shadow-xl flex items-center justify-center">
            {/* Visual SVG QR representation */}
            <svg className="w-44 h-44 text-[#111b21]" viewBox="0 0 100 100" fill="currentColor">
              {/* Corner markers */}
              <rect x="5" y="5" width="25" height="25" rx="3" fill="#111b21" />
              <rect x="8" y="8" width="19" height="19" rx="2" fill="#fff" />
              <rect x="12" y="12" width="11" height="11" rx="1" fill="#111b21" />

              <rect x="70" y="5" width="25" height="25" rx="3" fill="#111b21" />
              <rect x="73" y="8" width="19" height="19" rx="2" fill="#fff" />
              <rect x="77" y="12" width="11" height="11" rx="1" fill="#111b21" />

              <rect x="5" y="70" width="25" height="25" rx="3" fill="#111b21" />
              <rect x="8" y="73" width="19" height="19" rx="2" fill="#fff" />
              <rect x="12" y="77" width="11" height="11" rx="1" fill="#111b21" />

              {/* Data matrix dots */}
              <circle cx="42" cy="15" r="3" fill="#111b21" />
              <circle cx="55" cy="15" r="3" fill="#111b21" />
              <circle cx="48" cy="28" r="3" fill="#111b21" />
              <circle cx="15" cy="45" r="3" fill="#111b21" />
              <circle cx="28" cy="45" r="3" fill="#111b21" />
              <circle cx="40" cy="45" r="3" fill="#111b21" />
              <circle cx="55" cy="45" r="3" fill="#111b21" />
              <circle cx="70" cy="45" r="3" fill="#111b21" />
              <circle cx="85" cy="45" r="3" fill="#111b21" />

              <circle cx="35" cy="60" r="3" fill="#111b21" />
              <circle cx="50" cy="60" r="3" fill="#111b21" />
              <circle cx="65" cy="60" r="3" fill="#111b21" />
              <circle cx="80" cy="60" r="3" fill="#111b21" />

              <circle cx="42" cy="75" r="3" fill="#111b21" />
              <circle cx="55" cy="75" r="3" fill="#111b21" />
              <circle cx="70" cy="75" r="3" fill="#111b21" />
              <circle cx="85" cy="75" r="3" fill="#111b21" />

              <circle cx="48" cy="88" r="3" fill="#111b21" />
              <circle cx="62" cy="88" r="3" fill="#111b21" />
              <circle cx="80" cy="88" r="3" fill="#111b21" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 60-digit code matrix (12 blocks of 5) */}
          <div className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl p-3">
            <div className="grid grid-cols-3 gap-y-2 gap-x-3 text-center font-mono text-sm tracking-widest text-[#00ffcc]">
              {codeBlocks.map((block, idx) => (
                <span key={idx} className="bg-[#111b21] py-1 px-2 rounded border border-[#222e35]/60">
                  {block}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] text-xs font-semibold transition"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#25d366]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy 60-Digit Code'}</span>
            </button>

            <button
              onClick={handleVerify}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition ${
                isVerified
                  ? 'bg-[#25d366] text-black font-bold'
                  : 'bg-[#00a884] hover:bg-[#02906f] text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVerified ? 'Verified' : 'Mark as Verified'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
