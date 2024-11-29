import { useRef } from 'react'
import { useNavigate } from "react-router"
import { useLoaderData } from 'react-router-dom'

import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';

export default function QuoteBoost() {
  const { post } = useLoaderData();

  const navigate = useNavigate();

  const quotedPostRef = useRef();

  return <>
    <main>
      <h1>Quote boost</h1>

      <SystemNotificationArea />

      <PostEditor quotedPost={post} onSave={post => navigate(post.canonicalUrl)} onCancel={() => navigate(-1)} />

      <section>
      <h2>The Post You're Quoting</h2>

      <Post ref={quotedPostRef} post={post} showStats={false} />

      </section>
    </main>
  </>
  ;
}
