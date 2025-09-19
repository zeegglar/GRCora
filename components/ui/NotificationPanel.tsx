import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications, setGlobalNotificationHandler } from '../context/NotificationContext';

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);


const NotificationPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { notifications, addNotification, removeNotification, clearNotifications } = useNotifications();

    // Set up the global notification handler for use outside React components
    useEffect(() => {
        setGlobalNotificationHandler(addNotification);
    }, [addNotification]);

    // Update button position when panel opens
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [isOpen]);

    // Close panel when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const notificationPanel = isOpen && (
        <div
            className="fixed w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-[99999] animate-fade-in-scale-up"
            style={{
                top: `${buttonPosition.top}px`,
                right: `${buttonPosition.right}px`,
            }}
        >
            <div className="p-3 font-semibold text-heading border-b border-slate-700 flex justify-between items-center">
                <span>Notifications</span>
                {notifications.length > 0 && (
                    <button
                        onClick={clearNotifications}
                        className="text-xs text-muted hover:text-subheading transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <li className="p-4 text-center text-muted">No notifications</li>
                ) : (
                    notifications.map(n => (
                        <li key={n.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/50 group">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            n.type === 'success' ? 'bg-green-400' :
                                            n.type === 'warning' ? 'bg-yellow-400' :
                                            n.type === 'error' ? 'bg-red-400' :
                                            'bg-blue-400'
                                        }`} />
                                        <p className="text-sm text-body">{n.text}</p>
                                    </div>
                                    <p className="text-xs text-muted mt-1 ml-4">{n.time}</p>
                                </div>
                                <button
                                    onClick={() => removeNotification(n.id)}
                                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-subheading"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-muted hover:bg-slate-700/50 hover:text-heading"
            >
                <BellIcon className="h-6 w-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>
            {typeof window !== 'undefined' && createPortal(notificationPanel, document.body)}
        </div>
    );
};

export default NotificationPanel;
