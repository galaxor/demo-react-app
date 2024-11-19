import SystemNotificationArea from './SystemNotificationArea.jsx';

export default function YourFeed() {
  return (
    <main>
      <h1 id="your-feed">Your Feed</h1>
      <SystemNotificationArea />
      <ul aria-describedby="your-feed">
        <li><article>Test post 1 by friend</article></li>
        <li><article>Test post 2 by other friend</article></li>
      </ul>
    </main>
  );
}
