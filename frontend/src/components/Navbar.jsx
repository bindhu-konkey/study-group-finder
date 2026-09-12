import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Compass,
  FolderHeart,
  Calendar,
  Plus,
  LogOut,
  LogIn,
  ChevronDown,
  User as UserIcon,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onCreateGroupClick,
  onAuthClick,
  onProfileClick,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'my-groups', label: 'My Groups', icon: FolderHeart, authOnly: true },
    { id: 'calendar', label: 'Calendar', icon: Calendar, authOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#161B22]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Logo */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0056D6] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">
              Study Group Finder
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700">
          {navLinks
            .filter((link) => !link.authOnly || isAuthenticated)
            .map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#161B22] text-gray-900 dark:text-white shadow-sm font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </button>
              );
            })}
        </nav>

        {/* Right Side: Actions, Notifications & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Prominent Primary Button: + Create New Group */}
          <button
            onClick={onCreateGroupClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create New Group</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* In-App Notifications Bell */}
          {isAuthenticated && (
            <NotificationDropdown onNavigate={(link) => setActiveTab('calendar')} />
          )}


          {/* User Profile Avatar / Menu */}
          {isAuthenticated ? (
            <div className="relative pl-1 sm:pl-2 border-l border-gray-200 dark:border-gray-800" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                title="Account Options"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#0056D6] dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-gray-800 dark:text-gray-200">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:inline" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onProfileClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onProfileClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    <span>Settings</span>
                  </button>

                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
