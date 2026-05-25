
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VC } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import { PREDEFINED_ROOMS } from '../constants';

interface EditVCLocationsModalProps {
  vc: VC | null;
  onClose: () => void;
}

const EditVCLocationsModal: React.FC<EditVCLocationsModalProps> = ({ vc, onClose }) => {
  const { updateVCLocations } = useAppContext();
  const [locations, setLocations] = useState<{ id: string; type: 'predefined' | 'other'; name: string }[]>([]);

  useEffect(() => {
    if (vc && vc.locations) {
      const initialLocations = vc.locations.map((locName, index) => {
        const isPredefined = PREDEFINED_ROOMS.some(r => r.name === locName);
        return {
          id: `loc-${index}-${Date.now()}`,
          type: (isPredefined ? 'predefined' : 'other') as 'predefined' | 'other',
          name: locName
        };
      });
      setLocations(initialLocations.length > 0 ? initialLocations : [{ id: 'init', type: 'predefined', name: '' }]);
    }
  }, [vc]);

  const handleTypeChange = (index: number, type: 'predefined' | 'other') => {
    const newLocs = [...locations];
    newLocs[index].type = type;
    newLocs[index].name = type === 'predefined' ? (PREDEFINED_ROOMS[0]?.name || '') : '';
    setLocations(newLocs);
  };

  const handleNameChange = (index: number, name: string) => {
    const newLocs = [...locations];
    newLocs[index].name = name;
    setLocations(newLocs);
  };

  const addLocation = () => {
    setLocations([...locations, { id: `loc-${Date.now()}`, type: 'predefined', name: '' }]);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (vc) {
      const finalNames = locations
        .map(l => l.name.trim())
        .filter(name => name !== '');
      
      if (finalNames.length === 0) {
        alert('Please provide at least one valid location.');
        return;
      }

      // Check if any "other" locations are empty
      const hasEmptyOther = locations.some(l => l.type === 'other' && l.name.trim() === '');
      if (hasEmptyOther) {
        alert('Please provide a name for the "Another Location" entries.');
        return;
      }

      updateVCLocations(vc.id, finalNames);
      onClose();
    }
  };

  if (!vc) return null;

  return (
    <Modal isOpen={!!vc} onClose={onClose} title="Edit Locations">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Updating locations for: <span className="font-bold text-gray-900 dark:text-white">{vc.subject}</span>
        </p>
        
        <div className="space-y-4">
          {locations.map((loc, index) => (
            <div key={loc.id} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 relative animate-fadeIn">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Select Room / Type</label>
                  <select
                    value={loc.type === 'other' ? 'other' : loc.name}
                    onChange={(e) => {
                      if (e.target.value === 'other') {
                        handleTypeChange(index, 'other');
                      } else {
                        handleTypeChange(index, 'predefined');
                        handleNameChange(index, e.target.value);
                      }
                    }}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="" disabled>-- Select Room --</option>
                    {PREDEFINED_ROOMS.map(room => (
                      <option key={room.name} value={room.name}>{room.name}</option>
                    ))}
                    <option value="other" className="font-bold text-cyan-600">Another Location...</option>
                  </select>
                </div>

                {loc.type === 'other' && (
                  <div className="animate-fade-in-down">
                    <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase mb-1">Location Name (Required)</label>
                    <input
                      type="text"
                      value={loc.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder="Enter custom location name"
                      className="w-full p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-cyan-500 dark:border-cyan-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              {locations.length > 1 && (
                <button 
                  onClick={() => removeLocation(index)} 
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition-colors"
                  title="Remove Location"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <Button type="button" variant="secondary" onClick={addLocation} className="w-full border-2 border-dashed border-gray-300 dark:border-slate-600 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700 py-3">
          + Add Another Location
        </Button>
      </div>

      <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200 dark:border-slate-700">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} className="px-8">
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default EditVCLocationsModal;
