import React from 'react';

function Header() {
  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Header title - COMMENTED OUT: NOT NEEDED */}
          {/* 
          <div>
            <h1 className="text-3xl font-bold">Task Decomposition API</h1>
          </div>
          */}
        </div>
      </div>
    </header>
  );
}

export default Header;
