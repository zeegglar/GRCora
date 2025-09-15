import React, { useState, useEffect } from 'react';
import { useNotifications, setGlobalNotificationHandler } from '../context/NotificationContext';

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);


const NotificationPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, addNotification, removeNotification, clearNotifications } = useNotifications();

    // Set up the global notification handler for use outside React components
    useEffect(() => {
        setGlobalNotificationHandler(addNotification);
    }, [addNotification]);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white">
                <BellIcon className="h-6 w-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-10 animate-fade-in-scale-up">
                    <div className="p-3 font-semibold text-white border-b border-slate-700">Notifications</div>
                    <ul className="max-h-80 overflow-y-auto">
                        {notifications.map(n => (
                            <li key={n.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/50">
                                <p className="text-sm text-slate-300">{n.text}</p>
                                <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
