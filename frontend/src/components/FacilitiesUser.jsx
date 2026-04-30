import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { facilityService, API_BASE_URL } from '../services/facilityService';
import {
  Search,
  Filter,
  MapPin,
  Users,
  Box,
  CheckCircle2,
  X,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** Labels aligned with backend {@code ResourceType}. */
const resourceTypes = [
  { value: '', label: 'All resources' },
  { value: 'LECTURE_HALL', label: 'Lecture halls' },
  { value: 'LAB', label: 'Laboratories' },
  { value: 'MEETING_ROOM', label: 'Meeting rooms' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'COMMON_AREA', label: 'Common areas' },
  { value: 'SPORTS_FACILITY', label: 'Sports facilities' },
  { value: 'AUDITORIUM', label: 'Auditoriums' },
  { value: 'SEMINAR_ROOM', label: 'Seminar rooms' }
];

const FacilitiesUser = () => {
  const { id: routeResourceId } = useParams();
  const navigate = useNavigate();

  const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=800&auto=format&fit=crop';
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);

  const fetchFacilities = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.type = filterType;
      if (minCapacity > 0) params.minCapacity = minCapacity;
      if (showOnlyAvailable) params.status = 'ACTIVE';
      const data = await facilityService.getAll(params);
      setFacilities(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load campus resources');
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, minCapacity, showOnlyAvailable]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  useEffect(() => {
    if (!routeResourceId) {
      setSelectedFacility(null);
      setDetailLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setDetailLoading(true);
      try {
        const data = await facilityService.getById(routeResourceId);
        if (!cancelled) {
          setSelectedFacility(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setSelectedFacility(null);
          navigate('/facilities', { replace: true });
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [routeResourceId, navigate]);

  const filteredFacilities = facilities.filter((f) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.location && f.location.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q));
    const cap = Number(f.capacity) || 0;
    const matchesCapacity = cap >= minCapacity;
    return matchesSearch && matchesCapacity;
  });

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return FALLBACK_IMAGE;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl}`;
  };

  const closeDetail = () => {
    navigate('/facilities');
  };

  const openDetail = (facility) => {
    navigate(`/facilities/${facility.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-white">
                Campus <span className="text-indigo-500">Explorer</span>
              </h1>
              <p className="text-slate-400 mt-2 text-xl font-medium">
                Discover campus facilities and assets from the live catalogue
              </p>
              <Link
                to="/admin/facilities"
                className="inline-block mt-4 text-sm font-bold text-indigo-400 hover:text-indigo-300"
              >
                Open resource management (admin) →
              </Link>
            </div>

            <div className="relative group w-full md:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, building, or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/50 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-xl text-white placeholder:text-slate-500"
              />
            </div>
          </motion.div>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sticky top-24"
            >
              <div className="flex items-center gap-2 mb-8 text-indigo-400">
                <Filter size={20} />
                <h2 className="text-lg font-black uppercase tracking-widest">Filters</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Resource type
                  </label>
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {resourceTypes.map((type) => (
                      <button
                        key={type.value || 'all'}
                        type="button"
                        onClick={() => setFilterType(type.value)}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          filterType === type.value
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Min capacity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-slate-700 rounded-lg cursor-pointer transition-all"
                  />
                  <div className="flex justify-between mt-2 text-xs font-black text-indigo-400">
                    <span>{minCapacity} seats</span>
                    <span>100+</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      showOnlyAvailable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-black">Available only (ACTIVE)</span>
                    {showOnlyAvailable ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </aside>

          <main className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-slate-800/20 rounded-3xl animate-pulse border border-slate-700/30"
                  />
                ))}
              </div>
            ) : filteredFacilities.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredFacilities.map((facility, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={facility.id}
                      className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-xl flex flex-col"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={resolveImageUrl(facility.imageUrl)}
                          alt={facility.name}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                        <div
                          className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border backdrop-blur-md ${
                            facility.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              facility.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'
                            } animate-pulse`}
                          />
                          {facility.status === 'ACTIVE' ? 'AVAILABLE' : facility.status}
                        </div>

                        <div className="absolute bottom-4 left-4">
                          <span className="px-2 py-1 bg-indigo-600/80 backdrop-blur-sm text-[10px] font-black text-white rounded uppercase tracking-wider">
                            {String(facility.type || '').replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors mb-4 leading-tight">
                          {facility.name}
                        </h3>

                        <div className="space-y-3 mt-auto">
                          <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
                              <MapPin size={16} className="text-indigo-400" />
                            </div>
                            <span className="text-sm font-bold">{facility.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
                              <Users size={16} className="text-indigo-400" />
                            </div>
                            <span className="text-sm font-bold">{facility.capacity} capacity</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-6">
                          <button
                            type="button"
                            onClick={() => openDetail(facility)}
                            className="w-full py-4 bg-slate-700/50 hover:bg-indigo-600 border border-slate-600/50 hover:border-indigo-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                          >
                            View details
                          </button>
                          {facility.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/bookings/request/${facility.id}`)}
                              className="w-full py-4 bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                              Book now
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => alert('Booking is not available for this facility.')}
                              className="w-full py-4 bg-slate-800/80 border border-slate-700/50 text-slate-500 hover:text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                              Book now
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-40 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700 flex flex-col items-center justify-center">
                <Box size={48} className="text-slate-700 mb-4" />
                <h2 className="text-2xl font-bold text-slate-500 uppercase tracking-tighter">
                  No facilities match your filters
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Try broadening your search or adjusting filters
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('');
                    setMinCapacity(0);
                    setShowOnlyAvailable(false);
                    setSearchQuery('');
                  }}
                  className="mt-6 text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-indigo-300"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {routeResourceId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetail}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700/50 p-6 rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeDetail}
                className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} aria-hidden />
                Back to catalogue
              </button>

              {detailLoading || !selectedFacility ? (
                <div className="py-16 text-center text-slate-500 font-medium">Loading resource…</div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-2xl font-black text-white pr-4">{selectedFacility.name}</h3>
                    <button
                      type="button"
                      onClick={closeDetail}
                      className="p-2 shrink-0 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <img
                    src={resolveImageUrl(selectedFacility.imageUrl)}
                    alt={selectedFacility.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-64 object-cover rounded-2xl border border-slate-700/50 mb-5"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <p>
                      <span className="text-slate-500">Type:</span>{' '}
                      {String(selectedFacility.type || '').replace(/_/g, ' ')}
                    </p>
                    <p>
                      <span className="text-slate-500">Status:</span> {selectedFacility.status}
                    </p>
                    <p>
                      <span className="text-slate-500">Location:</span> {selectedFacility.location}
                    </p>
                    <p>
                      <span className="text-slate-500">Capacity:</span> {selectedFacility.capacity}
                    </p>
                  </div>

                  {selectedFacility.description && (
                    <div className="mt-4">
                      <p className="text-slate-500 mb-1">Description</p>
                      <p className="text-slate-300">{selectedFacility.description}</p>
                    </div>
                  )}

                  <div className="mt-6">
                    {selectedFacility.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/bookings/request/${selectedFacility.id}`);
                        }}
                        className="w-full py-4 bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                      >
                        Book now
                      </button>
                    ) : (
                      <p className="text-center text-sm text-slate-500">
                        Booking is not available while this resource is {selectedFacility.status}.
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilitiesUser;