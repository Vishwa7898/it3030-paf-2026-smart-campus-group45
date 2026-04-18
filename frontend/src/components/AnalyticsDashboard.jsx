import React, { useState, useEffect } from 'react';
import { facilityService } from '../services/facilityService';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await facilityService.getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      // Set mock data for demonstration
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalytics = () => ({
    totalResources: 45,
    totalBookings: 128,
    totalUsers: 234,
    completedBookings: 95,
    cancelledBookings: 33,
    completionRate: 73.4,
    utilizationRate: 82.1,
    topResources: [
      { name: 'Physics Lab', bookings: 24 },
      { name: 'Main Lecture Hall', bookings: 21 },
      { name: 'Meeting Room A', bookings: 18 },
      { name: 'Chemistry Lab', bookings: 15 },
      { name: 'Seminar Room B', bookings: 12 }
    ],
    statusDistribution: [
      { name: 'ACTIVE', value: 38 },
      { name: 'MAINTENANCE', value: 5 },
      { name: 'OUT_OF_SERVICE', value: 2 }
    ],
    dailyBookings: [
      { day: 'Mon', bookings: 18 },
      { day: 'Tue', bookings: 22 },
      { day: 'Wed', bookings: 20 },
      { day: 'Thu', bookings: 25 },
      { day: 'Fri', bookings: 19 },
      { day: 'Sat', bookings: 12 },
      { day: 'Sun', bookings: 6 }
    ],
    resourcesByType: [
      { type: 'LAB', count: 8 },
      { type: 'LECTURE_HALL', count: 6 },
      { type: 'MEETING_ROOM', count: 15 },
      { type: 'EQUIPMENT', count: 16 }
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Unable to load analytics data</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const statusColors = {
    'ACTIVE': '#10b981',
    'MAINTENANCE': '#f59e0b',
    'OUT_OF_SERVICE': '#ef4444'
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Campus facility usage and booking analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Resources</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalResources}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Box className="text-blue-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.completionRate?.toFixed(1)}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Utilization</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.utilizationRate?.toFixed(1)}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <AlertCircle className="text-indigo-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Booking Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Resources */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Resources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analytics.topResources}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Daily Bookings and Resource Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Booking Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Booking Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyBookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resource Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analytics.resourcesByType}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Booking Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-200 p-3 rounded-lg">
              <CheckCircle className="text-green-700" size={28} />
            </div>
            <div>
              <p className="text-green-700 text-sm font-medium">Completed Bookings</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{analytics.completedBookings}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-200 p-3 rounded-lg">
              <AlertCircle className="text-red-700" size={28} />
            </div>
            <div>
              <p className="text-red-700 text-sm font-medium">Cancelled Bookings</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{analytics.cancelledBookings}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-200 p-3 rounded-lg">
              <Clock className="text-blue-700" size={28} />
            </div>
            <div>
              <p className="text-blue-700 text-sm font-medium">Pending Bookings</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{analytics.totalBookings - analytics.completedBookings - analytics.cancelledBookings}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {error && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          <p>{error}</p>
          <p className="text-sm mt-2">Displaying mock data for demonstration purposes</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
