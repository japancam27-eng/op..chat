export type MessageStatus = 'sent' | 'delivered' | 'read';

export type MessageType = 'text' | 'voice' | 'image' | 'call' | 'action' | 'poll' | 'document' | 'location' | 'contact_card' | 'snap' | 'screenshot_alert';

export type AvatarExpression = 'idle' | 'happy' | 'talking' | 'laughing' | 'waving' | 'thinking' | 'dance' | 'surprised';

export interface AvatarConfig {
  skinColor: string;
  hairStyle: 'classic' | 'curly' | 'sleek' | 'afro' | 'cyberpunk' | 'bob';
  hairColor: string;
  outfitColor: string;
  outfitStyle: 'hoodie' | 'suit' | 'casual' | 'cyber';
  accessory: 'none' | 'headphones' | 'glasses' | 'cap' | 'gold_chain';
  expression: AvatarExpression;
}

export interface Story {
  id: string;
  contactId: string;
  contactName: string;
  timestamp: string;
  caption: string;
  colorGradient: string;
  mediaType: 'image' | 'text' | 'avatar';
  viewed: boolean;
  userAvatar?: string;
  reactions?: Record<string, number>;
}

export interface SnapData {
  id: string;
  timer: number; // Duration in seconds (e.g. 5, 10) or 0 for indefinite until release
  mediaUrl: string;
  caption?: string;
  filter?: string;
  isOpened: boolean;
  openedAt?: string;
  isBurnt: boolean; // Auto-destroyed after opening
  replayed?: boolean;
}

export interface ScreenshotAlert {
  detector: string;
  targetUser: string;
  timestamp: string;
}

export interface EyesOnlyItem {
  id: string;
  type: 'image' | 'text' | 'voice' | 'snap';
  title: string;
  content: string;
  timestamp: string;
  size?: string;
  encryptedHash: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  handle: string; // Unique Snapchat-style ID (e.g. @haider_op)
  phone?: string;
  avatarConfig: AvatarConfig;
  isLoggedIn: boolean;
  securityPin?: string;
  createdAt?: string;
  statusAbout?: string;
  snapscore?: number;
  ghostMode?: boolean;
  eyesOnlyPin?: string;
  twoFactorEnabled?: boolean;
  privacyShield?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  handle: string; // Unique handle / Snapchat-style ID
  email?: string;
  phone: string;
  avatarColor: string;
  avatarConfig: AvatarConfig;
  status: string;
  isOnline: boolean;
  lastSeen: string;
  unreadCount: number;
  isTyping?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  muteUntil?: string;
  disappearingTimer?: number; // 0 = off, 86400 = 24h, 604800 = 7d, 7776000 = 90d
  securityCode?: string; // 60-digit verification code
  streak?: { count: number; hoursLeft: number; active: boolean };
  snapscore?: number;
  stories?: Story[];
  isGroup?: boolean;
  groupMembers?: string[]; // IDs of members in the group
  groupAdmin?: string;
  groupDescription?: string;
  isAi?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user handles or IDs who voted for this option
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
}

export interface MessageDocument {
  name: string;
  size: string;
  extension: string;
  url?: string;
}

export interface MessageLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string; // 'me' or contactId
  senderName: string;
  text: string;
  type: MessageType;
  timestamp: string;
  status: MessageStatus;
  voiceDuration?: number; // in seconds
  voiceWaveform?: number[];
  imageUrl?: string;
  imagePrompt?: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: Record<string, number>;
  emotionTrigger?: AvatarExpression;
  isStarred?: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  forwarded?: boolean;
  poll?: PollData;
  document?: MessageDocument;
  location?: MessageLocation;
  snap?: SnapData;
  screenshotAlert?: ScreenshotAlert;
}

export interface CallLog {
  id: string;
  contactId: string;
  contactName: string;
  contactHandle: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  announcementId: string;
  groups: string[];
  membersCount: number;
  createdDate: string;
}

export interface CallState {
  isActive: boolean;
  type: 'voice' | 'video' | 'spatial3d';
  contact: Contact | null;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: number; // seconds
  status: 'connecting' | 'connected' | 'ended';
}

export type WhatsAppTab = 'chats' | 'status' | 'calls' | 'communities' | 'settings' | 'spatialLounge';

