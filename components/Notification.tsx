
import React from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'warning';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const baseClasses = "fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg flex items-center";
    const typeClasses = {
        success: 'bg-green-100 border-l-4 border-green-500 text-green-700',
        error: 'bg-red-100 border-l-4 border-red-500 text-red-700',
        warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
    };

    const title = {
        success: 'Sucesso',
        error: 'Erro',
        warning: 'Aviso'
    }

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <div className="flex-1">
                <p className="font-bold">{title[type]}</p>
                <p>{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};

export default Notification;
