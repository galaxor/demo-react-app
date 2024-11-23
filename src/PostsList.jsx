import Post from './Post.jsx'

export default function PostsList({posts}) {
  if (posts && posts.length > 0) {
    return posts.map((post) => { 
      return (
        <Post key={post.uri} post={post} />
      );
    });
  } else {
    return "No posts to display.";
  }
}
