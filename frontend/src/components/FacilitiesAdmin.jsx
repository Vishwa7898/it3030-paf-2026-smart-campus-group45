import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { facilityService, API_BASE_URL } from '../services/facilityService';
import { 
  Plus, Edit2, Trash2, X, Check, AlertCircle, 
  MapPin, Box, ChevronDown, FileText, ChevronLeft, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FacilitiesAdmin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'reports' ? 'reports' : 'inventory';

  const goToTab = (tab) => {
    if (tab === 'reports') {
      setSearchParams({ tab: 'reports' });
    } else {
      setSearchParams({});
    }
  };

  const resolveUploadedImageUrl = (path) => {
    if (!path) return null;
    const s = String(path).trim();
    if (!s) return null;
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    const p = s.startsWith('/') ? s : `/${s}`;
    return `${API_BASE_URL}${p}`;
  };

  const [facilities, setFacilities] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [reportGeneratedAt, setReportGeneratedAt] = useState(() => new Date());
  const [reportVisible, setReportVisible] = useState(false);
  const nameInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    location: '',
    capacity: 1,
    status: 'ACTIVE',
    description: '',
    amenities: []
  });

  const resourceTypes = [
    'LECTURE_HALL',
    'LAB',
    'MEETING_ROOM',
    'EQUIPMENT',
    'COMMON_AREA',
    'SPORTS_FACILITY',
    'AUDITORIUM',
    'SEMINAR_ROOM'
  ];
  const resourceStatus = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'UNDER_REPAIR', 'DECOMMISSIONED', 'RESERVED', 'INACTIVE'];
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const inferImageMimeFromFileName = (file) => {
    const name = (file?.name || '').toLowerCase();
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    return file?.type || '';
  };

  const isCapacityRequired = useMemo(
    () => ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'SEMINAR_ROOM', 'AUDITORIUM', 'SPORTS_FACILITY'].includes(formData.type),
    [formData.type]
  );

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (activeTab !== 'reports') {
      setReportVisible(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isModalOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isModalOpen]);

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
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? Number.parseInt(value, 10) || '' : value;

    setFormData({
      ...formData,
      [name]: parsedValue
    });

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z0-9 _.,&-]+$/;
    const locationRegex = /^[A-Za-z0-9 .,\-/()]+$/;

    const trimmedName = formData.name.trim();
    const trimmedLocation = formData.location.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      errors.name = 'Resource name is required';
    } else if (trimmedName.length < 3 || trimmedName.length > 150) {
      errors.name = 'Resource name must be between 3 and 150 characters';
    } else if (!nameRegex.test(trimmedName)) {
      errors.name = 'Invalid characters in resource name';
    }

    if (!formData.type || !resourceTypes.includes(formData.type)) {
      errors.type = 'Please select a resource type';
    }

    if (!trimmedLocation) {
      errors.location = 'Location is required';
    } else if (trimmedLocation.length < 5 || trimmedLocation.length > 200) {
      errors.location = 'Location must be between 5 and 200 characters';
    } else if (!locationRegex.test(trimmedLocation)) {
      errors.location = 'Location contains invalid characters';
    }

    const capacity = Number(formData.capacity);
    if (isCapacityRequired && !Number.isInteger(capacity)) {
      errors.capacity = 'Capacity is required';
    } else if (Number.isInteger(capacity) && (capacity < 1 || capacity > 10000)) {
      errors.capacity = 'Capacity must be a positive number between 1 and 10,000';
    }

    if (!formData.status || !resourceStatus.includes(formData.status)) {
      errors.status = 'Please select a valid status';
    }

    if (trimmedDescription.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    const hasStoredImage =
      Boolean(editingFacility?.imageUrl) && String(editingFacility.imageUrl).trim().length > 0;
    if (!selectedImage && !hasStoredImage) {
      errors.image = 'Resource image is required';
    } else if (selectedImage) {
      const effectiveType = selectedImage.type || inferImageMimeFromFileName(selectedImage);
      if (!allowedImageTypes.includes(effectiveType)) {
        errors.image = 'File type not supported. Allowed: JPG, PNG, WEBP';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setFieldErrors((prev) => ({ ...prev, image: '' }));

    if (!file) {
      if (editingFacility?.imageUrl) {
        setImagePreview(resolveUploadedImageUrl(editingFacility.imageUrl));
      } else {
        setImagePreview(null);
      }
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim()
      };

      if (editingFacility) {
        await facilityService.update(editingFacility.id, payload, selectedImage);
      } else {
        await facilityService.create(payload, selectedImage);
      }
      setIsModalOpen(false);
      setEditingFacility(null);
      resetForm();
      fetchFacilities();
    } catch (err) {
      const apiError = err?.response?.data;
      const firstValidationError =
        apiError && typeof apiError === 'object'
          ? Object.values(apiError).find((value) => typeof value === 'string')
          : null;
      setError(apiError?.error || firstValidationError || 'Failed to save facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      location: facility.location,
      capacity: facility.capacity,
      status: facility.status || 'ACTIVE',
      description: facility.description || '',
      amenities: facility.amenities || []
    });
    setSelectedImage(null);
    setImagePreview(facility.imageUrl ? resolveUploadedImageUrl(facility.imageUrl) : null);
    setFieldErrors({});
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
      type: 'LECTURE_HALL',
      location: '',
      capacity: 1,
      status: 'ACTIVE',
      description: '',
      amenities: []
    });
    setSelectedImage(null);
    setImagePreview(null);
    setFieldErrors({});
  };

  const downloadReport = () => {
    const rows = facilities
      .map(
        (r) => `
          <tr>
            <td>${r.name ?? ''}</td>
            <td>${r.type ?? ''}</td>
            <td>${r.location ?? ''}</td>
            <td>${r.capacity ?? ''}</td>
            <td>${r.status ?? ''}</td>
          </tr>
        `
      )
      .join('');
    const reportHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Facilities and Assets Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    h1 { margin-bottom: 12px; }
    p { margin: 4px 0; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f7f7f7; }
  </style>
</head>
<body>
  <h1>Facilities & Assets Report</h1>
  <p>Generated: ${reportGeneratedAt.toLocaleString()}</p>
  <p>Total Resources: ${facilities.length}</p>
  <table>
    <thead>
      <tr><th>Name</th><th>Type</th><th>Location</th><th>Capacity</th><th>Status</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facilities-assets-report-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Quick Stats Calculation
  const stats = {
    total: facilities.length,
    active: facilities.filter(f => f.status === 'ACTIVE').length
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ChevronLeft size={18} aria-hidden />
            Back to facilities catalogue
          </Link>
        </div>
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
          
          {activeTab === 'inventory' && (
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
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700/50">
          <button
            type="button"
            onClick={() => goToTab('inventory')}
            className={`px-6 py-4 font-bold transition-all ${activeTab === 'inventory' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-300'}`}
          >
            <div className="flex items-center gap-2">
              <Box size={20} />
              Inventory Management
            </div>
          </button>
          <button
            type="button"
            onClick={() => goToTab('reports')}
            className={`px-6 py-4 font-bold transition-all ${activeTab === 'reports' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-300'}`}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              Reports
            </div>
          </button>
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

        {activeTab === 'inventory' ? (
          <>
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                { label: 'Total Resources', value: stats.total, icon: <Box className="text-blue-400" />, color: 'from-blue-500/10 to-transparent' },
                { label: 'Active Resources', value: stats.active, icon: <Check className="text-emerald-400" />, color: 'from-emerald-500/10 to-transparent' }
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
                              resource.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${resource.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                              {resource.status}
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
          </>
        ) : (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8">
            {!reportVisible ? (
              <div className="flex flex-col items-center justify-center text-center py-12 md:py-16 px-4">
                <h2 className="text-2xl font-black text-white mb-3">Facilities &amp; Assets Report</h2>
                <p className="text-slate-400 max-w-md mb-8">
                  Generate the report to view resource details in a summary table.
                </p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setReportGeneratedAt(new Date());
                    setReportVisible(true);
                  }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/20"
                >
                  <FileText size={20} />
                  View report
                </motion.button>
                <button
                  type="button"
                  onClick={downloadReport}
                  className="mt-3 flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
                >
                  <Download size={18} />
                  Download report
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200/80 p-8 md:p-10 font-sans">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-[1.75rem] font-bold tracking-tight text-black">
                    Facilities &amp; Assets Report
                  </h2>
                  <button
                    type="button"
                    onClick={downloadReport}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700"
                  >
                    <Download size={16} />
                    Download report
                  </button>
                </div>
                <div className="text-sm text-slate-800 space-y-1 mb-10 leading-relaxed">
                  <p>Generated: {reportGeneratedAt.toLocaleString()}</p>
                  <p>Total Resources: {facilities.length}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="border border-neutral-300 px-3 py-2.5 font-bold text-center text-black">Name</th>
                        <th className="border border-neutral-300 px-3 py-2.5 font-bold text-center text-black">Type</th>
                        <th className="border border-neutral-300 px-3 py-2.5 font-bold text-center text-black">Location</th>
                        <th className="border border-neutral-300 px-3 py-2.5 font-bold text-center text-black">Capacity</th>
                        <th className="border border-neutral-300 px-3 py-2.5 font-bold text-center text-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="border border-neutral-300 px-3 py-8 text-center text-slate-500">
                            Loading…
                          </td>
                        </tr>
                      ) : facilities.length > 0 ? (
                        facilities.map((r) => (
                          <tr key={r.id}>
                            <td className="border border-neutral-300 px-3 py-2.5 text-left align-top">{r.name}</td>
                            <td className="border border-neutral-300 px-3 py-2.5 text-left align-top">{r.type}</td>
                            <td className="border border-neutral-300 px-3 py-2.5 text-left align-top">{r.location}</td>
                            <td className="border border-neutral-300 px-3 py-2.5 text-left align-top">{r.capacity ?? ''}</td>
                            <td className="border border-neutral-300 px-3 py-2.5 text-left align-top">{r.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="border border-neutral-300 px-3 py-8 text-center text-slate-500">
                            No resources to show.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
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
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Resource Name *</label>
                    <input
                      required
                      ref={nameInputRef}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={validateForm}
                      className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                      placeholder="e.g. Advanced Physics Lab"
                    />
                    {fieldErrors.name && <p className="text-red-400 text-xs mt-2">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Resource Type *</label>
                    <div className="relative">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        onBlur={validateForm}
                        className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white appearance-none cursor-pointer"
                      >
                        {resourceTypes.map(type => (
                          <option key={type} value={type} className="bg-slate-900">{type.replace('_', ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                    </div>
                    {fieldErrors.type && <p className="text-red-400 text-xs mt-2">{fieldErrors.type}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Location *</label>
                    <input
                      required
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      onBlur={validateForm}
                      className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600"
                      placeholder="e.g. Building C, Room 204"
                    />
                    <p className="text-slate-500 text-xs mt-2 italic">Use format like Building A, Floor 2, Room 201.</p>
                    {fieldErrors.location && <p className="text-red-400 text-xs mt-2">{fieldErrors.location}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      Capacity {isCapacityRequired ? '*' : '(optional)'}
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      max="10000"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      onBlur={validateForm}
                      className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                    />
                    <p className="text-slate-500 text-xs mt-2 italic">Enter seats/resources count between 1 and 10,000.</p>
                    {fieldErrors.capacity && <p className="text-red-400 text-xs mt-2">{fieldErrors.capacity}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Status *</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      onBlur={validateForm}
                      className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white appearance-none cursor-pointer"
                    >
                      {resourceStatus.map(status => (
                        <option key={status} value={status} className="bg-slate-900">{status}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                  </div>
                  {fieldErrors.status && <p className="text-red-400 text-xs mt-2">{fieldErrors.status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={validateForm}
                    className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600 h-24"
                    placeholder="Brief description of the resource..."
                  />
                  <p className="text-slate-500 text-xs mt-2 italic">{formData.description.length}/1000</p>
                  {fieldErrors.description && <p className="text-red-400 text-xs mt-2">{fieldErrors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Resource image *
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    className="w-full bg-slate-800 border border-slate-700/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-semibold hover:file:bg-indigo-500"
                  />
                  <p className="text-slate-500 text-xs mt-2 italic">
                    Required: JPG, PNG, or WEBP from your device.
                    {editingFacility
                      ? ' When editing, you may keep the current image or choose a new file.'
                      : ''}
                  </p>
                  {fieldErrors.image && <p className="text-red-400 text-xs mt-2">{fieldErrors.image}</p>}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Selected preview"
                      className="mt-4 h-40 w-full object-cover rounded-2xl border border-slate-700/50"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/40 transition-all mt-4 border border-indigo-400/20 flex items-center justify-center gap-2"
                >
                  {editingFacility ? <Check size={24} /> : <Plus size={24} />}
                  {isSubmitting ? 'Saving...' : editingFacility ? 'Update Resource' : 'Create Resource'}
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
