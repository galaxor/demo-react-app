import { useEffect, useRef, useState } from 'react';

export default function NotificationBell() {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const notificationsBoxRef = useRef(null);
  const notificationsBoxCheckboxRef = useRef(null);
  const notificationsBoxBellRef = useRef(null);

  useEffect(() => {
    function escKeyHandler(e) {
      if (e.key == 'Escape') {
        setNotificationsVisible(false);
      }
    }

    if (notificationsVisible) {
      window.addEventListener('keyup', escKeyHandler);
    }

    return () => {
      window.removeEventListener('keyup', escKeyHandler); 
    };
    
  }, [notificationsVisible, setNotificationsVisible]);

  useEffect(() => {
    function closeNotificationsBox(e) {
      if (notificationsVisible
        && !notificationsBoxCheckboxRef.current.contains(e.target)
        && !notificationsBoxBellRef.current.contains(e.target)
        && !notificationsBoxRef.current.contains(e.target))
      {
        setNotificationsVisible(false);
      }
    }

    if (notificationsVisible) {
      window.addEventListener('click', closeNotificationsBox);
    }

    return () => { 
      window.removeEventListener('click', closeNotificationsBox); 
    };
  }, [notificationsVisible, setNotificationsVisible, notificationsBoxCheckboxRef, notificationsBoxBellRef, notificationsBoxRef]);


  return (
    <>
      <input id="notifications-checkbox" type="checkbox"
        ref={notificationsBoxCheckboxRef}
        checked={notificationsVisible}
        aria-label="No new notifications"
        onChange={(e) => {
          setNotificationsVisible(e.target.checked);
         }}
      />
      <label htmlFor="notifications-checkbox" id="notifications-bell" ref={notificationsBoxBellRef}>🔔</label>

      {notificationsVisible ? 
        <section id="notifications" ref={notificationsBoxRef}>
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
