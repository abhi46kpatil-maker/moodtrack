import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BreathingModal } from './components/relaxation/BreathingModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { ProfileModal } from './components/common/ProfileModal';

// Auth Page
import { LoginPage } from './pages/auth/LoginPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { DailyCheckIn } from './pages/student/DailyCheckIn';
import { StudentTrends } from './pages/student/StudentTrends';
import { PersonalHeatmap } from './pages/student/PersonalHeatmap';
import { StudentHistory } from './pages/student/StudentHistory';
import { PersonalInsights } from './pages/student/PersonalInsights';

// Mentor Pages
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MentorStudents } from './pages/mentor/MentorStudents';
import { MentorHeatmap } from './pages/mentor/MentorHeatmap';
import { MentorAlerts } from './pages/mentor/MentorAlerts';
import { MentorAnalytics } from './pages/mentor/MentorAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsManagement } from './pages/admin/StudentsManagement';
import { MentorsManagement } from './pages/admin/MentorsManagement';
import { MentorAssignments } from './pages/admin/MentorAssignments';
import { CollegeHeatmap } from './pages/admin/CollegeHeatmap';
import { AdminAlerts } from './pages/admin/AdminAlerts';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AcademicPeriods } from './pages/admin/AcademicPeriods';
import { AdminSettings } from './pages/admin/AdminSettings';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync default view when role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'student') setCurrentView('student_dashboard');
      else if (user.role === 'mentor') setCurrentView('mentor_dashboard');
      else if (user.role === 'admin') setCurrentView('admin_dashboard');
    }
  }, [user?.role, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-medium">Initializing MoodTrack...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Render role-isolated views with strict role boundary enforcement
  const renderContent = () => {
    if (user.role === 'student') {
      switch (currentView) {
        case 'student_checkin':
          return <DailyCheckIn onComplete={() => setCurrentView('student_dashboard')} />;
        case 'student_trends':
          return <StudentTrends />;
        case 'student_heatmap':
          return <PersonalHeatmap />;
        case 'student_history':
          return <StudentHistory />;
        case 'student_insights':
          return <PersonalInsights onOpenBreathing={() => setIsBreathingOpen(true)} />;
        case 'student_dashboard':
        default:
          return (
            <StudentDashboard
              onNavigateToCheckin={() => setCurrentView('student_checkin')}
              onOpenBreathing={() => setIsBreathingOpen(true)}
            />
          );
      }
    }

    if (user.role === 'mentor') {
      switch (currentView) {
        case 'mentor_students':
          return <MentorStudents onNavigateToHeatmap={() => setCurrentView('mentor_heatmap')} />;
        case 'mentor_heatmap':
          return <MentorHeatmap />;
        case 'mentor_alerts':
          return <MentorAlerts />;
        case 'mentor_analytics':
          return <MentorAnalytics />;
        case 'mentor_dashboard':
        default:
          return (
            <MentorDashboard
              onNavigateToAlerts={() => setCurrentView('mentor_alerts')}
              onNavigateToHeatmap={() => setCurrentView('mentor_heatmap')}
              onNavigateToStudents={() => setCurrentView('mentor_students')}
            />
          );
      }
    }

    if (user.role === 'admin') {
      switch (currentView) {
        case 'admin_students':
          return <StudentsManagement />;
        case 'admin_mentors':
          return <MentorsManagement />;
        case 'admin_assignments':
          return <MentorAssignments />;
        case 'admin_heatmap':
          return <CollegeHeatmap />;
        case 'admin_alerts':
          return <AdminAlerts />;
        case 'admin_analytics':
          return <AdminAnalytics />;
        case 'admin_academic':
          return <AcademicPeriods />;
        case 'admin_settings':
          return <AdminSettings />;
        case 'admin_dashboard':
        default:
          return (
            <AdminDashboard
              onNavigateToAssignments={() => setCurrentView('admin_assignments')}
              onNavigateToHeatmap={() => setCurrentView('admin_heatmap')}
            />
          );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb] dark:bg-[#070b16] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic atmospheric ambient glow mesh */}
      <div className="absolute -top-24 right-10 w-[550px] h-[550px] bg-gradient-to-br from-teal-400/20 via-indigo-500/15 to-transparent dark:from-teal-500/15 dark:via-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/15 via-indigo-500/10 to-teal-400/15 dark:from-purple-600/10 dark:via-indigo-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/3 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-400/15 via-teal-500/10 to-transparent dark:from-emerald-500/10 dark:via-teal-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Main Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onOpenBreathing={() => setIsBreathingOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Layout Body with Role-Differentiated Sidebar */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenBreathing={() => setIsBreathingOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pb-16">
          {renderContent()}
        </main>
      </div>

      {/* Interactive 60-Second Breathing Relaxation Modal */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      {/* Account Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* In-App Notification Drawer */}
      <NotificationDrawer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
