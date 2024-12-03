import { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import icons from './icons.js'
import SystemNotificationsContext from './SystemNotificationsContext.jsx';

import './static/SystemNotificationArea.css'

export default function SystemNotificationArea() {
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const ulRef = useRef(null);

  function clickNotification(e) {
    // Find the notification li at the top.
    var node = e.target;
    for ( ; !((node.nodeName === "LI" && node.classList.contains("notification")) || node.nodeName === "A"); node = node.parentElement) { }

    console.log(node, node.nodeName);

    // If the thing they clicked was a link, let that happen.
    if (node.nodeName === "A") { return; }

    // Find the close link and click it.
    const closeLink = node.querySelector('.close-notification')
    if (closeLink) { closeLink.click(); }
  }

  // Make it so when you click a notification, it gets dismissed.
  useEffect(() => {
    // If there aren't any notifications, we don't have to make them clickable.
    if (!ulRef || !ulRef.current) { return; }

    const clickablePosts = ulRef.current.querySelectorAll('li.notification')

    clickablePosts.forEach(node => {
      node.addEventListener('click', clickNotification);
    });

    return(() => {
      clickablePosts.forEach(node => {
        node.removeEventListener('click', clickNotification);
      });
    });
  }, [systemNotifications]);

  const notifications = systemNotifications.map(item => {
    return (
      <li key={item.uuid} className={item.type + " notification"}>
        <div role={item.type == 'error'? "alert" : "status"}>
          <div className="message">{item.message}</div>
          <a className="close-notification" aria-label="Close this notification"
            href=""
            onClick={(e) => {
              e.preventDefault();
              setSystemNotifications(systemNotifications.filter(notification => notification.uuid != item.uuid));
          }}><FontAwesomeIcon icon={icons.xmark} /></a>
        </div>
      </li> 
    );
  });

  if (systemNotifications.length > 0) {
    return <aside id="system-notifications"><h2 id="system-notification-header">System Notifications</h2><ul ref={ulRef} className="notifications" aria-describedby="system-notification-header">{notifications}</ul></aside>;
  }
}

