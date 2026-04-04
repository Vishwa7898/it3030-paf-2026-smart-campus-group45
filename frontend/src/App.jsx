import React, { useState } from 'react';
import RoomList from './components/RoomList';
import Sidebar from './components/Sidebar';
import AdminBookings from './components/AdminBookings';
import MyBookings from './components/MyBookings';
import AdminResources from './components/AdminResources';

function App() {
  const [currentView, setCurrentView] = useState('rooms');

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto pb-12 pt-8 px-4 lg:px-8">
          
          {currentView === 'rooms' && (
            <>
              {/* Hero Section */}
              <div className="bg-indigo-700 rounded-3xl mb-12 p-10 md:p-16 text-center text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] opacity-20 bg-cover bg-center"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Find Your Perfect Stay</h2>
                  <p className="text-lg md:text-xl font-medium text-indigo-100 max-w-2xl mx-auto">
                    Secure a comfortable living space on campus with just a few clicks. 
                  </p>
                </div>
              </div>
              <RoomList />
            </>
          )}

          {currentView === 'my-bookings' && <MyBookings />}
          {currentView === 'admin' && <AdminBookings />}
          {currentView === 'admin-resources' && <AdminResources />}

        </div>
      </main>
    </div>
  )
}

export default App;
