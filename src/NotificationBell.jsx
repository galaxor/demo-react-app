import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import icons from './icons.js'

import './static/NotificationBell.css';

export default function NotificationBell() {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const notificationsBoxRef = useRef(null);
  const notificationsBoxCheckboxRef = useRef(null);
  const notificationsBoxBellRef = useRef(null);

  // Pressing escape causes the notifications box to close
  useEffect(() => {
    function escKeyHandler(e) {
      if (e.key == 'Escape') {
        setNotificationsVisible(false);
        notificationsBoxCheckboxRef.current.focus();
      }
    }

    if (notificationsVisible) {
      window.addEventListener('keyup', escKeyHandler);
    }

    return () => {
      window.removeEventListener('keyup', escKeyHandler); 
    };
    
  }, [notificationsVisible, setNotificationsVisible]);

  // Clicking outside the notifications box causes it to close
  useEffect(() => {
    function closeNotificationsBox(e) {
      if (notificationsVisible
        && !notificationsBoxCheckboxRef.current.contains(e.target)
        && !notificationsBoxBellRef.current.contains(e.target)
        && !notificationsBoxRef.current.contains(e.target))
      {
        setNotificationsVisible(false);
        notificationsBoxCheckboxRef.current.focus();
      }
    }

    if (notificationsVisible) {
      window.addEventListener('click', closeNotificationsBox);
    }

    return () => { 
      window.removeEventListener('click', closeNotificationsBox); 
    };
  }, [notificationsVisible, setNotificationsVisible]);

  // Focus the notifications box when it first appears.
  useEffect(() => {
    if (notificationsVisible) {
      notificationsBoxRef.current.focus();
    }
  }, [notificationsVisible]);

  return (
    <>
      <input id="notifications-checkbox" type="checkbox"
        ref={notificationsBoxCheckboxRef}
        checked={notificationsVisible}
        aria-label="No new notifications"
        onChange={(e) => {
          setNotificationsVisible(e.target.checked);

          if (!e.target.checked) {
            notificationsBoxCheckboxRef.current.focus();
          }
        }}
      />
      <label htmlFor="notifications-checkbox" id="notifications-bell" ref={notificationsBoxBellRef}>
        <FontAwesomeIcon title="No new notifications" icon={icons.bell} />
      </label>

      {notificationsVisible ? 
        <section id="notifications" ref={notificationsBoxRef} tabIndex="-1">
        <h2 id="notifications-header">Notifications</h2>
        <ul aria-labelledby="notifications-header">
          <li>No new notifications</li>
        </ul>
        </section>
        :
        ''
      }
    </>
  );
}
