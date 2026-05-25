
import React, { useState, useMemo } from 'react';
import { VC } from '../types';
import Button from './common/Button';
import Modal from './common/Modal';
import VCDetailsModal from './VCDetailsModal';
import LocationSticker from './common/LocationSticker';

interface CalendarViewProps {
  vcs: VC[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ vcs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateVCs, setSelectedDateVCs] = useState<VC[] | null>(null);
  const [vcForDetails, setVcForDetails] = useState<VC | null>(null);

  const vcsByDate = useMemo(() => {
    const map = new Map<string, VC[]>();
    vcs.forEach(vc => {
      const dateStr = new Date(vc.startTime).toISOString().split('T')[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(vc);
    });
    return map;
  }, [vcs]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const vcsOnDay = vcsByDate.get(dateStr) || [];
    if (vcsOnDay.length > 0) {
      setSelectedDateVCs(vcsOnDay);
    }
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };
  
  const getSelectedDateFormatted = () => {
    if (!selectedDateVCs || selectedDateVCs.length === 0) return '';
    return new Date(selectedDateVCs[0].startTime).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="bg-slate-700 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => changeMonth(-1)} variant="secondary" className="px-3 py-1 text-sm">&lt; Prev</Button>
        <h5 className="font-bold text-lg text-white">{monthName} {year}</h5>
        <Button onClick={() => changeMonth(1)} variant="secondary" className="px-3 py-1 text-sm">Next &gt;</Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 font-semibold mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasVCs = vcsByDate.has(dateStr);
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          
          let dayClasses = "h-10 w-10 flex items-center justify-center rounded-full text-sm transition-colors relative";
          if (isToday) dayClasses += " border-2 border-cyan-500";
          if (hasVCs) dayClasses += " cursor-pointer bg-slate-600 hover:bg-cyan-700";

          return (
            <div key={day} className={dayClasses} onClick={() => handleDayClick(day)}>
              {day}
              {hasVCs && <span className="absolute bottom-1 h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>}
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={!!selectedDateVCs} 
        onClose={() => setSelectedDateVCs(null)} 
        title={`VCs for ${getSelectedDateFormatted()}`}
      >
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {selectedDateVCs?.map(vc => (
                 <div key={vc.id} className="bg-slate-700 p-3 rounded-lg flex justify-between items-center gap-3">
                    <div>
                        <p className="font-semibold">{vc.subject}</p>
                        <p className="text-sm text-gray-400">{new Date(vc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <LocationSticker locations={vc.locations} className="mt-1" />
                    </div>
                     <Button variant="secondary" onClick={() => {
                         setSelectedDateVCs(null);
                         setVcForDetails(vc);
                     }}>
                        Details
                    </Button>
                 </div>
            ))}
        </div>
         <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={() => setSelectedDateVCs(null)}>Close</Button>
        </div>
      </Modal>

      <VCDetailsModal vc={vcForDetails} onClose={() => setVcForDetails(null)} />
    </div>
  );
};

export default CalendarView;
