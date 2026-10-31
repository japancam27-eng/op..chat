import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Story } from '../types/chat';
import { X, ChevronLeft, ChevronRight, Sparkles, Send } from 'lucide-react';

interface StatusViewerModalProps {
  initialStoryId: string;
  onClose: () => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  initialStoryId,
  onClose,
}) => {
  const { stories, markStoryViewed, sendMessage } = useChat();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = stories.findIndex((s) => s.id === initialStoryId);
    return idx !== -1 ? idx : 0;
  });
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (currentStory) {
      markStoryViewed(currentStory.id);
    }
  }, [currentStory, markStoryViewed]);

  // Story progress timer (5 seconds per story)
  useEffect(() => {
    setProgress(0);
    const step = 50;
    const total = 5000;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + (step / total) * 100;
      });
    }, step);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((c) => c + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessage(`Replying to story: "${replyText.trim()}"`);
    setReplyText('');
    onClose();
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none p-4">
      <div className="relative w-full max-w-md h-[720px] max-h-[95vh] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
        {/* Story Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${currentStory.colorGradient} flex items-center justify-center p-8 text-center`}
        >
          <div className="relative z-10 max-w-xs space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-xl">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-white leading-relaxed drop-shadow-md">
              {currentStory.caption}
            </p>
          </div>
        </div>

        {/* Top Header: Progress Bars & User Info */}
        <div className="relative z-20 p-4 space-y-3 bg-gradient-to-b from-black/60 to-transparent">
          {/* Progress segments */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white font-bold text-sm">
                {currentStory.contactName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-white drop-shadow">
                  {currentStory.contactName}
                </div>
                <div className="text-xs text-white/70">{currentStory.timestamp}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Left & Right tap zones for desktop navigation */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition z-20 cursor-pointer"
          title="Previous Story"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition z-20 cursor-pointer"
          title="Next Story"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Reply Bar */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to story..."
              className="flex-1 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white placeholder-white/60 text-sm focus:outline-none focus:ring-1 focus:ring-white border border-white/20"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2.5 rounded-full bg-[#25d366] text-[#111b21] disabled:opacity-40 font-bold transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
