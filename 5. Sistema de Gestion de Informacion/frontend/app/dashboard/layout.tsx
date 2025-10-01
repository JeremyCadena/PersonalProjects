import SideNav from '@/components/dashboard/sidenav';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-100">
      
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>

      <div className="flex-grow p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}