import React, { useState } from 'react';
import type { Control } from '../../../types';
import { mockUsers } from '../../../services/api';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: Control;
}

const SendReminderModal: React.FC<SendReminderModalProps> = ({ isOpen, onClose, control }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
        alert('Please select a user to send the reminder to.');
        return;
    }
    alert(`Reminder sent to user ID ${selectedUser}!`);
    onClose();
  };
  
  const defaultMessage = `Hi team,\n\nThis is a friendly reminder to please provide evidence or update the status for the following control:\n\n- ${control.id}: ${control.name}\n\nThanks!`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Send Reminder</h2>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="user-select" className="block text-sm font-medium text-slate-300 mb-1">Recipient</label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select a user...</option>
                {mockUsers.filter(u => u.role.startsWith('CLIENT')).map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">Message</label>
              <textarea
                id="message"
                value={message || defaultMessage}
                onChange={e => setMessage(e.target.value)}
                rows={8}
                className="w-full p-2 text-sm bg-slate-900/50 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <footer className="p-4 border-t border-slate-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors text-white">Send</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default SendReminderModal;
