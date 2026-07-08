import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { CalendarPage } from './pages/CalendarPage';
import { CoreCSPage } from './pages/CoreCSPage';
import { DashboardPage } from './pages/DashboardPage';
import { DSATrackerPage } from './pages/DSATrackerPage';
import { FullStackPage } from './pages/FullStackPage';
import { HackathonsPage } from './pages/HackathonsPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlacementTrackerPage } from './pages/PlacementTrackerPage';
import { ResumeHubPage } from './pages/ResumeHubPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignupPage } from './pages/SignupPage';
import { StudyHistoryPage } from './pages/StudyHistoryPage';
import { TasksPage } from './pages/TasksPage';
import { useNotifications } from './hooks/useNotifications';

function AppRoutes() {
  useNotifications();

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="dsa-tracker" element={<DSATrackerPage />} />
          <Route path="core-cs" element={<CoreCSPage />} />
          <Route path="full-stack" element={<FullStackPage />} />
          <Route path="study-history" element={<StudyHistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="placement-tracker" element={<PlacementTrackerPage />} />
          <Route path="interview-prep" element={<InterviewPrepPage />} />
          <Route path="mock-interview" element={<MockInterviewPage />} />
          <Route path="resume-hub" element={<ResumeHubPage />} />
          <Route path="hackathons" element={<HackathonsPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App() {
  return <AppRoutes />;
}
