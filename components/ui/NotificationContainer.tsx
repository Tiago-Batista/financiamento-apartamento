
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import NotificationToast from './NotificationToast';

const NotificationContainer: React.FC = () => {
  const { state } = useAppContext();

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-20 right-4 md:top-6 md:right-6 z-50 space-y-3 w-full max-w-sm sm:max-w-md print:hidden"
      aria-live="polite" // Screen readers will announce changes in this container
    >
      {state.notifications.map(notification => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;
