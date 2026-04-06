import React, { useState, useEffect } from 'react';
import { facilityService } from '../services/facilityService';
import { 
  Plus, Edit2, Trash2, Search, X, Check, AlertCircle, 
  MapPin, Users, Info, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FacilitiesAdmin = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM',
    location: '',
    capacity: 1,
    available: true
  });

  const resourceTypes = ['ROOM', 'LAB', 'EQUIPMENT', 'LECTURE_HALL', 'SPORTS_ROOM'];

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await facilityService.getAll();
      setFacilities(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch facilities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFacility) {
        await facilityService.update(editingFacility.id, formData);
      } else {
        await facilityService.create(formData);
      }
      setIsModalOpen(false);
      setEditingFacility(null);
      resetForm();
      fetchFacilities();
    } catch (err) {
      setError('Failed to save facility');
      console.error(err);
    }
  };

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      location: facility.location,
      capacity: facility.capacity,
      available: facility.available
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await facilityService.delete(id);
        fetchFacilities();
      } catch (err) {
        setError('Failed to delete facility');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'ROOM',
      location: '',
      capacity: 1,
      available: true
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Facility Management
            </h1>
            <p className="text-slate-400 mt-2">Admin Dashboard • Smart Campus</p>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingFacility(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus size={20} />
            Add New Facility
          </motion.button>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-800/50 rounded-2xl animate-pulse"></div>
            ))
          ) : facilities.length > 0 ? (
            facilities.map((facility, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={facility.id}
                className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Box size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(facility)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(facility.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{facility.name}</h3>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} />
                    <span className="text-sm">{facility.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users size={16} />
                    <span className="text-sm">Capacity: {facility.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info size={16} />
                    <span className="text-sm">Type: {facility.type.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    facility.available 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {facility.available ? 'AVAILABLE' : 'IN USE'}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-slate-500">
              No facilities found. Click "Add New Facility" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Facility Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Main Lab 101"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Resource Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      {resourceTypes.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Capacity</label>
                    <input
                      required
                      type="number"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                  <input
                    required
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Block A, 2nd Floor"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-indigo-500"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-slate-300">Available for use</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all mt-4"
                >
                  {editingFacility ? 'Update Facility' : 'Create Facility'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilitiesAdmin;
