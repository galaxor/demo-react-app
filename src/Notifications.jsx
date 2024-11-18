import { useEffect } from 'react';

export function Notifications({ setNotificationsVisible }) {
  // Make the Escape key close the notifications box.
  useEffect(() => {
    const closeNotificationsBox = (e) => {
      if (e.key == 'Escape') {
        setNotificationsVisible(false);
      }
    };

    window.addEventListener('keyup', closeNotificationsBox);

    return () => { 
      window.removeEventListener('keyup', closeNotificationsBox); 
    };
  }, [setNotificationsVisible]);


  return (
    <section id="notifications">
    <h2 id="notifications-header">Notifications</h2>
    <ul aria-labelledby="notifications-header">
      <li>No new notifications</li>
    </ul>
    </section>
  );
}
