

import React, { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { NotificationMessage, NotificationType } from '../../types';

interface NotificationToastProps {
  notification: NotificationMessage;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;


const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const { dispatch } = useAppContext();

  useEffect(() => {
    let timerId: number | null = null;
    if (notification.duration) {
      timerId = window.setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }, notification.duration);
    }
    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [notification, dispatch]);

  const handleClose = () => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
  };

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: <CheckCircleIcon />,
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: <ExclamationTriangleIcon />,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-400',
          text: 'text-gray-800',
          icon: <ExclamationTriangleIcon />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: <InfoIcon />,
        };
    }
  };

  const styles = getStyles(notification.type);

  return (
    <div
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      className={`${styles.bg} ${styles.text} p-4 rounded-md shadow-lg flex items-center justify-between transition-all duration-300 ease-in-out transform animate-fadeIn`}
    >
      <div className="flex items-center">
        <span className="mr-3">{styles.icon}</span>
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
      <button
        onClick={handleClose}
        aria-label="Fechar notificação"
        className={`ml-4 p-1 rounded-md hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors`}
      >
        <CloseIcon />
      </button>
      {/* The <style jsx> block has been removed to fix the type error.
          Ensure that 'animate-fadeIn' is defined in your Tailwind config or global CSS.
          Example for tailwind.config.js if it's a custom animation:
          theme: {
            extend: {
              keyframes: {
                fadeIn: {
                  '0%': { opacity: '0', transform: 'translateY(-10px)' },
                  '100%': { opacity: '1', transform: 'translateY(0)' },
                }
              },
              animation: {
                fadeIn: 'fadeIn 0.3s ease-out',
              }
            }
          }
      */}
    </div>
  );
};

export default NotificationToast;