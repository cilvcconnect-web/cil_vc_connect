import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { User } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { playVcReminderTune, playTechnicalIssueTune } from '../utils/audio';
import { Volume2, Play, Music, ShieldAlert } from 'lucide-react';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUserReminderSettings } = useAppContext();
  const [enabled, setEnabled] = useState(false);
  const [minutes, setMinutes] = useState(30);
  const [vcTune, setVcTune] = useState('crystal');
  const [techTune, setTechTune] = useState('siren');

  useEffect(() => {
    if (user) {
      setEnabled(user.remindersEnabled ?? false);
      setMinutes(user.reminderMinutes ?? 30);
      setVcTune(user.vcReminderTune ?? 'crystal');
      setTechTune(user.technicalIssueTune ?? 'siren');
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    updateUserReminderSettings(user.id, {
      remindersEnabled: enabled,
      reminderMinutes: Number(minutes),
      vcReminderTune: vcTune,
      technicalIssueTune: techTune,
    });
    onClose();
  };

  const handleTestVcTune = () => {
    playVcReminderTune(vcTune);
  };

  const handleTestTechTune = () => {
    playTechnicalIssueTune(techTune);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Preferences & Alarm Configuration">
      <div className="space-y-6">
        
        {/* Core VC reminder settings */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="enable-reminders" className="font-bold text-sm text-gray-200 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Enable VC Scheduled Reminders
            </label>
            <input
              id="enable-reminders"
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="h-6 w-6 rounded text-cyan-600 bg-slate-700 border-slate-500 focus:ring-cyan-500 cursor-pointer"
            />
          </div>
          
          <div>
            <label htmlFor="reminder-minutes" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Warning Period before VC starts (Minutes)
            </label>
            <input
              id="reminder-minutes"
              type="number"
              value={minutes}
              onChange={e => setMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
              disabled={!enabled}
              className="w-full p-2.5 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 text-xs font-mono font-bold"
              min="1"
            />
          </div>
        </div>

        {/* 🔊 VC REMINDER CUSTOM VOICE CHIME SECTION */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-white/5 space-y-3">
          <label className="block text-xs font-bold text-gray-100 uppercase tracking-widest flex items-center gap-2">
            <Music className="w-4 h-4 text-cyan-400" />
            VC Notification Chime Sound
          </label>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-relaxed">
            Choose the synthesizer tone pattern played when a VC milestone reminder triggers.
          </p>
          
          <div className="flex gap-2">
            <select
              value={vcTune}
              onChange={e => setVcTune(e.target.value)}
              className="flex-1 p-2.5 bg-slate-700 text-white text-xs font-semibold border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="crystal">💎 Crystal Ascending Chimes (Sine Wave)</option>
              <option value="zen">🧘‍♂️ Zen Meditative Arpeggio (Triangle Wave)</option>
            </select>
            
            <button
              onClick={handleTestVcTune}
              className="px-3.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Test play VC chime sound"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              Test Tone
            </button>
          </div>
        </div>

        {/* 🚨 TECHNICAL ISSUE SECTOR TUNE SECTION */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-white/5 space-y-3">
          <label className="block text-xs font-bold text-gray-100 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            Technical Signal Failure Alarm
          </label>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-relaxed">
            Choose the warning sound triggered when a meeting reports connection, or room power outages occur.
          </p>
          
          <div className="flex gap-2">
            <select
              value={techTune}
              onChange={e => setTechTune(e.target.value)}
              className="flex-1 p-2.5 bg-slate-700 text-white text-xs font-semibold border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="siren">🚨 Industrial Alert Siren (Sawtooth & Triangle)</option>
              <option value="warble">⚡ FM Warning Strobe Pulse (Pitch Sweep Sweep)</option>
            </select>
            
            <button
              onClick={handleTestTechTune}
              className="px-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Test play warning alarm sound"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Test Tone
            </button>
          </div>
        </div>

      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="secondary" onClick={onClose} className="!rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</Button>
        <Button onClick={handleSave} className="!rounded-xl text-xs font-bold uppercase tracking-widest">
          Save Settings
        </Button>
      </div>
    </Modal>
  );
};

export default ReminderSettingsModal;
