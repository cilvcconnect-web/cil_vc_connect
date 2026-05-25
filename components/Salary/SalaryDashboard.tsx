
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { UserRole, SalaryStatus, SalaryVoucher } from '../../types';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import SalaryFormModal from './SalaryFormModal';
import SalaryVoucherTemplate from './SalaryVoucherTemplate';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status: SalaryStatus) => {
    switch(status) {
        case SalaryStatus.Approved: return 'text-green-500';
        case SalaryStatus.Rejected: return 'text-red-500';
        case SalaryStatus.PendingRA: return 'text-yellow-500';
        case SalaryStatus.PendingManager: return 'text-orange-500';
        default: return 'text-gray-400';
    }
};

interface VoucherItemProps {
    voucher: SalaryVoucher;
    showActions?: boolean;
    onView: (v: SalaryVoucher) => void;
}

const VoucherItem: React.FC<VoucherItemProps> = ({ voucher, showActions = false, onView }) => {
    const { getUserById, approveSalaryVoucher, rejectSalaryVoucher } = useAppContext();
    const creator = getUserById(voucher.userId);
    
    return (
        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">{voucher.voucherType} Voucher</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{new Date(voucher.date).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Raised By: <span className="font-semibold">{creator?.name} ({creator?.role})</span></p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Amount: <span className="font-bold">₹{voucher.amount}</span></p>
                <p className={`text-sm font-semibold mt-1 ${getStatusColor(voucher.status)}`}>{voucher.status}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={() => onView(voucher)}>View Voucher</Button>
                {showActions && (
                    <>
                        <Button variant="success" onClick={() => approveSalaryVoucher(voucher.id)}>Approve</Button>
                        <Button variant="danger" onClick={() => rejectSalaryVoucher(voucher.id)}>Reject</Button>
                    </>
                )}
            </div>
        </div>
    );
};

const SalaryDashboard: React.FC = () => {
  const { currentUser, salaryVouchers, getUserById } = useAppContext();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<SalaryVoucher | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'approvals' | 'all'>('my');

  const myVouchers = useMemo(() => {
    if (!currentUser) return [];
    return salaryVouchers.filter(v => v.userId === currentUser.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, salaryVouchers]);

  const pendingApprovals = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ReportingAuthority) {
        return salaryVouchers.filter(v => v.status === SalaryStatus.PendingRA);
    }
    if (currentUser.role === UserRole.Manager) {
        return salaryVouchers.filter(v => v.status === SalaryStatus.PendingManager);
    }
    return [];
  }, [currentUser, salaryVouchers]);
  
  const allVouchers = useMemo(() => {
      if(currentUser?.role === UserRole.Manager) {
          return salaryVouchers.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return [];
  }, [currentUser, salaryVouchers]);

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>&larr; Back</Button>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Salary Portal</h2>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>+ New Voucher</Button>
            </div>

            {/* Tabs for Roles that have approvals */}
            {(currentUser?.role === UserRole.ReportingAuthority || currentUser?.role === UserRole.Manager) && (
                <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-slate-600 pb-2">
                    <button 
                        className={`pb-2 px-4 font-semibold ${activeTab === 'my' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('my')}
                    >
                        My Vouchers
                    </button>
                    <button 
                         className={`pb-2 px-4 font-semibold ${activeTab === 'approvals' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
                         onClick={() => setActiveTab('approvals')}
                    >
                        Pending Approvals ({pendingApprovals.length})
                    </button>
                    {currentUser.role === UserRole.Manager && (
                        <button 
                             className={`pb-2 px-4 font-semibold ${activeTab === 'all' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
                             onClick={() => setActiveTab('all')}
                        >
                            All Users History
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-4">
                {activeTab === 'my' && (
                    <>
                        {myVouchers.length === 0 && <p className="text-gray-500">No vouchers created yet.</p>}
                        {myVouchers.map(v => <VoucherItem key={v.id} voucher={v} onView={setSelectedVoucher} />)}
                    </>
                )}

                {activeTab === 'approvals' && (
                    <>
                        {pendingApprovals.length === 0 && <p className="text-gray-500">No pending approvals.</p>}
                        {pendingApprovals.map(v => <VoucherItem key={v.id} voucher={v} showActions={true} onView={setSelectedVoucher} />)}
                    </>
                )}

                 {activeTab === 'all' && currentUser?.role === UserRole.Manager && (
                    <>
                         <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded mb-4">
                             <h4 className="font-bold mb-2">Manager Overview</h4>
                             <Button variant="secondary" onClick={() => {
                                 // Simple export logic could be added here re-using export util or just table print
                                 alert("Export All functionality would generate a consolidated report.");
                             }}>Export All Data</Button>
                         </div>
                        {allVouchers.map(v => <VoucherItem key={v.id} voucher={v} onView={setSelectedVoucher} />)}
                    </>
                )}
            </div>

            <SalaryFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
            
            {selectedVoucher && (
                <SalaryVoucherTemplate 
                    voucher={selectedVoucher} 
                    prepUser={getUserById(selectedVoucher.userId)}
                    raUser={selectedVoucher.checkedByRaId ? getUserById(selectedVoucher.checkedByRaId) : undefined}
                    managerUser={selectedVoucher.passedByManagerId ? getUserById(selectedVoucher.passedByManagerId) : undefined}
                    onClose={() => setSelectedVoucher(null)} 
                />
            )}
        </main>
    </div>
  );
};

export default SalaryDashboard;
