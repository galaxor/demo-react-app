import { forwardRef, useEffect } from 'react';

const Notifications = forwardRef((props, ref) => {
  const { setNotificationsVisible } = props;

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


  // Make it so clicking outside the notifications box closes the box
  useEffect(() => {
    const closeNotificationsBox = (e) => {
      if (!ref.current.contains(e.target) && e.target.id!='notifications-checkbox' && e.target.id!='notifications-bell') {
        setNotificationsVisible(false);
      }
    };

    window.addEventListener('click', closeNotificationsBox);

    return () => { 
      window.removeEventListener('click', closeNotificationsBox); 
    };
  }, [setNotificationsVisible]);


  return (
    <section ref={ref} id="notifications">
    <h2 id="notifications-header">Notifications</h2>
    <ul aria-labelledby="notifications-header">
      <li>No new notifications</li>
    </ul>
    </section>
  );
});

export default Notifications;
