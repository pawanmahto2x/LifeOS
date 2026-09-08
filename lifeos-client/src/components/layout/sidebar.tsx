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
      className={`sticky top-0 z-30 hidden h-screen flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-200 transition-all duration-300 lg:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-neutral-950">
              L
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">LifeOS</span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-neutral-950">
            L
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 scrollbar-thin scrollbar-thumb-neutral-800 space-y-6 overflow-y-auto px-3 py-4">
        {/* Dashboard Link */}
        <div>
          {(() => {
            const ItemIcon = navigationConfig.dashboard.icon;
            const isActive = pathname === navigationConfig.dashboard.href;
            return (
              <Link
                href={navigationConfig.dashboard.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-800 font-semibold text-white'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
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
              <h3 className="px-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
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
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-800 font-semibold text-white'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <ItemIcon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                    {!isCollapsed && item.badge && (
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

      {/* Settings Link at Bottom */}
      <div className="border-t border-neutral-800 p-3">
        {(() => {
          const SettingsIcon = navigationConfig.settings.icon;
          const isActive = pathname.startsWith(navigationConfig.settings.href);
          return (
            <Link
              href={navigationConfig.settings.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-800 font-semibold text-white'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
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
