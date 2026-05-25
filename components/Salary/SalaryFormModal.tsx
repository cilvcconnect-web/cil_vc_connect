
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SalaryVoucher } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface SalaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalaryFormModal: React.FC<SalaryFormModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitSalaryVoucher } = useAppContext();

  const [formData, setFormData] = useState<Partial<SalaryVoucher>>({
    voucherType: 'BANK',
    paidTo: currentUser?.name || '',
    project: 'COAL INDIA LIMITED',
    advance: 'NA',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    amountInWords: '',
    accountCode: '',
    accountNo: '',
    bankName: '',
    ifscCode: '',
    description: 'Salary/Reimbursement for...'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.amountInWords || !formData.bankName) {
        alert("Please fill in all required fields.");
        return;
    }

    if (currentUser) {
        submitSalaryVoucher({
            userId: currentUser.id,
            date: formData.date!,
            voucherType: formData.voucherType as 'BANK' | 'CASH',
            paidTo: formData.paidTo!,
            accountCode: formData.accountCode || 'N/A',
            accountNo: formData.accountNo!,
            bankName: formData.bankName!,
            ifscCode: formData.ifscCode!,
            project: formData.project!,
            advance: formData.advance!,
            amount: Number(formData.amount),
            amountInWords: formData.amountInWords!,
            description: formData.description!
        });
        onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Salary Voucher">
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-gray-300">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" required />
            </div>
             <div>
                <label className="block text-sm text-gray-300">Type</label>
                <select name="voucherType" value={formData.voucherType} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white">
                    <option value="BANK">BANK</option>
                    <option value="CASH">CASH</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm text-gray-300">Paid To</label>
            <input type="text" name="paidTo" value={formData.paidTo} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-300">Account No</label>
                <input type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" required />
            </div>
            <div>
                <label className="block text-sm text-gray-300">Account Code</label>
                <input type="text" name="accountCode" value={formData.accountCode} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-300">Bank Name</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" required />
            </div>
            <div>
                <label className="block text-sm text-gray-300">IFSC Code</label>
                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" required />
            </div>
        </div>

        <div>
            <label className="block text-sm text-gray-300">Description/Particulars</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" rows={2} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-300">Project</label>
                <input type="text" name="project" value={formData.project} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" />
            </div>
            <div>
                <label className="block text-sm text-gray-300">Advance (if any)</label>
                <input type="text" name="advance" value={formData.advance} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-300">Amount (Rs.)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" required />
            </div>
             <div>
                <label className="block text-sm text-gray-300">Amount In Words</label>
                <input type="text" name="amountInWords" value={formData.amountInWords} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white" placeholder="e.g. Two Thousand Only" required />
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-600">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">Submit Voucher</Button>
        </div>
      </form>
    </Modal>
  );
};

export default SalaryFormModal;
