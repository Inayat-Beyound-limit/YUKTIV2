import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Briefcase, 
  Eye, 
  UserCheck,
  Plus,
  TrendingUp,
  Calendar,
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const CompanyDashboard: React.FC = () => {
  const { profile } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    activeJobs: 5,
    totalApplications: 87,
    shortlisted: 23,
    hired: 8,
    recentApplications: [],
    topJobs: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    setDashboardData({
      activeJobs: 5,
      totalApplications: 87,
      shortlisted: 23,
      hired: 8,
      recentApplications: [
        { id: 1, name: 'Sarah Johnson', position: 'Frontend Developer', time: '2 hours ago', avatar: 'SJ' },
        { id: 2, name: 'Mike Chen', position: 'Data Scientist', time: '4 hours ago', avatar: 'MC' },
        { id: 3, name: 'Emily Davis', position: 'UX Designer', time: '6 hours ago', avatar: 'ED' }
      ],
      topJobs: [
        { id: 1, title: 'Senior Frontend Developer', applications: 34, views: 156 },
        { id: 2, title: 'Data Scientist', applications: 28, views: 142 },
        { id: 3, title: 'Product Manager', applications: 25, views: 98 }
      ]
    })
  }

  const statCards = [
    {
      title: 'Active Job Posts',
      value: dashboardData.activeJobs,
      icon: Briefcase,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      title: 'Total Applications',
      value: dashboardData.totalApplications,
      icon: Users,
      color: 'bg-green-500',
      change: '+12 this week'
    },
    {
      title: 'Shortlisted',
      value: dashboardData.shortlisted,
      icon: UserCheck,
      color: 'bg-yellow-500',
      change: '+5 pending review'
    },
    {
      title: 'Hired',
      value: dashboardData.hired,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+3 this month'
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
                Company Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your hiring process and find the perfect candidates
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Post New Job
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
                    <p className="text-green-600 text-sm mt-2">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-500">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {application.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{application.name}</h4>
                      <p className="text-sm text-gray-600">{application.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{application.time}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <button className="text-indigo-600 hover:text-indigo-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <UserCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Performing Jobs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Jobs</h3>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-500">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.topJobs.map((job) => (
                <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{job.title}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.applications} applications
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {job.views} views
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hiring Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hiring Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { stage: 'Applied', count: 87, color: 'bg-blue-500' },
              { stage: 'Screening', count: 34, color: 'bg-yellow-500' },
              { stage: 'Interview', count: 23, color: 'bg-orange-500' },
              { stage: 'Hired', count: 8, color: 'bg-green-500' }
            ].map((stage, index) => (
              <div key={stage.stage} className="text-center">
                <div className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-white font-bold text-lg">{stage.count}</span>
                </div>
                <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ChevronRight className="w-6 h-6 text-gray-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-opacity-30 transition-all"
            >
              <Briefcase className="w-6 h-6 mb-2" />
              <div className="font-medium">Post New Job</div>
              <div className="text-sm text-indigo-100">Create a new job posting</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-opacity-30 transition-all"
            >
              <Users className="w-6 h-6 mb-2" />
              <div className="font-medium">Review Candidates</div>
              <div className="text-sm text-indigo-100">Check pending applications</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-opacity-30 transition-all"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <div className="font-medium">Schedule Interviews</div>
              <div className="text-sm text-indigo-100">Manage interview calendar</div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CompanyDashboard