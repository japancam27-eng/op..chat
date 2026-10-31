import React, { useEffect, useRef } from 'react';
import { CompanionScene } from '../3d/CompanionScene';
import { Contact, AvatarExpression } from '../types/chat';
import { Sparkles, Smile, Hand, PartyPopper, Brain, RotateCcw, X, Volume2 } from 'lucide-react';

interface AvatarCompanionViewProps {
  contact: Contact;
  onClose?: () => void;
  onOpenCustomizer?: () => void;
  overrideExpression?: AvatarExpression;
}

export const AvatarCompanionView: React.FC<AvatarCompanionViewProps> = ({
  contact,
  onClose,
  onOpenCustomizer,
  overrideExpression,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CompanionScene | null>(null);

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new CompanionScene(mountRef.current, contact.avatarConfig);
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
  }, [contact.id]);

  // Update avatar configuration when contact config changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateConfig(contact.avatarConfig);
    }
  }, [contact.avatarConfig]);

  // Handle external emotion overrides (e.g. from chat messages or buttons)
  useEffect(() => {
    if (sceneRef.current && overrideExpression && overrideExpression !== 'idle') {
      sceneRef.current.setExpression(overrideExpression);
    }
  }, [overrideExpression]);

  const handleEmote = (exp: AvatarExpression) => {
    if (sceneRef.current) {
      sceneRef.current.setExpression(exp);
      setTimeout(() => {
        sceneRef.current?.setExpression('idle');
      }, 3500);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111b21] border-l border-[#222e35] select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] border-b border-[#222e35] z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#25d366]" />
          <span className="text-sm font-semibold text-[#e9edef] tracking-wide">3D Avatar Companion</span>
        </div>
        <div className="flex items-center space-x-2">
          {onOpenCustomizer && (
            <button
              onClick={onOpenCustomizer}
              className="px-2.5 py-1 text-xs font-medium text-[#25d366] bg-[#25d366]/10 hover:bg-[#25d366]/20 rounded-full transition flex items-center gap-1 cursor-pointer"
              title="Customize 3D Avatar"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21] rounded-full transition cursor-pointer"
              title="Close Companion"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative flex-1 w-full h-full min-h-[220px] bg-gradient-to-b from-[#111b21] to-[#0c1317]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Subtle helper hint */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-[#111b21]/80 border border-[#222e35] text-[11px] text-[#8696a0] flex items-center gap-1.5 shadow-sm">
          <span>Drag to rotate • Click avatar to wave</span>
        </div>

        {/* Live Audio talking indicator when speaking */}
        {overrideExpression === 'talking' && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#25d366]/20 border border-[#25d366]/40 text-[#25d366] text-xs flex items-center gap-1.5 animate-pulse">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {/* Interactive Emote Actions Dock (Collapsible Bottom Dock adhering to Three.js design) */}
      <div className="p-3 bg-[#202c33] border-t border-[#222e35] z-10">
        <div className="text-[11px] font-medium text-[#8696a0] uppercase tracking-wider mb-2 text-center">
          Interactive 3D Gestures
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => handleEmote('waving')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] transition cursor-pointer border border-[#2a3942]"
            title="Wave"
          >
            <Hand className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Wave</span>
          </button>
          <button
            onClick={() => handleEmote('happy')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] transition cursor-pointer border border-[#2a3942]"
            title="Happy"
          >
            <Smile className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Happy</span>
          </button>
          <button
            onClick={() => handleEmote('dance')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] transition cursor-pointer border border-[#2a3942]"
            title="Dance"
          >
            <PartyPopper className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Dance</span>
          </button>
          <button
            onClick={() => handleEmote('thinking')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] transition cursor-pointer border border-[#2a3942]"
            title="Think"
          >
            <Brain className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Think</span>
          </button>
          <button
            onClick={() => handleEmote('idle')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 hover:text-[#25d366] text-[#e9edef] transition cursor-pointer border border-[#2a3942]"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
