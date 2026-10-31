import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { CompanionScene } from '../3d/CompanionScene';
import { AvatarConfig } from '../types/chat';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  KeyRound,
  CheckCircle2,
  LogIn,
  UserPlus,
  QrCode,
  Palette,
  Mail,
  AtSign,
  AlertCircle,
  X,
  Radio,
  Eye,
  Globe,
} from 'lucide-react';
import { OpHaiderLogo } from './OpHaiderLogo';

interface LoginScreenProps {
  onClose?: () => void;
  initialTab?: 'login' | 'signup' | 'qr';
  onViewShowcase?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onClose,
  initialTab = 'signup',
  onViewShowcase,
}) => {
  const { login, signup, checkHandleAvailability, myAvatarConfig, registeredUsers } = useChat();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'qr'>(initialTab);

  // Form fields for Login
  const [loginIdentifier, setLoginIdentifier] = useState(''); // email or @handle
  const [loginPin, setLoginPin] = useState('');

  // Form fields for Sign Up
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupHandle, setSignupHandle] = useState('');
  const [signupPin, setSignupPin] = useState('');

  // Handle availability check state
  const [handleStatus, setHandleStatus] = useState<{
    checked: boolean;
    isAvailable: boolean;
    message: string;
  }>({
    checked: false,
    isAvailable: false,
    message: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 3D Avatar Preview Config for Sign Up
  const [previewAvatar, setPreviewAvatar] = useState<AvatarConfig>({
    ...myAvatarConfig,
    hairStyle: 'cyberpunk',
    hairColor: '#00ffcc',
    outfitColor: '#00a884',
    expression: 'happy',
  });

  // 3D Three.js Scene Host
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CompanionScene | null>(null);

  // Live handle verification when user types handle
  useEffect(() => {
    if (!signupHandle.trim()) {
      setHandleStatus({ checked: false, isAvailable: false, message: '' });
      return;
    }
    const timer = setTimeout(() => {
      const res = checkHandleAvailability(signupHandle);
      setHandleStatus({
        checked: true,
        isAvailable: res.isAvailable,
        message: res.message,
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [signupHandle, checkHandleAvailability]);

  // Initialize 3D Avatar Stage
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new CompanionScene(mountRef.current, previewAvatar);
    sceneRef.current = scene;

    const handleResize = () => {
      if (mountRef.current && sceneRef.current) {
        sceneRef.current.resize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  // Update 3D avatar when previewAvatar changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateConfig(previewAvatar);
    }
  }, [previewAvatar]);

  // Handle Log In Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email address or unique ID.');
      return;
    }

    soundFX.playCallConnected();
    setIsLoading(true);
    setStatusMessage('Authenticating your 256-bit encrypted session...');

    if (sceneRef.current) {
      sceneRef.current.setExpression('happy');
    }

    setTimeout(() => {
      const result = login(loginIdentifier.trim(), loginPin || '1234');
      if (result.success) {
        setIsLoading(false);
        onClose?.();
      } else {
        setIsLoading(false);
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 700);
  };

  // Handle Sign Up Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@') || !signupEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signupHandle.trim()) {
      setErrorMessage('Please create your unique ID (Snapchat-style handle).');
      return;
    }
    if (handleStatus.checked && !handleStatus.isAvailable) {
      setErrorMessage(handleStatus.message || 'This unique ID is already taken. Please choose another.');
      return;
    }

    soundFX.playCallConnected();
    setIsLoading(true);
    setStatusMessage('Registering unique ID & generating 3D avatar...');

    if (sceneRef.current) {
      sceneRef.current.setExpression('dance');
    }

    confetti({
      particleCount: 75,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#00ffcc', '#00a884', '#10b981', '#ffffff', '#3b82f6'],
    });

    setTimeout(() => {
      const result = signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        handle: signupHandle.trim(),
        pin: signupPin || '1234',
        avatarConfig: previewAvatar,
      });

      if (result.success) {
        setIsLoading(false);
        onClose?.();
      } else {
        setIsLoading(false);
        setErrorMessage(result.error || 'Registration error. Please check your inputs.');
      }
    }, 900);
  };

  // Quick 1-Click Fast Login
  const handleQuickLogin = (emailOrHandle: string) => {
    soundFX.playCallConnected();
    setIsLoading(true);
    setStatusMessage(`Signing in with ${emailOrHandle}...`);

    if (sceneRef.current) {
      sceneRef.current.setExpression('waving');
    }

    setTimeout(() => {
      login(emailOrHandle, '1234');
      setIsLoading(false);
      onClose?.();
    }, 600);
  };

  const handleAvatarStyleChange = (hair: AvatarConfig['hairStyle'], color: string) => {
    soundFX.playTap();
    setPreviewAvatar((prev) => ({
      ...prev,
      hairStyle: hair,
      outfitColor: color,
      expression: 'happy',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#071318] text-[#e9edef] overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Cyber Ambient Glow matching image */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#00ffcc]/12 via-[#00a884]/15 to-transparent blur-3xl opacity-75" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#00ffcc]/8 blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00a884]/8 blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full px-6 md:px-12 py-4 flex items-center justify-between border-b border-[#00ffcc]/15 bg-[#071318]/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <OpHaiderLogo variant="avatar" size={44} />
          <div>
            <div className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span>OP HAIDER</span>
              <span className="px-2 py-0.5 rounded-full bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] text-[10px] font-bold uppercase tracking-widest">
                3D Messenger
              </span>
            </div>
            <div className="text-xs text-[#8696a0]">Sign In with Email & Unique Snapchat-Style ID</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onViewShowcase && (
            <button
              onClick={onViewShowcase}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/90 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#00ffcc]" />
              <span>Preview 3D Showcase</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[#00ffcc] text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full">
        {/* Holographic Header Banner */}
        <div className="w-full text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ffcc]/15 border border-[#00ffcc]/30 text-[#00ffcc] text-xs font-semibold mb-2 shadow-[0_0_15px_rgba(0,255,204,0.2)]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00ffcc]" />
            <span>Official Identity Gate • Every User Must Have a Unique ID</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Connect Effortlessly in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] via-[#10b981] to-[#34d399]">3D Space</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1 max-w-xl mx-auto">
            Log in with your email or create your unique Snapchat-style handle to discover friends, chat in real-time, and explore 3D lounges.
          </p>
        </div>

        {/* Outer Glass Card */}
        <div className="w-full rounded-3xl bg-[#0f1d24]/90 backdrop-blur-xl border border-[#00ffcc]/25 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column: Log In & Sign Up Forms */}
          <div className="w-full lg:w-3/5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* Primary Tab Switcher */}
              <div className="flex items-center p-1.5 rounded-2xl bg-[#071318]/90 border border-[#1e2f38] mb-6 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    soundFX.playTap();
                    setErrorMessage('');
                    if (sceneRef.current) sceneRef.current.setExpression('happy');
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-gradient-to-r from-[#00ffcc] to-[#00a884] text-[#071318] shadow-[0_0_20px_rgba(0,255,204,0.35)] scale-[1.01]'
                      : 'text-[#8696a0] hover:text-[#e9edef]'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account (Sign Up)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    soundFX.playTap();
                    setErrorMessage('');
                    if (sceneRef.current) sceneRef.current.setExpression('idle');
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-[#00ffcc] to-[#00a884] text-[#071318] shadow-[0_0_20px_rgba(0,255,204,0.35)] scale-[1.01]'
                      : 'text-[#8696a0] hover:text-[#e9edef]'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In (Existing)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('qr');
                    soundFX.playTap();
                    setErrorMessage('');
                    if (sceneRef.current) sceneRef.current.setExpression('waving');
                  }}
                  className={`px-3 py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'qr'
                      ? 'bg-[#00a884] text-[#071318]'
                      : 'text-[#8696a0] hover:text-[#e9edef]'
                  }`}
                  title="Fast Access"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">Fast</span>
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-200 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Loading State Overlay */}
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full border-4 border-[#1e2f38] border-t-[#00ffcc] animate-spin shadow-[0_0_25px_rgba(0,255,204,0.4)]" />
                  <div className="text-base font-extrabold text-[#e9edef] animate-pulse">
                    {statusMessage}
                  </div>
                  <div className="text-xs text-[#8696a0]">Opening OP HAIDER 3D Messenger...</div>
                </div>
              ) : (
                <>
                  {/* TAB 1: SIGN UP WITH UNIQUE SNAPCHAT-STYLE ID */}
                  {activeTab === 'signup' && (
                    <form onSubmit={handleSignupSubmit} className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-1">
                          Full Name
                        </label>
                        <div className="flex items-center bg-[#13222a] rounded-xl px-3.5 py-2.5 border border-[#1e323e] focus-within:border-[#00ffcc] transition">
                          <User className="w-4 h-4 text-[#8696a0] mr-2.5 flex-shrink-0" />
                          <input
                            type="text"
                            required
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            placeholder="e.g. Sajjad Haider"
                            className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-1">
                          Email Address (Required for Verification)
                        </label>
                        <div className="flex items-center bg-[#13222a] rounded-xl px-3.5 py-2.5 border border-[#1e323e] focus-within:border-[#00ffcc] transition">
                          <Mail className="w-4 h-4 text-[#8696a0] mr-2.5 flex-shrink-0" />
                          <input
                            type="email"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="e.g. sajjad@example.com"
                            className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Unique User ID / Handle Input (Snapchat-style) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#00ffcc] uppercase tracking-wider flex items-center gap-1">
                            <AtSign className="w-3.5 h-3.5" />
                            <span>Create Unique Snapchat-Style ID (Handle)</span>
                          </label>
                          <span className="text-[10px] text-[#94a3b8]">Unique to you only</span>
                        </div>
                        <div className={`flex items-center bg-[#13222a] rounded-xl px-3.5 py-2.5 border transition ${
                          handleStatus.checked
                            ? handleStatus.isAvailable
                              ? 'border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]'
                              : 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                            : 'border-[#1e323e] focus-within:border-[#00ffcc]'
                        }`}>
                          <span className="text-sm font-bold text-[#00ffcc] mr-1">@</span>
                          <input
                            type="text"
                            required
                            value={signupHandle.replace(/^@/, '')}
                            onChange={(e) => setSignupHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                            placeholder="haider_99"
                            className="w-full bg-transparent text-sm font-semibold text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                          />
                        </div>

                        {/* Live Handle Validation Feedback */}
                        {handleStatus.checked && (
                          <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                            handleStatus.isAvailable ? 'text-[#00ffcc]' : 'text-red-400'
                          }`}>
                            {handleStatus.isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{handleStatus.message} — Other users will find you with this ID!</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{handleStatus.message}</span>
                              </>
                            )}
                          </div>
                        )}
                        {!handleStatus.checked && (
                          <p className="mt-1 text-[11px] text-[#8696a0]">
                            Like Snapchat, you will share this unique ID with friends to connect and chat.
                          </p>
                        )}
                      </div>

                      {/* Security PIN */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">
                            Password / PIN (4 digits or password)
                          </label>
                          <span className="text-[11px] text-[#8696a0]">e.g. 1234</span>
                        </div>
                        <div className="flex items-center bg-[#13222a] rounded-xl px-3.5 py-2.5 border border-[#1e323e] focus-within:border-[#00ffcc] transition">
                          <KeyRound className="w-4 h-4 text-[#8696a0] mr-2.5 flex-shrink-0" />
                          <input
                            type="password"
                            value={signupPin}
                            onChange={(e) => setSignupPin(e.target.value)}
                            placeholder="••••"
                            className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* 3D Initial Avatar Customizer */}
                      <div className="p-3 rounded-2xl bg-[#0b151b] border border-[#1a2c35]">
                        <span className="text-xs font-bold text-[#00ffcc] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Choose Initial 3D Avatar Look:</span>
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAvatarStyleChange('cyberpunk', '#00ffcc')}
                            className="p-1.5 rounded-xl bg-[#13222a] hover:bg-[#00ffcc]/20 border border-[#1e323e] hover:border-[#00ffcc] text-[11px] font-semibold text-center cursor-pointer text-[#e9edef] transition"
                          >
                            Cyber Emerald
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAvatarStyleChange('curly', '#2563eb')}
                            className="p-1.5 rounded-xl bg-[#13222a] hover:bg-[#00ffcc]/20 border border-[#1e323e] hover:border-[#00ffcc] text-[11px] font-semibold text-center cursor-pointer text-[#e9edef] transition"
                          >
                            Curly Blue
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAvatarStyleChange('bob', '#7c3aed')}
                            className="p-1.5 rounded-xl bg-[#13222a] hover:bg-[#00ffcc]/20 border border-[#1e323e] hover:border-[#00ffcc] text-[11px] font-semibold text-center cursor-pointer text-[#e9edef] transition"
                          >
                            Sleek Violet
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAvatarStyleChange('afro', '#ea580c')}
                            className="p-1.5 rounded-xl bg-[#13222a] hover:bg-[#00ffcc]/20 border border-[#1e323e] hover:border-[#00ffcc] text-[11px] font-semibold text-center cursor-pointer text-[#e9edef] transition"
                          >
                            Afro Amber
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00ffcc] via-[#00e6b8] to-[#00a884] hover:shadow-[0_0_25px_rgba(0,255,204,0.5)] text-[#071318] font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-[0.99]"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Register Unique ID & Enter OP HAIDER 3D</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* TAB 2: LOG IN WITH EMAIL OR UNIQUE ID */}
                  {activeTab === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">
                            Email Address or Unique ID (@handle)
                          </label>
                          <span className="text-[11px] text-[#00ffcc]">Registered User</span>
                        </div>
                        <div className="flex items-center bg-[#13222a] rounded-xl px-4 py-3 border border-[#1e323e] focus-within:border-[#00ffcc] transition">
                          <AtSign className="w-5 h-5 text-[#8696a0] mr-2.5 flex-shrink-0" />
                          <input
                            type="text"
                            required
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="e.g. sajjad@example.com or @haider_op"
                            className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">
                            Password / PIN
                          </label>
                          <span className="text-[11px] text-[#8696a0]">Default: 1234</span>
                        </div>
                        <div className="flex items-center bg-[#13222a] rounded-xl px-4 py-3 border border-[#1e323e] focus-within:border-[#00ffcc] transition">
                          <KeyRound className="w-5 h-5 text-[#8696a0] mr-2.5 flex-shrink-0" />
                          <input
                            type="password"
                            value={loginPin}
                            onChange={(e) => setLoginPin(e.target.value)}
                            placeholder="••••"
                            className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#64748b] focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00ffcc] via-[#00e6b8] to-[#00a884] hover:shadow-[0_0_25px_rgba(0,255,204,0.5)] text-[#071318] font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                      >
                        <LogIn className="w-5 h-5" />
                        <span>Log In & Enter OP HAIDER 3D</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* Fast Demo Logins */}
                      <div className="pt-4 mt-4 border-t border-[#1a2c35]">
                        <span className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-2">
                          Or Fast 1-Click Demo Accounts:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('@haider_op')}
                            className="p-2.5 rounded-xl bg-[#13222a] hover:bg-[#00ffcc]/15 border border-[#1e323e] hover:border-[#00ffcc] transition text-left cursor-pointer group"
                          >
                            <div className="text-xs font-bold text-[#e9edef] group-hover:text-[#00ffcc]">
                              Haider Khan
                            </div>
                            <div className="text-[11px] text-[#00ffcc]">@haider_op</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('@alex_r')}
                            className="p-2.5 rounded-xl bg-[#13222a] hover:bg-[#00ffcc]/15 border border-[#1e323e] hover:border-[#00ffcc] transition text-left cursor-pointer group"
                          >
                            <div className="text-xs font-bold text-[#e9edef] group-hover:text-[#00ffcc]">
                              Alex Rivera
                            </div>
                            <div className="text-[11px] text-[#00ffcc]">@alex_r</div>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* TAB 3: QR CODE & FAST SCAN */}
                  {activeTab === 'qr' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="p-4 rounded-2xl bg-[#13222a] border border-[#1e323e] text-xs text-[#94a3b8] leading-relaxed">
                        To link your existing OP HAIDER 3D device session, tap a fast demo access profile below or scan with your device.
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleQuickLogin('@haider_op')}
                          className="p-3.5 rounded-xl bg-[#0b151b] hover:bg-[#00ffcc]/20 border border-[#1e323e] hover:border-[#00ffcc] text-xs font-bold text-[#e9edef] cursor-pointer text-left transition"
                        >
                          <div className="text-[#00ffcc]">@haider_op</div>
                          <div className="text-[10px] text-[#94a3b8]">Haider Khan • Admin</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin('@sophia_m')}
                          className="p-3.5 rounded-xl bg-[#0b151b] hover:bg-[#00ffcc]/20 border border-[#1e323e] hover:border-[#00ffcc] text-xs font-bold text-[#e9edef] cursor-pointer text-left transition"
                        >
                          <div className="text-[#00ffcc]">@sophia_m</div>
                          <div className="text-[10px] text-[#94a3b8]">Sophia Miller • 3D Creator</div>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Security Info */}
            <div className="pt-6 border-t border-[#1a2c35] mt-6 flex items-center justify-between text-xs text-[#8696a0]">
              <div className="flex items-center gap-1.5 text-[#00ffcc]">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Knowledge Encrypted</span>
              </div>
              <span className="text-[#8696a0]">Snapchat-Style Unique IDs Active</span>
            </div>
          </div>

          {/* Right Column: 3D Holographic Companion Stage */}
          <div className="w-full lg:w-2/5 bg-gradient-to-b from-[#0b151b] via-[#071318] to-[#040c10] border-t lg:border-t-0 lg:border-l border-[#00ffcc]/15 p-6 md:p-8 flex flex-col items-center justify-between relative overflow-hidden">
            
            {/* Interactive 3D Avatar Preview Host */}
            <div className="w-full flex-1 min-h-[280px] flex flex-col items-center justify-center relative">
              <div className="w-full h-72 relative rounded-3xl overflow-hidden bg-[#071318]/70 border border-[#00ffcc]/30 shadow-[0_0_30px_rgba(0,255,204,0.15)]">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                
                {/* 3D badge */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-[#071318]/90 backdrop-blur border border-[#00ffcc]/40 text-[11px] text-[#00ffcc] flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,204,0.3)]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Interactive 3D Avatar • Drag to Orbit</span>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs font-bold text-[#e9edef] block">
                  {activeTab === 'signup'
                    ? signupHandle ? `@${signupHandle.replace(/^@/, '')}'s 3D Avatar` : 'Your Live 3D Avatar'
                    : 'OP HAIDER 3D Interactive Host'}
                </span>
                <span className="text-[11px] text-[#8696a0]">
                  Real-time WebGL gestures, voice lip-sync, and emotes
                </span>
              </div>
            </div>

            {/* Quick 1-Click Card at bottom */}
            <div
              onClick={() => handleQuickLogin('@haider_op')}
              className="mt-4 w-full p-3 rounded-2xl bg-[#13222a] border border-[#1e323e] hover:border-[#00ffcc] transition cursor-pointer flex items-center justify-between group shadow"
              title="Click for instant login"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00ffcc] to-[#00a884] flex items-center justify-center text-[#071318]">
                  <QrCode className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#e9edef] group-hover:text-[#00ffcc]">
                    Instant 1-Click Access
                  </div>
                  <div className="text-[10px] text-[#8696a0]">Enter as @haider_op</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8696a0] group-hover:text-[#00ffcc] group-hover:translate-x-1 transition-all" />
            </div>

          </div>

        </div>

        {/* Global Security Guarantee */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#8696a0] text-center">
          <div className="flex items-center gap-1.5 text-[#e9edef]">
            <Lock className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span>End-to-End Encrypted Communication</span>
          </div>
          <span className="hidden sm:inline text-[#1e2f38]">•</span>
          <span>Only you and the people you talk to can read messages, listen to voice notes, or view avatars.</span>
        </div>
      </main>
    </div>
  );
};
