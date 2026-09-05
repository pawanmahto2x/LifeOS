import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-neutral-950 py-12 text-neutral-100 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">LifeOS</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Your personal operating system for productivity & wellness
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-neutral-800 bg-neutral-900 px-4 py-8 shadow sm:rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
