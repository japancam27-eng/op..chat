import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { soundFX } from '../utils/audio';

interface SnapSecurityModalProps {
  onClose: () => void;
  onOpenEyesOnly?: () => void;
}

export const SnapSecurityModal: React.FC<SnapSecurityModalProps> = ({
  onClose,
  onOpenEyesOnly,
}) => {
  const {
    activeContact,
    ghostMode,
    setGhostMode,
    privacyShield,
    setPrivacyShield,
    triggerScreenshotAlert,
    activeSessions,
    terminateSession,
    terminateAllOtherSessions,
    burnConversation,
  } = useChat();

  const [confirmBurn, setConfirmBurn] = useState(false);
  const [panicLoggedOut, setPanicLoggedOut] = useState(false);

  const handleTestScreenshot = () => {
    triggerScreenshotAlert(activeContact.name || 'Someone');
  };

  const handleBurnChat = () => {
    burnConversation(activeContact.id);
    setConfirmBurn(false);
    onClose();
  };

  const handlePanicLogout = () => {
    terminateAllOtherSessions();
    setPanicLoggedOut(true);
    setTimeout(() => setPanicLoggedOut(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0b141a] border border-[#202c33] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#202c33] flex items-center justify-between bg-[#111b21]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fffc00]/10 border border-[#fffc00]/30 flex items-center justify-center text-xl text-[#fffc00] shadow-[0_0_15px_rgba(255,252,0,0.2)]">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Snapchat & Cyber Security Suite
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#fffc00]/20 text-[#fffc00] rounded-full border border-[#fffc00]/30">
                  SHIELD ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                End-to-end cryptographic privacy, anti-screenshot detection & session control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-zinc-400 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
          {/* 1. Screenshot Detection Card */}
          <div className="p-4 bg-[#111b21] border border-[#202c33] rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">📸</span>
                  <h4 className="text-sm font-bold text-white">
                    Instant Screenshot Detection & Alert
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                    Always Live
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time anti-capture monitor triggers loud chime, audit banner, and in-chat log whenever a user attempts to screenshot (PrintScreen, Snipping tool, or keyboard shortcuts).
                </p>
              </div>

              <button
                onClick={handleTestScreenshot}
                className="flex-shrink-0 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                🚨 Test Trigger
              </button>
            </div>
          </div>

          {/* 2. Privacy Shield (Screen Obfuscation on Blur) */}
          <div className="p-4 bg-[#111b21] border border-[#202c33] rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">🙈</span>
                <h4 className="text-sm font-bold text-white">
                  Privacy Shield (Anti-Snoop Blurring)
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Immediately obscures and blurs chat conversation if your browser window loses focus, preventing shoulder-surfing and screen scrapers.
              </p>
            </div>

            <button
              onClick={() => {
                setPrivacyShield(!privacyShield);
                soundFX.playTap();
              }}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${
                privacyShield ? 'bg-[#fffc00]' : 'bg-[#202c33]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  privacyShield ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Ghost Mode */}
          <div className="p-4 bg-[#111b21] border border-[#202c33] rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">👻</span>
                <h4 className="text-sm font-bold text-white">
                  Ghost Mode (Stealth Presence)
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When enabled, your 3D avatar location, active status, and last seen are completely hidden from all friends and maps.
              </p>
            </div>

            <button
              onClick={() => {
                setGhostMode(!ghostMode);
                soundFX.playTap();
              }}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${
                ghostMode ? 'bg-[#fffc00]' : 'bg-[#202c33]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  ghostMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. My Eyes Only Shortcut */}
          {onOpenEyesOnly && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔒</span>
                  <h4 className="text-sm font-bold text-white">
                    My Eyes Only Vault
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">
                  Access your 4-digit PIN-protected confidential storage.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenEyesOnly();
                }}
                className="px-3.5 py-1.5 bg-[#fffc00] hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl shadow transition-all"
              >
                Open Vault
              </button>
            </div>
          )}

          {/* 5. Active Devices & Remote Kill Switch */}
          <div className="p-4 bg-[#111b21] border border-[#202c33] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>📱</span> Active Login Sessions ({activeSessions.length})
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Verify authenticated devices with access to your account.
                </p>
              </div>

              <button
                onClick={handlePanicLogout}
                className="px-2.5 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl transition-all"
                title="Log out all other devices"
              >
                🚨 Panic Logout Others
              </button>
            </div>

            {panicLoggedOut && (
              <p className="text-xs text-emerald-400 font-semibold">
                ✓ All other remote devices have been terminated!
              </p>
            )}

            <div className="space-y-2 pt-1">
              {activeSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-2.5 bg-[#0b141a] border border-[#202c33] rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono">
                          This Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      {sess.location} • <span className="font-mono text-zinc-500">{sess.ip}</span>
                    </p>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => terminateSession(sess.id)}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 6. Cryptographic Chat Wipe (Burn Conversation) */}
          <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-red-300 flex items-center gap-1.5">
                  <span>🔥</span> Burn Conversation from Both Devices
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Permanently incinerates all message history with {activeContact.name}.
                </p>
              </div>

              {!confirmBurn ? (
                <button
                  onClick={() => setConfirmBurn(true)}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  Burn Chat
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBurnChat}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow animate-pulse"
                  >
                    Confirm Wipe!
                  </button>
                  <button
                    onClick={() => setConfirmBurn(false)}
                    className="px-2 py-1 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
