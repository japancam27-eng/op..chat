import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Contact } from '../types/chat';
import { X, Users, ArrowRight, Check, Search, Sparkles, ShieldCheck } from 'lucide-react';

interface NewGroupModalProps {
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ onClose }) => {
  const { contacts, createGroup } = useChat();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Available contacts (filter out existing groups)
  const individualContacts = contacts.filter((c) => !c.isGroup);

  const filteredContacts = individualContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedContactIds.length === 0) return;
    setStep(2);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    createGroup(groupName.trim(), selectedContactIds, groupDescription.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111b21] border border-[#2a3942] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#202c33] border-b border-[#222e35]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00a884]/20 text-[#25d366] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#e9edef]">
                {step === 1 ? 'Add Group Participants' : 'New 3D Group Details'}
              </h2>
              <span className="text-xs text-[#8696a0]">
                {step === 1
                  ? `${selectedContactIds.length} of ${individualContacts.length} selected`
                  : 'End-to-end encrypted 3D group'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8696a0] hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Group Members */}
        {step === 1 && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Search */}
            <div className="relative flex items-center bg-[#202c33] rounded-xl px-3.5 py-2 mb-3 border border-[#2a3942]">
              <Search className="w-4 h-4 text-[#8696a0] mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contact to add..."
                className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
            </div>

            {/* Selected Chips */}
            {selectedContactIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 max-h-24 overflow-y-auto">
                {selectedContactIds.map((id) => {
                  const c = contacts.find((item) => item.id === id);
                  if (!c) return null;
                  return (
                    <span
                      key={id}
                      onClick={() => toggleContact(id)}
                      className="px-2.5 py-1 rounded-full bg-[#00a884]/20 border border-[#25d366]/40 text-[#25d366] text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#00a884]/30 transition"
                    >
                      <span>{c.name.split(' ')[0]}</span>
                      <X className="w-3 h-3" />
                    </span>
                  );
                })}
              </div>
            )}

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/60 pr-1">
              {filteredContacts.map((c) => {
                const isSelected = selectedContactIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-[#202c33] rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow"
                        style={{ backgroundColor: c.avatarColor }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#e9edef]">{c.name}</div>
                        <div className="text-xs text-[#8696a0] truncate max-w-[220px]">
                          {c.status}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-[#25d366] border-[#25d366] text-[#111b21]'
                          : 'border-[#8696a0]/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Step 1 Button */}
            <div className="pt-4 border-t border-[#222e35] flex items-center justify-between">
              <span className="text-xs text-[#8696a0]">Select at least 1 contact</span>
              <button
                onClick={handleNext}
                disabled={selectedContactIds.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] disabled:opacity-40 disabled:hover:bg-[#25d366] text-[#111b21] font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Set Group Subject & Details */}
        {step === 2 && (
          <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                Group Subject / Name
              </label>
              <div className="flex items-center bg-[#202c33] rounded-xl px-4 py-3 border border-[#2a3942] focus-within:border-[#25d366]">
                <Users className="w-5 h-5 text-[#8696a0] mr-2" />
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. 🚀 3D Dev Lounge"
                  className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                Group Description (Optional)
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="What is this 3D group about?"
                rows={2}
                className="w-full bg-[#202c33] rounded-xl px-4 py-2.5 border border-[#2a3942] focus-within:border-[#25d366] text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none resize-none"
              />
            </div>

            {/* Security note */}
            <div className="p-3.5 rounded-2xl bg-[#00a884]/10 border border-[#25d366]/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#25d366] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#8696a0] leading-relaxed">
                <strong className="text-[#e9edef] block mb-0.5">End-to-End Encrypted Group</strong>
                Messages and calls are secured with 256-bit encryption. All members can join the 3D Spatial Lounge together.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!groupName.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-[#111b21] font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create 3D Group</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
