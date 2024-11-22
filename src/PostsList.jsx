import Post from './Post.jsx'

export default function PostsList({posts}) {
  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  if (posts && posts.length > 0) {
    return posts.map((post) => { 
      return (
        <Post key={post.uri} post={post} dateFormat={dateFormat} />
      );
    });
  } else {
    return "No posts to display.";
  }
}
