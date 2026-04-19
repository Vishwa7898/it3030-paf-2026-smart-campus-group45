import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import { TicketService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    resourceId: '',
    location: '',
    category: '',
    description: '',
    priority: 'LOW',
    contactDetails: '',
    submitterId: '',
  });

  useEffect(() => {
    const submitterId =
      user?.id ||
      user?.userId ||
      user?.studentId ||
      user?.email ||
      '';
    if (submitterId) {
      setFormData((prev) => ({ ...prev, submitterId }));
    }
  }, [user]);

  const categories = [
    'Hardware Issue',
    'Software/Network',
    'Facility Damage',
    'Cleaning Required',
    'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, contactDetails: digitsOnly });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert('You can only upload up to 3 images.');
      return;
    }
    setImages([...images, ...files].slice(0, 3));
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.submitterId?.trim()) {
      setError('You must be signed in to submit (submitter id missing).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await TicketService.createTicket(formData, images);
      // Wait a moment then navigate
      setTimeout(() => {
        navigate('/tickets');
      }, 500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create ticket. Please try again.';
      setError(msg);
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/tickets')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Report an Incident</h2>
          <p className="text-slate-500 text-sm">Provide details about the issue or maintenance request</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Priority Level *</label>
              <select
                name="priority"
                required
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="LOW">Low - Routine issue</option>
                <option value="MEDIUM">Medium - Needs attention soon</option>
                <option value="HIGH">High - Affecting ongoing activities</option>
                <option value="CRITICAL">Critical - Safety/Complete failure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Resource ID / Name *</label>
              <input
                type="text"
                name="resourceId"
                required
                placeholder="e.g. Projector-01"
                value={formData.resourceId}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Location *</label>
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Room A402"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-black placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">Contact Details (Phone number) *</label>
            <input
              type="tel"
              name="contactDetails"
              required
              inputMode="numeric"
              pattern="^[0-9]{10}$"
              maxLength={10}
              placeholder="10-digit phone number (e.g. 0771234567)"
              value={formData.contactDetails}
              onChange={handlePhoneChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-black placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            <p className="text-xs text-slate-600">
              Enter exactly 10 digits. Letters and special characters are not allowed.
            </p>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-sm font-semibold text-black flex justify-between">
              Evidence Attachments
              <span className="text-slate-400 font-normal">({images.length}/3 images max)</span>
            </label>

            <div className="flex gap-4 items-start">
              {images.length < 3 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {images.map((file, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden group shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
