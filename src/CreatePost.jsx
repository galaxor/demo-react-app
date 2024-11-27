import PostEditor from './PostEditor.jsx';

export default function CreatePost() {
  return (
    <main className="create-post">
      <h1>Create a Post</h1>

      <PostEditor onSave={navigateToNewPost} />
    </main>
  );
}

function navigateToNewPost(post) {
  navigate(post.canonicalUrl);
}
