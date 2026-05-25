
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VC } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import { PREDEFINED_ROOMS } from '../constants';

interface EditRoomDetailsModalProps {
  vc: VC | null;
  onClose: () => void;
}

const EditRoomDetailsModal: React.FC<EditRoomDetailsModalProps> = ({ vc, onClose }) => {
  const { updateVCDetails } = useAppContext();
  const [roomName, setRoomName] = useState('');
  const [roomIp, setRoomIp] = useState('');
  const [buildingType, setBuildingType] = useState<'Office Block' | 'Corporate Block' | ''>('');

  useEffect(() => {
    if (vc) {
      setRoomName(vc.roomName || '');
      setRoomIp(vc.roomIp || '');
      setBuildingType(vc.buildingType || '');
    }
  }, [vc]);

  const handlePredefinedRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedIp = e.target.value;
      const room = PREDEFINED_ROOMS.find(r => r.ip === selectedIp);
      if (room) {
          setRoomIp(room.ip);
          setRoomName(room.name);
          
          // Auto-infer building type
          if (room.name.includes('CB') || room.name.includes('Corporate Block')) {
              setBuildingType('Corporate Block');
          } else if (room.name.includes('OB') || room.name.includes('Office Block')) {
              setBuildingType('Office Block');
          } else if (room.name.includes('Chamber') || room.name.includes('Board Room')) {
               // Defaulting chambers to Corporate Block as a best guess, user can change
              setBuildingType('Corporate Block');
          }
      }
  };

  const handleSave = () => {
    if (vc) {
      updateVCDetails(vc.id, {
        roomName: roomName || undefined,
        roomIp: roomIp || undefined,
        buildingType: buildingType || undefined,
      });
      onClose();
    }
  };

  if (!vc) {
    return null;
  }

  return (
    <Modal isOpen={!!vc} onClose={onClose} title="Edit Room Details">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
            For Meeting: <span className="font-bold text-gray-900 dark:text-white">{vc.subject}</span>
        </p>

        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quick Select Room</label>
            <select 
                onChange={handlePredefinedRoomChange}
                className="w-full p-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
                defaultValue=""
            >
                <option value="" disabled>-- Select a Predefined Room --</option>
                {PREDEFINED_ROOMS.map(room => (
                    <option key={room.ip} value={room.ip}>{room.name} ({room.ip})</option>
                ))}
            </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Name / Location</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g. Conference Room 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room IP</label>
          <input
            type="text"
            value={roomIp}
            onChange={(e) => setRoomIp(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g. 192.168.1.10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Building Type</label>
          <select
            value={buildingType}
            onChange={(e) => setBuildingType(e.target.value as 'Office Block' | 'Corporate Block')}
            className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">-- Select Building Type --</option>
            <option value="Office Block">Office Block</option>
            <option value="Corporate Block">Corporate Block</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default EditRoomDetailsModal;
