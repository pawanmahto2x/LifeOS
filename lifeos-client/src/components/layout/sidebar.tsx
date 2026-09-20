'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 z-30 hidden h-screen flex-col border-r transition-all duration-300 lg:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shadow-xs">
              L
            </div>
            <span className="text-sidebar-foreground text-base font-bold tracking-tight">
              LifeOS
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="bg-primary text-primary-foreground mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shadow-xs">
            L
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg p-1.5 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 scrollbar-thin space-y-6 overflow-y-auto px-3 py-4">
        {/* Dashboard Link */}
        <div>
          {(() => {
            const ItemIcon = navigationConfig.dashboard.icon;
            const isActive = pathname === navigationConfig.dashboard.href;
            return (
              <Link
                href={navigationConfig.dashboard.href}
                className={`flex items-center rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                title={isCollapsed ? navigationConfig.dashboard.title : undefined}
              >
                <ItemIcon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{navigationConfig.dashboard.title}</span>}
              </Link>
            );
          })()}
        </div>

        {/* Grouped Modules */}
        {navigationConfig.groups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            {!isCollapsed && (
              <h3 className="text-muted-foreground/80 px-3 text-[10px] font-semibold tracking-wider uppercase">
                {group.groupName}
              </h3>
            )}
            <div className="mt-1 space-y-0.5">
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                        : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                    } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <ItemIcon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                    {!isCollapsed && item.badge && (
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

      {/* Settings Link at Bottom */}
      <div className="border-sidebar-border border-t p-3">
        {(() => {
          const SettingsIcon = navigationConfig.settings.icon;
          const isActive = pathname.startsWith(navigationConfig.settings.href);
          return (
            <Link
              href={navigationConfig.settings.href}
              className={`flex items-center rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
              title={isCollapsed ? navigationConfig.settings.title : undefined}
            >
              <SettingsIcon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{navigationConfig.settings.title}</span>}
            </Link>
          );
        })()}
      </div>
    </aside>
  );
}
