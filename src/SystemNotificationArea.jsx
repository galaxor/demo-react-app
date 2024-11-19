import { useContext } from 'react';

import { v4 as uuidv4 } from 'uuid';

import SystemNotificationsContext from './SystemNotificationsContext.jsx';

export default function SystemNotificationArea() {
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const notifications = systemNotifications.map(item => 
    <li key={uuidv4()} className="item.level" role={item.level == 'error'? "alert" : "status"}>{item.message}</li> 
  );

  if (systemNotifications) {
    return <section id="system-notifications"><h2 id="system-notification-header">System Notifications</h2><ul aria-describedby="system-notification-header">{notifications}</ul></section>;
  }
}

