
import React from 'react';
import { SalaryVoucher, User } from '../../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SalaryVoucherTemplateProps {
  voucher: SalaryVoucher;
  prepUser?: User;
  raUser?: User; // Checked By
  managerUser?: User; // Passed By
  onClose: () => void;
}

// Simple helper to format amounts in INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const DigitalStamp: React.FC<{ name: string; role: string; date?: string; color: string }> = ({ name, role, date, color }) => (
    <div className={`border-2 border-${color}-600 text-${color}-700 p-1 rounded transform -rotate-12 bg-white bg-opacity-80 text-xs font-bold text-center w-32`}>
        <p className="uppercase border-b border-current mb-1 pb-1">Digitally Signed</p>
        <p>{name}</p>
        <p className="text-[10px]">{role}</p>
        {date && <p className="text-[9px]">{new Date(date).toLocaleDateString()}</p>}
    </div>
);

const SalaryVoucherTemplate: React.FC<SalaryVoucherTemplateProps> = ({ voucher, prepUser, raUser, managerUser, onClose }) => {

  const downloadPDF = async () => {
    const input = document.getElementById('voucher-pdf-content');
    if (input) {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voucher_${voucher.id}.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mb-4 overflow-hidden relative">
        <div className="p-4 bg-gray-200 flex justify-between items-center no-print">
           <h3 className="font-bold text-gray-800">Salary Voucher Preview</h3>
           <div className="flex gap-2">
             <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Close</button>
             {(voucher.status === 'Approved' || prepUser?.id === voucher.userId) && (
                <button onClick={downloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download PDF
                </button>
             )}
           </div>
        </div>

        {/* PDF CONTENT START */}
        <div id="voucher-pdf-content" className="p-10 bg-white text-black text-sm font-serif relative">
           
           {/* Header Table */}
           <div className="border-2 border-black mb-4">
             <div className="grid grid-cols-12 border-b border-black">
                <div className="col-span-8 p-2 border-r border-black">
                    <p className="underline font-bold text-xs">DEBIT/CREDIT VOUCHER</p>
                    <h1 className="text-3xl font-bold mt-2">MINESOURCE</h1>
                    <p className="font-bold text-lg">INDIA PRIVATE LIMITED</p>
                </div>
                <div className="col-span-4 p-2">
                   <div className="flex justify-between mb-1">
                       <span>No.</span>
                       <span className="font-mono">{voucher.id.split('-')[1]}</span>
                   </div>
                   <div className="border-t border-b border-black py-1 text-center font-bold">
                       {voucher.voucherType}
                   </div>
                   <div className="flex justify-between mt-1">
                       <span>DATE:</span>
                       <span>{new Date(voucher.date).toLocaleDateString()}</span>
                   </div>
                </div>
             </div>
             <div className="text-center font-bold py-1 border-b border-black bg-gray-100">
                 BANK / CASH VOUCHER
             </div>
             
             {/* Body Table */}
             <div className="grid grid-cols-12">
                 {/* Left Labels */}
                 <div className="col-span-12 grid grid-cols-12 border-b border-black">
                    <div className="col-span-10 p-1 border-r border-black font-bold">PARTICULARS</div>
                    <div className="col-span-2 p-1 font-bold text-center">AMOUNT (Rs.)</div>
                 </div>
                 
                 {/* Content Row 1: Credit/Debit Info */}
                 <div className="col-span-12 grid grid-cols-12 border-b border-black min-h-[200px]">
                    <div className="col-span-10 p-2 border-r border-black relative">
                        <div className="grid grid-cols-12 gap-2 mb-2">
                            <div className="col-span-2 font-bold">PAID TO :</div>
                            <div className="col-span-10 border-b border-dotted border-black">{voucher.paidTo}</div>
                        </div>
                        <div className="grid grid-cols-12 gap-2 mb-2">
                            <div className="col-span-2 font-bold">Account Code :</div>
                            <div className="col-span-4 border border-black h-6 flex items-center px-1">{voucher.accountCode}</div>
                        </div>
                        <div className="grid grid-cols-12 gap-2 mb-2">
                            <div className="col-span-2 font-bold">Account No. :</div>
                            <div className="col-span-10 border-b border-dotted border-black">{voucher.accountNo}</div>
                        </div>
                        <div className="grid grid-cols-12 gap-2 mb-2">
                            <div className="col-span-2 font-bold">Bank Name :</div>
                            <div className="col-span-10 border-b border-dotted border-black">{voucher.bankName}</div>
                        </div>
                         <div className="grid grid-cols-12 gap-2 mb-2">
                            <div className="col-span-2 font-bold">IFSC Code :</div>
                            <div className="col-span-10 border-b border-dotted border-black">{voucher.ifscCode}</div>
                        </div>
                        <div className="grid grid-cols-12 gap-2 mb-2 mt-4">
                             <div className="col-span-2 font-bold">Description :</div>
                             <div className="col-span-10 italic">{voucher.description}</div>
                        </div>
                        <div className="grid grid-cols-12 gap-2 mb-2 mt-2">
                             <div className="col-span-2 font-bold">Project :</div>
                             <div className="col-span-10">{voucher.project}</div>
                        </div>
                         <div className="grid grid-cols-12 gap-2 mb-2">
                             <div className="col-span-2 font-bold">Advance if any:</div>
                             <div className="col-span-10">{voucher.advance}</div>
                        </div>
                    </div>
                    <div className="col-span-2 p-2 text-right font-mono text-lg">
                        {formatCurrency(voucher.amount)}
                    </div>
                 </div>

                  {/* Amount in words */}
                 <div className="col-span-12 grid grid-cols-12 border-b border-black">
                    <div className="col-span-10 p-2 border-r border-black">
                        <span className="font-bold mr-2">RUPEES:</span>
                        <span className="italic uppercase">{voucher.amountInWords} Only</span>
                    </div>
                    <div className="col-span-2 p-2 font-bold text-center bg-gray-100">
                        TOTAL
                    </div>
                 </div>
             </div>
           </div>

           {/* Signatures */}
           <div className="flex justify-between items-end mt-12 px-4">
               <div className="text-center">
                   <div className="mb-8 font-bold border-b border-dotted border-black pb-1">
                        {prepUser?.name || 'Unknown'}
                   </div>
                   <p className="font-bold">Prep by</p>
                   <p className="text-xs">({prepUser?.role})</p>
               </div>
               
               <div className="text-center relative">
                   {/* Digital Stamp for RA */}
                   {voucher.checkedByRaId && raUser && (
                       <div className="absolute -top-12 left-0 right-0 flex justify-center">
                           <DigitalStamp name={raUser.name} role="Accountant/RA" date={voucher.checkedDate} color="blue" />
                       </div>
                   )}
                   <div className="mb-8 font-bold border-b border-dotted border-black pb-1 min-w-[150px]">
                        {raUser ? raUser.name : 'Pending...'}
                   </div>
                   <p className="font-bold">Checked (Accountant)</p>
                   <p className="text-xs">Full Name</p>
               </div>

               <div className="text-center relative">
                   {/* Digital Stamp for Manager */}
                   {voucher.passedByManagerId && managerUser && (
                       <div className="absolute -top-12 left-0 right-0 flex justify-center">
                            <DigitalStamp name={managerUser.name} role="Manager" date={voucher.passedDate} color="green" />
                       </div>
                   )}
                   <div className="mb-8 font-bold border-b border-dotted border-black pb-1 min-w-[150px]">
                       {managerUser ? managerUser.name : (voucher.status === 'Rejected' ? 'Rejected' : 'Pending...')}
                   </div>
                   <p className="font-bold">Passed</p>
                   <p className="text-xs">Full Name</p>
               </div>
           </div>
            
           <div className="mt-8 text-center text-[10px] text-gray-500">
               Generated by CIL VC Connect System
           </div>
        </div>
        {/* PDF CONTENT END */}

      </div>
    </div>
  );
};

export default SalaryVoucherTemplate;
