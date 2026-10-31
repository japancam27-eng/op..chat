/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { AvatarCompanionView } from './components/AvatarCompanionView';
import { SpatialLoungeView } from './components/SpatialLoungeView';
import { CallModal } from './components/CallModal';
import { StatusViewerModal } from './components/StatusViewerModal';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { NewChatModal } from './components/NewChatModal';
import { NewGroupModal } from './components/NewGroupModal';
import { LoginScreen } from './components/LoginScreen';
import { LandingHero } from './components/LandingHero';

const OPHaiderApp: React.FC = () => {
  const {
    currentUser,
    activeContact,
    activeView,
    is3DCompanionOpen,
    setIs3DCompanionOpen,
    currentEmote,
    login,
  } = useChat();

  const [showLanding, setShowLanding] = useState<boolean>(false);

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);

  // If user is not authenticated, strictly show the Login & Sign Up screen first
  if (!currentUser || !currentUser.isLoggedIn) {
    if (showLanding) {
      return (
        <LandingHero
          onLaunchApp={() => setShowLanding(false)}
          onOpenAuth={() => setShowLanding(false)}
        />
      );
    }
    return (
      <LoginScreen
        initialTab="signup"
        onViewShowcase={() => setShowLanding(true)}
      />
    );
  }

  // If user is logged in and specifically chose to view the 3D Showcase
  if (showLanding) {
    return (
      <LandingHero
        onLaunchApp={() => setShowLanding(false)}
        onOpenAuth={() => setShowLanding(false)}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#071318] text-[#e9edef] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* OP HAIDER 3D Core Viewport */}
      {activeView === 'spatialLounge' ? (
        <SpatialLoungeView />
      ) : (
        <div className="flex-1 w-full h-full flex overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            onOpenNewChat={() => setIsNewChatOpen(true)}
            onOpenNewGroup={() => setIsNewGroupOpen(true)}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenStatusViewer={(id) => setViewingStoryId(id)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenLanding={() => setShowLanding(true)}
          />

          {/* Main Chat Area */}
          <ChatArea onOpenCustomizer={() => setIsCustomizerOpen(true)} />

          {/* Right 3D Avatar Companion Panel */}
          {is3DCompanionOpen && (
            <>
              {/* Desktop view */}
              <div className="hidden lg:flex w-72 xl:w-80 h-full flex-shrink-0 animate-in slide-in-from-right-4 duration-200">
                <AvatarCompanionView
                  contact={activeContact}
                  onClose={() => setIs3DCompanionOpen(false)}
                  onOpenCustomizer={() => setIsCustomizerOpen(true)}
                  overrideExpression={currentEmote}
                />
              </div>

              {/* Mobile / Tablet slide-over drawer */}
              <div className="lg:hidden fixed inset-y-0 right-0 z-40 w-80 max-w-[90vw] h-full shadow-2xl animate-in slide-in-from-right duration-200">
                <AvatarCompanionView
                  contact={activeContact}
                  onClose={() => setIs3DCompanionOpen(false)}
                  onOpenCustomizer={() => setIsCustomizerOpen(true)}
                  overrideExpression={currentEmote}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* 3D Audio & Video Call Modal */}
      <CallModal />

      {/* Status Viewer Modal */}
      {viewingStoryId && (
        <StatusViewerModal
          initialStoryId={viewingStoryId}
          onClose={() => setViewingStoryId(null)}
        />
      )}

      {/* 3D Avatar Customizer Modal */}
      {isCustomizerOpen && (
        <AvatarCustomizerModal onClose={() => setIsCustomizerOpen(false)} />
      )}

      {/* New Chat Modal */}
      {isNewChatOpen && (
        <NewChatModal onClose={() => setIsNewChatOpen(false)} />
      )}

      {/* New Group Modal */}
      {isNewGroupOpen && (
        <NewGroupModal onClose={() => setIsNewGroupOpen(false)} />
      )}

      {/* 3D Log In & Sign Up Modal */}
      {isAuthModalOpen && (
        <LoginScreen onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <OPHaiderApp />
    </ChatProvider>
  );
}
