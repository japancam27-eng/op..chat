import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Contact,
  Message,
  Story,
  CallState,
  AvatarConfig,
  AvatarExpression,
  UserAccount,
  CallLog,
  Community,
  PollData,
  WhatsAppTab,
  SnapData,
  EyesOnlyItem,
  ActiveSession,
  ScreenshotAlert,
} from '../types/chat';
import {
  MOCK_CONTACTS,
  INITIAL_MESSAGES,
  MOCK_STORIES,
  INITIAL_MY_AVATAR,
  PRE_REGISTERED_USERS,
  MOCK_CALL_LOGS,
  MOCK_COMMUNITIES,
  MOCK_EYES_ONLY_ITEMS,
  MOCK_ACTIVE_SESSIONS,
} from '../data/mockData';
import { soundFX } from '../utils/audio';

export interface ChatWallpaper {
  theme: 'doodle-dark' | 'doodle-emerald' | 'cyber-carbon' | 'midnight-blue';
  doodleOpacity: number;
}

interface ChatContextType {
  currentUser: UserAccount | null;
  login: (emailOrHandle: string, pin?: string) => { success: boolean; error?: string };
  signup: (params: {
    name: string;
    email: string;
    handle: string;
    pin?: string;
    avatarConfig?: AvatarConfig;
  }) => { success: boolean; error?: string };
  logout: () => void;
  checkHandleAvailability: (handle: string) => { isAvailable: boolean; message: string };
  addContactByHandle: (handle: string) => { success: boolean; message: string; contact?: Contact };
  registeredUsers: UserAccount[];
  contacts: Contact[];
  activeContact: Contact;
  setActiveContact: (contact: Contact) => void;
  messages: Message[];
  allMessages: Message[];
  myAvatarConfig: AvatarConfig;
  updateMyAvatarConfig: (config: Partial<AvatarConfig>) => void;
  stories: Story[];
  markStoryViewed: (storyId: string) => void;
  addStatus: (caption: string, colorGradient?: string) => void;
  callState: CallState;
  callLogs: CallLog[];
  clearCallLogs: () => void;
  startCall: (type: 'voice' | 'video' | 'spatial3d', contact?: Contact) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  activeView: 'chats' | 'spatialLounge' | 'status';
  setActiveView: (view: 'chats' | 'spatialLounge' | 'status') => void;
  whatsAppTab: WhatsAppTab;
  setWhatsAppTab: (tab: WhatsAppTab) => void;
  is3DCompanionOpen: boolean;
  setIs3DCompanionOpen: (open: boolean) => void;
  sendMessage: (text: string, emotion?: AvatarExpression) => void;
  sendVoiceMessage: (duration: number, waveform?: number[]) => void;
  sendReaction: (messageId: string, emoji: string) => void;
  triggerEmote: (expression: AvatarExpression) => void;
  currentEmote: AvatarExpression;
  createNewChat: (name: string, phone: string, handle?: string) => void;
  createGroup: (name: string, memberIds: string[], description?: string) => void;
  triggerTypingSimulation: (durationMs?: number) => void;
  generateAiImage: (prompt: string) => Promise<boolean>;

  // WhatsApp Core Features
  replyToMessage: Message | null;
  setReplyToMessage: (msg: Message | null) => void;
  starMessage: (msgId: string) => void;
  deleteMessage: (msgId: string, forEveryone?: boolean) => void;
  editMessage: (msgId: string, newText: string) => void;
  pinMessage: (msgId: string) => void;
  unpinMessage: (msgId: string) => void;
  forwardMessage: (msg: Message, targetContactId: string) => void;
  createPoll: (question: string, options: string[], allowMultiple?: boolean) => void;
  votePoll: (messageId: string, optionId: string) => void;
  sendDocument: (doc: { name: string; size: string; extension: string }) => void;
  sendLocation: (loc: { name: string; address: string; lat: number; lng: number }) => void;
  setDisappearingTimer: (contactId: string, seconds: number) => void;
  toggleMuteContact: (contactId: string, duration?: string) => void;
  toggleArchiveContact: (contactId: string) => void;
  wallpaper: ChatWallpaper;
  setWallpaper: (wp: ChatWallpaper) => void;
  communities: Community[];
  createCommunity: (name: string, description: string) => void;
  pinnedMessage: Message | null;

  // Snapchat Security & Feature Additions
  snapscore: number;
  ghostMode: boolean;
  setGhostMode: (enabled: boolean) => void;
  privacyShield: boolean;
  setPrivacyShield: (enabled: boolean) => void;
  isScreenObscured: boolean;
  screenshotAlertBanner: { user: string; timestamp: string } | null;
  triggerScreenshotAlert: (detectedUser?: string) => void;
  dismissScreenshotAlert: () => void;
  sendSnap: (snap: { timer: number; mediaUrl: string; caption?: string; filter?: string }) => void;
  openSnap: (messageId: string) => void;
  activeSnapViewing: { messageId: string; snap: SnapData } | null;
  setActiveSnapViewing: (item: { messageId: string; snap: SnapData } | null) => void;
  burnConversation: (chatId: string) => void;
  eyesOnlyPin: string;
  setEyesOnlyPin: (pin: string) => void;
  eyesOnlyItems: EyesOnlyItem[];
  addEyesOnlyItem: (item: { title: string; type: EyesOnlyItem['type']; content: string; size?: string }) => void;
  deleteEyesOnlyItem: (id: string) => void;
  activeSessions: ActiveSession[];
  terminateSession: (sessionId: string) => void;
  terminateAllOtherSessions: () => void;
}


const ChatContext = createContext<ChatContextType | null>(null);

