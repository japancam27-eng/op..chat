import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CompanionScene } from '../3d/CompanionScene';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, Sparkles } from 'lucide-react';

export const CallModal: React.FC = () => {
  const { callState, endCall, toggleMute, toggleVideo } = useChat();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CompanionScene | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!callState.isActive || !callState.contact || !mountRef.current) return;

    // Build 3D Avatar in talking mode
    const scene = new CompanionScene(mountRef.current, {
      ...callState.contact.avatarConfig,
      expression: 'talking',
    });
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
  }, [callState.isActive, callState.contact]);

  // Duration timer
  useEffect(() => {
    if (callState.status !== 'connected') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState.status]);

  if (!callState.isActive || !callState.contact) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl select-none p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[640px] max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#111b21] via-[#0b141a] to-[#060b0e] border border-[#2a3942] shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 z-10">
          <div>
            <h2 className="text-xl font-bold text-[#e9edef] flex items-center gap-2">
              <span>{callState.contact.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#25d366]/20 text-[#25d366] text-[10px] uppercase font-bold tracking-wider">
                {callState.type === 'video' ? '3D Video' : '3D Voice'}
              </span>
            </h2>
            <div className="text-xs text-[#25d366] font-medium mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
              <span>
                {callState.status === 'connecting'
                  ? 'Connecting...'
                  : `In Call • ${formatDuration(callDuration)}`}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-full bg-[#202c33] text-[#8696a0]">
            <Sparkles className="w-5 h-5 text-[#25d366]" />
          </div>
        </div>

        {/* 3D WebGL Avatar Call Stage */}
        <div className="relative flex-1 w-full h-full">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Self-preview thumbnail (if video call) */}
          {callState.type === 'video' && !callState.isVideoOff && (
            <div className="absolute top-4 right-4 w-24 h-32 rounded-2xl bg-[#202c33] border-2 border-[#25d366]/50 shadow-xl overflow-hidden flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-sm shadow">
                You
              </div>
              <span className="text-[10px] text-[#e9edef] mt-2 font-medium">Camera Active</span>
            </div>
          )}

          {/* Speaking Audio wave indication */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#111b21]/80 backdrop-blur border border-[#222e35] text-xs text-[#25d366] flex items-center gap-2 shadow-lg">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>3D Spatial Audio Stream Active</span>
          </div>
        </div>

        {/* Bottom Call Controls */}
        <div className="p-6 bg-[#182229]/90 backdrop-blur border-t border-[#222e35] flex items-center justify-center space-x-6 z-10">
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition cursor-pointer shadow-lg ${
              callState.isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef]'
            }`}
            title={callState.isMuted ? 'Unmute' : 'Mute'}
          >
            {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Video toggle */}
          {callState.type === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition cursor-pointer shadow-lg ${
                callState.isVideoOff
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef]'
              }`}
              title={callState.isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {callState.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transition cursor-pointer transform hover:scale-105 active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
