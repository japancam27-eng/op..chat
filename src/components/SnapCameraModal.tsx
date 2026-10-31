import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { soundFX } from '../utils/audio';

interface SnapCameraModalProps {
  onClose: () => void;
}

const PRESET_SNAPS = [
  {
    id: 'p-1',
    name: 'Cyber Horizon',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'p-2',
    name: 'Neon Matrix',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'p-3',
    name: '3D Spatial Room',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'p-4',
    name: 'OP Haider Emblem',
    url: '/op-haider-logo.png',
  },
];

const FILTERS = [
  { id: 'none', label: 'Normal', css: '' },
  { id: 'neon_glow', label: 'Neon 3D', css: 'brightness-110 contrast-125 saturate-200 drop-shadow-[0_0_20px_rgba(0,255,204,0.7)]' },
  { id: 'cyberpunk', label: 'Cyberpunk', css: 'contrast-125 saturate-150 hue-rotate-15' },
  { id: 'matrix', label: 'Matrix Code', css: 'hue-rotate-90 saturate-200 contrast-125' },
  { id: 'golden_hour', label: 'Golden Hour', css: 'sepia-[0.35] contrast-110 saturate-125' },
];

export const SnapCameraModal: React.FC<SnapCameraModalProps> = ({ onClose }) => {
  const { activeContact, contacts, sendSnap } = useChat();
  const [selectedPhoto, setSelectedPhoto] = useState<string>(PRESET_SNAPS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('neon_glow');
  const [caption, setCaption] = useState<string>('');
  const [timer, setTimer] = useState<number>(10);
  const [targetContactId, setTargetContactId] = useState<string>(activeContact.id);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const handleCapture = () => {
    setIsFlashing(true);
    soundFX.playTap();
    setTimeout(() => {
      setIsFlashing(false);
    }, 200);
  };

  const handleSend = () => {
    const finalMedia = customPhotoUrl.trim() || selectedPhoto;
    sendSnap({
      timer,
      mediaUrl: finalMedia,
      caption: caption.trim() || undefined,
      filter: activeFilter,
    });
    onClose();
  };

  const currentFilterObj = FILTERS.find((f) => f.id === activeFilter) || FILTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0b141a] border border-[#202c33] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 border-b border-[#202c33] flex items-center justify-between bg-[#111b21]/80">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#fffc00] text-black font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(255,252,0,0.5)]">
              👻
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                OP HAIDER Snap Camera
              </h3>
              <p className="text-[11px] text-zinc-400">View-Once Ephemeral Camera</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-zinc-400 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative w-full h-80 sm:h-96 bg-black overflow-hidden flex items-center justify-center group">
          {/* Flash animation */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200" />
          )}

          {/* Media */}
          <img
            src={customPhotoUrl.trim() || selectedPhoto}
            alt="Snap Preview"
            className={`w-full h-full object-cover transition-all duration-300 ${currentFilterObj.css}`}
          />

          {/* Snapchat Signature Black Caption Bar */}
          <div className="absolute inset-x-0 bottom-12 bg-black/70 backdrop-blur-sm px-4 py-2 flex items-center justify-center border-y border-white/10">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tap to add a caption..."
              className="w-full bg-transparent text-center text-white placeholder-white/60 font-medium text-sm focus:outline-none"
              maxLength={80}
            />
          </div>

          {/* Viewfinder crosshairs & timer badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[11px]">{timer}s Duration</span>
          </div>

          {/* Shutter Button in Viewfinder */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
            <button
              type="button"
              onClick={handleCapture}
              className="pointer-events-auto w-12 h-12 rounded-full border-4 border-white/80 bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
              title="Shutter Effect"
            >
              <div className="w-9 h-9 rounded-full bg-white shadow-inner" />
            </button>
          </div>
        </div>

        {/* Filters Carousel */}
        <div className="p-3 border-b border-[#202c33] bg-[#111b21]/90 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-zinc-400 px-1">
            Filters:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id);
                soundFX.playTap();
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeFilter === f.id
                  ? 'bg-[#fffc00] text-black border-[#fffc00] shadow-[0_0_10px_rgba(255,252,0,0.4)]'
                  : 'bg-[#202c33] text-zinc-300 border-transparent hover:border-zinc-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Snap Settings & Send Controls */}
        <div className="p-4 space-y-3.5 bg-[#0b141a]">
          {/* Preset Photos or Custom URL */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {PRESET_SNAPS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPhoto(p.url);
                    setCustomPhotoUrl('');
                    soundFX.playTap();
                  }}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedPhoto === p.url && !customPhotoUrl
                      ? 'border-[#fffc00] scale-105 shadow-[0_0_8px_rgba(255,252,0,0.5)]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Timer Selector */}
            <div className="flex items-center gap-1 bg-[#111b21] border border-[#202c33] rounded-xl p-1 flex-shrink-0">
              <span className="text-[10px] text-zinc-400 font-mono px-1">⏱️</span>
              {[3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setTimer(sec)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                    timer === sec
                      ? 'bg-[#fffc00] text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Recipient and Send button */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#111b21] border border-[#202c33] rounded-2xl px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Send To:</span>
                <select
                  value={targetContactId}
                  onChange={(e) => setTargetContactId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111b21] text-white">
                      {c.name} {c.streak ? `(🔥 ${c.streak.count})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                🔥 Streak +1
              </span>
            </div>

            <button
              onClick={handleSend}
              className="px-5 py-3 rounded-2xl bg-[#fffc00] hover:bg-yellow-300 active:scale-95 text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(255,252,0,0.4)] transition-all"
            >
              <span>Send Snap</span>
              <span>⚡</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
