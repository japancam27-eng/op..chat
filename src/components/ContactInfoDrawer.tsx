import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Contact, Message } from '../types/chat';
import {
  X,
  Phone,
  Video,
  Search,
  Bell,
  BellOff,
  Clock,
  Lock,
  Star,
  Image as ImageIcon,
  FileText,
  Link2,
  Users,
  UserPlus,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Check,
  CheckCircle2,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { MiniAvatarHead } from './MiniAvatarHead';
import { SecurityCodeModal } from './SecurityCodeModal';
import { soundFX } from '../utils/audio';

interface ContactInfoDrawerProps {
  contact: Contact;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export const ContactInfoDrawer: React.FC<ContactInfoDrawerProps> = ({
  contact,
  onClose,
  onOpenSearch,
}) => {
  const {
    startCall,
    allMessages,
    setDisappearingTimer,
    toggleMuteContact,
    contacts,
  } = useChat();

  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'starred'>('info');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showDisappearingMenu, setShowDisappearingMenu] = useState(false);
  const [showMuteMenu, setShowMuteMenu] = useState(false);

  // Chat messages
  const chatMessages = allMessages.filter((m) => m.chatId === contact.id);
  const starredMessages = chatMessages.filter((m) => m.isStarred);
  const mediaMessages = chatMessages.filter((m) => m.type === 'image' && m.imageUrl);
  const docMessages = chatMessages.filter((m) => m.type === 'document' || m.document);

  const formatTimerLabel = (secs?: number) => {
    if (!secs || secs === 0) return 'Off';
    if (secs === 86400) return '24 hours';
    if (secs === 604800) return '7 days';
    if (secs === 7776000) return '90 days';
    return `${Math.round(secs / 3600)}h`;
  };

  const handleTimerChange = (seconds: number) => {
    setDisappearingTimer(contact.id, seconds);
    setShowDisappearingMenu(false);
  };

  const handleMuteChange = (duration: string) => {
    toggleMuteContact(contact.id, duration);
    setShowMuteMenu(false);
  };

  return (
    <>
      <div className="w-80 xl:w-96 h-full flex flex-col bg-[#0c161c] border-l border-[#1a2c35] overflow-y-auto select-none z-30 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2c35] bg-[#0f1d24] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-[#e9edef]">
              {contact.isGroup ? 'Group info' : 'Contact info'}
            </h3>
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center text-center p-6 bg-[#0f1d24]/60 border-b border-[#1a2c35]">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full border-4 border-[#00a884]/40 bg-[#182229] flex items-center justify-center overflow-hidden shadow-2xl">
              <MiniAvatarHead config={contact.avatarConfig} size={110} />
            </div>
            {contact.isOnline && (
              <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-[#25d366] border-2 border-[#0f1d24]" />
            )}
          </div>

          <h2 className="text-lg font-bold text-[#e9edef] flex items-center gap-2">
            <span>{contact.name}</span>
            {contact.isAi && <Sparkles className="w-4 h-4 text-[#00ffcc]" />}
          </h2>
          <div className="text-xs font-semibold text-[#00ffcc] mt-0.5">{contact.handle || '@contact'}</div>
          <div className="text-xs text-[#8696a0] mt-1">{contact.phone}</div>

          {/* Quick Actions */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={() => startCall('voice', contact)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#182229] hover:bg-[#202c33] border border-[#222e35] text-[#25d366] transition cursor-pointer min-w-[64px]"
            >
              <Phone className="w-5 h-5" />
              <span className="text-[10px] font-semibold text-[#e9edef]">Audio</span>
            </button>

            <button
              onClick={() => startCall('video', contact)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#182229] hover:bg-[#202c33] border border-[#222e35] text-[#25d366] transition cursor-pointer min-w-[64px]"
            >
              <Video className="w-5 h-5" />
              <span className="text-[10px] font-semibold text-[#e9edef]">Video</span>
            </button>

            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#182229] hover:bg-[#202c33] border border-[#222e35] text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer min-w-[64px]"
              >
                <Search className="w-5 h-5" />
                <span className="text-[10px] font-semibold text-[#e9edef]">Search</span>
              </button>
            )}
          </div>
        </div>

        {/* About / Bio */}
        <div className="p-4 bg-[#0f1d24]/30 border-b border-[#1a2c35]">
          <span className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider">About</span>
          <p className="text-xs text-[#e9edef] mt-1 font-medium leading-relaxed">
            {contact.status || 'Available in OP HAIDER 3D!'}
          </p>
        </div>

        {/* Media, Links and Docs Preview */}
        <div className="p-4 border-b border-[#1a2c35]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#e9edef] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#00ffcc]" />
              <span>Media, links and docs</span>
            </span>
            <span className="text-xs text-[#8696a0]">{mediaMessages.length + docMessages.length} &gt;</span>
          </div>

          {mediaMessages.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {mediaMessages.slice(-3).map((m) => (
                <div
                  key={m.id}
                  className="aspect-square rounded-xl overflow-hidden bg-[#182229] border border-[#222e35] relative group"
                >
                  <img
                    src={m.imageUrl}
                    alt={m.imagePrompt || 'Media'}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#8696a0] py-2">No media shared yet</div>
          )}
        </div>

        {/* Starred Messages Section */}
        <div className="p-4 border-b border-[#1a2c35]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-[#e9edef]">Starred Messages</span>
            </div>
            <span className="text-xs font-bold text-[#8696a0] bg-[#182229] px-2 py-0.5 rounded-full">
              {starredMessages.length}
            </span>
          </div>

          {starredMessages.length > 0 && (
            <div className="mt-3 space-y-2 max-h-36 overflow-y-auto">
              {starredMessages.slice(-2).map((m) => (
                <div key={m.id} className="p-2 rounded-xl bg-[#182229] border border-[#222e35] text-xs">
                  <div className="text-[10px] text-[#25d366] font-semibold">{m.senderName}</div>
                  <div className="text-[#e9edef] truncate mt-0.5">{m.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disappearing Messages Settings */}
        <div className="p-4 border-b border-[#1a2c35]">
          <div
            onClick={() => setShowDisappearingMenu(!showDisappearingMenu)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#8696a0] group-hover:text-[#25d366] transition" />
              <div>
                <div className="text-xs font-semibold text-[#e9edef]">Disappearing messages</div>
                <div className="text-[11px] text-[#8696a0]">{formatTimerLabel(contact.disappearingTimer)}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </div>

          {showDisappearingMenu && (
            <div className="mt-3 p-2 rounded-xl bg-[#182229] border border-[#222e35] space-y-1 animate-in fade-in">
              {[
                { label: '24 hours', secs: 86400 },
                { label: '7 days', secs: 604800 },
                { label: '90 days', secs: 7776000 },
                { label: 'Off', secs: 0 },
              ].map((opt) => (
                <button
                  key={opt.secs}
                  onClick={() => handleTimerChange(opt.secs)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    (contact.disappearingTimer || 0) === opt.secs
                      ? 'bg-[#00a884]/20 text-[#25d366]'
                      : 'hover:bg-[#202c33] text-[#e9edef]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {(contact.disappearingTimer || 0) === opt.secs && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mute Notifications */}
        <div className="p-4 border-b border-[#1a2c35]">
          <div
            onClick={() => setShowMuteMenu(!showMuteMenu)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              {contact.isMuted ? (
                <BellOff className="w-4 h-4 text-amber-400" />
              ) : (
                <Bell className="w-4 h-4 text-[#8696a0] group-hover:text-[#25d366] transition" />
              )}
              <div>
                <div className="text-xs font-semibold text-[#e9edef]">Mute notifications</div>
                <div className="text-[11px] text-[#8696a0]">{contact.isMuted ? contact.muteUntil || 'Muted' : 'Off'}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </div>

          {showMuteMenu && (
            <div className="mt-3 p-2 rounded-xl bg-[#182229] border border-[#222e35] space-y-1 animate-in fade-in">
              {['8 hours', '1 week', 'Always'].map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleMuteChange(dur)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    contact.isMuted && contact.muteUntil === dur
                      ? 'bg-[#00a884]/20 text-[#25d366]'
                      : 'hover:bg-[#202c33] text-[#e9edef]'
                  }`}
                >
                  <span>{dur}</span>
                  {contact.isMuted && contact.muteUntil === dur && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
              {contact.isMuted && (
                <button
                  onClick={() => handleMuteChange('Unmute')}
                  className="w-full text-left p-2 rounded-lg text-xs text-red-400 hover:bg-[#202c33] transition"
                >
                  Unmute notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* End-to-End Encryption Verification */}
        <div
          onClick={() => setShowSecurityModal(true)}
          className="p-4 border-b border-[#1a2c35] flex items-center justify-between cursor-pointer hover:bg-[#0f1d24] transition group"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#25d366]" />
            <div>
              <div className="text-xs font-semibold text-[#e9edef]">Encryption</div>
              <div className="text-[11px] text-[#8696a0]">Messages and calls are end-to-end encrypted. Tap to verify.</div>
            </div>
          </div>
          <QrCode className="w-4 h-4 text-[#8696a0] group-hover:text-[#25d366] transition flex-shrink-0" />
        </div>

        {/* Group Participants (if group) */}
        {contact.isGroup && (
          <div className="p-4 border-b border-[#1a2c35]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#e9edef]">
                {contact.groupMembers?.length || 5} participants
              </span>
            </div>

            <div className="space-y-2">
              {contact.groupMembers?.map((mId) => {
                const member = mId === 'me' ? { name: 'You', handle: '@me', avatarColor: '#00a884' } : contacts.find((c) => c.id === mId);
                const isAdmin = mId === contact.groupAdmin || mId === 'me';
                return (
                  <div key={mId} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#182229] transition">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: member?.avatarColor || '#00a884' }}
                      >
                        {member?.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#e9edef] truncate">{member?.name}</div>
                        <div className="text-[10px] text-[#8696a0] truncate">{member?.handle}</div>
                      </div>
                    </div>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-md bg-[#00a884]/20 text-[#25d366] text-[10px] font-bold">
                        Group Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Block / Report Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              soundFX.playTap();
              alert(`Reported ${contact.name}. Thank you for keeping OP HAIDER 3D secure.`);
            }}
            className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-semibold transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report {contact.isGroup ? 'Group' : 'Contact'}</span>
          </button>
        </div>
      </div>

      {/* Security Code Verification Modal */}
      {showSecurityModal && (
        <SecurityCodeModal
          contact={contact}
          onClose={() => setShowSecurityModal(false)}
        />
      )}
    </>
  );
};
