import React, { useState } from 'react';
import { createResource } from '../services/api';

const AdminResources = () => {
    const [formData, setFormData] = useState({
        type: 'ROOM',
        name: '',
        roomNumber: '',
        capacity: 1,
        location: '',
        pricePerSemester: 0,
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' || name === 'pricePerSemester' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await createResource(formData);
            setSuccess(true);
            setFormData({
                type: 'ROOM',
                name: '',
                roomNumber: '',
                capacity: 1,
                location: '',
                pricePerSemester: 0,
                description: ''
            });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        }
        
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Add New Resource</h2>
            
            {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded shadow-md transition-all">
                    <p className="font-bold">Success!</p>
                    <p>Resource successfully saved to the system.</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded shadow-md transition-all">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-8">
                <form onSubmit={handleSubmit}>
                    
                    <div className="mb-6 border-b border-gray-100 pb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Type</label>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        >
                            <option value="ROOM">Room</option>
                            <option value="LAB">Laboratory</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Name</label>
                            <input 
                                type="text" name="name" value={formData.name} onChange={handleChange} required
                                placeholder="e.g. CompSci Lab A"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <input 
                                type="text" name="location" value={formData.location} onChange={handleChange} required
                                placeholder="e.g. Main Building Floor 2"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-b border-gray-100 pb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Identifier / No.</label>
                            <input 
                                type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required
                                placeholder="e.g. 101"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                            <input 
                                type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Per Sem ($)</label>
                            <input 
                                type="number" name="pricePerSemester" value={formData.pricePerSemester} onChange={handleChange} required min="0" step="0.01"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                        <textarea 
                            name="description" value={formData.description} onChange={handleChange} required
                            placeholder="Provide details about the resource, rules of usage, or components included..." rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : `Add New ${formData.type === 'LAB' ? 'Lab' : formData.type === 'EQUIPMENT' ? 'Equipment' : 'Room'}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminResources;
