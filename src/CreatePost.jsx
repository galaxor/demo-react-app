import { useRef } from 'react'
import { useNavigate } from "react-router"

import PostEditor from './PostEditor.jsx';

export default function CreatePost() {
  const navigate = useNavigate();
  const editorRef = useRef();

  return (
    <main className="create-post">
      <h1>Create a Post</h1>

      <PostEditor ref={editorRef} onSave={post => navigateToNewPost(post, navigate) }
        onCancel={() => {
          navigateToCreatePost(navigate);
          editorRef.current.clear();
          editorRef.current.focus();
        }}
      />
    </main>
  );
}

function navigateToNewPost(post, navigate) {
  navigate(post.canonicalUrl);
}

function navigateToCreatePost(navigate) {
  navigate("/create");
}
