import React from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ScimDashboard } from './components/ScimDashboard';
import { ThemeProvider } from './components/ThemeProvider';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="scim-demo-theme">
      <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
        
        {/* Left: Chat Interface */}
        <div className="w-full md:w-4/5 h-full relative z-0">
          <ChatInterface apiKey="" />
        </div>

        {/* Right: SCIM Dashboard (Sidebar) */}
        <div className="hidden md:block w-1/5 h-full z-10 border-l border-border bg-card">
          <ScimDashboard />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;