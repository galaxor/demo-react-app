export function Notifications({ notificationsVisible }) {
  if (!notificationsVisible) { return ''; }

  return (
    <section id="notifications">
    <h2 id="notifications-header">Notifications</h2>
    <ul aria-labelledby="notifications-header">
      <li>No new notifications</li>
    </ul>
    </section>
  );
}
