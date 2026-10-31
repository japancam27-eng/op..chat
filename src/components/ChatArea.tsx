import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Message, AvatarExpression, PollOption } from '../types/chat';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Check,
  CheckCheck,
  Play,
  Square,
  Sparkles,
  Volume2,
  X,
  Rotate3d,
  MessageSquare,
  Lock,
  Users,
  Bot,
  Wand2,
  FileText,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Palette,
  Maximize2,
  Zap,
  Pin,
  Star,
  Forward,
  Trash2,
  Edit2,
  BarChart2,
  MapPin,
  Clock,
  ChevronDown,
  Info,
  CornerUpLeft,
} from 'lucide-react';
import { MiniAvatarHead } from './MiniAvatarHead';
import { OpHaiderLogo } from './OpHaiderLogo';
import { ContactInfoDrawer } from './ContactInfoDrawer';
import { PollCreatorModal } from './PollCreatorModal';
import { ForwardModal } from './ForwardModal';
import { SnapCameraModal } from './SnapCameraModal';
import { SnapSecurityModal } from './SnapSecurityModal';
import { SnapViewerModal } from './SnapViewerModal';
import { ShieldAlert, Flame, Eye, Camera, ShieldCheck } from 'lucide-react';

interface ChatAreaProps {
  onOpenCustomizer: () => void;
  onOpenEyesOnly?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onOpenCustomizer, onOpenEyesOnly }) => {
  const {
    activeContact,
    messages,
    sendMessage,
    sendVoiceMessage,
    sendReaction,
    startCall,
    is3DCompanionOpen,
    setIs3DCompanionOpen,
    triggerEmote,
    triggerTypingSimulation,
    generateAiImage,
    replyToMessage,
    setReplyToMessage,
    starMessage,
    deleteMessage,
    editMessage,
    pinMessage,
    unpinMessage,
    votePoll,
    sendDocument,
    sendLocation,
    pinnedMessage,
    wallpaper,
    currentUser,
    openSnap,
    activeSnapViewing,
    setActiveSnapViewing,
    screenshotAlertBanner,
    dismissScreenshotAlert,
    triggerScreenshotAlert,
    snapscore,
  } = useChat();

  const [inputVal, setInputVal] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSnapCamera, setShowSnapCamera] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef<number | null>(null);

  // WhatsApp Modals
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [forwardingMsg, setForwardingMsg] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [editInputVal, setEditInputVal] = useState('');

  // 3D Image Generator States
  const [showImageModal, setShowImageModal] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Audio note playback states
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [playingProgress, setPlayingProgress] = useState<number>(0);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Search inside chat
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Smart Tools States
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'That sounds exciting! 🚀',
    'Can you tell me more about that? ✨',
    'Let’s meet in the 3D Lounge! 🌐',
  ]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showRewriteMenu, setShowRewriteMenu] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Auto fetch AI quick suggestions when new messages arrive
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.senderId === 'me') {
      setAiSuggestions([
        'Sounds good! 👍',
        'Tell me more! ✨',
        'Let’s hop on a 3D call! 🚀',
      ]);
      return;
    }

    fetch('/api/gemini/smart-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastMessage: lastMsg.text,
        contactName: activeContact.name,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.suggestions) && d.suggestions.length > 0) {
          setAiSuggestions(d.suggestions);
        }
      })
      .catch(() => {
        setAiSuggestions([
          'Totally agree! ✨',
          'That sounds great! 🚀',
          'Let me know! 👍',
        ]);
      });
  }, [activeContact.id, messages.length]);

  const handleAiRewrite = async (tone: string) => {
    if (!inputVal.trim()) return;
    setIsRewriting(true);
    setShowRewriteMenu(false);
    try {
      const res = await fetch('/api/gemini/rewrite-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputVal, tone }),
      });
      const data = await res.json();
      if (data.rewritten) {
        setInputVal(data.rewritten);
        soundFX.playCallConnected();
      }
    } catch {
      // ignore
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setShowSummaryModal(true);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-12).map((m) => ({ sender: m.senderName, text: m.text })),
        }),
      });
      const data = await res.json();
      setAiSummaryText(data.summary || 'Summary generated.');
    } catch {
      setAiSummaryText('Active conversation with 3D avatars and real-time messaging in OP HAIDER.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact.isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    sendMessage(inputVal.trim());
    setInputVal('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Voice recording simulation
  const startRecording = () => {
    soundFX.playTap();
    setIsRecordingVoice(true);
    setRecordDuration(0);
    recordTimerRef.current = window.setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopAndSendRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    const finalDuration = Math.max(2, recordDuration);
    setIsRecordingVoice(false);
    setRecordDuration(0);
    sendVoiceMessage(finalDuration);
  };

  const cancelRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecordingVoice(false);
    setRecordDuration(0);
    soundFX.playTap();
  };

  // Play voice note
  const handlePlayVoiceNote = (msg: Message) => {
    if (playingMsgId === msg.id) {
      stopAudioRef.current?.();
      setPlayingMsgId(null);
      setPlayingProgress(0);
      return;
    }

    if (stopAudioRef.current) {
      stopAudioRef.current();
    }

    setPlayingMsgId(msg.id);
    setPlayingProgress(0);
    triggerEmote('talking');

    const duration = msg.voiceDuration || 4;
    stopAudioRef.current = soundFX.playVoiceNote(
      duration,
      (pct) => setPlayingProgress(pct),
      () => {
        setPlayingMsgId(null);
        setPlayingProgress(0);
      }
    );
  };

  const handleReact = (msgId: string, emoji: string, e: React.MouseEvent) => {
    sendReaction(msgId, emoji);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      origin: { x, y },
      particleCount: 25,
      spread: 60,
      startVelocity: 15,
      ticks: 70,
      colors: ['#25d366', '#ffffff', '#3b82f6', '#f59e0b'],
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMsg || !editInputVal.trim()) return;
    editMessage(editingMsg.id, editInputVal.trim());
    setEditingMsg(null);
    setEditInputVal('');
  };

  const handleSendSampleDoc = () => {
    setShowAttachMenu(false);
    sendDocument({
      name: 'OP_HAIDER_3D_Architecture.pdf',
      size: '2.4 MB',
      extension: 'PDF',
    });
  };

  const handleSendSampleLocation = () => {
    setShowAttachMenu(false);
    sendLocation({
      name: 'Holographic Cyber Lounge',
      address: '77 Metaverse Blvd, 3D Cloud Cluster',
      lat: 37.7749,
      lng: -122.4194,
    });
  };

  const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✨'];

  // Filter messages by search if searching
  const displayedMessages = searchInChatQuery.trim()
    ? messages.filter((m) =>
        m.text.toLowerCase().includes(searchInChatQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="relative flex-1 h-full flex flex-row min-w-0 overflow-hidden">
      <div className="relative flex-1 h-full flex flex-col bg-[#0b141a] select-none min-w-0">
        {/* WhatsApp Doodle Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: wallpaper.doodleOpacity,
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0,255,204,0.15) 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Chat Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1d24] border-b border-[#1a2c35] z-10 shadow-sm">
          {/* Contact info (Click to open WhatsApp Contact Drawer) */}
          <div
            onClick={() => setShowContactInfo(!showContactInfo)}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            {activeContact.isAi || activeContact.id === 'c-ai' ? (
              <div className="relative">
                <OpHaiderLogo variant="avatar" size={42} />
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00ffcc] border-2 border-[#0f1d24] shadow-[0_0_8px_#00ffcc]" />
              </div>
            ) : (
              <div
                className="relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow overflow-hidden"
                style={{ backgroundColor: activeContact.avatarColor }}
              >
                {activeContact.isGroup ? (
                  <Users className="w-5 h-5 text-white" />
                ) : (
                  <MiniAvatarHead config={activeContact.avatarConfig} size={40} />
                )}
                {!activeContact.isGroup && activeContact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-[#0f1d24]" />
                )}
              </div>
            )}

            <div>
              <div className="text-sm font-bold text-[#e9edef] flex items-center gap-1.5 group-hover:text-[#25d366] transition">
                <span>{activeContact.name}</span>
                {activeContact.streak && (
                  <span
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[11px] font-extrabold border border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.3)] animate-pulse"
                    title={`${activeContact.streak.count} Day Snapstreak 🔥 (${activeContact.streak.hoursLeft}h left to reply)`}
                  >
                    🔥 {activeContact.streak.count}
                  </span>
                )}
                {activeContact.isGroup ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#25d366]/20 text-[#25d366] text-[10px] font-bold">
                    Group
                  </span>
                ) : (activeContact.isAi || activeContact.id === 'c-ai') ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] text-[10px] font-extrabold uppercase tracking-wider">
                    OP Haider AI
                  </span>
                ) : null}
              </div>

              <div className="text-xs text-[#8696a0] flex items-center gap-2 max-w-[280px] md:max-w-md truncate">
                <span className="text-[11px] font-bold text-[#00ffcc]">
                  {activeContact.handle || `@user_${activeContact.id.slice(-4)}`}
                </span>
                {activeContact.snapscore ? (
                  <>
                    <span className="text-[#334155]">•</span>
                    <span className="text-[10px] font-mono text-amber-400">
                      ⚡ {activeContact.snapscore.toLocaleString()}
                    </span>
                  </>
                ) : null}
                <span className="text-[#334155]">•</span>
                {activeContact.isTyping ? (
                  <span className="text-[#25d366] font-medium animate-pulse">typing...</span>
                ) : activeContact.isGroup ? (
                  <span className="truncate">{activeContact.status}</span>
                ) : activeContact.isOnline ? (
                  <span className="text-[#25d366]">online</span>
                ) : (
                  <span>last seen {activeContact.lastSeen}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center space-x-1.5 text-[#aebac1]">
            {/* Quick Snap Camera */}
            <button
              onClick={() => setShowSnapCamera(true)}
              className="px-2.5 py-1.5 rounded-full bg-[#fffc00]/15 hover:bg-[#fffc00]/25 text-[#fffc00] border border-[#fffc00]/30 transition flex items-center gap-1.5 cursor-pointer text-xs font-extrabold shadow-[0_0_12px_rgba(255,252,0,0.25)]"
              title="Take & Send Ephemeral View-Once Snap"
            >
              <span>👻</span>
              <span className="hidden sm:inline">Snap</span>
            </button>

            {/* Snapchat & Cyber Security Shield */}
            <button
              onClick={() => setShowSecurityModal(true)}
              className="p-2 rounded-full hover:bg-[#111b21] text-[#fffc00] hover:text-yellow-300 transition cursor-pointer relative"
              title="Snapchat & Privacy Security Suite"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            {/* 3D Avatar Companion Toggle */}
            <button
              onClick={() => setIs3DCompanionOpen(!is3DCompanionOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                is3DCompanionOpen
                  ? 'bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/40'
                  : 'bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0]'
              }`}
              title="Toggle 3D Avatar Companion"
            >
              <Rotate3d className="w-4 h-4" />
              <span className="hidden sm:inline">3D Avatar</span>
            </button>

            {/* Voice Call */}
            <button
              onClick={() => startCall('voice')}
              className="p-2 rounded-full hover:bg-[#111b21] hover:text-[#25d366] transition cursor-pointer"
              title="WhatsApp Audio Call"
            >
              <Phone className="w-5 h-5" />
            </button>

            {/* Video Call */}
            <button
              onClick={() => startCall('video')}
              className="p-2 rounded-full hover:bg-[#111b21] hover:text-[#25d366] transition cursor-pointer"
              title="WhatsApp 3D Video Call"
            >
              <Video className="w-5 h-5" />
            </button>

            {/* Search in chat */}
            <button
              onClick={() => setShowSearchInChat(!showSearchInChat)}
              className={`p-2 rounded-full transition cursor-pointer ${
                showSearchInChat ? 'bg-[#25d366]/20 text-[#25d366]' : 'hover:bg-[#111b21] text-[#aebac1]'
              }`}
              title="Search messages"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Summarize */}
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="p-2 rounded-full hover:bg-[#111b21] text-[#00ffcc] hover:text-[#38ef7d] transition cursor-pointer"
              title="Summarize conversation with Gemini AI"
            >
              <Bot className={`w-5 h-5 ${isSummarizing ? 'animate-spin' : ''}`} />
            </button>

            {/* Contact Info Drawer Toggle */}
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="p-2 rounded-full hover:bg-[#111b21] hover:text-[#e9edef] transition cursor-pointer"
              title="Contact / Group Info"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Screenshot Alert Banner */}
        {screenshotAlertBanner && (
          <div className="px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between text-xs font-bold border-b border-red-400 shadow-2xl z-30 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <span className="text-base animate-bounce">🚨</span>
              <span>
                SCREENSHOT DETECTED: {screenshotAlertBanner.user} took a screenshot of chat at {screenshotAlertBanner.timestamp}!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerScreenshotAlert('Someone')}
                className="px-2 py-0.5 bg-black/30 hover:bg-black/50 text-[10px] rounded uppercase font-mono tracking-wider transition"
              >
                Test Again
              </button>
              <button
                onClick={dismissScreenshotAlert}
                className="w-5 h-5 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Search In Chat Bar (collapsible) */}
        {showSearchInChat && (
          <div className="px-4 py-2 bg-[#111b21] border-b border-[#222e35] flex items-center gap-2 z-10 animate-in slide-in-from-top-2">
            <Search className="w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              autoFocus
              value={searchInChatQuery}
              onChange={(e) => setSearchInChatQuery(e.target.value)}
              placeholder="Search in this chat..."
              className="flex-1 bg-transparent text-xs text-white placeholder-[#8696a0] focus:outline-none"
            />
            {searchInChatQuery && (
              <span className="text-[11px] text-[#25d366]">
                {displayedMessages.length} results
              </span>
            )}
            <button
              onClick={() => {
                setShowSearchInChat(false);
                setSearchInChatQuery('');
              }}
              className="text-xs text-[#8696a0] hover:text-white"
            >
              Close
            </button>
          </div>
        )}

        {/* WhatsApp Pinned Message Bar */}
        {pinnedMessage && (
          <div className="px-4 py-2 bg-[#182229]/95 border-b border-[#25d366]/30 flex items-center justify-between text-xs text-[#e9edef] z-10 backdrop-blur shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <Pin className="w-4 h-4 text-[#25d366] flex-shrink-0 fill-[#25d366]" />
              <div className="min-w-0 truncate">
                <span className="font-bold text-[#25d366] mr-1.5">Pinned:</span>
                <span className="text-[#8696a0]">{pinnedMessage.text}</span>
              </div>
            </div>
            <button
              onClick={() => unpinMessage(pinnedMessage.id)}
              className="text-[10px] text-[#8696a0] hover:text-red-400 font-semibold uppercase tracking-wider ml-2"
            >
              Unpin
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-2.5 z-0">
          {/* End-to-End Encryption Notice Badge */}
          <div className="flex justify-center my-2">
            <div className="max-w-md px-3.5 py-1.5 rounded-xl bg-[#182229]/90 border border-[#2a3942]/60 text-[11px] text-[#ffd279] text-center flex items-center justify-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#ffd279] flex-shrink-0" />
              <span>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</span>
            </div>
          </div>

          {/* Disappearing Messages Active Badge */}
          {activeContact.disappearingTimer && activeContact.disappearingTimer > 0 && (
            <div className="flex justify-center my-1">
              <div className="px-3 py-1 rounded-full bg-[#182229]/80 border border-[#25d366]/30 text-[10px] text-[#25d366] flex items-center gap-1.5 shadow">
                <Clock className="w-3 h-3" />
                <span>Disappearing messages active in this chat</span>
              </div>
            </div>
          )}

          {/* Date separator */}
          <div className="flex justify-center my-3">
            <span className="px-3 py-1 rounded-lg bg-[#182229] text-[11px] font-medium text-[#8696a0] shadow-sm uppercase tracking-wider">
              Today
            </span>
          </div>

          {/* Message bubbles */}
          {displayedMessages.map((msg) => {
            const isMe = msg.senderId === 'me';
            const isSystem = msg.senderId === 'system';

            if (msg.type === 'screenshot_alert' || msg.screenshotAlert) {
              return (
                <div key={msg.id} className="flex justify-center my-3 w-full">
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs shadow-lg backdrop-blur animate-in zoom-in-95">
                    <span className="text-base animate-pulse">🚨</span>
                    <div>
                      <span className="font-extrabold text-white">Screenshot Audit: </span>
                      <span>{msg.text.replace('🚨 Screenshot Detected: ', '')}</span>
                    </div>
                    <span className="text-[10px] text-red-400 font-mono ml-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="max-w-md px-3 py-1 rounded-xl bg-[#182229]/90 border border-[#25d366]/20 text-[11px] text-[#8696a0] text-center shadow-sm">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group mb-1`}
              >
                <div
                  className={`relative max-w-[85%] md:max-w-[70%] lg:max-w-[60%] rounded-xl px-3.5 py-2 shadow-md transition ${
                    isMe
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                  }`}
                >
                  {/* Forwarded Header */}
                  {msg.forwarded && (
                    <div className="flex items-center gap-1 text-[10px] text-[#8696a0] italic mb-1">
                      <Forward className="w-3 h-3" />
                      <span>Forwarded</span>
                    </div>
                  )}

                  {/* Quoted Reply Preview */}
                  {msg.replyTo && (
                    <div className="p-2 mb-2 rounded-lg bg-black/20 border-l-4 border-l-[#25d366] text-xs">
                      <div className="font-bold text-[#25d366] text-[11px]">{msg.replyTo.senderName}</div>
                      <div className="text-[#8696a0] truncate mt-0.5">{msg.replyTo.text}</div>
                    </div>
                  )}

                  {/* AI Companion Sender Badge */}
                  {!isMe && (msg.senderId === 'c-ai' || activeContact.isAi) && (
                    <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-[#00ffcc]/20">
                      <OpHaiderLogo variant="avatar" size={20} />
                      <span className="text-xs font-black text-[#00ffcc]">OP Haider AI</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] font-extrabold uppercase tracking-wider">
                        @haider.ai
                      </span>
                    </div>
                  )}

                  {/* Group Sender Name */}
                  {!isMe && activeContact.isGroup && (
                    <div className="text-xs font-bold text-[#53bdeb] mb-0.5 tracking-wide">
                      {msg.senderName}
                    </div>
                  )}

                  {/* Deleted message notice */}
                  {msg.isDeleted ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#8696a0] italic py-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{msg.text}</span>
                    </div>
                  ) : msg.poll ? (
                    /* Interactive WhatsApp Poll Bubble */
                    <div className="space-y-3 py-1 min-w-[260px] max-w-sm">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                        <BarChart2 className="w-4 h-4 text-[#25d366]" />
                        <h4 className="text-sm font-bold text-[#e9edef] leading-snug">
                          {msg.poll.question}
                        </h4>
                      </div>

                      <div className="text-[10px] text-[#8696a0]">
                        {msg.poll.allowMultiple ? 'Select one or more' : 'Select one'}
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {msg.poll.options.map((opt) => {
                          const totalVotes = msg.poll?.options.reduce(
                            (acc, o) => acc + o.votes.length,
                            0
                          ) || 1;
                          const pct = Math.round((opt.votes.length / Math.max(1, totalVotes)) * 100);
                          const userHandle = currentUser?.handle || '@me';
                          const hasVoted = opt.votes.includes(userHandle);

                          return (
                            <button
                              key={opt.id}
                              onClick={() => votePoll(msg.id, opt.id)}
                              className="w-full relative overflow-hidden rounded-xl bg-black/25 hover:bg-black/40 border border-white/10 p-2.5 text-left transition cursor-pointer group/opt"
                            >
                              {/* Animated Percentage Fill Bar */}
                              <div
                                className="absolute inset-y-0 left-0 bg-[#25d366]/25 transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />

                              <div className="relative z-10 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 font-medium text-[#e9edef]">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                                      hasVoted
                                        ? 'bg-[#25d366] border-[#25d366] text-black font-bold'
                                        : 'border-[#8696a0]'
                                    }`}
                                  >
                                    {hasVoted && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span>{opt.text}</span>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#25d366]">
                                  <span>{opt.votes.length}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[10px] text-[#8696a0] text-right pt-1">
                        {msg.poll.options.reduce((acc, o) => acc + o.votes.length, 0)} votes total
                      </div>
                    </div>
                  ) : msg.document ? (
                    /* WhatsApp Document Message */
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20 border border-white/10 min-w-[220px]">
                      <div className="w-10 h-10 rounded-xl bg-[#25d366]/20 text-[#25d366] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#e9edef] truncate">{msg.document.name}</div>
                        <div className="text-[10px] text-[#8696a0] mt-0.5">{msg.document.size} • {msg.document.extension}</div>
                      </div>
                      <button
                        onClick={() => {
                          soundFX.playTap();
                          alert(`Downloaded document: ${msg.document?.name}`);
                        }}
                        className="p-2 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-white transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ) : msg.location ? (
                    /* WhatsApp Location Message */
                    <div className="space-y-2 min-w-[220px]">
                      <div className="h-28 rounded-xl bg-gradient-to-br from-[#0c1e28] to-[#14323d] border border-[#25d366]/30 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                        <MapPin className="w-8 h-8 text-[#25d366] animate-bounce mb-1" />
                        <span className="text-xs font-bold text-white truncate max-w-full">{msg.location.name}</span>
                        <span className="text-[10px] text-[#8696a0] truncate max-w-full">{msg.location.address}</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center text-xs text-[#25d366] font-semibold hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  ) : msg.imageUrl ? (
                    /* Image message */
                    <div className="space-y-2 pb-1 min-w-[240px] max-w-sm">
                      <div className="relative rounded-xl overflow-hidden border border-[#00ffcc]/40 bg-[#08131a] shadow-lg group/img">
                        <img
                          src={msg.imageUrl}
                          alt={msg.imagePrompt || 'OP Haider 3D Generation'}
                          className="w-full max-h-72 object-cover rounded-xl cursor-pointer hover:scale-102 transition-transform duration-300"
                          onClick={() => setPreviewModalImage(msg.imageUrl!)}
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover/img:opacity-100 transition">
                          <button
                            onClick={() => setPreviewModalImage(msg.imageUrl!)}
                            className="p-1.5 rounded-lg bg-[#071318]/80 hover:bg-[#00ffcc] text-white hover:text-black border border-white/20 transition cursor-pointer"
                            title="View Fullscreen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={msg.imageUrl}
                            download={`op-haider-${Date.now()}.png`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-[#071318]/80 hover:bg-[#00ffcc] text-white hover:text-black border border-white/20 transition cursor-pointer"
                            title="Download 3D Artwork"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {msg.text && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-12 pb-1">
                          {msg.text}
                        </p>
                      )}
                    </div>
                  ) : msg.type === 'voice' ? (
                    /* Voice Note */
                    <div className="flex items-center space-x-3 py-1 min-w-[210px]">
                      <button
                        onClick={() => handlePlayVoiceNote(msg)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer shadow ${
                          playingMsgId === msg.id
                            ? 'bg-[#25d366] text-[#111b21]'
                            : 'bg-[#111b21]/40 text-[#25d366] hover:bg-[#111b21]/60'
                        }`}
                      >
                        {playingMsgId === msg.id ? (
                          <Square className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center space-x-0.5 h-6 mb-1">
                          {(msg.voiceWaveform || [40, 60, 90, 70, 50, 80, 40, 60]).map((h, i) => {
                            const isPlayed = playingMsgId === msg.id && (i / 8) <= playingProgress;
                            return (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                  isPlayed ? 'bg-[#25d366]' : 'bg-[#8696a0]/60'
                                }`}
                                style={{ height: `${Math.max(6, (h / 100) * 22)}px` }}
                              />
                            );
                          })}
                        </div>

                        <div className="flex justify-between text-[11px] text-[#8696a0]">
                          <span>0:0{msg.voiceDuration || 4}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ) : msg.snap ? (
                    /* Snapchat Ephemeral Snap Bubble */
                    <div className="py-1 min-w-[220px]">
                      {!msg.snap.isBurnt && !msg.snap.isOpened ? (
                        <button
                          onClick={() => openSnap(msg.id)}
                          className="w-full p-3 rounded-2xl bg-gradient-to-r from-red-600/90 to-purple-600/90 hover:from-red-500 hover:to-purple-500 border border-red-400/50 text-white flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.35)] transition-all active:scale-98 cursor-pointer group/snap"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-sm shadow group-hover/snap:rotate-12 transition-transform">
                              ⚡
                            </div>
                            <div className="text-left">
                              <div className="font-extrabold text-xs tracking-wide">
                                Ephemeral Snap
                              </div>
                              <div className="text-[10px] text-white/80">
                                Tap to view ({msg.snap.timer}s)
                              </div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono font-bold uppercase tracking-wider text-[#fffc00]">
                            View Once
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[#8696a0] select-none">
                          <div className="w-7 h-7 rounded-lg border-2 border-[#8696a0]/50 flex items-center justify-center text-xs">
                            ▢
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-zinc-400">
                              Opened Snap (Burnt)
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              Auto-destroyed after viewing
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Text message layout */
                    <div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-14 pb-1">
                        {msg.text}
                      </p>
                    </div>
                  )}

                  {/* Message Bottom Status Row */}
                  <div className="absolute right-2 bottom-1 flex items-center space-x-1 text-[11px] text-[#8696a0]">
                    {msg.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    {msg.isPinned && <Pin className="w-3 h-3 text-[#25d366] fill-[#25d366]" />}
                    {msg.isEdited && <span className="text-[10px] italic mr-0.5">edited</span>}
                    <span>{msg.timestamp}</span>
                    {isMe && !msg.isDeleted && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#8696a0] inline" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-[#8696a0] inline" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Reactions badge */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="absolute -bottom-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#111b21] border border-[#222e35] text-xs shadow-md">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <span key={emoji} className="flex items-center text-[11px]">
                          {emoji} <strong className="ml-0.5 text-[#8696a0]">{count}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* WhatsApp Hover Action Toolbar */}
                {!msg.isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#202c33]/95 border border-[#2a3942] shadow-lg z-10">
                    {/* Quick Reactions */}
                    {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => handleReact(msg.id, emoji, e)}
                        className="hover:scale-125 transition-transform text-xs p-0.5 cursor-pointer"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}

                    <span className="w-[1px] h-3 bg-white/20 mx-0.5" />

                    {/* Reply */}
                    <button
                      onClick={() => setReplyToMessage(msg)}
                      className="p-1 text-[#8696a0] hover:text-[#25d366] transition cursor-pointer"
                      title="Reply"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Star / Unstar */}
                    <button
                      onClick={() => starMessage(msg.id)}
                      className={`p-1 transition cursor-pointer ${
                        msg.isStarred ? 'text-amber-400' : 'text-[#8696a0] hover:text-amber-400'
                      }`}
                      title={msg.isStarred ? 'Unstar' : 'Star message'}
                    >
                      <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-current' : ''}`} />
                    </button>

                    {/* Pin / Unpin */}
                    <button
                      onClick={() => (msg.isPinned ? unpinMessage(msg.id) : pinMessage(msg.id))}
                      className={`p-1 transition cursor-pointer ${
                        msg.isPinned ? 'text-[#25d366]' : 'text-[#8696a0] hover:text-[#25d366]'
                      }`}
                      title={msg.isPinned ? 'Unpin' : 'Pin message'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${msg.isPinned ? 'fill-current' : ''}`} />
                    </button>

                    {/* Forward */}
                    <button
                      onClick={() => setForwardingMsg(msg)}
                      className="p-1 text-[#8696a0] hover:text-[#25d366] transition cursor-pointer"
                      title="Forward"
                    >
                      <Forward className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit (only if me) */}
                    {isMe && msg.type === 'text' && (
                      <button
                        onClick={() => {
                          setEditingMsg(msg);
                          setEditInputVal(msg.text);
                        }}
                        className="p-1 text-[#8696a0] hover:text-[#00ffcc] transition cursor-pointer"
                        title="Edit message"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteMessage(msg.id, true)}
                      className="p-1 text-[#8696a0] hover:text-red-400 transition cursor-pointer"
                      title="Delete for everyone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* 3D Quick Emote Trigger Strip */}
        <div className="px-4 py-1.5 bg-[#182229]/80 border-t border-[#222e35] flex items-center justify-between text-xs text-[#8696a0] z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#25d366]" />
            <span className="text-[11px] font-medium text-[#e9edef]">3D Avatar Actions:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerEmote('waving')}
              className="px-2.5 py-0.5 rounded-full bg-[#202c33] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] text-[11px] transition cursor-pointer flex items-center gap-1"
            >
              <span>Wave 👋</span>
            </button>
            <button
              onClick={() => triggerEmote('happy')}
              className="px-2.5 py-0.5 rounded-full bg-[#202c33] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] text-[11px] transition cursor-pointer flex items-center gap-1"
            >
              <span>Smile 😄</span>
            </button>
            <button
              onClick={() => triggerEmote('dance')}
              className="px-2.5 py-0.5 rounded-full bg-[#202c33] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] text-[11px] transition cursor-pointer flex items-center gap-1"
            >
              <span>Dance 💃</span>
            </button>
            <button
              onClick={() => triggerTypingSimulation(4000)}
              className="px-2.5 py-0.5 rounded-full bg-[#202c33] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] text-[11px] transition cursor-pointer flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" />
              <span>Typing 💬</span>
            </button>
          </div>
        </div>

        {/* Quoted Reply Banner above input bar */}
        {replyToMessage && (
          <div className="px-4 py-2 bg-[#182229] border-t border-[#222e35] flex items-center justify-between text-xs z-10 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-1 h-8 rounded-full bg-[#25d366]" />
              <div className="min-w-0">
                <div className="font-bold text-[#25d366]">Replying to {replyToMessage.senderName}</div>
                <div className="text-[#8696a0] truncate">{replyToMessage.text}</div>
              </div>
            </div>
            <button
              onClick={() => setReplyToMessage(null)}
              className="p-1 rounded-full text-[#8696a0] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Floating WhatsApp Attachment Popover Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-20 left-12 p-3 rounded-2xl bg-[#202c33] border border-[#2a3942] shadow-2xl z-40 grid grid-cols-3 gap-3 w-72 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={handleSendSampleDoc}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#182229] transition text-[#53bdeb] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#53bdeb]/20 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#e9edef]">Document</span>
            </button>

            <button
              onClick={() => {
                setShowAttachMenu(false);
                setShowPollModal(true);
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#182229] transition text-[#25d366] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#25d366]/20 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#e9edef]">Poll</span>
            </button>

            <button
              onClick={handleSendSampleLocation}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#182229] transition text-[#f59e0b] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#e9edef]">Location</span>
            </button>

            <button
              onClick={() => {
                setShowAttachMenu(false);
                setShowImageModal(true);
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#182229] transition text-[#00ffcc] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#00ffcc]/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#e9edef]">3D Artwork</span>
            </button>

            <button
              onClick={() => {
                setShowAttachMenu(false);
                onOpenCustomizer();
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#182229] transition text-purple-400 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Rotate3d className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#e9edef]">Avatar Studio</span>
            </button>

            <button
              onClick={() => {
                setShowAttachMenu(false);
                triggerEmote('dance');
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#182229] transition text-pink-400 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] text-[#e9edef]">3D Dance</span>
            </button>
          </div>
        )}

        {/* Floating Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 p-3 rounded-2xl bg-[#202c33] border border-[#2a3942] shadow-2xl z-30 w-72 animate-in fade-in">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#2a3942] text-xs text-[#8696a0]">
              <span>WhatsApp Emojis</span>
              <button onClick={() => setShowEmojiPicker(false)} className="text-[#8696a0] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2 text-xl">
              {['😀', '😂', '😍', '🔥', '🎉', '🚀', '🥑', '👏', '💯', '👍', '💖', '😎', '🥳', '🙌', '✨', '⚡', '🤖', '🌟'].map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    setInputVal((prev) => prev + em);
                    setShowEmojiPicker(false);
                  }}
                  className="hover:scale-125 transition-transform p-1 cursor-pointer text-center"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Message Input Bar */}
        <div className="p-3 bg-[#202c33] border-t border-[#222e35] z-10">
          {isRecordingVoice ? (
            <div className="flex items-center justify-between px-4 py-2 bg-[#111b21] rounded-xl border border-[#25d366]/50">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-sm font-semibold text-[#e9edef]">
                  Recording Voice Note... 0:{recordDuration.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={cancelRecording}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={stopAndSendRecording}
                  className="px-4 py-1.5 rounded-lg bg-[#25d366] hover:bg-[#20ba59] text-[#111b21] font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Note</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-[#8696a0] hover:text-[#e9edef] rounded-full transition cursor-pointer"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Attach Popover */}
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2 text-[#8696a0] hover:text-[#e9edef] rounded-full transition cursor-pointer"
                title="Attach Poll, Document, or Location"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Instant 3D Image Generator Trigger */}
              <button
                onClick={() => setShowImageModal(true)}
                className="p-2 text-[#00ffcc] hover:bg-[#111b21] rounded-full transition cursor-pointer relative"
                title="Create 3D Image at Lightning Speed"
              >
                <Palette className="w-5 h-5" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeContact.isAi || activeContact.id === 'c-ai'
                      ? 'Ask OP Haider AI or type "/image futuristic city"...'
                      : 'Type a message...'
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] text-sm focus:outline-none focus:ring-1 focus:ring-[#25d366] border border-transparent focus:border-[#25d366]"
                />
              </div>

              {/* AI Tone Rewriter Button */}
              {inputVal.trim() && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRewriteMenu(!showRewriteMenu)}
                    className="p-2 text-[#00ffcc] hover:bg-[#111b21] rounded-full transition cursor-pointer"
                    title="Rewrite tone with Gemini AI"
                  >
                    <Wand2 className={`w-5 h-5 ${isRewriting ? 'animate-spin' : ''}`} />
                  </button>

                  {showRewriteMenu && (
                    <div className="absolute bottom-12 right-0 z-40 w-44 rounded-2xl bg-[#111b21] border border-[#00ffcc]/30 shadow-2xl p-1.5 text-xs animate-in fade-in duration-150">
                      <div className="px-2.5 py-1 font-bold text-[#00ffcc] border-b border-[#222e35] mb-1">
                        Gemini Tone Rewriter
                      </div>
                      <button
                        onClick={() => handleAiRewrite('cyberpunk')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#202c33] text-white flex items-center gap-2 cursor-pointer"
                      >
                        <span>⚡</span>
                        <span>Cyberpunk</span>
                      </button>
                      <button
                        onClick={() => handleAiRewrite('polite')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#202c33] text-white flex items-center gap-2 cursor-pointer"
                      >
                        <span>✨</span>
                        <span>Friendly</span>
                      </button>
                      <button
                        onClick={() => handleAiRewrite('enthusiastic')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#202c33] text-white flex items-center gap-2 cursor-pointer"
                      >
                        <span>🎉</span>
                        <span>Enthusiastic</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {inputVal.trim() ? (
                <button
                  onClick={() => handleSend()}
                  className="p-2.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-[#071318] transition shadow-md cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="p-2.5 rounded-full hover:bg-[#111b21] text-[#8696a0] hover:text-[#25d366] transition cursor-pointer"
                  title="Hold or click to record voice note"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer: WhatsApp Contact Info Drawer */}
      {showContactInfo && (
        <ContactInfoDrawer
          contact={activeContact}
          onClose={() => setShowContactInfo(false)}
          onOpenSearch={() => {
            setShowContactInfo(false);
            setShowSearchInChat(true);
          }}
        />
      )}

      {/* WhatsApp Poll Creator Modal */}
      {showPollModal && (
        <PollCreatorModal onClose={() => setShowPollModal(false)} />
      )}

      {/* WhatsApp Message Forward Modal */}
      {forwardingMsg && (
        <ForwardModal message={forwardingMsg} onClose={() => setForwardingMsg(null)} />
      )}

      {/* Message Edit Inline Modal */}
      {editingMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md rounded-2xl bg-[#111b21] border border-[#222e35] p-5 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#222e35] pb-2">
              <h4 className="text-sm font-bold text-[#e9edef] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#25d366]" />
                <span>Edit Message</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingMsg(null)}
                className="text-[#8696a0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              autoFocus
              rows={3}
              value={editInputVal}
              onChange={(e) => setEditInputVal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-white focus:outline-none focus:border-[#25d366] resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMsg(null)}
                className="px-4 py-2 text-xs font-semibold text-[#8696a0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#25d366] text-black text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* High-Speed 3D Image Generator Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#09151c] border-2 border-[#00ffcc]/40 p-6 shadow-[0_0_50px_rgba(0,255,204,0.3)]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#182730] text-[#8696a0] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <OpHaiderLogo variant="avatar" size={44} />
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>OP Haider 3D Image Generator</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#00ffcc]/20 text-[#00ffcc] text-[10px] font-extrabold uppercase">
                    Lightning Speed
                  </span>
                </h3>
                <p className="text-xs text-[#8696a0]">
                  Synthesize high-resolution 3D concepts, shields, cyberpunk worlds & avatars in milliseconds.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#00ffcc] uppercase tracking-wider mb-2">
                Describe Your 3D Creation
              </label>
              <textarea
                value={customImagePrompt}
                onChange={(e) => setCustomImagePrompt(e.target.value)}
                placeholder="e.g. Metallic chrome shield with blue neon lasers and cyber armor..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-[#0e1d25] border border-[#1a2f3b] text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none focus:border-[#00ffcc] transition resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#14232c] hover:bg-[#1a2d39] text-[#8696a0] font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingImage || !customImagePrompt.trim()}
                onClick={async () => {
                  if (!customImagePrompt.trim()) return;
                  setIsGeneratingImage(true);
                  soundFX.playTap();
                  await generateAiImage(customImagePrompt.trim());
                  setIsGeneratingImage(false);
                  setShowImageModal(false);
                  setCustomImagePrompt('');
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00a884] text-[#071318] font-black text-xs shadow-[0_0_20px_rgba(0,255,204,0.4)] hover:shadow-[0_0_30px_rgba(0,255,204,0.6)] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#071318]" />
                    <span>Synthesizing (0.4s)...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-[#071318]" />
                    <span>Generate at Lightning Speed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewModalImage}
              alt="OP Haider 3D Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border-2 border-[#00ffcc]/50 shadow-[0_0_50px_rgba(0,255,204,0.4)]"
            />
            <div className="mt-4 flex items-center gap-3">
              <a
                href={previewModalImage}
                download={`op-haider-${Date.now()}.png`}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffcc] to-[#00a884] text-black font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Download High-Res 3D Artwork</span>
              </a>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Conversation Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-[#111b21] border border-[#00ffcc]/30 p-6 shadow-2xl">
            <button
              onClick={() => setShowSummaryModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#202c33] text-[#8696a0] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 text-[#00ffcc] mb-3">
              <Bot className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Gemini Conversation Summary</h3>
            </div>
            {isSummarizing ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full border-4 border-[#202c33] border-t-[#00ffcc] animate-spin" />
                <span className="text-xs text-[#8696a0] animate-pulse">Summarizing key points...</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] text-sm text-[#e9edef] leading-relaxed whitespace-pre-line">
                {aiSummaryText}
              </div>
            )}
            <button
              onClick={() => setShowSummaryModal(false)}
              className="w-full mt-4 py-3 rounded-xl bg-[#00ffcc] hover:bg-[#00e6b8] text-[#071318] font-bold text-xs shadow transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
