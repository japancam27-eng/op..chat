import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { MiniAvatarHead } from './MiniAvatarHead';
import { soundFX } from '../utils/audio';

interface SnapcodeModalProps {
  onClose: () => void;
}

export const SnapcodeModal: React.FC<SnapcodeModalProps> = ({ onClose }) => {
  const { currentUser, myAvatarConfig, snapscore } = useChat();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Add me on OP HAIDER Snap! Handle: ${currentUser?.handle || '@haider_op'}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    soundFX.playTap();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0b141a] border border-[#202c33] rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-zinc-400 hover:text-white flex items-center justify-center transition-all"
        >
          ✕
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
          <span>👻</span> OP HAIDER SNAPCODE
        </span>
        <h3 className="text-lg font-bold text-white mb-4">
          Scan or Share Your ID
        </h3>

        {/* Yellow Snapcode Card */}
        <div className="relative w-56 h-56 rounded-3xl bg-[#fffc00] p-4 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(255,252,0,0.4)] border-4 border-black">
          {/* Snapchat Ghost Dotted Matrix Perimeter */}
          <div className="absolute inset-2 border-2 border-dashed border-black/40 rounded-2xl pointer-events-none" />

          {/* Dotted corner accents */}
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-black" />
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-black" />
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-black" />
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-black" />

          {/* Center 3D Bitmoji Avatar */}
          <div className="relative w-28 h-28 rounded-2xl bg-black border-2 border-black flex items-center justify-center shadow-lg overflow-hidden group">
            <MiniAvatarHead
              avatarConfig={currentUser?.avatarConfig || myAvatarConfig}
              className="w-24 h-24 transform group-hover:scale-110 transition-transform"
            />
            {/* Ghost outline overlay */}
            <div className="absolute bottom-1 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-white/90">
              3D AVATAR
            </div>
          </div>
        </div>

        {/* User Info & Snapscore */}
        <div className="mt-5 space-y-1">
          <h4 className="text-base font-extrabold text-white">
            {currentUser?.name || 'Haider Khan'}
          </h4>
          <p className="text-sm font-mono font-bold text-[#00ffcc]">
            {currentUser?.handle || '@haider_op'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#111b21] border border-[#202c33] rounded-full text-xs text-zinc-300">
              <span className="text-amber-400 font-bold">⚡ Snapscore:</span>
              <span className="font-mono font-extrabold text-white">
                {snapscore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 w-full space-y-2">
          <button
            onClick={handleCopy}
            className="w-full py-2.5 rounded-xl bg-[#fffc00] hover:bg-yellow-300 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(255,252,0,0.3)] flex items-center justify-center gap-2"
          >
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Profile Link & Handle'}
          </button>

          <button
            onClick={() => {
              handleCopy();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Share with Friends</span>
          </button>
        </div>
      </div>
    </div>
  );
};
