import React, { useState, useEffect, useRef } from 'react';
import { SnapData } from '../types/chat';
import { useChat } from '../context/ChatContext';
import { soundFX } from '../utils/audio';

interface SnapViewerModalProps {
  messageId: string;
  snap: SnapData;
  onClose: () => void;
}

export const SnapViewerModal: React.FC<SnapViewerModalProps> = ({
  messageId,
  snap,
  onClose,
}) => {
  const { allMessages, triggerScreenshotAlert } = useChat();
  const maxTime = snap.timer > 0 ? snap.timer : 10;
  const [timeLeft, setTimeLeft] = useState<number>(maxTime);
  const [isHolding, setIsHolding] = useState<boolean>(true);
  const [isBurnt, setIsBurnt] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio open
  useEffect(() => {
    soundFX.playTap();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isBurnt) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleBurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isBurnt]);

  const handleBurn = () => {
    setIsBurnt(true);
    soundFX.playSent();
    // Update the message in localStorage to mark it burnt
    try {
      const stored = localStorage.getItem('op_haider_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((m: any) => {
          if (m.id === messageId && m.snap) {
            return {
              ...m,
              text: 'Opened Snap (Burnt)',
              status: 'read',
              snap: {
                ...m.snap,
                isOpened: true,
                openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isBurnt: true,
                mediaUrl: '',
              },
            };
          }
          return m;
        });
        localStorage.setItem('op_haider_messages', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const progressPercent = ((maxTime - timeLeft) / maxTime) * 100;

  // Filter styles
  const getFilterStyle = (filter?: string) => {
    switch (filter) {
      case 'cyberpunk':
        return 'contrast-125 saturate-150 hue-rotate-15 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]';
      case 'neon_glow':
        return 'brightness-110 contrast-125 saturate-200 drop-shadow-[0_0_25px_rgba(0,255,204,0.6)]';
      case 'matrix':
        return 'hue-rotate-90 saturate-200 contrast-125';
      case 'golden_hour':
        return 'sepia-[0.35] contrast-110 saturate-125';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none animate-in fade-in duration-200">
      {/* Anti-screenshot watermark pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-wrap gap-12 p-8 font-mono text-xs overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i}>OP HAIDER SNAP GUARD • ENCRYPTED • DO NOT CAPTURE</span>
        ))}
      </div>

      {/* Top Countdown Bar & Header */}
      <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          {/* Animated Countdown Circle */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/20"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#fffc00"
                strokeWidth="3.5"
                strokeDasharray={100}
                strokeDashoffset={progressPercent}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-bold text-xs text-[#fffc00] font-mono">
              {timeLeft}s
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                View Once Snap
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Will auto-destruct upon closing</p>
          </div>
        </div>

        {/* Security badges & Close button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerScreenshotAlert('Someone')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-full transition-all"
            title="Simulate Screenshot Warning"
          >
            <span>📸 Test Warn</span>
          </button>
          <button
            onClick={handleBurn}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Snap Media Content */}
      <div className="relative w-full max-w-md h-[80vh] flex flex-col items-center justify-center p-4">
        {isBurnt ? (
          <div className="flex flex-col items-center text-center animate-out zoom-out-90 duration-300">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-3xl mb-4 animate-bounce">
              🔥
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Snap Burnt & Destroyed</h3>
            <p className="text-sm text-zinc-400">This snap has vanished from all servers and devices.</p>
          </div>
        ) : (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 flex items-center justify-center">
            {snap.mediaUrl ? (
              <img
                src={snap.mediaUrl}
                alt="Snap Content"
                className={`w-full h-full object-cover transition-all duration-300 ${getFilterStyle(snap.filter)}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-950 via-purple-950 to-zinc-950 w-full h-full">
                <span className="text-5xl mb-4">👻</span>
                <h4 className="text-lg font-bold text-white mb-2">Holographic Snap</h4>
                <p className="text-xs text-zinc-300 max-w-xs">
                  Sent with end-to-end cryptographic ephemeral encryption.
                </p>
              </div>
            )}

            {/* Classic Snapchat Black Caption Bar */}
            {snap.caption && (
              <div className="absolute inset-x-0 bottom-16 bg-black/75 backdrop-blur-md py-3 px-6 text-center text-white font-medium text-sm md:text-base border-y border-white/10">
                {snap.caption}
              </div>
            )}

            {/* Bottom Anti-Screenshot Banner */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-[11px] text-white/60 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
              <span className="flex items-center gap-1">
                🔒 Protected by Anti-Capture Shield
              </span>
              <span className="font-mono text-[#fffc00]">BURNING IN {timeLeft}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
