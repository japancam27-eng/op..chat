import React, { useEffect, useRef, useState } from 'react';
import { HoloGlobeScene } from '../3d/HoloGlobeScene';
import { soundFX } from '../utils/audio';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Lock,
  Cpu,
  Zap,
  Globe2,
  Bot,
  Layers,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { OpHaiderLogo } from './OpHaiderLogo';

interface LandingHeroProps {
  onLaunchApp: () => void;
  onOpenAuth: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLaunchApp, onOpenAuth }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HoloGlobeScene | null>(null);
  const [activeModal, setActiveModal] = useState<'safety' | 'features' | 'ai' | null>(null);

  // Initialize Three.js 3D HoloGlobe
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new HoloGlobeScene(mountRef.current);
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

  const handleLaunch = () => {
    soundFX.playCallConnected();
    onLaunchApp();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#071318] text-[#e9edef] overflow-x-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#00ffcc]/30 selection:text-white">
      {/* Background Ambient Glows & Cyber Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => soundFX.playTap()}>
          <OpHaiderLogo variant="avatar" size={48} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-2xl tracking-wider text-white">OP HAIDER</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ffcc] shadow-[0_0_10px_#00ffcc] animate-pulse" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00ffcc]/80 -mt-1 block">
              3D Spatial Messenger
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#94a3b8]">
          <button
            onClick={() => setActiveModal('features')}
            className="hover:text-[#00ffcc] transition cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => setActiveModal('safety')}
            className="hover:text-[#00ffcc] transition cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span>Safety</span>
          </button>
          <button
            onClick={handleLaunch}
            className="text-white hover:text-[#00ffcc] transition cursor-pointer"
          >
            Web App
          </button>
          <button
            onClick={() => setActiveModal('ai')}
            className="hover:text-[#00ffcc] transition cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span>AI Studio</span>
          </button>
          <button
            onClick={() => {
              soundFX.playTap();
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="hover:text-[#00ffcc] transition cursor-pointer"
          >
            Support
          </button>
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAuth}
            className="hidden sm:inline-block text-xs font-bold text-[#94a3b8] hover:text-white transition px-3 py-2 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={handleLaunch}
            className="relative group px-6 py-2.5 rounded-full bg-[#00ffcc] hover:bg-[#00e6b8] text-[#071318] font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(0,255,204,0.45)] hover:shadow-[0_0_35px_rgba(0,255,204,0.65)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Get Started</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-4 pb-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[520px]">
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-xs font-semibold text-[#00ffcc] mx-auto lg:mx-0 w-fit backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen WebGL & Gemini AI Powered</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              CONNECT <br />
              <span className="bg-gradient-to-r from-[#00ffcc] via-[#00d293] to-white bg-clip-text text-transparent">
                EFFORTLESSLY
              </span> <br />
              IN 3D
            </h1>

            <p className="text-base sm:text-lg text-[#94a3b8] max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
              Experience seamless communication with immersive interfaces, expressive 3D avatars, and next-gen technology.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Glowing LAUNCH WEB APP Button */}
              <button
                onClick={handleLaunch}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#00ffcc] hover:bg-[#25f8c8] text-[#071318] font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(0,255,204,0.5)] hover:shadow-[0_0_45px_rgba(0,255,204,0.75)] transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>LAUNCH WEB APP</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Learn More Button */}
              <button
                onClick={() => setActiveModal('features')}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm tracking-wide border border-white/15 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Learn More</span>
                <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
              </button>
            </div>

            {/* Quick stats / Highlights */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#94a3b8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00ffcc]" />
                <span>256-Bit E2E Encrypted</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#94a3b8]/40" />
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#00d293]" />
                <span>Zero Latency Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic Globe Canvas */}
          <div className="lg:col-span-7 relative h-[420px] sm:h-[480px] md:h-[540px] flex items-center justify-center">
            {/* Soft Radial Ambient Backdrop behind Orb */}
            <div className="absolute inset-0 bg-radial from-[#00ffcc]/15 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* 3D Three.js Container */}
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing select-none"
              title="Drag with mouse or swipe to rotate the 3D Holographic Orb"
            />
          </div>
        </div>

        {/* Bottom Feature Cards (Matching the reference mockup) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-6">
          {/* Card 1: Immersive Chats */}
          <div
            onClick={handleLaunch}
            className="group relative p-6 rounded-3xl bg-[#0b1c22]/70 hover:bg-[#0e242c]/90 border border-[#00ffcc]/20 hover:border-[#00ffcc]/50 backdrop-blur-xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffcc]/5 rounded-bl-full pointer-events-none transition group-hover:scale-125" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00ffcc]/15 border border-[#00ffcc]/30 flex items-center justify-center text-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.2)]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00ffcc]/80 px-2.5 py-1 rounded-full bg-[#00ffcc]/10">
                Spatial 3D
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00ffcc] transition">
              Immersive Chats
            </h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Express yourself with fully articulated 3D avatars, real-time emotes, voice notes, and spatial sound.
            </p>
          </div>

          {/* Card 2: End-to-End Encryption */}
          <div
            onClick={() => setActiveModal('safety')}
            className="group relative p-6 rounded-3xl bg-[#0b1c22]/70 hover:bg-[#0e242c]/90 border border-[#00d293]/20 hover:border-[#00d293]/50 backdrop-blur-xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d293]/5 rounded-bl-full pointer-events-none transition group-hover:scale-125" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00d293]/15 border border-[#00d293]/30 flex items-center justify-center text-[#00d293] shadow-[0_0_15px_rgba(0,210,147,0.2)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00d293]/80 px-2.5 py-1 rounded-full bg-[#00d293]/10">
                Encrypted
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d293] transition">
              End-to-End Encryption
            </h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Cryptographic keys stay only on your devices. No third parties or servers can read your messages or calls.
            </p>
          </div>

          {/* Card 3: Fluid Interface */}
          <div
            onClick={handleLaunch}
            className="group relative p-6 rounded-3xl bg-[#0b1c22]/70 hover:bg-[#0e242c]/90 border border-[#38ef7d]/20 hover:border-[#38ef7d]/50 backdrop-blur-xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38ef7d]/5 rounded-bl-full pointer-events-none transition group-hover:scale-125" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#38ef7d]/15 border border-[#38ef7d]/30 flex items-center justify-center text-[#38ef7d] shadow-[0_0_15px_rgba(56,239,125,0.2)]">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#38ef7d]/80 px-2.5 py-1 rounded-full bg-[#38ef7d]/10">
                Ultra Fluid
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#38ef7d] transition">
              Fluid Interface
            </h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Silky 60fps animations, cross-tab synchronization, group chat creation, and built-in Gemini AI intelligence.
            </p>
          </div>
        </div>
      </main>

      {/* Informational Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0d1e25] border border-[#00ffcc]/30 p-7 shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#94a3b8] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'features' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00ffcc]/20 flex items-center justify-center text-[#00ffcc]">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">OP HAIDER 3D Features</h3>
                <ul className="space-y-3 text-sm text-[#94a3b8]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00ffcc] mt-0.5 flex-shrink-0" />
                    <span><strong>Procedural 3D Avatars:</strong> 10+ anatomical joints, skin, hairstyle, outfit and expression customizer.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00ffcc] mt-0.5 flex-shrink-0" />
                    <span><strong>3D Spatial Lounge:</strong> Walk around, orbit, and interact with multiple contact avatars simultaneously.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00ffcc] mt-0.5 flex-shrink-0" />
                    <span><strong>Voice & Video Calls:</strong> Realistic 3D calling simulation with Web Audio procedural ringtones.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00ffcc] mt-0.5 flex-shrink-0" />
                    <span><strong>Multi-Member Encrypted Groups:</strong> Create groups with customizable members and group descriptions.</span>
                  </li>
                </ul>
                <button
                  onClick={handleLaunch}
                  className="w-full mt-4 py-3 rounded-xl bg-[#00ffcc] text-black font-bold text-sm shadow-lg hover:bg-[#00e6b8] transition cursor-pointer"
                >
                  Experience Features in Web App
                </button>
              </div>
            )}

            {activeModal === 'safety' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00d293]/20 flex items-center justify-center text-[#00d293]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Security & Encryption</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  OP HAIDER uses client-side simulated AES-256 encryption. Your keys never leave your browser instance.
                </p>
                <div className="p-4 rounded-xl bg-[#071318] border border-[#00d293]/30 text-xs text-[#00d293] space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Lock className="w-4 h-4" />
                    <span>Zero-Knowledge Architecture</span>
                  </div>
                  <p className="text-[#94a3b8]">
                    No eavesdropping, no tracking, and total privacy for all personal chats and group messages.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-4 py-3 rounded-xl bg-[#202c33] text-white font-bold text-sm hover:bg-[#2a3942] transition cursor-pointer"
                >
                  Got It
                </button>
              </div>
            )}

            {activeModal === 'ai' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#38ef7d]/20 flex items-center justify-center text-[#38ef7d]">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">OP Haider AI Assistant</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  Integrated with Google Gemini 3.8 Flash intelligence. Enjoy real-time conversation assistance, smart drafting, tone rewriting, and conversation summaries.
                </p>
                <div className="space-y-2 text-xs text-[#94a3b8]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" />
                    <span>Instant Smart Suggestions while messaging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#00ffcc]" />
                    <span>AI Tone Rewriter: Cyberpunk, Professional, Playful</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-[#00ffcc]" />
                    <span>Dedicated "OP Haider AI" contact ready to chat 24/7</span>
                  </div>
                </div>
                <button
                  onClick={handleLaunch}
                  className="w-full mt-4 py-3 rounded-xl bg-[#00ffcc] text-black font-bold text-sm shadow-lg hover:bg-[#00e6b8] transition cursor-pointer"
                >
                  Chat with OP Haider AI Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 px-6 text-center text-xs text-[#64748b]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#94a3b8]">OP HAIDER 3D</span>
            <span>• Next-Gen Spatial Messenger</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveModal('safety')} className="hover:text-white transition cursor-pointer">
              Privacy & Encryption
            </button>
            <button onClick={() => setActiveModal('features')} className="hover:text-white transition cursor-pointer">
              Specs
            </button>
            <button onClick={handleLaunch} className="text-[#00ffcc] font-semibold hover:underline cursor-pointer">
              Launch App
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
