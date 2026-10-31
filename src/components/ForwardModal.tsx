import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Message, Contact } from '../types/chat';
import { X, Search, Forward, Users, Check } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface ForwardModalProps {
  message: Message;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({ message, onClose }) => {
  const { contacts, forwardMessage } = useChat();
  const [search, setSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.handle && c.handle.toLowerCase().includes(q));
  });

  const handleSend = () => {
    if (!selectedContactId) return;
    forwardMessage(message, selectedContactId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222e35] bg-[#0b141a]">
          <div className="flex items-center gap-2">
            <Forward className="w-5 h-5 text-[#25d366]" />
            <h3 className="text-base font-bold text-[#e9edef]">Forward message to...</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="px-6 py-3 bg-[#182229]/70 border-b border-[#222e35] flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#00a884]" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-[#25d366]">{message.senderName}</div>
            <div className="text-xs text-[#8696a0] truncate">{message.text}</div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#222e35]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts or groups..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#202c33] border border-[#2a3942] text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40 p-2">
          {filtered.map((c) => {
            const isSelected = selectedContactId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  soundFX.playTap();
                  setSelectedContactId(c.id);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left cursor-pointer ${
                  isSelected ? 'bg-[#00a884]/20 border border-[#00a884]/40' : 'hover:bg-[#202c33]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: c.avatarColor || '#00a884' }}
                  >
                    {c.isGroup ? <Users className="w-5 h-5" /> : c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#e9edef] truncate">{c.name}</div>
                    <div className="text-xs text-[#8696a0] truncate">{c.handle || c.phone}</div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-[#25d366] border-[#25d366] text-black'
                      : 'border-[#8696a0]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222e35] bg-[#0b141a] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8696a0] hover:text-[#e9edef] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedContactId}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              selectedContactId
                ? 'bg-[#00a884] hover:bg-[#02906f] text-white shadow-lg cursor-pointer'
                : 'bg-[#202c33] text-[#8696a0] opacity-50 cursor-not-allowed'
            }`}
          >
            <Forward className="w-4 h-4" />
            <span>Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
