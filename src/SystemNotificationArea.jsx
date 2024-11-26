import { useContext } from 'react';
import { Link } from 'react-router-dom';

import SystemNotificationsContext from './SystemNotificationsContext.jsx';

export default function SystemNotificationArea() {
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const notifications = systemNotifications.map(item => {
    return (
      <li key={item.uuid} className="item.level" role={item.level == 'error'? "alert" : "status"}>
        <div className="message">{item.message}</div>
        <a aria-label="Close this notification"
          href=""
          onClick={(e) => {
            e.preventDefault();
            setSystemNotifications(systemNotifications.filter(notification => notification.uuid != item.uuid));
        }}>×</a>
      </li> 
    );
  });

  if (systemNotifications.length > 0) {
    return <aside id="system-notifications"><h2 id="system-notification-header">System Notifications</h2><ul aria-describedby="system-notification-header">{notifications}</ul></aside>;
  }
}

