import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/20 via-bg-primary to-bg-primary">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {user && <Sidebar onLogout={onLogout} />}
        
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
