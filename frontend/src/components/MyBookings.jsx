import React, { useState, useEffect } from 'react';
import { getStudentBookings, cancelBooking } from '../services/api';

const MyBookings = () => {
    const [studentId, setStudentId] = useState('');
    const [queryId, setQueryId] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMyBookings = async (idToFetch) => {
        if (!idToFetch) return;
        setLoading(true);
        try {
            const data = await getStudentBookings(idToFetch);
            setBookings(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setQueryId(studentId);
        fetchMyBookings(studentId);
    };

    const handleCancel = async (id) => {
        if(!window.confirm('Are you sure you want to cancel this booking?')) return;
        
        try {
            await cancelBooking(id);
            // refresh list
            fetchMyBookings(queryId);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">My Bookings</h2>
            
            <form onSubmit={handleSearch} className="mb-10 flex gap-4 max-w-xl">
                <input 
                    type="text" 
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter your Student ID (e.g. STU12345)"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition">
                    Search
                </button>
            </form>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                </div>
            ) : queryId ? (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-sm uppercase tracking-wider">
                                    <th className="p-4">Room ID</th>
                                    <th className="p-4">Dates</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions / Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">{booking.roomId}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            In: {new Date(booking.checkInDate).toLocaleDateString()}<br/>
                                            Out: {new Date(booking.checkOutDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {booking.status}
                                            </span>
                                            {booking.status === 'REJECTED' && booking.reason && (
                                                <p className="mt-1 text-xs text-red-500 max-w-xs truncate" title={booking.reason}>
                                                    Reason: {booking.reason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                                <button 
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500">No bookings found for ID: {queryId}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-100 rounded-3xl border border-gray-200 border-dashed">
                    Please enter your Student ID to view your records.
                </div>
            )}
        </div>
    );
};

export default MyBookings;
