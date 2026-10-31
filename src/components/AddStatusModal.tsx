import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Type, Send, Sparkles, Palette } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface AddStatusModalProps {
  onClose: () => void;
}

const GRADIENTS = [
  'from-emerald-600 via-teal-700 to-cyan-900',
  'from-purple-600 via-indigo-700 to-blue-900',
  'from-rose-600 via-pink-700 to-purple-900',
  'from-amber-600 via-orange-600 to-red-800',
  'from-blue-600 via-cyan-700 to-emerald-800',
  'from-slate-800 via-neutral-900 to-black',
];

export const AddStatusModal: React.FC<AddStatusModalProps> = ({ onClose }) => {
  const { addStatus } = useChat();
  const [caption, setCaption] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    addStatus(caption.trim(), selectedGradient);
    onClose();
  };

  const cycleGradient = () => {
    soundFX.playTap();
    const currIdx = GRADIENTS.indexOf(selectedGradient);
    const nextIdx = (currIdx + 1) % GRADIENTS.length;
    setSelectedGradient(GRADIENTS[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[560px] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
        {/* Dynamic Background Stage */}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedGradient} transition-colors duration-500`} />

        {/* Top bar controls */}
        <div className="relative z-10 flex items-center justify-between p-5">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={cycleGradient}
              className="p-2.5 rounded-full bg-black/40 text-white/90 hover:text-white backdrop-blur-md transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Change background color"
            >
              <Palette className="w-4 h-4" />
              <span>Theme</span>
            </button>
          </div>
        </div>

        {/* Middle: Centered status text input */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-8 text-center">
          <textarea
            autoFocus
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Type a status update..."
            maxLength={180}
            className="w-full bg-transparent text-white placeholder-white/50 text-2xl font-bold text-center resize-none focus:outline-none drop-shadow-md"
          />
        </div>

        {/* Bottom bar with Send button */}
        <div className="relative z-10 p-5 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
          <span className="text-xs text-white/70 font-medium">
            {180 - caption.length} characters left
          </span>

          <button
            onClick={handleSubmit}
            disabled={!caption.trim()}
            className={`p-3.5 rounded-full shadow-2xl transition cursor-pointer flex items-center justify-center ${
              caption.trim()
                ? 'bg-[#25d366] hover:bg-[#20ba5a] text-black scale-100 hover:scale-105 active:scale-95'
                : 'bg-white/20 text-white/40 cursor-not-allowed scale-95'
            }`}
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
