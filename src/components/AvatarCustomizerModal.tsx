import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { CompanionScene } from '../3d/CompanionScene';
import { AvatarConfig, AvatarExpression } from '../types/chat';
import { soundFX } from '../utils/audio';
import {
  Sparkles,
  X,
  Check,
  Hand,
  Smile,
  PartyPopper,
  Brain,
  RotateCcw,
  Palette,
  Shirt,
  Glasses,
} from 'lucide-react';

interface AvatarCustomizerModalProps {
  onClose: () => void;
}

const SKIN_COLORS = [
  { label: 'Warm Peach', value: '#f6d1b1' },
  { label: 'Honey Almond', value: '#ebd0be' },
  { label: 'Golden Tan', value: '#d79e76' },
  { label: 'Rich Bronze', value: '#c68642' },
  { label: 'Deep Espresso', value: '#8d5524' },
];

const HAIR_STYLES: Array<{ label: string; value: AvatarConfig['hairStyle'] }> = [
  { label: 'Classic Part', value: 'classic' },
  { label: 'Curls', value: 'curly' },
  { label: 'Afro Puff', value: 'afro' },
  { label: 'Bob Cut', value: 'bob' },
  { label: 'Cyberpunk', value: 'cyberpunk' },
  { label: 'Sleek Short', value: 'sleek' },
];

const HAIR_COLORS = [
  { label: 'Jet Black', value: '#18181b' },
  { label: 'Dark Brunette', value: '#3b2f2f' },
  { label: 'Golden Blonde', value: '#e2ba7d' },
  { label: 'Neon Pink', value: '#ec4899' },
  { label: 'Electric Blue', value: '#06b6d4' },
  { label: 'Auburn Red', value: '#991b1b' },
];

const OUTFIT_STYLES: Array<{ label: string; value: AvatarConfig['outfitStyle'] }> = [
  { label: 'OP Haider Hoodie', value: 'hoodie' },
  { label: 'Executive Suit', value: 'suit' },
  { label: 'Street Casual', value: 'casual' },
  { label: 'Cyber Armor', value: 'cyber' },
];

const OUTFIT_COLORS = [
  { label: 'Emerald Neon', value: '#00a884' },
  { label: 'Royal Blue', value: '#2563eb' },
  { label: 'Cyber Violet', value: '#7c3aed' },
  { label: 'Warm Sunset', value: '#ea580c' },
  { label: 'Stealth Black', value: '#1e293b' },
  { label: 'Rose Pink', value: '#e11d48' },
];

