import React, { useEffect, useState } from 'react';
import { getRooms } from '../services/api';
import RoomCard from './RoomCard';
import BookingModal from './BookingModal';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Fetch rooms
        const fetchRooms = async () => {
            const data = await getRooms();
            setRooms(data);
            setLoading(false);
        };
        fetchRooms();
    }, []);

    const handleSuccess = () => {
        setShowSuccess(true);
        setSelectedRoom(null);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Refresh room list
        getRooms().then(data => {
            if (data.length > 0) setRooms(data);
        });
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Available Rooms
            </h2>
            
            {showSuccess && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded shadow-md transition-all">
                    <p className="font-bold">Success!</p>
                    <p>Your room booking has been confirmed.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map(room => (
                    <RoomCard key={room.id} room={room} onBook={setSelectedRoom} />
                ))}
            </div>

            {selectedRoom && (
                <BookingModal 
                    room={selectedRoom} 
                    onClose={() => setSelectedRoom(null)} 
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default RoomList;
