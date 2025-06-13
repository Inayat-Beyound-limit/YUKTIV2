import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Building2,
  TrendingUp,
  Heart,
  AlertTriangle,
  Award,
  Calendar,
  BarChart3,
  Bell
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 1245,
    totalCompanies: 89,
    placementRate: 78,
    wellnessAlerts: 12,
    monthlyPlacements: [],
    wellnessTrends: [],
    recentAlerts: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    setDashboardData({
      totalStudents: 1245,
      totalCompanies: 89,
      placementRate: 78,
      wellnessAlerts: 12,
      monthlyPlacements: [
        { month: 'Jan', placements: 45 },
        { month: 'Feb', placements: 52 },
        { month: 'Mar', placements: 48 },
        { month: 'Apr', placements: 61 },
        { month: 'May', placements: 55 },
        { month: 'Jun', placements: 67 }
      ],
      wellnessTrends: [
        { week: 'Week 1', score: 75 },
        { week: 'Week 2', score: 78 },
        { week: 'Week 3', score: 72 },
        { week: 'Week 4', score: 80 }
      ],
      recentAlerts: [
        { id: 1, student: 'John Doe', type: 'Low Mood', severity: 'High', time: '2 hours ago' },
        { id: 2, student: 'Sarah Smith', type: 'High Stress', severity: 'Medium', time: '4 hours ago' },
        { id: 3, student: 'Mike Johnson', type: 'Declining Trend', severity: 'Low', time: '6 hours ago' }
      ]
    })
  }

  const statCards = [
    {
      title: 'Total Students',
      value: dashboardData.totalStudents.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+23 this month'
    },
    {
      title: 'Partner Companies',
      value: dashboardData.totalCompanies,
      icon: Building2,
      color: 'bg-green-500',
      change: '+5 new partners'
    },
    {
      title: 'Placement Rate',
      value: `${dashboardData.placementRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+3% from last year'
    },
    {
      title: 'Wellness Alerts',
      value: dashboardData.wellnessAlerts,
      icon: Heart,
      color: 'bg-red-500',
      change: '5 urgent'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor student placements and wellness across your institution
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Bell className="w-5 h-5 inline mr-2" />
                View Alerts
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-2 ${
                      stat.title === 'Wellness Alerts' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Placements Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Placements</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyPlacements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="placements" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Wellness Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Wellness Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.wellnessTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#EC4899" 
                  strokeWidth={3}
                  dot={{ fill: '#EC4899', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wellness Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Wellness Alerts</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {dashboardData.wellnessAlerts} Active
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity === 'High' ? 'text-red-500' :
                      alert.severity === 'Medium' ? 'text-yellow-500' : 'text-orange-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.student}</h4>
                      <p className="text-sm text-gray-600">{alert.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-500">
              View all alerts
            </button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Active Students</p>
                    <p className="text-sm text-gray-600">Currently seeking placement</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">892</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">This Month</p>
                    <p className="text-sm text-gray-600">Students placed</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">67</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Avg Package</p>
                    <p className="text-sm text-gray-600">Current semester</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">₹6.5L</span>
              </div>
            </div>
          </motion.div>

          {/* Top Companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Hiring Companies</h3>
            <div className="space-y-4">
              {[
                { name: 'TechCorp', hires: 15, logo: 'TC' },
                { name: 'InnovateLabs', hires: 12, logo: 'IL' },
                { name: 'DataFlow Inc', hires: 10, logo: 'DF' },
                { name: 'CloudSys', hires: 8, logo: 'CS' }
              ].map((company, index) => (
                <div key={company.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                      {company.logo}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-600">{company.hires} hires this year</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">#{index + 1}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard