
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import NewVCScreen from './components/NewVCScreen';
import SignUpScreen from './components/SignUpScreen';
import SalaryDashboard from './components/Salary/SalaryDashboard';
import ChatScreen from './components/Chat/ChatScreen';

const App: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-200 font-sans transition-colors duration-300">
        <Routes>
          {!currentUser ? (
            <>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignUpScreen />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/schedule-vc" element={<NewVCScreen />} />
              <Route path="/salary" element={<SalaryDashboard />} />
              <Route path="/chat" element={<ChatScreen />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;