import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Plus, Trash2, BarChart2 } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface PollCreatorModalProps {
  onClose: () => void;
}

export const PollCreatorModal: React.FC<PollCreatorModalProps> = ({ onClose }) => {
  const { createPoll } = useChat();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);

  const handleAddOption = () => {
    if (options.length >= 10) return;
    soundFX.playTap();
    setOptions((prev) => [...prev, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    soundFX.playTap();
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) return;

    createPoll(question.trim(), cleanOptions, allowMultiple);
    onClose();
  };

  const isValid = question.trim().length > 0 && options.filter((o) => o.trim().length > 0).length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222e35] bg-[#0b141a]">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#25d366]" />
            <h3 className="text-base font-bold text-[#e9edef]">Create Poll</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8696a0]">Question</label>
            <input
              type="text"
              required
              autoFocus
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#8696a0]">Options (min 2)</label>
            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      required={idx < 2}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition"
                    />
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-[#8696a0] hover:text-red-400 hover:bg-[#202c33] rounded-lg transition"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1.5 text-xs text-[#25d366] hover:text-[#00a884] font-medium pt-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add option</span>
              </button>
            )}
          </div>

          {/* Multiple Answers Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#222e35]">
            <span className="text-xs text-[#e9edef] font-medium">Allow multiple answers</span>
            <button
              type="button"
              onClick={() => {
                soundFX.playTap();
                setAllowMultiple(!allowMultiple);
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                allowMultiple ? 'bg-[#25d366]' : 'bg-[#202c33]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  allowMultiple ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-[#00a884] hover:bg-[#02906f] text-white shadow-lg cursor-pointer'
                  : 'bg-[#202c33] text-[#8696a0] cursor-not-allowed opacity-60'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Send Poll</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
