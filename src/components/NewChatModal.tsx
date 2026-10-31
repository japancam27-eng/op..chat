import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, UserPlus, Phone, User, AtSign, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface NewChatModalProps {
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
  const { addContactByHandle, createNewChat, registeredUsers } = useChat();

  const [mode, setMode] = useState<'handle' | 'custom'>('handle');
  const [handleInput, setHandleInput] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ isError: boolean; text: string } | null>(null);

  const handleConnectByHandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    soundFX.playTap();
    const result = addContactByHandle(handleInput.trim());
    if (result.success) {
      setStatusMessage({ isError: false, text: result.message });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setStatusMessage({ isError: true, text: result.message });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundFX.playCallConnected();
    createNewChat(name.trim(), phone.trim() || '+1 (555) 000-0000');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0f1d24] border border-[#00ffcc]/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1a2c35]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00ffcc]" />
            <h2 className="text-base font-bold text-[#e9edef]">Start New 3D Chat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8696a0] hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Add by Unique Handle vs Custom Name */}
        <div className="flex items-center p-1 rounded-xl bg-[#071318] border border-[#1a2c35] mt-4 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('handle');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'handle'
                ? 'bg-[#00ffcc] text-[#071318] shadow-sm'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <AtSign className="w-3.5 h-3.5" />
            <span>Connect by Unique ID</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('custom');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'custom'
                ? 'bg-[#00ffcc] text-[#071318] shadow-sm'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Custom Contact</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-red-950/60 border border-red-500/50 text-red-200'
                : 'bg-[#00ffcc]/15 border border-[#00ffcc]/30 text-[#00ffcc]'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#00ffcc] flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* MODE 1: CONNECT BY UNIQUE SNAPCHAT-STYLE ID */}
        {mode === 'handle' ? (
          <form onSubmit={handleConnectByHandle} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                Friend&rsquo;s Unique ID (Snapchat-style Handle)
              </label>
              <div className="flex items-center bg-[#13222a] rounded-xl px-3.5 py-2.5 border border-[#1e323e] focus-within:border-[#00ffcc]">
                <span className="text-sm font-bold text-[#00ffcc] mr-1.5">@</span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={handleInput.replace(/^@/, '')}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="e.g. sophia_m or alex_r"
                  className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#8696a0]">
                Every user has a distinct ID. Type any handle to instantly start a 3D conversation.
              </p>
            </div>

            {/* Quick Suggestions of Registered Handles */}
            <div>
              <span className="text-[11px] text-[#8696a0] font-bold uppercase tracking-wider block mb-1.5">
                Suggested 3D Friends:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['@haider.ai', '@sophia_m', '@alex_r', '@zara_k', '@liam_c'].map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => setHandleInput(handle)}
                    className="px-2.5 py-1 rounded-full bg-[#13222a] hover:bg-[#00ffcc]/20 border border-[#1e323e] hover:border-[#00ffcc] text-xs font-medium text-[#00ffcc] transition cursor-pointer"
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00a884] hover:shadow-[0_0_15px_rgba(0,255,204,0.4)] text-[#071318] font-bold text-xs shadow-md transition cursor-pointer"
              >
                Connect & Chat
              </button>
            </div>
          </form>
        ) : (
          /* MODE 2: CUSTOM CONTACT FORM */
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                Contact Name
              </label>
              <div className="flex items-center bg-[#13222a] rounded-xl px-3.5 py-2.5 border border-[#1e323e] focus-within:border-[#00ffcc]">
                <User className="w-4 h-4 text-[#8696a0] mr-2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                Phone or Username
              </label>
              <div className="flex items-center bg-[#13222a] rounded-xl px-3.5 py-2.5 border border-[#1e323e] focus-within:border-[#00ffcc]">
                <Phone className="w-4 h-4 text-[#8696a0] mr-2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 789-0123"
                  className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00a884] text-[#071318] font-bold text-xs shadow-md transition cursor-pointer"
              >
                Create Chat
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
