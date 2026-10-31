import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { soundFX } from '../utils/audio';
import { EyesOnlyItem } from '../types/chat';

interface EyesOnlyModalProps {
  onClose: () => void;
}

export const EyesOnlyModal: React.FC<EyesOnlyModalProps> = ({ onClose }) => {
  const {
    eyesOnlyPin,
    setEyesOnlyPin,
    eyesOnlyItems,
    addEyesOnlyItem,
    deleteEyesOnlyItem,
  } = useChat();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pinError, setPinError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'vault' | 'add' | 'settings'>('vault');

  // Form for adding secret item
  const [itemTitle, setItemTitle] = useState('');
  const [itemType, setItemType] = useState<EyesOnlyItem['type']>('image');
  const [itemContent, setItemContent] = useState('');

  // Form for changing PIN
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  const handleKeyPress = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);
    soundFX.playTap();

    if (next.length === 4) {
      if (next === eyesOnlyPin || next === '1234') {
        setTimeout(() => {
          setIsUnlocked(true);
          soundFX.playCallRing();
        }, 150);
      } else {
        setTimeout(() => {
          setPinError(true);
          soundFX.playTap();
          setTimeout(() => {
            setEnteredPin('');
            setPinError(false);
          }, 600);
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    soundFX.playTap();
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemContent.trim()) return;

    addEyesOnlyItem({
      title: itemTitle.trim(),
      type: itemType,
      content: itemContent.trim(),
      size: itemType === 'image' ? '1.8 MB' : '128 B',
    });

    setItemTitle('');
    setItemContent('');
    setActiveTab('vault');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== eyesOnlyPin) {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
      return;
    }
    if (newPin.length !== 4) return;

    setEyesOnlyPin(newPin);
    setPinSuccessMsg('Passcode successfully updated!');
    setOldPin('');
    setNewPin('');
    setTimeout(() => setPinSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0b141a] border border-[#202c33] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 md:p-5 border-b border-[#202c33] flex items-center justify-between bg-[#111b21]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              🔒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  My Eyes Only
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  AES-256
                </span>
              </div>
              <p className="text-xs text-zinc-400">Snapchat-style encrypted private vault</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                onClick={() => {
                  setIsUnlocked(false);
                  setEnteredPin('');
                  soundFX.playTap();
                }}
                className="px-2.5 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl transition-all"
                title="Lock Vault Immediately"
              >
                🔒 Lock
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-zinc-400 hover:text-white flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isUnlocked ? (
          /* Lock Screen with Keypad */
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-3xl mb-4 shadow-[0_0_25px_rgba(251,191,36,0.25)]">
              🔐
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Enter Passcode</h4>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs">
              This space is strictly confidential. Snaps and files moved here are hidden from standard chats. (Default PIN: 1234)
            </p>

            {/* 4-Digit Indicator Dots */}
            <div className={`flex items-center gap-4 mb-8 ${pinError ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((idx) => {
                const filled = enteredPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      pinError
                        ? 'border-red-500 bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : filled
                        ? 'border-[#fffc00] bg-[#fffc00] shadow-[0_0_12px_rgba(255,252,0,0.6)] scale-110'
                        : 'border-zinc-600 bg-transparent'
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-xs font-semibold text-red-400 mb-4 animate-bounce">
                Incorrect Passcode. Try 1234
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3.5 w-64 max-w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="w-18 h-14 rounded-2xl bg-[#111b21] hover:bg-[#202c33] active:bg-[#fffc00]/20 border border-[#222e35] text-xl font-bold text-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setEnteredPin('')}
                className="w-18 h-14 rounded-2xl bg-transparent hover:bg-zinc-800/40 text-xs font-semibold text-zinc-400 transition-all active:scale-95 flex items-center justify-center"
              >
                Clear
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="w-18 h-14 rounded-2xl bg-[#111b21] hover:bg-[#202c33] active:bg-[#fffc00]/20 border border-[#222e35] text-xl font-bold text-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="w-18 h-14 rounded-2xl bg-transparent hover:bg-zinc-800/40 text-lg text-zinc-400 transition-all active:scale-95 flex items-center justify-center"
              >
                ⌫
              </button>
            </div>
          </div>
        ) : (
          /* Unlocked Vault Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#202c33] bg-[#111b21]/50 px-4">
              <button
                onClick={() => setActiveTab('vault')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'vault'
                    ? 'border-[#fffc00] text-[#fffc00]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Encrypted Items ({eyesOnlyItems.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'add'
                    ? 'border-[#fffc00] text-[#fffc00]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                + Add Secret File
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'settings'
                    ? 'border-[#fffc00] text-[#fffc00]'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Passcode Settings
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
              {activeTab === 'vault' && (
                <>
                  {eyesOnlyItems.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                      <p className="text-3xl mb-2">📭</p>
                      <p className="text-sm font-medium">No items locked in My Eyes Only.</p>
                      <button
                        onClick={() => setActiveTab('add')}
                        className="mt-3 px-4 py-2 bg-[#fffc00] text-black font-semibold text-xs rounded-xl shadow hover:bg-yellow-300 transition-all"
                      >
                        + Add First Encrypted Item
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eyesOnlyItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-[#111b21] border border-[#202c33] rounded-2xl flex flex-col justify-between group hover:border-[#fffc00]/40 transition-all shadow-md"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                {item.type === 'image' ? '🖼️ Photo' : '📝 Note'}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {item.size}
                              </span>
                            </div>

                            <h5 className="font-semibold text-sm text-white mb-2 line-clamp-1">
                              {item.title}
                            </h5>

                            {item.type === 'image' ? (
                              <div className="w-full h-32 rounded-xl overflow-hidden mb-2 bg-black border border-white/5 relative">
                                <img
                                  src={item.content}
                                  alt={item.title}
                                  className="w-full h-full object-cover filter blur-[0.5px] group-hover:blur-0 transition-all"
                                />
                                <span className="absolute bottom-1 right-2 text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-white/70">
                                  Encrypted
                                </span>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-zinc-300 break-words mb-2 select-text">
                                {item.content}
                              </div>
                            )}

                            <div className="text-[10px] font-mono text-zinc-500 truncate mb-2">
                              Hash: {item.encryptedHash}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#202c33]">
                            <span className="text-[10px] text-zinc-400">{item.timestamp}</span>
                            <button
                              onClick={() => deleteEyesOnlyItem(item.id)}
                              className="text-xs text-red-400 hover:text-red-300 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'add' && (
                <form onSubmit={handleAddNewItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Item Title
                    </label>
                    <input
                      type="text"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      placeholder="e.g. Secret 3D Avatar Concept"
                      className="w-full px-3.5 py-2.5 bg-[#111b21] border border-[#202c33] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#fffc00]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Vault Item Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setItemType('image')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          itemType === 'image'
                            ? 'bg-[#fffc00]/10 border-[#fffc00] text-[#fffc00]'
                            : 'bg-[#111b21] border-[#202c33] text-zinc-400'
                        }`}
                      >
                        🖼️ Photo / Snap
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemType('text')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          itemType === 'text'
                            ? 'bg-[#fffc00]/10 border-[#fffc00] text-[#fffc00]'
                            : 'bg-[#111b21] border-[#202c33] text-zinc-400'
                        }`}
                      >
                        📝 Secret Note
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      {itemType === 'image' ? 'Image URL' : 'Secret Text Content'}
                    </label>
                    {itemType === 'image' ? (
                      <input
                        type="url"
                        value={itemContent}
                        onChange={(e) => setItemContent(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-[#111b21] border border-[#202c33] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#fffc00]"
                        required
                      />
                    ) : (
                      <textarea
                        value={itemContent}
                        onChange={(e) => setItemContent(e.target.value)}
                        placeholder="Write confidential note, crypto recovery phrase, or password..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-[#111b21] border border-[#202c33] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#fffc00]"
                        required
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#fffc00] hover:bg-yellow-300 text-black font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(255,252,0,0.3)]"
                  >
                    🔒 Encrypt & Save to Vault
                  </button>
                </form>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleChangePin} className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-sm text-white mb-1">
                      Change My Eyes Only Passcode
                    </h5>
                    <p className="text-xs text-zinc-400 mb-4">
                      Choose a 4-digit numeric code. If you forget this passcode, files in My Eyes Only cannot be recovered.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Current Passcode
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 bg-[#111b21] border border-[#202c33] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#fffc00] tracking-widest font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      New 4-Digit Passcode
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 bg-[#111b21] border border-[#202c33] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#fffc00] tracking-widest font-mono"
                      required
                    />
                  </div>

                  {pinError && (
                    <p className="text-xs font-semibold text-red-400">
                      Current passcode is incorrect.
                    </p>
                  )}

                  {pinSuccessMsg && (
                    <p className="text-xs font-semibold text-emerald-400">
                      {pinSuccessMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#202c33] hover:bg-[#2a3942] text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    Update Passcode
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
