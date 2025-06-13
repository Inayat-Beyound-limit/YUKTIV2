import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Heart, 
  Bell,
  Calendar,
  Target,
  Award,
  ChevronRight,
  Plus,
  AlertCircle,
  Loader
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface DashboardData {
  applications: number
  interviews: number
  jobMatches: number
  moodScore: number
  recentActivities: Array<{
    id: number
    type: string
    message: string
    time: string
  }>
  upcomingEvents: Array<{
    id: number
    title: string
    date: string
    time: string
  }>
}

const StudentDashboard: React.FC = () => {
  const { profile, user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    applications: 0,
    interviews: 0,
    jobMatches: 0,
    moodScore: 0,
    recentActivities: [],
    upcomingEvents: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData()
    }
  }, [user, profile])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, these would be actual database queries
      // For now, we'll use mock data with some randomization to simulate real data
      
      const mockData: DashboardData = {
        applications: Math.floor(Math.random() * 20) + 5,
        interviews: Math.floor(Math.random() * 5) + 1,
        jobMatches: Math.floor(Math.random() * 30) + 10,
        moodScore: Math.floor(Math.random() * 30) + 70,
        recentActivities: [
          { 
            id: 1, 
            type: 'application', 
            message: 'Applied to Software Developer at TechCorp', 
            time: '2 hours ago' 
          },
          { 
            id: 2, 
            type: 'match', 
            message: 'New job match: Frontend Developer at StartupXYZ', 
            time: '5 hours ago' 
          },
          { 
            id: 3, 
            type: 'mood', 
            message: 'Logged daily mood entry', 
            time: '1 day ago' 
          },
          { 
            id: 4, 
            type: 'interview', 
            message: 'Interview scheduled with DataFlow Inc', 
            time: '2 days ago' 
          }
        ],
        upcomingEvents: [
          { 
            id: 1, 
            title: 'Interview with TechCorp', 
            date: '2024-01-15', 
            time: '10:00 AM' 
          },
          { 
            id: 2, 
            title: 'Career Counseling Session', 
            date: '2024-01-16', 
            time: '2:00 PM' 
          },
          { 
            id: 3, 
            title: 'Resume Review Workshop', 
            date: '2024-01-18', 
            time: '11:00 AM' 
          }
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDashboardData(mockData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Applications',
      value: dashboardData.applications,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+3 this week',
      changeType: 'positive' as const
    },
    {
      title: 'Interviews',
      value: dashboardData.interviews,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+1 scheduled',
      changeType: 'positive' as const
    },
    {
      title: 'Job Matches',
      value: dashboardData.jobMatches,
      icon: Briefcase,
      color: 'bg-purple-500',
      change: '+5 new matches',
      changeType: 'positive' as const
    },
    {
      title: 'Wellness Score',
      value: `${dashboardData.moodScore}%`,
      icon: Heart,
      color: 'bg-pink-500',
      change: dashboardData.moodScore >= 75 ? '+5% this week' : 'Needs attention',
      changeType: dashboardData.moodScore >= 75 ? 'positive' as const : 'warning' as const
    }
  ]

  const quickActions = [
    { 
      title: 'Find New Jobs', 
      icon: Briefcase, 
      path: '/student/jobs', 
      color: 'bg-indigo-500',
      description: 'Browse latest opportunities'
    },
    { 
      title: 'Build Resume', 
      icon: FileText, 
      path: '/student/resume', 
      color: 'bg-green-500',
      description: 'AI-powered resume builder'
    },
    { 
      title: 'Log Mood', 
      icon: Heart, 
      path: '/student/wellness', 
      color: 'bg-pink-500',
      description: 'Track your wellness'
    },
    { 
      title: 'Career Path', 
      icon: Target, 
      path: '/student/career', 
      color: 'bg-purple-500',
      description: 'Explore career options'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'match':
        return <Briefcase className="w-4 h-4 text-green-500" />
      case 'mood':
        return <Heart className="w-4 h-4 text-pink-500" />
      case 'interview':
        return <Calendar className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your career journey today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Quick Apply
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
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-2 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'warning' ? 'text-yellow-600' : 'text-red-600'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.title}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-gray-900 block">{action.title}</span>
                        <span className="text-sm text-gray-500">{action.description}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-500 transition-colors">
              View all activities
            </button>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {dashboardData.upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {event.date}
                    </span>
                    <span>{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-500 transition-colors">
              View calendar
            </button>
          </motion.div>
        </div>

        {/* Mood Tracking Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">How are you feeling today?</h3>
              <p className="text-pink-100">Track your daily mood and well-being</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-4xl">
                {dashboardData.moodScore >= 80 ? '😊' : 
                 dashboardData.moodScore >= 60 ? '😐' : '😔'}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{dashboardData.moodScore}%</div>
                <div className="text-sm text-pink-100">Wellness Score</div>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Log Today's Mood
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDashboard