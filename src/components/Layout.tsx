import React from 'react';
import Sidebar from './Sidebar';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const handleCreateNewSearch = async () => {
      navigate(`/shortlist`);
      };

  return (
    <div className="flex h-screen bg-background relative">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>

      {/* Floating Button */}
      <button
        onClick={handleCreateNewSearch}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg transition-colors glow-primary"
      >
        <Plus className="w-4 h-4" />
        <span>Create New Search</span>
      </button>
    </div>
  );
};

export default Layout;
