
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole } from '../types';
import Header from './common/Header';
import ManagerDashboard from './ManagerDashboard';
import ReportingAuthorityDashboard from './ReportingAuthorityDashboard';
import ConductorDashboard from './ConductorDashboard';
import RailTelDashboard from './RailTelDashboard';
import ConfirmDeletionModal from './ConfirmDeletionModal';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser, deleteUser, logout, cancelDeletionRequest } = useAppContext();
  const navigate = useNavigate();
  const [showDeletionModal, setShowDeletionModal] = useState(false);

  useEffect(() => {
    if (currentUser?.deletionRequested) {
      setShowDeletionModal(true);
    } else {
      setShowDeletionModal(false);
    }
  }, [currentUser]);

  const handleConfirmDelete = () => {
    if (currentUser) {
      deleteUser(currentUser.id);
      logout();
      navigate('/login');
    }
  };

  const handleRejectDelete = () => {
    if (currentUser) {
      cancelDeletionRequest(currentUser.id);
      setShowDeletionModal(false);
    }
  };

  const renderDashboard = () => {
    switch (currentUser?.role) {
      case UserRole.Manager:
        return <ManagerDashboard />;
      case UserRole.ReportingAuthority:
        return <ReportingAuthorityDashboard />;
      case UserRole.Conductor:
        return <ConductorDashboard />;
      case UserRole.RailTel:
        return <RailTelDashboard />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-800">
               <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Unauthorized Protocol</h3>
               <p className="text-slate-500 dark:text-slate-400">Invalid user role detected. Please contact the administrator.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-[#0a0f1a] transition-colors duration-500">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 max-w-7xl animate-fade-in">
        {renderDashboard()}
      </main>

      <ConfirmDeletionModal 
        isOpen={showDeletionModal} 
        onConfirm={handleConfirmDelete}
        onReject={handleRejectDelete}
      />
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
