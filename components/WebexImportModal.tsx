
import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { parseWebexInvite, WebexParsedDetails } from '../services/webexService';

interface WebexImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (details: WebexParsedDetails) => void;
}

const WebexLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
);

const WebexImportModal: React.FC<WebexImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [inviteText, setInviteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = async () => {
    if (!inviteText.trim()) return;
    
    setIsParsing(true);
    const result = await parseWebexInvite(inviteText);
    setIsParsing(false);

    if (result) {
      onImport(result);
      onClose();
      setInviteText('');
    } else {
      alert("Failed to extract meeting details. Please check the text and try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import from Webex">
      <div className="space-y-4">
        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <WebexLogo />
            <p className="text-sm font-medium">Paste the Webex invitation text below to auto-fill meeting details.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Invitation Snippet
          </label>
          <textarea
            value={inviteText}
            onChange={(e) => setInviteText(e.target.value)}
            rows={8}
            className="w-full p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            placeholder="Example: &#10;Meeting Number: 2519... &#10;Join link: https://webex.com/..."
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isParsing}>Cancel</Button>
          <Button 
            onClick={handleParse} 
            disabled={isParsing || !inviteText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isParsing ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Parsing with AI...
                </span>
            ) : 'Auto-Fill Details'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WebexImportModal;
