import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Heart,
  Briefcase,
  FileText,
  UserPlus,
  Target,
  Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth()
  const location = useLocation()

  const getSidebarItems = () => {
    switch (profile?.role) {
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: Briefcase, label: 'Find Jobs', path: '/student/jobs' },
          { icon: FileText, label: 'Applications', path: '/student/applications' },
          { icon: FileText, label: 'Resume Builder', path: '/student/resume' },
          { icon: Heart, label: 'Wellness Tracker', path: '/student/wellness' },
          { icon: Target, label: 'Career Path', path: '/student/career' }
        ]
      case 'company':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/company/dashboard' },
          { icon: UserPlus, label: 'Post New Job', path: '/company/jobs/new' },
          { icon: Briefcase, label: 'My Job Posts', path: '/company/jobs' },
          { icon: Users, label: 'Candidates', path: '/company/candidates' },
          { icon: Calendar, label: 'Interviews', path: '/company/interviews' }
        ]
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: Users, label: 'Students', path: '/admin/students' },
          { icon: Building2, label: 'Companies', path: '/admin/companies' },
          { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
          { icon: Heart, label: 'Wellness Alerts', path: '/admin/wellness' }
        ]
      default:
        return []
    }
  }

  const sidebarItems = getSidebarItems()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 lg:static lg:translate-x-0"
      >
        <div className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar