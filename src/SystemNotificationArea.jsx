import { useContext } from 'react';

import { v4 as uuidv4 } from 'uuid';

import SystemNotificationsContext from './SystemNotificationsContext.jsx';

export default function SystemNotificationArea() {
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const notifications = systemNotifications.map(item => <li key={uuidv4()} className="item.level">{item.message}</li> );

  if (systemNotifications) {
    return <section><h2>System Notifications</h2><ul id="system-notifications">{notifications}</ul></section>;
  }
}

