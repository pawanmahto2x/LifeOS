import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight">LifeOS</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your personal operating system for productivity & wellness
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border-border bg-card border px-4 py-8 shadow-lg sm:rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
