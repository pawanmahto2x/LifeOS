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
      <nav className="border-border/80 bg-background/95 fixed right-0 bottom-0 left-0 z-30 flex h-16 items-center justify-around border-t px-2 backdrop-blur-lg transition-colors lg:hidden">
        {primaryDestinations.map((item) => {
          const ItemIcon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 px-3 py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
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
            isDrawerOpen
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseDrawer}
          />

          {/* Drawer Content */}
          <div className="border-border bg-sidebar text-sidebar-foreground relative z-50 flex h-full w-4/5 max-w-xs flex-col overflow-y-auto border-r p-4 shadow-2xl">
            <div className="border-sidebar-border flex items-center justify-between border-b pb-4">
              <span className="text-sidebar-foreground text-base font-bold tracking-tight">
                LifeOS Modules
              </span>
              <button
                onClick={onCloseDrawer}
                className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg p-1.5"
                aria-label="Close navigation drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 py-4">
              {navigationConfig.groups.map((group) => (
                <div key={group.groupName} className="space-y-1">
                  <h3 className="text-muted-foreground/80 px-2 text-[10px] font-semibold tracking-wider uppercase">
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
                          className={`flex items-center space-x-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                          }`}
                        >
                          <ItemIcon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="bg-muted text-muted-foreground ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
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
            <div className="border-sidebar-border border-t pt-4">
              <Link
                href="/settings"
                onClick={onCloseDrawer}
                className="text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground flex items-center space-x-3 rounded-xl px-2.5 py-2 text-xs font-medium"
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
