import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Search,
  Heart,
  User,
  CheckSquare,
  UserCheck,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  FileText,
  Star
} from 'lucide-react';


const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Heart, label: 'Saved Profiles', path: '/saved-profiles' },
    { icon: UserCheck, label: 'Joinees', path: '/joinees' },
    { icon: User, label: 'Account', path: '/account' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'GET',
        credentials: 'include', // send session cookie
      });

      if (response.redirected) {
        window.location.href = response.url; // follow redirect to /login
      } else {
        window.location.href = '/login'; // fallback if no redirect
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center glow-primary">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">RecruiterAI</h1>
            <p className="text-xs text-muted-foreground">HR Automation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 glow-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-primary' : 'group-hover:text-primary'
                } transition-colors`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
