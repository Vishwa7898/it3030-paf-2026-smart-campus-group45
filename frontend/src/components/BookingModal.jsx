import React, { useState } from 'react';
import { createBooking } from '../services/api';

const BookingModal = ({ room, onClose, onSuccess }) => {
  const [studentId, setStudentId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !purpose) {
      setError('Please provide your Student ID and Booking Purpose');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createBooking({
        studentId,
        roomId: room.id,
        purpose,
        checkInDate: new Date().toISOString(), // Mocking future date
        checkOutDate: new Date(Date.now() + 86400000).toISOString() // +1 day mock
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error creating booking');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Confirm Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <p className="text-indigo-800 font-semibold text-lg">Room {room.roomNumber}</p>
          <p className="text-indigo-600">{room.type} Room • ${room.pricePerSemester}/semester</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
            <input 
              type="text" 
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition mb-4"
              placeholder="e.g. STU12345"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Purpose</label>
            <textarea 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="e.g. Study group meeting"
              rows={3}
            />
          </div>

          {error && <div className="text-red-500 text-sm mb-4 animate-pulse">{error}</div>}

          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition duration-200 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {loading ? 'Booking...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
