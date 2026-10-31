import React, { useEffect, useRef, useState } from 'react';
import { SpatialLoungeScene } from '../3d/SpatialLoungeScene';
import { useChat } from '../context/ChatContext';
import { Contact, AvatarExpression } from '../types/chat';
import { Users, Send, MessageSquare, Hand, Sparkles, Smile, ArrowLeft, Rotate3d, PartyPopper } from 'lucide-react';

export const SpatialLoungeView: React.FC = () => {
  const { contacts, myAvatarConfig, setActiveContact, setActiveView, sendMessage, activeContact } = useChat();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SpatialLoungeScene | null>(null);
  const fallbackContact = contacts.find((c) => !c.isGroup) || contacts[0];
  const [selectedLoungeContact, setSelectedLoungeContact] = useState<Contact>(
    activeContact && !activeContact.isGroup ? activeContact : fallbackContact
  );
  const [roomInput, setRoomInput] = useState('');

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new SpatialLoungeScene(mountRef.current, {
      contacts,
      userConfig: myAvatarConfig,
      onSelectContact: (contact) => {
        setSelectedLoungeContact(contact);
        setActiveContact(contact);
      },
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
  }, [contacts, myAvatarConfig]);

  const handleBroadcastMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomInput.trim()) return;

    // Show message bubble over current selected avatar or active avatar
    if (sceneRef.current) {
      sceneRef.current.showMessageBubble(selectedLoungeContact.id, roomInput.trim());
    }

    // Also send in chat context
    sendMessage(roomInput.trim(), 'talking');
    setRoomInput('');
  };

  const handleTriggerRoomEmote = (emote: AvatarExpression) => {
    if (sceneRef.current && selectedLoungeContact) {
      sceneRef.current.triggerEmote(selectedLoungeContact.id, emote);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0b141a] overflow-hidden select-none">
      {/* Top Lounge Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#202c33]/90 backdrop-blur-md border-b border-[#222e35] z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('chats')}
            className="p-1.5 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21] rounded-full transition cursor-pointer"
            title="Back to OP HAIDER Chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#25d366]/20 flex items-center justify-center text-[#25d366]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#e9edef] flex items-center gap-2">
                <span>3D Spatial Lounge</span>
                <span className="px-2 py-0.5 rounded-full bg-[#25d366]/20 text-[#25d366] text-[10px] font-bold tracking-wider uppercase">
                  Live Hologram
                </span>
              </div>
              <div className="text-xs text-[#8696a0]">
                {contacts.length + 1} Avatars in spatial circle • Drag to orbit & click to converse
              </div>
            </div>
          </div>
        </div>

        {/* Selected Contact Card */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111b21] border border-[#2a3942] text-xs text-[#8696a0]">
            <Rotate3d className="w-3.5 h-3.5 text-[#25d366]" />
            <span>Target: <strong className="text-[#e9edef]">{selectedLoungeContact.name}</strong></span>
          </div>
          <button
            onClick={() => setActiveView('chats')}
            className="px-3.5 py-1.5 bg-[#00a884] hover:bg-[#029070] text-[#111b21] font-semibold text-xs rounded-full shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Chat</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Orbit Helper Badge */}
        <div className="absolute top-4 left-6 pointer-events-none px-3.5 py-1.5 rounded-full bg-[#111b21]/80 backdrop-blur border border-[#222e35] text-xs text-[#8696a0] flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-[#25d366]" />
          <span>Click any 3D avatar to interact • Drag with mouse to orbit room</span>
        </div>

        {/* Floating Quick Emote Bar for Selected Avatar */}
        <div className="absolute top-4 right-6 flex items-center gap-1.5 p-1.5 rounded-full bg-[#111b21]/90 backdrop-blur border border-[#2a3942] shadow-xl">
          <button
            onClick={() => handleTriggerRoomEmote('waving')}
            className="p-2 text-[#e9edef] hover:text-[#25d366] hover:bg-[#202c33] rounded-full transition cursor-pointer"
            title="Make avatar wave"
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTriggerRoomEmote('happy')}
            className="p-2 text-[#e9edef] hover:text-[#25d366] hover:bg-[#202c33] rounded-full transition cursor-pointer"
            title="Make avatar smile"
          >
            <Smile className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTriggerRoomEmote('dance')}
            className="p-2 text-[#e9edef] hover:text-[#25d366] hover:bg-[#202c33] rounded-full transition cursor-pointer"
            title="Make avatar dance"
          >
            <PartyPopper className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Room Broadcast Bar (Collapsible / Non-occluding per Three.js guidelines) */}
      <div className="p-4 bg-[#202c33]/90 backdrop-blur border-t border-[#222e35] z-10">
        <form onSubmit={handleBroadcastMessage} className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder={`Send speech bubble to 3D Lounge (Speaking to ${selectedLoungeContact.name})...`}
              className="w-full px-4 py-2.5 rounded-xl bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] text-sm focus:outline-none focus:ring-1 focus:ring-[#25d366] border border-transparent focus:border-[#25d366]"
            />
          </div>
          <button
            type="submit"
            disabled={!roomInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] disabled:opacity-40 disabled:hover:bg-[#25d366] text-[#111b21] font-semibold text-sm transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast 3D</span>
          </button>
        </form>
      </div>
    </div>
  );
};
