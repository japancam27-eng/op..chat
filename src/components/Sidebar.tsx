import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Contact, WhatsAppTab } from '../types/chat';
import {
  MessageSquare,
  CircleDot,
  Phone,
  Users,
  Settings,
  Search,
  MessageSquarePlus,
  Rotate3d,
  Sparkles,
  CheckCheck,
  Check,
  Mic,
  Plus,
  LogOut,
  Lock,
  Copy,
  CheckCircle2,
  AtSign,
  Palette,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Link,
  Trash2,
  ShieldCheck,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { OpHaiderLogo } from './OpHaiderLogo';
import { MiniAvatarHead } from './MiniAvatarHead';
import { AddStatusModal } from './AddStatusModal';
import { soundFX } from '../utils/audio';

interface SidebarProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenCustomizer: () => void;
  onOpenStatusViewer: (storyId: string) => void;
  onOpenAuth: () => void;
  onOpenLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewChat,
  onOpenNewGroup,
  onOpenCustomizer,
  onOpenStatusViewer,
  onOpenAuth,
  onOpenLanding,
}) => {
  const {
    currentUser,
    logout,
    contacts,
    activeContact,
    setActiveContact,
    allMessages,
    stories,
    activeView,
    setActiveView,
    whatsAppTab,
    setWhatsAppTab,
    callLogs,
    clearCallLogs,
    startCall,
    addContactByHandle,
    wallpaper,
    setWallpaper,
    communities,
    createCommunity,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups' | 'favorites'>('all');
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [showAddById, setShowAddById] = useState(false);
  const [inputHandle, setInputHandle] = useState('');
  const [addStatusMessage, setAddStatusMessage] = useState<string | null>(null);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [showNewCommunityInput, setShowNewCommunityInput] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');

  // Unread counts across all chats
  const totalUnreadCount = contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unreadStoriesCount = stories.filter((s) => !s.viewed && s.contactId !== 'me').length;
  const missedCallsCount = callLogs.filter((c) => c.direction === 'missed').length;

  // Filter contacts by Name OR by Unique Handle
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.handle && c.handle.toLowerCase().includes(q)) ||
      c.status.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterType === 'unread') return c.unreadCount > 0;
    if (filterType === 'groups') return !!c.isGroup;
    if (filterType === 'favorites') return !!c.isFavorite;
    return true;
  });

  const getLastMessage = (contactId: string) => {
    const contactMsgs = allMessages.filter((m) => m.chatId === contactId);
    return contactMsgs[contactMsgs.length - 1];
  };

  const handleCopyMyHandle = () => {
    if (!currentUser?.handle) return;
    soundFX.playTap();
    navigator.clipboard?.writeText(currentUser.handle);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  const handleAddByHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHandle.trim()) return;

    const result = addContactByHandle(inputHandle.trim());
    setAddStatusMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        setShowAddById(false);
        setInputHandle('');
        setAddStatusMessage(null);
      }, 1200);
    }
  };

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;
    createCommunity(newCommName.trim(), newCommDesc.trim() || 'A new collaborative space.');
    setNewCommName('');
    setNewCommDesc('');
    setShowNewCommunityInput(false);
  };

  const myHandle = currentUser?.handle || '@haider_op';

  return (
    <div className="w-full md:w-[380px] lg:w-[420px] h-full flex flex-col bg-[#0b141a] border-r border-[#1a2c35] select-none flex-shrink-0 z-10">
      {/* Top Main Navigation Header */}
      <div className="px-4 py-3 bg-[#0f1d24] border-b border-[#1a2c35] flex items-center justify-between">
        {/* User 3D Profile Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onOpenCustomizer}
            className="relative w-10 h-10 rounded-full border-2 border-[#00ffcc] bg-[#00a884]/20 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(0,255,204,0.3)] flex-shrink-0 cursor-pointer group"
            title="Open 3D Avatar Customizer"
          >
            <span className="text-xs font-black text-[#00ffcc] uppercase truncate max-w-[32px]">
              {currentUser?.name ? currentUser.name.slice(0, 2) : 'OP'}
            </span>
            <div className="absolute inset-0 bg-[#00ffcc]/15 group-hover:bg-[#00ffcc]/30 transition" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#e9edef] truncate max-w-[100px]">
                {currentUser?.name || 'You'}
              </span>
              <Sparkles className="w-3 h-3 text-[#00ffcc]" />
            </div>

            {/* Snapchat-Style Unique Handle Display */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] font-bold text-[#00ffcc] truncate max-w-[110px]">
                {myHandle}
              </span>
              <button
                type="button"
                onClick={handleCopyMyHandle}
                className="p-0.5 text-[#8696a0] hover:text-[#00ffcc] transition cursor-pointer"
                title="Copy my Unique ID"
              >
                {copiedHandle ? (
                  <CheckCircle2 className="w-3 h-3 text-[#00ffcc]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center space-x-1 text-[#94a3b8]">
          {/* Quick Add by Unique ID Button */}
          <button
            onClick={() => setShowAddById((prev) => !prev)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
              showAddById
                ? 'bg-[#00ffcc] text-[#071318] border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]'
                : 'bg-[#13222a] text-[#00ffcc] border-[#00ffcc]/30 hover:border-[#00ffcc]'
            }`}
            title="Add friend by unique Snapchat-style ID"
          >
            <AtSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add ID</span>
          </button>

          {/* New Group */}
          <button
            onClick={onOpenNewGroup}
            className="p-1.5 rounded-full hover:bg-[#13222a] hover:text-[#00ffcc] transition cursor-pointer"
            title="Create New Group"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* 3D Spatial Lounge Toggle */}
          <button
            onClick={() => {
              soundFX.playTap();
              setActiveView(activeView === 'spatialLounge' ? 'chats' : 'spatialLounge');
            }}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              activeView === 'spatialLounge'
                ? 'bg-[#00ffcc]/20 text-[#00ffcc]'
                : 'hover:bg-[#13222a] hover:text-[#e9edef]'
            }`}
            title="Open 3D Spatial Lounge"
          >
            <Rotate3d className="w-4 h-4" />
          </button>

          {/* New Chat */}
          <button
            onClick={onOpenNewChat}
            className="p-1.5 rounded-full hover:bg-[#13222a] hover:text-[#00ffcc] transition cursor-pointer"
            title="New Chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>

          {/* Log Out */}
          <button
            onClick={logout}
            className="p-1.5 rounded-full hover:bg-[#13222a] hover:text-red-400 transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline "Add Friend by Unique ID" Drawer */}
      {showAddById && (
        <div className="p-3 bg-[#071318] border-b border-[#00ffcc]/30 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#00ffcc] uppercase tracking-wider flex items-center gap-1">
              <AtSign className="w-3 h-3" />
              <span>Connect via Unique ID (Snapchat-style)</span>
            </span>
            <button
              onClick={() => setShowAddById(false)}
              className="text-[10px] text-[#8696a0] hover:text-white"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleAddByHandleSubmit} className="flex gap-2">
            <div className="flex-1 flex items-center bg-[#13222a] rounded-xl px-3 py-1.5 border border-[#1e323e] focus-within:border-[#00ffcc]">
              <span className="text-xs font-bold text-[#00ffcc] mr-1">@</span>
              <input
                type="text"
                autoFocus
                value={inputHandle.replace(/^@/, '')}
                onChange={(e) => setInputHandle(e.target.value)}
                placeholder="e.g. sophia_m or alex_r"
                className="w-full bg-transparent text-xs text-[#e9edef] placeholder-[#64748b] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00a884] text-[#071318] text-xs font-extrabold cursor-pointer hover:shadow-[0_0_10px_rgba(0,255,204,0.4)] transition"
            >
              Connect
            </button>
          </form>
          {addStatusMessage && (
            <div className="mt-1.5 text-[11px] text-[#00ffcc] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{addStatusMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Main Navigation Bar (Chats, Status, Calls, Communities, Settings) */}
      <div className="flex items-center justify-around bg-[#0c161c] border-b border-[#1a2c35] px-2 py-2">
        {/* Chats Tab */}
        <button
          onClick={() => {
            soundFX.playTap();
            setWhatsAppTab('chats');
            if (activeView !== 'chats') setActiveView('chats');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition relative cursor-pointer ${
            whatsAppTab === 'chats'
              ? 'text-[#25d366] bg-[#25d366]/10 font-bold'
              : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#182229]'
          }`}
          title="Chats"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 rounded-full bg-[#25d366] text-[#0c161c] text-[10px] font-black flex items-center justify-center">
                {totalUnreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Chats</span>
        </button>

        {/* Status / Updates Tab */}
        <button
          onClick={() => {
            soundFX.playTap();
            setWhatsAppTab('status');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition relative cursor-pointer ${
            whatsAppTab === 'status'
              ? 'text-[#25d366] bg-[#25d366]/10 font-bold'
              : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#182229]'
          }`}
          title="Status / Updates"
        >
          <div className="relative">
            <CircleDot className="w-5 h-5" />
            {unreadStoriesCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25d366] ring-2 ring-[#0c161c]" />
            )}
          </div>
          <span className="text-[11px]">Status</span>
        </button>

        {/* Calls Tab */}
        <button
          onClick={() => {
            soundFX.playTap();
            setWhatsAppTab('calls');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition relative cursor-pointer ${
            whatsAppTab === 'calls'
              ? 'text-[#25d366] bg-[#25d366]/10 font-bold'
              : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#182229]'
          }`}
          title="Calls"
        >
          <div className="relative">
            <Phone className="w-5 h-5" />
            {missedCallsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {missedCallsCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Calls</span>
        </button>

        {/* Communities Tab */}
        <button
          onClick={() => {
            soundFX.playTap();
            setWhatsAppTab('communities');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition relative cursor-pointer ${
            whatsAppTab === 'communities'
              ? 'text-[#25d366] bg-[#25d366]/10 font-bold'
              : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#182229]'
          }`}
          title="Communities"
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px]">Communities</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => {
            soundFX.playTap();
            setWhatsAppTab('settings');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition relative cursor-pointer ${
            whatsAppTab === 'settings'
              ? 'text-[#25d366] bg-[#25d366]/10 font-bold'
              : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#182229]'
          }`}
          title="Settings & Wallpaper"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px]">Settings</span>
        </button>
      </div>

      {/* ===================== TAB CONTENT: CHATS ===================== */}
      {whatsAppTab === 'chats' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="px-3 pt-2.5 pb-2 bg-[#0b151b]">
            <div className="relative flex items-center bg-[#13222a] rounded-xl px-3 py-2 border border-[#1e323e] focus-within:border-[#00ffcc]/50 transition">
              <Search className="w-4 h-4 text-[#8696a0] mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name or @unique_id"
                className="w-full bg-transparent text-xs text-[#e9edef] placeholder-[#64748b] focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 mt-2">
              {(['all', 'unread', 'groups', 'favorites'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer capitalize ${
                    filterType === ft
                      ? 'bg-[#25d366] text-[#071318] font-bold shadow-sm'
                      : 'bg-[#13222a] text-[#8696a0] hover:text-[#e9edef]'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8696a0]">
                No contacts found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isActive = contact.id === activeContact.id && activeView === 'chats';
                const lastMsg = getLastMessage(contact.id);
                const isAI = contact.isAi || contact.id === 'c-ai';

                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setActiveContact(contact);
                      if (activeView !== 'chats') setActiveView('chats');
                    }}
                    className={`relative flex items-center px-3.5 py-3 gap-3 cursor-pointer transition border-b border-[#1a2c35]/50 ${
                      isActive
                        ? 'bg-[#13222a] border-l-4 border-l-[#00ffcc]'
                        : 'hover:bg-[#13222a]/50'
                    }`}
                  >
                    {/* 3D Contact Avatar Circle */}
                    <div className="relative flex-shrink-0">
                      {isAI ? (
                        <OpHaiderLogo variant="avatar" size={48} />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shadow overflow-hidden"
                          style={{ backgroundColor: contact.avatarColor }}
                        >
                          {contact.isGroup ? (
                            <Users className="w-5 h-5 text-white" />
                          ) : (
                            <MiniAvatarHead config={contact.avatarConfig} size={48} />
                          )}
                        </div>
                      )}

                      {contact.isGroup ? (
                        <div className="absolute -bottom-1 -right-1 px-1 py-0.5 rounded-full bg-[#00ffcc] text-[9px] font-bold text-[#071318]">
                          GRP
                        </div>
                      ) : isAI ? (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00ffcc] border-2 border-[#0b151b] shadow-[0_0_8px_#00ffcc]" />
                      ) : contact.isOnline ? (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25d366] border-2 border-[#0b151b]" />
                      ) : null}
                    </div>

                    {/* Info & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs sm:text-sm font-bold text-[#e9edef] truncate">
                            {contact.name}
                          </span>
                          {isAI && (
                            <span className="px-1.5 py-0.2 rounded bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] text-[9px] font-extrabold uppercase tracking-wide">
                              AI
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8696a0] flex-shrink-0">
                          {lastMsg ? lastMsg.timestamp : 'Active'}
                        </span>
                      </div>

                      {/* Contact Handle */}
                      <div className="flex items-center gap-1 text-[11px] text-[#00ffcc] font-medium mb-1 truncate">
                        <span>{contact.handle || `@user_${contact.id.slice(-4)}`}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-[#8696a0] truncate pr-2">
                          {contact.isTyping ? (
                            <span className="text-[#25d366] font-semibold animate-pulse">
                              typing...
                            </span>
                          ) : lastMsg ? (
                            <>
                              {lastMsg.senderId === 'me' && (
                                <span className="mr-1">
                                  {lastMsg.status === 'read' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
                                  ) : lastMsg.status === 'delivered' ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-[#8696a0] inline" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-[#8696a0] inline" />
                                  )}
                                </span>
                              )}
                              {lastMsg.type === 'voice' && (
                                <Mic className="w-3.5 h-3.5 mr-1 text-[#25d366] inline" />
                              )}
                              <span className="truncate">{lastMsg.text}</span>
                            </>
                          ) : (
                            <span className="truncate">{contact.status}</span>
                          )}
                        </div>

                        {/* Unread Count Badge */}
                        {contact.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#25d366] text-[#071318] text-[10px] font-extrabold flex-shrink-0">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB CONTENT: STATUS / STORIES ===================== */}
      {whatsAppTab === 'status' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-5">
          {/* My Status Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0f1d24] border border-[#1a2c35]">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setShowAddStatusModal(true)}
                className="relative cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#25d366] bg-[#182229] flex items-center justify-center font-bold text-white overflow-hidden shadow">
                  <MiniAvatarHead config={currentUser?.avatarConfig || contacts[0].avatarConfig} size={48} />
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#25d366] text-[#071318] flex items-center justify-center shadow">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#e9edef]">My Status</h4>
                <p className="text-xs text-[#8696a0]">Tap to add status update</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddStatusModal(true)}
              className="p-2 rounded-xl bg-[#25d366]/20 text-[#25d366] hover:bg-[#25d366]/30 transition cursor-pointer"
              title="Add Status"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Recent Updates */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#8696a0] uppercase tracking-wider px-1">
              Recent Updates
            </span>

            <div className="space-y-1">
              {stories.filter((s) => !s.viewed && s.contactId !== 'me').map((story) => (
                <div
                  key={story.id}
                  onClick={() => onOpenStatusViewer(story.id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#13222a] transition cursor-pointer"
                >
                  {/* Status Circle with Green Ring */}
                  <div className="relative p-0.5 rounded-full ring-2 ring-[#25d366] ring-offset-2 ring-offset-[#0b141a]">
                    <div className="w-11 h-11 rounded-full bg-[#182229] flex items-center justify-center font-bold text-white text-sm">
                      {story.contactName.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#e9edef] truncate">{story.contactName}</h5>
                    <p className="text-[11px] text-[#8696a0] truncate mt-0.5">{story.caption}</p>
                    <span className="text-[10px] text-[#25d366]">{story.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Viewed Updates */}
          <div className="space-y-2 pt-2 border-t border-[#1a2c35]">
            <span className="text-xs font-bold text-[#8696a0] uppercase tracking-wider px-1">
              Viewed Updates
            </span>

            <div className="space-y-1">
              {stories.filter((s) => s.viewed).map((story) => (
                <div
                  key={story.id}
                  onClick={() => onOpenStatusViewer(story.id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#13222a] transition cursor-pointer opacity-75"
                >
                  <div className="p-0.5 rounded-full ring-2 ring-[#8696a0]/40 ring-offset-2 ring-offset-[#0b141a]">
                    <div className="w-11 h-11 rounded-full bg-[#182229] flex items-center justify-center font-bold text-[#8696a0] text-sm">
                      {story.contactName.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-[#e9edef] truncate">{story.contactName}</h5>
                    <p className="text-[11px] text-[#8696a0] truncate mt-0.5">{story.caption}</p>
                    <span className="text-[10px] text-[#8696a0]">{story.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB CONTENT: CALLS ===================== */}
      {whatsAppTab === 'calls' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {/* Create Call Link Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0f1d24] border border-[#1a2c35]">
            <div className="w-11 h-11 rounded-full bg-[#25d366]/20 text-[#25d366] flex items-center justify-center flex-shrink-0">
              <Link className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#e9edef]">Create call link</h4>
              <p className="text-[11px] text-[#8696a0] mt-0.5">Share a link for your OP HAIDER 3D call</p>
            </div>
            <button
              onClick={() => {
                soundFX.playTap();
                navigator.clipboard?.writeText('https://ophaider.com/call/3d-lounge-room');
                alert('Call link copied to clipboard: https://ophaider.com/call/3d-lounge-room');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-[#00ffcc] transition cursor-pointer"
            >
              Share
            </button>
          </div>

          {/* Calls History Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">
              Recent Calls
            </span>
            {callLogs.length > 0 && (
              <button
                onClick={clearCallLogs}
                className="text-[11px] text-[#8696a0] hover:text-red-400 flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Call Logs List */}
          <div className="space-y-1">
            {callLogs.map((log) => {
              const contact = contacts.find((c) => c.id === log.contactId);
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#13222a] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#182229] border border-[#222e35] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                      {log.contactName.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-[#e9edef] truncate">{log.contactName}</h5>
                      <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                        {log.direction === 'incoming' && (
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#25d366]" />
                        )}
                        {log.direction === 'outgoing' && (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-[#25d366]" />
                        )}
                        {log.direction === 'missed' && (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className="text-[#8696a0]">{log.timestamp}</span>
                        {log.duration && (
                          <span className="text-[#8696a0]">({log.duration})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startCall('voice', contact)}
                      className="p-2 rounded-full text-[#25d366] hover:bg-[#202c33] transition cursor-pointer"
                      title="Audio Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startCall('video', contact)}
                      className="p-2 rounded-full text-[#25d366] hover:bg-[#202c33] transition cursor-pointer"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB CONTENT: COMMUNITIES ===================== */}
      {whatsAppTab === 'communities' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {/* New Community Trigger */}
          <div className="p-4 rounded-2xl bg-[#0f1d24] border border-[#1a2c35] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#25d366]/20 text-[#25d366] flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e9edef]">New Community</h4>
                <p className="text-[11px] text-[#8696a0] mt-0.5">Bring members together in topic groups</p>
              </div>
            </div>

            {!showNewCommunityInput ? (
              <button
                onClick={() => setShowNewCommunityInput(true)}
                className="w-full py-2 rounded-xl bg-[#25d366] text-[#071318] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Community</span>
              </button>
            ) : (
              <form onSubmit={handleCreateCommunitySubmit} className="space-y-2 pt-2 border-t border-[#1a2c35]">
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="Community Name"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#182229] border border-[#2a3942] text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#25d366]"
                />
                <input
                  type="text"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#182229] border border-[#2a3942] text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#25d366]"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNewCommunityInput(false)}
                    className="px-3 py-1 text-xs text-[#8696a0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-lg bg-[#25d366] text-black text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Communities List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#8696a0] uppercase tracking-wider px-1">
              Your Communities
            </span>

            {communities.map((comm) => (
              <div
                key={comm.id}
                className="p-4 rounded-2xl bg-[#0f1d24]/60 border border-[#1a2c35] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#182229] border border-[#222e35] flex items-center justify-center font-bold text-[#00ffcc] text-sm">
                    {comm.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-[#e9edef] truncate">{comm.name}</h5>
                    <p className="text-[11px] text-[#8696a0] truncate mt-0.5">{comm.description}</p>
                    <span className="text-[10px] text-[#25d366] font-semibold">{comm.membersCount} members</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1a2c35] space-y-1.5">
                  <div
                    onClick={() => {
                      const g = contacts.find((c) => c.isGroup);
                      if (g) setActiveContact(g);
                      setWhatsAppTab('chats');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#182229] transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📢</span>
                      <span className="font-semibold text-[#e9edef]">Announcements</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8696a0]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB CONTENT: SETTINGS & WALLPAPER ===================== */}
      {whatsAppTab === 'settings' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-5">
          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-[#0f1d24] border border-[#1a2c35] flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full border-2 border-[#00ffcc] bg-[#182229] flex items-center justify-center overflow-hidden shadow">
              <MiniAvatarHead config={currentUser?.avatarConfig || contacts[0].avatarConfig} size={56} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[#e9edef] truncate">{currentUser?.name || 'You'}</h3>
              <div className="text-xs text-[#00ffcc] font-semibold">{myHandle}</div>
              <div className="text-[11px] text-[#8696a0] truncate mt-0.5">{currentUser?.email}</div>
            </div>
            <button
              onClick={onOpenCustomizer}
              className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[#00ffcc] text-xs font-semibold transition"
            >
              Edit
            </button>
          </div>

          {/* WhatsApp Chat Wallpaper Theme Selector */}
          <div className="p-4 rounded-2xl bg-[#0f1d24]/60 border border-[#1a2c35] space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#25d366]" />
              <h4 className="text-xs font-bold text-[#e9edef]">Chat Wallpaper Theme</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'doodle-dark', name: 'Dark Doodle', bg: 'bg-[#0b141a]' },
                { id: 'doodle-emerald', name: 'Emerald Midnight', bg: 'bg-[#071a17]' },
                { id: 'cyber-carbon', name: 'Cyber Carbon', bg: 'bg-[#0a0f12]' },
                { id: 'midnight-blue', name: 'Midnight Navy', bg: 'bg-[#07131f]' },
              ].map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => {
                    soundFX.playTap();
                    setWallpaper({ ...wallpaper, theme: wp.id as any });
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-20 ${wp.bg} ${
                    wallpaper.theme === wp.id
                      ? 'border-[#25d366] shadow-[0_0_10px_rgba(37,211,102,0.3)]'
                      : 'border-[#222e35] hover:border-[#8696a0]'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#e9edef]">{wp.name}</span>
                  {wallpaper.theme === wp.id && (
                    <span className="text-[10px] text-[#25d366] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Doodle Opacity Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-[#8696a0]">
                <span>Pattern Intensity</span>
                <span>{Math.round(wallpaper.doodleOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={wallpaper.doodleOpacity}
                onChange={(e) =>
                  setWallpaper({ ...wallpaper, doodleOpacity: parseFloat(e.target.value) })
                }
                className="w-full accent-[#25d366] cursor-pointer"
              />
            </div>
          </div>

          {/* Security & Privacy Badges */}
          <div className="p-4 rounded-2xl bg-[#0f1d24]/60 border border-[#1a2c35] space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#25d366]" />
              <h4 className="text-xs font-bold text-[#e9edef]">Privacy & Security</h4>
            </div>
            <p className="text-[11px] text-[#8696a0] leading-relaxed">
              All messages, calls, media, and 3D spatial audio in OP HAIDER 3D are protected with 256-bit end-to-end encryption.
            </p>
          </div>

          {/* Logout Action */}
          <button
            onClick={logout}
            className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out of OP HAIDER 3D</span>
          </button>
        </div>
      )}

      {/* Add Status Modal */}
      {showAddStatusModal && (
        <AddStatusModal onClose={() => setShowAddStatusModal(false)} />
      )}
    </div>
  );
};
