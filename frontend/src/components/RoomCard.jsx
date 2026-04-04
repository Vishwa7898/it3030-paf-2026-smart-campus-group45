import React from 'react';

const RoomCard = ({ room, onBook }) => {
  // Using a placeholder image if room doesn't have one
  const image = room.images && room.images.length > 0 ? room.images[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const isFull = room.currentOccupancy >= room.capacity;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img src={image} alt={`Room ${room.roomNumber}`} className="w-full h-48 object-cover" />
        <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          {room.type}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Room {room.roomNumber}</h3>
        <p className="text-gray-600 mb-4 h-12 overflow-hidden">{room.description || 'A comfortable and spacious room perfect for your stay.'}</p>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Occupancy</span>
            <span className="font-bold text-gray-800">{room.currentOccupancy}/{room.capacity}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Price/Sem</span>
            <span className="font-bold text-indigo-600">${room.pricePerSemester}</span>
          </div>
        </div>

        <button 
          onClick={() => onBook(room)}
          disabled={isFull}
          className={`w-full py-3 rounded-xl font-bold transition duration-300 ${
            isFull 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:from-indigo-600 hover:to-purple-700'
          }`}
        >
          {isFull ? 'Fully Occupied' : 'Book Now'}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
