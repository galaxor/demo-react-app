import SystemNotificationArea from './SystemNotificationArea.jsx';

export default function PopularFeed() {
  return (
    <main>
      <h1 id="featured-feed">Popular Posts</h1>
      <SystemNotificationArea />
      <ul aria-describedby="featured-feed">
        <li><article>Test post 1 by person</article></li>
        <li><article>Test post 2 by other person</article></li>
      </ul>
    </main>
  );
}
