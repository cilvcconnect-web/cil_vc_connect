import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { User } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUserReminderSettings } = useAppContext();
  const [enabled, setEnabled] = useState(false);
  const [minutes, setMinutes] = useState(30);

  useEffect(() => {
    if (user) {
      setEnabled(user.remindersEnabled ?? false);
      setMinutes(user.reminderMinutes ?? 30);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    updateUserReminderSettings(user.id, {
      remindersEnabled: enabled,
      reminderMinutes: Number(minutes),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="VC Reminder Settings">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="enable-reminders" className="font-medium text-gray-200">
            Enable Reminders
          </label>
          <input
            id="enable-reminders"
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            className="h-6 w-6 rounded text-cyan-600 bg-slate-700 border-slate-500 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="reminder-minutes" className="block text-sm font-medium text-gray-300 mb-2">
            Remind me before VC starts (minutes)
          </label>
          <input
            id="reminder-minutes"
            type="number"
            value={minutes}
            onChange={e => setMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
            disabled={!enabled}
            className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
            min="1"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </Modal>
  );
};

export default ReminderSettingsModal;
