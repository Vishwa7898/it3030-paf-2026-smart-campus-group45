import React, { useState, useEffect } from 'react';
import { facilityService } from '../services/facilityService';
import { 
  Search, Filter, MapPin, Users, Info, Box, 
  ChevronDown, Grid, List as ListIcon, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FacilitiesUser = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const resourceTypes = [
    { value: '', label: 'All Types' },
    { value: 'ROOM', label: 'Room' },
    { value: 'LAB', label: 'Lab' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'LECTURE_HALL', label: 'Lecture Hall' },
    { value: 'SPORTS_ROOM', label: 'Sports Room' }
  ];

  useEffect(() => {
    fetchFacilities();
  }, [filterType]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = filterType ? { type: filterType } : {};
      const data = await facilityService.getAll(params);
      setFacilities(data);
    } catch (err) {
      setError('Failed to load facilities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                Campus <span className="text-indigo-500">Facilities</span>
              </h1>
              <p className="text-slate-400 mt-2 text-lg">Explore and locate university resources</p>
            </div>

            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="relative group col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search facilities by name or location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-md"
              />
            </div>
            
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none backdrop-blur-md"
              >
                {resourceTypes.map(t => (
                  <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </motion.div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-800/30 rounded-3xl animate-pulse border border-slate-700/30"></div>
            ))}
          </div>
        ) : filteredFacilities.length > 0 ? (
          <motion.div 
            layout
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "flex flex-col gap-4"
            }
          >
            <AnimatePresence>
              {filteredFacilities.map((facility, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  key={facility.id}
                  className={`group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 ${viewMode === 'list' ? 'flex items-center p-4' : 'p-8'}`}
                >
                  <div className={`flex flex-col h-full ${viewMode === 'list' ? 'flex-row items-center w-full' : ''}`}>
                    <div className={`p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-500 w-fit ${viewMode === 'list' ? 'mb-0 mr-6' : ''}`}>
                      <Box size={28} />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-wide">
                          {facility.name}
                        </h3>
                        {viewMode === 'grid' && (
                          <div className={`flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full ${
                            facility.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {facility.available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {facility.available ? 'OPEN' : 'CLOSED'}
                          </div>
                        )}
                      </div>

                      <div className={`flex flex-wrap gap-x-6 gap-y-2 text-slate-400 ${viewMode === 'list' ? 'mb-0' : 'mt-4'}`}>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-indigo-500/60" />
                          <span className="text-sm font-medium">{facility.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-indigo-500/60" />
                          <span className="text-sm font-medium">{facility.capacity} People</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Info size={16} className="text-indigo-500/60" />
                          <span className="text-sm font-medium">{facility.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {viewMode === 'list' && (
                      <div className={`ml-auto flex items-center gap-1 text-xs font-black px-4 py-2 rounded-xl border ${
                        facility.available ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {facility.available ? 'AVAILABLE' : 'RESERVED'}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-32 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
            <h2 className="text-2xl font-bold text-slate-500">No matching facilities found</h2>
            <p className="text-slate-600 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitiesUser;
