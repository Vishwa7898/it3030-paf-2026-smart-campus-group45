import React, { useState, useEffect } from 'react';
import { facilityService } from '../services/facilityService';
import { 
  Plus, Edit2, Trash2, Search, X, Check, AlertCircle, 
  MapPin, Users, Info, Box, ChevronDown
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
    available: true,
    imageUrl: ''
  });

  const resourceTypes = ['ROOM', 'LAB', 'EQUIPMENT', 'LECTURE_HALL', 'SPORTS_ROOM'];

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await facilityService.getAll();
      if (Array.isArray(data)) {
        setFacilities(data);
      } else {
        setFacilities([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch facilities');
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
    }
  };

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      location: facility.location,
      capacity: facility.capacity,
      available: facility.available,
      imageUrl: facility.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        await facilityService.delete(id);
        fetchFacilities();
      } catch (err) {
        setError('Failed to delete resource');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'ROOM',
      location: '',
      capacity: 1,
      available: true,
      imageUrl: ''
    });
  };

  // Quick Stats Calculation
  const stats = {
    total: facilities.length,
    available: facilities.filter(f => f.available).length,
    totalCapacity: facilities.reduce((acc, f) => acc + (f.capacity || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Box size={32} />
              </span>
              Admin <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Dashboard</span>
            </h1>
            <p className="text-slate-400 mt-3 text-lg font-medium">Campus Resource Management System</p>
          </motion.div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingFacility(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl shadow-indigo-500/20 transition-all border border-indigo-400/20"
            >
              <Plus size={20} />
              Add New Resource
            </motion.button>
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-4 rounded-2xl font-bold transition-all border border-slate-700">
              <Plus size={20} className="rotate-45" />
              Generate Reports
            </button>
          </div>
        </header>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Resources', value: stats.total, icon: <Box className="text-blue-400" />, color: 'from-blue-500/10 to-transparent' },
            { label: 'Available Rooms', value: stats.available, icon: <Check className="text-emerald-400" />, color: 'from-emerald-500/10 to-transparent' },
            { label: 'Campus Capacity', value: stats.totalCapacity, icon: <Users className="text-purple-400" />, color: 'from-purple-500/10 to-transparent' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl bg-gradient-to-br ${stat.color}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                  {stat.icon}
                </div>
              </div>
              <h4 className="text-slate-400 font-semibold uppercase tracking-wider text-xs">{stat.label}</h4>
              <p className="text-4xl font-black mt-1 text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Inventory Table */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50">
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">ID</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Resource Name</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Type</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Location</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-center">Capacity</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-center">Status</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="7" className="px-6 py-6 h-12 bg-slate-800/30"></td>
                    </tr>
                  ))
                ) : facilities.length > 0 ? (
                  facilities.map((resource, index) => (
                    <motion.tr 
                      key={resource.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-6 py-5 font-mono text-xs text-slate-500">{resource.id?.substring(0, 8)}...</td>
                      <td className="px-6 py-5 font-bold text-slate-200">{resource.name}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-medium text-slate-300 border border-slate-600/30">
                          {resource.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-400 flex items-center gap-2">
                        <MapPin size={14} className="text-indigo-500/60" />
                        {resource.location}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-300">{resource.capacity}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${
                          resource.available 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${resource.available ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                          {resource.available ? 'AVAILABLE' : 'IN USE'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 text-slate-400">
                          <button 
                            onClick={() => handleEdit(resource)}
                            className="p-2 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(resource.id)}
                            className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-slate-500 font-medium">
                      No resources found. Click "Add New Resource" to populate the inventory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700/50 p-8 rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {editingFacility ? 'Edit Resource' : 'Add New Resource'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Fill in the campus resource details</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Resource Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                      placeholder="e.g. Advanced Physics Lab"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Resource Type</label>
                    <div className="relative">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white appearance-none cursor-pointer"
                      >
                        {resourceTypes.map(type => (
                          <option key={type} value={type} className="bg-slate-900">{type.replace('_', ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Internal Location</label>
                    <input
                      required
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600"
                      placeholder="e.g. Building C, Room 204"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Max Capacity</label>
                    <input
                      required
                      type="number"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-slate-500 text-xs mt-2 italic">Paste a direct link to a high-quality facility image for the student gallery.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 group cursor-pointer" 
                     onClick={() => setFormData(prev => ({ ...prev, available: !prev.available }))}>
                  <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.available ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.available ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Mark as Available for Student Discovery</span>
                  <input type="checkbox" name="available" checked={formData.available} onChange={handleInputChange} className="hidden" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/40 transition-all mt-4 border border-indigo-400/20 flex items-center justify-center gap-2"
                >
                  {editingFacility ? <Check size={24} /> : <Plus size={24} />}
                  {editingFacility ? 'Update Resource Records' : 'Save New Resource'}
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
