'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import { LayoutDashboard, CheckSquare, Repeat, Bot, MoreHorizontal, X } from 'lucide-react';

interface MobileNavProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export function MobileNav({ isDrawerOpen, onCloseDrawer }: MobileNavProps) {
  const pathname = usePathname();

  // Primary destinations for fixed mobile bottom bar
  const primaryDestinations = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Tasks', href: '/tasks', icon: CheckSquare },
    { title: 'Habits', href: '/habits', icon: Repeat },
    { title: 'AI Coach', href: '/ai-coach', icon: Bot },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed right-0 bottom-0 left-0 z-30 flex h-16 items-center justify-around border-t border-neutral-800 bg-neutral-950/95 px-2 backdrop-blur-lg lg:hidden">
        {primaryDestinations.map((item) => {
          const ItemIcon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 px-3 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'font-semibold text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ItemIcon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          onClick={onCloseDrawer}
          className={`flex flex-col items-center justify-center space-y-1 px-3 py-1 text-[10px] font-medium transition-colors ${
            isDrawerOpen ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
          }`}
          aria-label="More navigation options"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-out Navigation Drawer for Secondary Modules */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseDrawer}
          />

          {/* Drawer Content */}
          <div className="relative z-50 flex h-full w-4/5 max-w-xs flex-col overflow-y-auto border-r border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <span className="text-lg font-extrabold tracking-tight text-white">
                LifeOS Modules
              </span>
              <button
                onClick={onCloseDrawer}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                aria-label="Close navigation drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 py-4">
              {navigationConfig.groups.map((group) => (
                <div key={group.groupName} className="space-y-1">
                  <h3 className="px-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                    {group.groupName}
                  </h3>
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onCloseDrawer}
                          className={`flex items-center space-x-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-neutral-800 font-semibold text-white'
                              : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                          }`}
                        >
                          <ItemIcon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom settings link in drawer */}
            <div className="border-t border-neutral-800 pt-4">
              <Link
                href="/settings"
                onClick={onCloseDrawer}
                className="flex items-center space-x-3 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white"
              >
                <navigationConfig.settings.icon className="h-4 w-4 shrink-0" />
                <span>{navigationConfig.settings.title}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
