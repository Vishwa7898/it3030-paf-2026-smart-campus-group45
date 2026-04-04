import React, { useEffect, useState } from 'react';
import { getAllBookings, approveBooking, rejectBooking } from '../services/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        const data = await getAllBookings();
        setBookings(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleApprove = async (id) => {
        try {
            await approveBooking(id);
            fetchAll();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        try {
            await rejectBooking(rejectingId, rejectReason);
            setRejectingId(null);
            setRejectReason('');
            fetchAll();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Admin Dashboard - All Bookings</h2>
            
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-sm uppercase tracking-wider">
                                <th className="p-4">Student ID</th>
                                <th className="p-4">Room ID</th>
                                <th className="p-4">Purpose</th>
                                <th className="p-4">Dates</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{booking.studentId}</td>
                                    <td className="p-4 text-gray-600">{booking.roomId}</td>
                                    <td className="p-4 text-gray-600 max-w-xs truncate" title={booking.purpose}>{booking.purpose || '-'}</td>
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
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(booking.id)}
                                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => setRejectingId(booking.id)}
                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No bookings found on the platform.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {rejectingId && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Reject Booking</h3>
                        <form onSubmit={handleRejectSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Provide a Reason</label>
                                <textarea 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                                    placeholder="Briefly explain the rejection..."
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setRejectingId(null)}
                                    className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