const BOT_REPLIES: Record<string, string[]> = {
  default: [
    'That sounds really awesome! Let me rotate my 3D avatar to show you! ✨',
    'Haha absolutely! OP HAIDER in 3D feels so futuristic! 😎',
    'Totally agree! Have you checked out the 3D Spatial Lounge view yet? 🚀',
    'Nice! Let me send you an audio note in a second! 🎙️',
    'Loving our conversation! Tap on my 3D avatar to make me wave back! 👋',
  ],
  happy: [
    'Yay! That made my day! 😄✨',
    'So exciting! Check out my happy bounce! 🎉',
  ],
  dance: [
    'Party time! Dancing right now to our vibe! 💃🕺',
  ],
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered users database for Snapchat-style handles & email logins
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('op_haider_users_db');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PRE_REGISTERED_USERS.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      handle: u.handle,
      phone: u.phone,
      avatarConfig: u.avatarConfig,
      isLoggedIn: false,
      securityPin: u.pin,
      createdAt: 'Pre-registered',
    }));
  });

  useEffect(() => {
    localStorage.setItem('op_haider_users_db', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('op_haider_contacts');
    return saved ? JSON.parse(saved) : MOCK_CONTACTS;
  });

  const [activeContactId, setActiveContactId] = useState<string>(() => {
    return contacts[0]?.id || 'c-ai';
  });

  const [allMessages, setAllMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('op_haider_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [myAvatarConfig, setMyAvatarConfig] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('op_haider_my_avatar');
    return saved ? JSON.parse(saved) : INITIAL_MY_AVATAR;
  });

  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [activeView, setActiveView] = useState<'chats' | 'spatialLounge' | 'status'>('chats');
  const [whatsAppTab, setWhatsAppTab] = useState<WhatsAppTab>('chats');
  const [is3DCompanionOpen, setIs3DCompanionOpen] = useState<boolean>(true);
  const [currentEmote, setCurrentEmote] = useState<AvatarExpression>('idle');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  // WhatsApp Call History State
  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    try {
      const saved = localStorage.getItem('op_haider_call_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_CALL_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('op_haider_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);

  // WhatsApp Communities State
  const [communities, setCommunities] = useState<Community[]>(() => {
    try {
      const saved = localStorage.getItem('op_haider_communities');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_COMMUNITIES;
  });

  useEffect(() => {
    localStorage.setItem('op_haider_communities', JSON.stringify(communities));
  }, [communities]);

  // WhatsApp Chat Wallpaper State
  const [wallpaper, setWallpaper] = useState<ChatWallpaper>(() => {
    try {
      const saved = localStorage.getItem('op_haider_wallpaper');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { theme: 'doodle-dark', doodleOpacity: 0.15 };
  });

  useEffect(() => {
    localStorage.setItem('op_haider_wallpaper', JSON.stringify(wallpaper));
  }, [wallpaper]);

  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    type: 'video',
    contact: null,
    isMuted: false,
    isVideoOff: false,
    duration: 0,
    status: 'connecting',
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const isUnlocked = sessionStorage.getItem('op_haider_session_unlocked');
      if (isUnlocked === 'true') {
        const saved = localStorage.getItem('op_haider_user_session');
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Save changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('op_haider_user_session', JSON.stringify(currentUser));
      sessionStorage.setItem('op_haider_session_unlocked', 'true');
    } else {
      localStorage.removeItem('op_haider_user_session');
      sessionStorage.removeItem('op_haider_session_unlocked');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('op_haider_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('op_haider_messages', JSON.stringify(allMessages));
  }, [allMessages]);

  useEffect(() => {
    localStorage.setItem('op_haider_my_avatar', JSON.stringify(myAvatarConfig));
  }, [myAvatarConfig]);

  // Real-time multi-tab synchronization via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('whatsapp_3d_sync');
      channel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === 'NEW_MESSAGE') {
          setAllMessages((prev) => [...prev, data]);
          soundFX.playReceived();
        } else if (type === 'NEW_REACTION') {
          setAllMessages((prev) =>
            prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
          );
        }
      };
    } catch {
      // BroadcastChannel unsupported
    }
    return () => {
      channel?.close();
    };
  }, []);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];
  const messages = allMessages.filter((m) => m.chatId === activeContactId);

  const setActiveContact = useCallback((contact: Contact) => {
    setActiveContactId(contact.id);
    // Mark messages as read and clear unread count
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
    );
    setAllMessages((prev) =>
      prev.map((m) => (m.chatId === contact.id ? { ...m, status: 'read' } : m))
    );
  }, []);

  const triggerEmote = useCallback((expression: AvatarExpression) => {
    setCurrentEmote(expression);
    soundFX.playTap();
    setTimeout(() => {
      setCurrentEmote('idle');
    }, 4000);
  }, []);

  const updateMyAvatarConfig = useCallback((config: Partial<AvatarConfig>) => {
    setMyAvatarConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const markStoryViewed = useCallback((storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, viewed: true } : s))
    );
  }, []);

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    soundFX.playTap();
    setAllMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const currentReactions = { ...(m.reactions || {}) };
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          return { ...m, reactions: currentReactions };
        }
        return m;
      })
    );

    // Make avatar happy/react
    triggerEmote('happy');
  }, [triggerEmote]);

  const simulateContactReply = useCallback((chatId: string, userText: string) => {
    // Show typing status
    setContacts((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isTyping: true } : c))
    );

    const delay = 1800 + Math.random() * 1400;

    const contact = contacts.find((c) => c.id === chatId);

    // If chat is with OP Haider AI, query Gemini API endpoint
    if (chatId === 'c-ai' || contact?.isAi) {
      (async () => {
        let aiText = '';
        let generatedImg: { url: string; prompt: string } | null = null;
        try {
          const res = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userText,
              chatHistory: allMessages
                .filter((m) => m.chatId === chatId)
                .slice(-6)
                .map((m) => ({ sender: m.senderName, text: m.text })),
            }),
          });
          const data = await res.json();
          aiText = data.reply;
          if (data.generatedImage?.url) {
            generatedImg = {
              url: data.generatedImage.url,
              prompt: data.generatedImage.prompt || userText,
            };
          }
        } catch {
          aiText = "I'm right here with you in OP HAIDER 3D! ✨ Ready to chat, draft messages, or generate 3D images.";
        }

        setContacts((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, isTyping: false } : c))
        );

        const newMsg: Message = {
          id: 'msg-' + Date.now(),
          chatId,
          senderId: 'c-ai',
          senderName: 'OP Haider AI',
          text: aiText || "I'm with you in the 3D space! 🚀 How can I help next?",
          type: generatedImg ? 'image' : 'text',
          imageUrl: generatedImg ? generatedImg.url : undefined,
          imagePrompt: generatedImg ? generatedImg.prompt : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          emotionTrigger: generatedImg ? 'happy' : 'talking',
        };

        setAllMessages((prev) => [...prev, newMsg]);
        soundFX.playReceived();
        triggerEmote(generatedImg ? 'happy' : 'talking');

        try {
          const bc = new BroadcastChannel('op_haider_3d_sync');
          bc.postMessage({ type: 'NEW_MESSAGE', data: newMsg });
          bc.close();
        } catch {
          // ignore
        }
      })();
      return;
    }

    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isTyping: false } : c))
      );

      let replyPool = BOT_REPLIES.default;
      let replyEmotion: AvatarExpression = 'talking';

      if (/dance|party|music|song/i.test(userText)) {
        replyPool = BOT_REPLIES.dance;
        replyEmotion = 'dance';
      } else if (/cool|awesome|great|love|happy|wow/i.test(userText)) {
        replyPool = BOT_REPLIES.happy;
        replyEmotion = 'happy';
      } else if (/hello|hi|hey/i.test(userText)) {
        replyPool = ['Hey there! 👋 Awesome to see you in OP HAIDER 3D!'];
        replyEmotion = 'waving';
      }

      let responderId = chatId;
      let responderName = contact ? contact.name : 'Contact';

      if (contact?.isGroup && contact.groupMembers) {
        const otherMembers = contact.groupMembers.filter((m) => m !== 'me');
        if (otherMembers.length > 0) {
          responderId = otherMembers[Math.floor(Math.random() * otherMembers.length)];
          const memberContact = contacts.find((c) => c.id === responderId);
          if (memberContact) {
            responderName = memberContact.name;
          }
        }
      }

      const replyText = replyPool[Math.floor(Math.random() * replyPool.length)];

      const newMsg: Message = {
        id: 'msg-' + Date.now(),
        chatId,
        senderId: responderId,
        senderName: responderName,
        text: replyText,
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        emotionTrigger: replyEmotion,
      };

      setAllMessages((prev) => [...prev, newMsg]);
      soundFX.playReceived();
      triggerEmote(replyEmotion);

      // Broadcast to other tabs
      try {
        const bc = new BroadcastChannel('whatsapp_3d_sync');
        bc.postMessage({ type: 'NEW_MESSAGE', data: newMsg });
        bc.close();
      } catch {
        // ignore
      }
    }, delay);
  }, [contacts, triggerEmote]);

  const sendMessage = useCallback((text: string, emotion?: AvatarExpression) => {
    if (!text.trim()) return;

    soundFX.playSent();

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      chatId: activeContactId,
      senderId: 'me',
      senderName: 'You',
      text: text.trim(),
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      emotionTrigger: emotion || 'idle',
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            senderName: replyToMessage.senderName,
            text: replyToMessage.text,
          }
        : undefined,
    };

    if (replyToMessage) {
      setReplyToMessage(null);
    }

    setAllMessages((prev) => [...prev, newMsg]);

    // Update message status to delivered then read
    setTimeout(() => {
      setAllMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 700);

    setTimeout(() => {
      setAllMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1400);

    // Simulate smart friend reply
    simulateContactReply(activeContactId, text);
  }, [activeContactId, replyToMessage, simulateContactReply]);

  const sendVoiceMessage = useCallback((duration: number, waveform?: number[]) => {
    soundFX.playSent();

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      chatId: activeContactId,
      senderId: 'me',
      senderName: 'You',
      text: `Voice note (0:${duration.toString().padStart(2, '0')})`,
      type: 'voice',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      voiceDuration: duration,
      voiceWaveform: waveform || [30, 50, 75, 90, 80, 60, 45, 85, 95, 70, 50, 30],
    };

    setAllMessages((prev) => [...prev, newMsg]);
    triggerEmote('talking');

    setTimeout(() => {
      setAllMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1200);

    simulateContactReply(activeContactId, 'Nice voice message!');
  }, [activeContactId, simulateContactReply, triggerEmote]);

  const startCall = useCallback((type: 'voice' | 'video' | 'spatial3d', contact?: Contact) => {
    const targetContact = contact || activeContact;
    soundFX.startRingtone();

    // Log to call history
    const newCallLog: CallLog = {
      id: 'call-' + Date.now(),
      contactId: targetContact.id,
      contactName: targetContact.name,
      contactHandle: targetContact.handle || '@contact',
      type: type === 'voice' ? 'voice' : 'video',
      direction: 'outgoing',
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: 'Ongoing',
    };
    setCallLogs((prev) => [newCallLog, ...prev]);

    setCallState({
      isActive: true,
      type,
      contact: targetContact,
      isMuted: false,
      isVideoOff: false,
      duration: 0,
      status: 'connecting',
    });

    // Simulate answer after 2.5 seconds
    setTimeout(() => {
      soundFX.stopRingtone();
      soundFX.playCallConnected();
      setCallState((prev) => ({
        ...prev,
        status: 'connected',
      }));
    }, 2500);
  }, [activeContact]);

  const endCall = useCallback(() => {
    soundFX.stopRingtone();
    soundFX.playTap();
    setCallState((prev) => ({ ...prev, isActive: false, status: 'ended' }));
  }, []);

  const toggleMute = useCallback(() => {
    setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const toggleVideo = useCallback(() => {
    setCallState((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }));
  }, []);

  // WhatsApp Message Actions
  const pinnedMessage = messages.find((m) => m.isPinned) || null;

  const starMessage = useCallback((messageId: string) => {
    soundFX.playTap();
    setAllMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isStarred: !m.isStarred } : m))
    );
  }, []);

  const deleteMessage = useCallback((messageId: string, forEveryone: boolean = true) => {
    soundFX.playTap();
    if (forEveryone) {
      setAllMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, text: '🚫 This message was deleted', imageUrl: undefined, poll: undefined, document: undefined }
            : m
        )
      );
    } else {
      setAllMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  }, []);

  const editMessage = useCallback((messageId: string, newText: string) => {
    if (!newText.trim()) return;
    soundFX.playTap();
    setAllMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, text: newText.trim(), isEdited: true } : m
      )
    );
  }, []);

  const pinMessage = useCallback((messageId: string) => {
    soundFX.playTap();
    setAllMessages((prev) =>
      prev.map((m) => {
        if (m.chatId === activeContactId) {
          return { ...m, isPinned: m.id === messageId ? !m.isPinned : false };
        }
        return m;
      })
    );
  }, [activeContactId]);

  const unpinMessage = useCallback((messageId: string) => {
    soundFX.playTap();
    setAllMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isPinned: false } : m))
    );
  }, []);

  const forwardMessage = useCallback((message: Message, targetContactId: string) => {
    soundFX.playSent();
    const forwardedMsg: Message = {
      ...message,
      id: 'msg-' + Date.now(),
      chatId: targetContactId,
      senderId: 'me',
      senderName: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      forwarded: true,
      reactions: undefined,
      isPinned: false,
      isStarred: false,
    };
    setAllMessages((prev) => [...prev, forwardedMsg]);
    setActiveContactId(targetContactId);
  }, []);

  const createPoll = useCallback((question: string, options: string[], allowMultiple: boolean = false) => {
    if (!question.trim() || options.length < 2) return;
    soundFX.playSent();
    const pollData: PollData = {
      question: question.trim(),
      allowMultiple,
      options: options.map((opt, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: opt.trim(),
        votes: [],
      })),
    };
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      chatId: activeContactId,
      senderId: 'me',
      senderName: 'You',
      text: `📊 Poll: ${question.trim()}`,
      type: 'poll',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      poll: pollData,
    };
    setAllMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      setAllMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1200);

    // Simulate contact participating in poll after a couple seconds
    setTimeout(() => {
      setAllMessages((prev) =>
        prev.map((m) => {
          if (m.id === newMsg.id && m.poll) {
            const randomOptIdx = Math.floor(Math.random() * m.poll.options.length);
            const voter = activeContact.handle || activeContact.name;
            const updatedOpts = m.poll.options.map((opt, idx) => {
              if (idx === randomOptIdx && !opt.votes.includes(voter)) {
                return { ...opt, votes: [...opt.votes, voter] };
              }
              return opt;
            });
            return { ...m, poll: { ...m.poll, options: updatedOpts } };
          }
          return m;
        })
      );
      soundFX.playReceived();
    }, 2800);
  }, [activeContact.handle, activeContact.name, activeContactId]);

  const votePoll = useCallback((messageId: string, optionId: string) => {
    const voterId = currentUser?.handle || '@me';
    soundFX.playTap();
    setAllMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId && m.poll) {
          const isMulti = m.poll.allowMultiple;
          const updatedOptions = m.poll.options.map((opt) => {
            const hasVoted = opt.votes.includes(voterId);
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: hasVoted ? opt.votes.filter((v) => v !== voterId) : [...opt.votes, voterId],
              };
            } else if (!isMulti) {
              return {
                ...opt,
                votes: opt.votes.filter((v) => v !== voterId),
              };
            }
            return opt;
          });
          return { ...m, poll: { ...m.poll, options: updatedOptions } };
        }
        return m;
      })
    );
  }, [currentUser?.handle]);

  const sendDocument = useCallback((doc: { name: string; size: string; extension: string }) => {
    soundFX.playSent();
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      chatId: activeContactId,
      senderId: 'me',
      senderName: 'You',
      text: `📄 ${doc.name} (${doc.size})`,
      type: 'document',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      document: doc,
    };
    setAllMessages((prev) => [...prev, newMsg]);
    setTimeout(() => {
      setAllMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1000);
  }, [activeContactId]);

  const sendLocation = useCallback((loc: { name: string; address: string; lat: number; lng: number }) => {
    soundFX.playSent();
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      chatId: activeContactId,
      senderId: 'me',
      senderName: 'You',
      text: `📍 Location: ${loc.name}`,
      type: 'location',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      location: loc,
    };
    setAllMessages((prev) => [...prev, newMsg]);
    setTimeout(() => {
      setAllMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1000);
  }, [activeContactId]);

  const addStatus = useCallback((caption: string, colorGradient?: string) => {
    soundFX.playSent();
    const newStory: Story = {
      id: 'status-' + Date.now(),
      contactId: 'me',
      contactName: currentUser?.name || 'My Status',
      timestamp: 'Just now',
      caption,
      colorGradient: colorGradient || 'from-emerald-600 via-teal-700 to-cyan-900',
      mediaType: 'text',
      viewed: false,
    };
    setStories((prev) => [newStory, ...prev]);
  }, [currentUser?.name]);

  const clearCallLogs = useCallback(() => {
    soundFX.playTap();
    setCallLogs([]);
  }, []);

  const setDisappearingTimer = useCallback((contactId: string, seconds: number) => {
    soundFX.playTap();
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, disappearingTimer: seconds } : c))
    );
    const label = seconds === 86400 ? '24 hours' : seconds === 604800 ? '7 days' : seconds === 7776000 ? '90 days' : 'off';
    const noticeMsg: Message = {
      id: 'msg-' + Date.now(),
      chatId: contactId,
      senderId: 'system',
      senderName: 'Disappearing Messages',
      text: seconds > 0 ? `⏳ You turned on disappearing messages. New messages will disappear from this chat after ${label}.` : `⏳ You turned off disappearing messages.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };
    setAllMessages((prev) => [...prev, noticeMsg]);
  }, []);

  const toggleMuteContact = useCallback((contactId: string, duration: string = '8 hours') => {
    soundFX.playTap();
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          const isNowMuted = !c.isMuted;
          return {
            ...c,
            isMuted: isNowMuted,
            muteUntil: isNowMuted ? duration : undefined,
          };
        }
        return c;
      })
    );
  }, []);

  const toggleArchiveContact = useCallback((contactId: string) => {
    soundFX.playTap();
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isArchived: !c.isArchived } : c))
    );
  }, []);

  const createCommunity = useCallback((name: string, description: string) => {
    soundFX.playCallConnected();
    const newCommId = 'comm-' + Date.now();
    const newComm: Community = {
      id: newCommId,
      name,
      description,
      announcementId: 'g-' + Date.now(),
      groups: ['g-1'],
      membersCount: 1,
      createdDate: 'Today',
    };
    setCommunities((prev) => [newComm, ...prev]);
  }, []);

  // Check if a handle is globally unique (Snapchat style)
  const checkHandleAvailability = useCallback(
    (rawHandle: string): { isAvailable: boolean; message: string } => {
      let handle = rawHandle.trim().toLowerCase();
      if (!handle) return { isAvailable: false, message: 'Please enter a unique ID' };
      if (!handle.startsWith('@')) handle = '@' + handle;

      if (handle.length < 3) {
        return { isAvailable: false, message: 'ID must be at least 3 characters' };
      }
      if (!/^@[a-z0-9_.-]+$/.test(handle)) {
        return { isAvailable: false, message: 'Only letters, numbers, and underscores allowed' };
      }

      // Check registered users
      const existsInUsers = registeredUsers.some(
        (u) => u.handle.toLowerCase() === handle
      );
      // Check contacts
      const existsInContacts = contacts.some(
        (c) => c.handle && c.handle.toLowerCase() === handle
      );

      if (existsInUsers || existsInContacts) {
        return { isAvailable: false, message: `${handle} is already taken. Try another!` };
      }
      return { isAvailable: true, message: `${handle} is available!` };
    },
    [registeredUsers, contacts]
  );

  // Add contact by unique Snapchat-style handle
  const addContactByHandle = useCallback(
    (rawHandle: string): { success: boolean; message: string; contact?: Contact } => {
      let handle = rawHandle.trim().toLowerCase();
      if (!handle.startsWith('@')) handle = '@' + handle;

      // 1. Check if already in contacts list
      const existing = contacts.find((c) => c.handle && c.handle.toLowerCase() === handle);
      if (existing) {
        setActiveContactId(existing.id);
        soundFX.playTap();
        return { success: true, message: `Opened existing chat with ${existing.name}`, contact: existing };
      }

      // 2. Check registered users
      const regUser = registeredUsers.find((u) => u.handle.toLowerCase() === handle);
      if (regUser) {
        const newContact: Contact = {
          id: 'c-' + Date.now(),
          name: regUser.name,
          handle: regUser.handle,
          email: regUser.email,
          phone: regUser.phone || '+1 (555) 789-0000',
          avatarColor: '#00ffcc',
          status: 'Connected via Snapchat-style unique ID!',
          isOnline: true,
          lastSeen: 'online',
          unreadCount: 0,
          isFavorite: true,
          avatarConfig: regUser.avatarConfig || {
            skinColor: '#f7d5b8',
            hairStyle: 'cyberpunk',
            hairColor: '#00ffcc',
            outfitColor: '#00a884',
            outfitStyle: 'casual',
            accessory: 'headphones',
            expression: 'happy',
          },
        };

        setContacts((prev) => [newContact, ...prev]);
        setActiveContactId(newContact.id);
        soundFX.playCallConnected();
        return { success: true, message: `Found and connected with ${regUser.name} (${regUser.handle})!`, contact: newContact };
      }

      // 3. If handle is fresh custom user, create active contact immediately
      const displayName = handle.replace('@', '').replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const customContact: Contact = {
        id: 'c-' + Date.now(),
        name: displayName || 'New Friend',
        handle,
        email: `${handle.replace('@', '')}@ophaider.com`,
        phone: '+1 (555) 000-0000',
        avatarColor: '#10b981',
        status: `Added via unique ID ${handle}`,
        isOnline: true,
        lastSeen: 'online',
        unreadCount: 0,
        avatarConfig: {
          skinColor: '#ebd0be',
          hairStyle: 'classic',
          hairColor: '#3b2f2f',
          outfitColor: '#10b981',
          outfitStyle: 'casual',
          accessory: 'headphones',
          expression: 'waving',
        },
      };

      setContacts((prev) => [customContact, ...prev]);
      setActiveContactId(customContact.id);
      soundFX.playCallConnected();
      return { success: true, message: `Connected with ${customContact.name} (${handle})!`, contact: customContact };
    },
    [contacts, registeredUsers]
  );

  const createNewChat = useCallback((name: string, phone: string, handle?: string) => {
    let cleanHandle = handle?.trim().toLowerCase();
    if (!cleanHandle) {
      cleanHandle = '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 89 + 10);
    } else if (!cleanHandle.startsWith('@')) {
      cleanHandle = '@' + cleanHandle;
    }

    const newContact: Contact = {
      id: 'c-' + Date.now(),
      name,
      handle: cleanHandle,
      phone: phone || '+1 (555) 000-0000',
      avatarColor: '#10b981',
      status: `Connected with ${cleanHandle}`,
      isOnline: true,
      lastSeen: 'online',
      unreadCount: 0,
      avatarConfig: {
        skinColor: '#f7d5b8',
        hairStyle: 'classic',
        hairColor: '#3b2f2f',
        outfitColor: '#10b981',
        outfitStyle: 'casual',
        accessory: 'headphones',
        expression: 'waving',
      },
    };
    setContacts((prev) => [newContact, ...prev]);
    setActiveContactId(newContact.id);
  }, []);

  const login = useCallback(
    (emailOrHandle: string, pin?: string): { success: boolean; error?: string } => {
      const input = emailOrHandle.trim().toLowerCase();
      if (!input) return { success: false, error: 'Please enter your email or unique ID' };

      // Look up user in registeredUsers by email or handle
      const matched = registeredUsers.find(
        (u) =>
          u.email.toLowerCase() === input ||
          u.handle.toLowerCase() === input ||
          u.handle.toLowerCase() === (input.startsWith('@') ? input : '@' + input)
      );

      soundFX.playCallConnected();

      if (matched) {
        const account: UserAccount = {
          ...matched,
          isLoggedIn: true,
        };
        setCurrentUser(account);
        setMyAvatarConfig(account.avatarConfig || myAvatarConfig);
        return { success: true };
      }

      // If user logs in with an email that is not in the db, create and register it
      const isEmail = input.includes('@') && input.includes('.');
      const derivedHandle = isEmail
        ? '@' + input.split('@')[0].replace(/[^a-z0-9]/g, '_')
        : (input.startsWith('@') ? input : '@' + input);

      const newAccount: UserAccount = {
        id: 'usr-' + Date.now(),
        name: derivedHandle.replace('@', '').replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: isEmail ? input : `${derivedHandle.replace('@', '')}@ophaider.com`,
        handle: derivedHandle,
        phone: '+1 (555) 789-3210',
        avatarConfig: myAvatarConfig,
        isLoggedIn: true,
        securityPin: pin || '1234',
        createdAt: 'Just now',
      };

      setRegisteredUsers((prev) => [...prev, newAccount]);
      setCurrentUser(newAccount);
      return { success: true };
    },
    [registeredUsers, myAvatarConfig]
  );

  const signup = useCallback(
    ({
      name,
      email,
      handle,
      pin,
      avatarConfig,
    }: {
      name: string;
      email: string;
      handle: string;
      pin?: string;
      avatarConfig?: AvatarConfig;
    }): { success: boolean; error?: string } => {
      if (!name.trim()) return { success: false, error: 'Please enter your name' };
      if (!email.trim() || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      let cleanHandle = handle.trim().toLowerCase();
      if (!cleanHandle) return { success: false, error: 'Please create a unique ID' };
      if (!cleanHandle.startsWith('@')) cleanHandle = '@' + cleanHandle;

      // Uniqueness check
      const isTaken = registeredUsers.some((u) => u.handle.toLowerCase() === cleanHandle);
      if (isTaken) {
        return { success: false, error: `The unique ID ${cleanHandle} is already taken. Please choose another.` };
      }

      const configToUse = avatarConfig || myAvatarConfig;
      const newAccount: UserAccount = {
        id: 'usr-' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        handle: cleanHandle,
        phone: '+1 (555) ' + Math.floor(Math.random() * 899 + 100) + '-' + Math.floor(Math.random() * 8999 + 1000),
        avatarConfig: configToUse,
        isLoggedIn: true,
        securityPin: pin || '1234',
        createdAt: new Date().toLocaleDateString(),
      };

      soundFX.playCallConnected();
      setRegisteredUsers((prev) => [...prev, newAccount]);
      setMyAvatarConfig(configToUse);
      setCurrentUser(newAccount);
      return { success: true };
    },
    [registeredUsers, myAvatarConfig]
  );

  const logout = useCallback(() => {
    soundFX.playTap();
    setCurrentUser(null);
  }, []);

  const createGroup = useCallback((name: string, memberIds: string[], description?: string) => {
    soundFX.playCallConnected();
    const groupId = 'g-' + Date.now();
    const membersWithMe = Array.from(new Set([...memberIds, 'me']));
    const memberNames = membersWithMe.map((id) => {
      if (id === 'me') return 'You';
      const c = contacts.find((item) => item.id === id);
      return c ? c.name.split(' ')[0] : id;
    }).join(', ');

    const newGroup: Contact = {
      id: groupId,
      name,
      handle: '@group_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15),
      phone: `Group • ${membersWithMe.length} members`,
      avatarColor: '#059669',
      status: memberNames,
      isOnline: true,
      lastSeen: 'online',
      unreadCount: 0,
      isFavorite: true,
      isGroup: true,
      groupMembers: membersWithMe,
      groupAdmin: 'me',
      groupDescription: description || 'Created with OP HAIDER 3D. End-to-end encrypted group.',
      avatarConfig: {
        skinColor: '#ebd0be',
        hairStyle: 'cyberpunk',
        hairColor: '#00a884',
        outfitColor: '#10b981',
        outfitStyle: 'cyber',
        accessory: 'headphones',
        expression: 'happy',
      },
    };

    setContacts((prev) => [newGroup, ...prev]);
    setActiveContactId(groupId);

    // Initial encryption notice system message
    const welcomeMsg: Message = {
      id: 'msg-' + Date.now(),
      chatId: groupId,
      senderId: 'system',
      senderName: 'OP HAIDER 3D Security',
      text: `🔒 Messages and calls in "${name}" are end-to-end encrypted. No one outside of this group, not even OP HAIDER 3D, can read or listen to them.`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };
    setAllMessages((prev) => [...prev, welcomeMsg]);
  }, [contacts]);

  const triggerTypingSimulation = useCallback((durationMs: number = 3500) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === activeContactId ? { ...c, isTyping: true } : c))
    );
    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) => (c.id === activeContactId ? { ...c, isTyping: false } : c))
      );
    }, durationMs);
  }, [activeContactId]);

  const generateAiImage = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return false;

      const targetChatId = 'c-ai';
      const aiContact = contacts.find((c) => c.id === 'c-ai' || c.isAi);
      if (aiContact && activeContact.id !== targetChatId) {
        setActiveContact(aiContact);
      }

      const userMsg: Message = {
        id: 'msg-' + Date.now(),
        chatId: targetChatId,
        senderId: 'me',
        senderName: currentUser?.name || 'Me',
        text: `🎨 /image ${prompt.trim()}`,
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      setAllMessages((prev) => [...prev, userMsg]);
      soundFX.playSent();

      setContacts((prev) =>
        prev.map((c) => (c.id === targetChatId ? { ...c, isTyping: true } : c))
      );

      try {
        const res = await fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });
        const data = await res.json();

        setContacts((prev) =>
          prev.map((c) => (c.id === targetChatId ? { ...c, isTyping: false } : c))
        );

        if (data.imageUrl) {
          const aiMsg: Message = {
            id: 'msg-' + Date.now(),
            chatId: targetChatId,
            senderId: 'c-ai',
            senderName: 'OP Haider AI',
            text: `✨ Generated at lightning speed in ${data.durationMs ? (data.durationMs / 1000).toFixed(1) + 's' : '0.4s'}!`,
            type: 'image',
            imageUrl: data.imageUrl,
            imagePrompt: prompt.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
            emotionTrigger: 'happy',
          };
          setAllMessages((prev) => [...prev, aiMsg]);
          soundFX.playReceived();
          triggerEmote('happy');
          return true;
        }
      } catch (err) {
        console.error('Error in generateAiImage:', err);
        setContacts((prev) =>
          prev.map((c) => (c.id === targetChatId ? { ...c, isTyping: false } : c))
        );
      }
      return false;
    },
  // --- Snapchat Security & Ephemeral Features ---
  const [snapscore, setSnapscore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('op_haider_snapscore');
      if (saved) return parseInt(saved, 10);
    } catch {
      // ignore
    }
    return 25840;
  });

  useEffect(() => {
    localStorage.setItem('op_haider_snapscore', snapscore.toString());
  }, [snapscore]);

  const [ghostMode, setGhostModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('op_haider_ghost_mode');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return false;
  });

  const setGhostMode = useCallback((enabled: boolean) => {
    setGhostModeState(enabled);
    localStorage.setItem('op_haider_ghost_mode', JSON.stringify(enabled));
  }, []);

  const [privacyShield, setPrivacyShieldState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('op_haider_privacy_shield');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return true;
  });

  const setPrivacyShield = useCallback((enabled: boolean) => {
    setPrivacyShieldState(enabled);
    localStorage.setItem('op_haider_privacy_shield', JSON.stringify(enabled));
  }, []);

  const [isScreenObscured, setIsScreenObscured] = useState<boolean>(false);
  const [screenshotAlertBanner, setScreenshotAlertBanner] = useState<{ user: string; timestamp: string } | null>(null);
  const [activeSnapViewing, setActiveSnapViewing] = useState<{ messageId: string; snap: SnapData } | null>(null);

  // Screen obscuration listener on blur
  useEffect(() => {
    if (!privacyShield) {
      setIsScreenObscured(false);
      return;
    }
    const handleVisibilityChange = () => {
      setIsScreenObscured(document.hidden);
    };
    const handleBlur = () => {
      setIsScreenObscured(true);
    };
    const handleFocus = () => {
      setIsScreenObscured(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [privacyShield]);

  const triggerScreenshotAlert = useCallback((detectedUser?: string) => {
    const user = detectedUser || (activeContact?.name || 'Someone');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    soundFX.playCallRing();
    setScreenshotAlertBanner({ user, timestamp: timeStr });

    const alertMessage: Message = {
      id: `m-alert-${Date.now()}`,
      chatId: activeContact.id,
      senderId: 'system',
      senderName: 'Security Audit',
      text: `🚨 Screenshot Detected: ${user} took a screenshot of chat!`,
      type: 'screenshot_alert',
      timestamp: timeStr,
      status: 'read',
      screenshotAlert: {
        detector: 'Anti-Capture Shield',
        targetUser: user,
        timestamp: timeStr,
      },
    };

    setAllMessages((prev) => [...prev, alertMessage]);
  }, [activeContact?.name, activeContact?.id]);

  const dismissScreenshotAlert = useCallback(() => {
    setScreenshotAlertBanner(null);
  }, []);

  // Global key listener for screenshot shortcuts
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's'))
      ) {
        triggerScreenshotAlert(currentUser?.name || 'You');
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerScreenshotAlert, currentUser?.name]);

  const sendSnap = useCallback(
    (snapInput: { timer: number; mediaUrl: string; caption?: string; filter?: string }) => {
      const snapId = `snap-${Date.now()}`;
      const newMsg: Message = {
        id: `m-${Date.now()}`,
        chatId: activeContact.id,
        senderId: 'me',
        senderName: currentUser?.name || 'You',
        text: 'Sent an Ephemeral Snap (View Once)',
        type: 'snap',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        snap: {
          id: snapId,
          timer: snapInput.timer,
          mediaUrl: snapInput.mediaUrl,
          caption: snapInput.caption,
          filter: snapInput.filter || 'none',
          isOpened: false,
          isBurnt: false,
        },
      };

      setAllMessages((prev) => [...prev, newMsg]);
      soundFX.playSent();
      setSnapscore((prev) => prev + 1);

      // Boost streak
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === activeContact.id) {
            const currentCount = c.streak?.count || 0;
            return {
              ...c,
              streak: { count: currentCount + 1, hoursLeft: 24, active: true },
            };
          }
          return c;
        })
      );

      // If chatting with AI or Sophia, simulate reply snap
      if (activeContact.isAi || activeContact.id === 'c-1') {
        setTimeout(() => {
          const replySnapId = `snap-reply-${Date.now()}`;
          const replyMsg: Message = {
            id: `m-bot-${Date.now()}`,
            chatId: activeContact.id,
            senderId: activeContact.id,
            senderName: activeContact.name,
            text: 'Sent an Ephemeral Snap (Tap to View)',
            type: 'snap',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
            snap: {
              id: replySnapId,
              timer: 8,
              mediaUrl: activeContact.isAi ? '/op-haider-logo.png' : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
              caption: activeContact.isAi ? '⚡ 3D Hologram Render by OP Haider AI!' : '🔥 Streak preserved! Loving this chat!',
              filter: 'cyberpunk',
              isOpened: false,
              isBurnt: false,
            },
          };
          setAllMessages((prev) => [...prev, replyMsg]);
          soundFX.playReceived();
        }, 2200);
      }
    },
    [activeContact, currentUser?.name]
  );

  const openSnap = useCallback(
    (messageId: string) => {
      const msg = allMessages.find((m) => m.id === messageId);
      if (!msg || !msg.snap || msg.snap.isBurnt) return;

      setActiveSnapViewing({ messageId, snap: msg.snap });
      soundFX.playTap();
    },
    [allMessages]
  );

  const burnConversation = useCallback(
    (chatId: string) => {
      setAllMessages((prev) => prev.filter((m) => m.chatId !== chatId));
      soundFX.playTap();
    },
    []
  );

  // Eyes Only Locker State
  const [eyesOnlyPin, setEyesOnlyPinState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('op_haider_eyes_only_pin');
      if (saved) return saved;
    } catch {
      // ignore
    }
    return '1234';
  });

  const setEyesOnlyPin = useCallback((pin: string) => {
    setEyesOnlyPinState(pin);
    localStorage.setItem('op_haider_eyes_only_pin', pin);
  }, []);

  const [eyesOnlyItems, setEyesOnlyItems] = useState<EyesOnlyItem[]>(() => {
    try {
      const saved = localStorage.getItem('op_haider_eyes_only_items');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_EYES_ONLY_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('op_haider_eyes_only_items', JSON.stringify(eyesOnlyItems));
  }, [eyesOnlyItems]);

  const addEyesOnlyItem = useCallback(
    (item: { title: string; type: EyesOnlyItem['type']; content: string; size?: string }) => {
      const newItem: EyesOnlyItem = {
        id: `eo-${Date.now()}`,
        title: item.title,
        type: item.type,
        content: item.content,
        timestamp: 'Just now',
        size: item.size || '120 KB',
        encryptedHash: `AES256-GCM::${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      };
      setEyesOnlyItems((prev) => [newItem, ...prev]);
      soundFX.playSent();
    },
    []
  );

  const deleteEyesOnlyItem = useCallback((id: string) => {
    setEyesOnlyItems((prev) => prev.filter((it) => it.id !== id));
    soundFX.playTap();
  }, []);

  // Active Sessions State
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => {
    try {
      const saved = localStorage.getItem('op_haider_active_sessions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_ACTIVE_SESSIONS;
  });

  useEffect(() => {
    localStorage.setItem('op_haider_active_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  const terminateSession = useCallback((sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    soundFX.playTap();
  }, []);

  const terminateAllOtherSessions = useCallback(() => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    soundFX.playTap();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,
        checkHandleAvailability,
        addContactByHandle,
        registeredUsers,
        contacts,
        activeContact,
        setActiveContact,
        messages,
        allMessages,
        myAvatarConfig,
        updateMyAvatarConfig,
        stories,
        markStoryViewed,
        addStatus,
        callState,
        callLogs,
        clearCallLogs,
        startCall,
        endCall,
        toggleMute,
        toggleVideo,
        activeView,
        setActiveView,
        whatsAppTab,
        setWhatsAppTab,
        is3DCompanionOpen,
        setIs3DCompanionOpen,
        sendMessage,
        sendVoiceMessage,
        sendReaction,
        triggerEmote,
        currentEmote,
        createNewChat,
        createGroup,
        triggerTypingSimulation,
        generateAiImage,

        // WhatsApp Core Features
        replyToMessage,
        setReplyToMessage,
        starMessage,
        deleteMessage,
        editMessage,
        pinMessage,
        unpinMessage,
        forwardMessage,
        createPoll,
        votePoll,
        sendDocument,
        sendLocation,
        setDisappearingTimer,
        toggleMuteContact,
        toggleArchiveContact,
        wallpaper,
        setWallpaper,
        communities,
        createCommunity,
        pinnedMessage,

        // Snapchat Additions
        snapscore,
        ghostMode,
        setGhostMode,
        privacyShield,
        setPrivacyShield,
        isScreenObscured,
        screenshotAlertBanner,
        triggerScreenshotAlert,
        dismissScreenshotAlert,
        sendSnap,
        openSnap,
        activeSnapViewing,
        setActiveSnapViewing,
        burnConversation,
        eyesOnlyPin,
        setEyesOnlyPin,
        eyesOnlyItems,
        addEyesOnlyItem,
        deleteEyesOnlyItem,
        activeSessions,
        terminateSession,
        terminateAllOtherSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