const ACCESSORIES: Array<{ label: string; value: AvatarConfig['accessory'] }> = [
  { label: 'None', value: 'none' },
  { label: 'Beats Headphones', value: 'headphones' },
  { label: 'Cyber Shades', value: 'glasses' },
  { label: 'Baseball Cap', value: 'cap' },
  { label: 'Gold Chain', value: 'gold_chain' },
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({ onClose }) => {
  const { myAvatarConfig, updateMyAvatarConfig } = useChat();
  const [config, setConfig] = useState<AvatarConfig>({ ...myAvatarConfig });
  const [activeTab, setActiveTab] = useState<'hair' | 'outfit' | 'skin' | 'accessories'>('hair');

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CompanionScene | null>(null);

  // Initialize preview 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new CompanionScene(mountRef.current, config);
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

  // Sync scene with config changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateConfig(config);
    }
  }, [config]);

  const handleEmotePreview = (exp: AvatarExpression) => {
    soundFX.playTap();
    if (sceneRef.current) {
      sceneRef.current.setExpression(exp);
      setTimeout(() => {
        sceneRef.current?.setExpression('idle');
      }, 3000);
    }
  };

  const handleSave = () => {
    soundFX.playCallConnected();
    updateMyAvatarConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[680px] max-h-[92vh] flex flex-col md:flex-row rounded-3xl bg-[#111b21] border border-[#2a3942] shadow-2xl overflow-hidden">
        {/* Left Side: 3D Live Avatar Preview */}
        <div className="relative w-full md:w-1/2 h-64 md:h-full bg-gradient-to-b from-[#182229] via-[#111b21] to-[#0c1317] border-b md:border-b-0 md:border-r border-[#222e35] flex flex-col">
          <div className="p-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#25d366]" />
              <span className="text-sm font-bold text-[#e9edef]">3D Avatar Live Studio</span>
            </div>
            <span className="text-[11px] text-[#8696a0]">Drag to rotate</span>
          </div>

          <div className="relative flex-1 w-full h-full">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>

          {/* Test Emote Bar */}
          <div className="p-3 bg-[#202c33]/80 border-t border-[#222e35] flex items-center justify-center gap-2 z-10">
            <span className="text-[11px] text-[#8696a0] mr-1">Test Expression:</span>
            <button
              onClick={() => handleEmotePreview('waving')}
              className="p-1.5 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 text-[#e9edef] hover:text-[#25d366] transition cursor-pointer text-xs flex items-center gap-1"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Wave</span>
            </button>
            <button
              onClick={() => handleEmotePreview('happy')}
              className="p-1.5 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 text-[#e9edef] hover:text-[#25d366] transition cursor-pointer text-xs flex items-center gap-1"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Smile</span>
            </button>
            <button
              onClick={() => handleEmotePreview('dance')}
              className="p-1.5 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 text-[#e9edef] hover:text-[#25d366] transition cursor-pointer text-xs flex items-center gap-1"
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Dance</span>
            </button>
            <button
              onClick={() => handleEmotePreview('thinking')}
              className="p-1.5 rounded-lg bg-[#111b21] hover:bg-[#25d366]/20 text-[#e9edef] hover:text-[#25d366] transition cursor-pointer text-xs flex items-center gap-1"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Think</span>
            </button>
          </div>
        </div>

        {/* Right Side: Customization Controls */}
        <div className="w-full md:w-1/2 flex-1 flex flex-col bg-[#111b21]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#202c33] border-b border-[#222e35]">
            <h2 className="text-base font-bold text-[#e9edef]">Customize Avatar</h2>
            <button
              onClick={onClose}
              className="p-1 text-[#8696a0] hover:text-white rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex border-b border-[#222e35] bg-[#182229]">
            <button
              onClick={() => setActiveTab('hair')}
              className={`flex-1 py-3 text-xs font-semibold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'hair'
                  ? 'border-[#25d366] text-[#25d366]'
                  : 'border-transparent text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hair</span>
            </button>
            <button
              onClick={() => setActiveTab('outfit')}
              className={`flex-1 py-3 text-xs font-semibold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'outfit'
                  ? 'border-[#25d366] text-[#25d366]'
                  : 'border-transparent text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Outfit</span>
            </button>
            <button
              onClick={() => setActiveTab('skin')}
              className={`flex-1 py-3 text-xs font-semibold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'skin'
                  ? 'border-[#25d366] text-[#25d366]'
                  : 'border-transparent text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Skin</span>
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`flex-1 py-3 text-xs font-semibold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'accessories'
                  ? 'border-[#25d366] text-[#25d366]'
                  : 'border-transparent text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <Glasses className="w-3.5 h-3.5" />
              <span>Accessories</span>
            </button>
          </div>

          {/* Category Panels */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            {activeTab === 'hair' && (
              <>
                <div>
                  <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-2.5">
                    Hairstyle
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h.value}
                        onClick={() => setConfig((prev) => ({ ...prev, hairStyle: h.value }))}
                        className={`p-2.5 rounded-xl text-xs font-medium text-left transition cursor-pointer border ${
                          config.hairStyle === h.value
                            ? 'bg-[#00a884]/20 border-[#25d366] text-[#25d366]'
                            : 'bg-[#202c33] border-[#2a3942] text-[#e9edef] hover:border-[#8696a0]'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-2.5">
                    Hair Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setConfig((prev) => ({ ...prev, hairColor: c.value }))}
                        className={`w-9 h-9 rounded-full transition cursor-pointer relative shadow ${
                          config.hairColor === c.value ? 'ring-2 ring-offset-2 ring-[#25d366] ring-offset-[#111b21]' : ''
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'outfit' && (
              <>
                <div>
                  <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-2.5">
                    Clothing Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {OUTFIT_STYLES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setConfig((prev) => ({ ...prev, outfitStyle: s.value }))}
                        className={`p-2.5 rounded-xl text-xs font-medium text-left transition cursor-pointer border ${
                          config.outfitStyle === s.value
                            ? 'bg-[#00a884]/20 border-[#25d366] text-[#25d366]'
                            : 'bg-[#202c33] border-[#2a3942] text-[#e9edef] hover:border-[#8696a0]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-2.5">
                    Outfit Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {OUTFIT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setConfig((prev) => ({ ...prev, outfitColor: c.value }))}
                        className={`w-9 h-9 rounded-full transition cursor-pointer relative shadow ${
                          config.outfitColor === c.value ? 'ring-2 ring-offset-2 ring-[#25d366] ring-offset-[#111b21]' : ''
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'skin' && (
              <div>
                <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-2.5">
                  Skin Tone
                </label>
                <div className="flex flex-wrap gap-3">
                  {SKIN_COLORS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setConfig((prev) => ({ ...prev, skinColor: s.value }))}
                      className={`w-10 h-10 rounded-full transition cursor-pointer relative shadow ${
                        config.skinColor === s.value ? 'ring-2 ring-offset-2 ring-[#25d366] ring-offset-[#111b21]' : ''
                      }`}
                      style={{ backgroundColor: s.value }}
                      title={s.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'accessories' && (
              <div>
                <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider block mb-2.5">
                  Gear & Accessories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCESSORIES.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setConfig((prev) => ({ ...prev, accessory: a.value }))}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left transition cursor-pointer border ${
                        config.accessory === a.value
                          ? 'bg-[#00a884]/20 border-[#25d366] text-[#25d366]'
                          : 'bg-[#202c33] border-[#2a3942] text-[#e9edef] hover:border-[#8696a0]'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="p-4 bg-[#202c33] border-t border-[#222e35] flex items-center justify-between">
            <button
              onClick={() => setConfig({ ...myAvatarConfig })}
              className="px-4 py-2 text-xs font-medium text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-[#111b21] font-bold text-sm shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Save 3D Avatar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
