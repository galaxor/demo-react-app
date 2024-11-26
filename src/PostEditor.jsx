import {
  MDXEditor,
  toolbarPlugin,
    BlockTypeSelect,
    BoldItalicUnderlineToggles, 
    codeBlockPlugin,
    codeMirrorPlugin,
    CodeToggle,
    CreateLink,
    DiffSourceToggleWrapper,
    diffSourcePlugin,
    InsertCodeBlock,
    linkPlugin,
    linkDialogPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    quotePlugin,
    UndoRedo
 } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { useContext, useRef } from 'react'
import { Link } from "react-router-dom"
import { useNavigate } from "react-router"
import { v4 as uuidv4 } from "uuid"

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js'
import SystemNotificationsContext from './SystemNotificationsContext'
import UserContext from './UserContext.jsx'


import './static/PostEditor.css'

export default function PostEditor() {
  const editorRef = useRef(null);
  const db = useContext(DatabaseContext);
  const { user } = useContext(UserContext);
  const postsDB = new PostsDB(db);

  const {systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);
  

  const navigate = useNavigate();

  // XXX Language picker:  Do we make a custom toolbar component, or put it somewhere else?

  return (
    <>
    <div className="post-editor">
      <MDXEditor markdown="" ref={editorRef} autofocus
        placeholder="What do you want to share?"
        plugins={[
          codeBlockPlugin({defaultCodeBlockLanguage: ''}),
          codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', "": 'Text', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX' } }),
          diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          toolbarPlugin({
            toolbarClassName: "post-editor-toolbar",
            toolbarContents: () => (
              <>
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <CreateLink />
                  <CodeToggle />
                  <BlockTypeSelect />
                  <ListsToggle />
                  <InsertCodeBlock />
                </DiffSourceToggleWrapper>
              </>
            ),
          }),
          quotePlugin(),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
    <button onClick={() => savePost({ user, postsDB, text: editorRef.current.getMarkdown(), systemNotifications, setSystemNotifications, navigate })}>Post</button>
    </>
  );
}

function savePost({ user, postsDB, text, systemNotifications, setSystemNotifications, navigate }) {
  const postId = uuidv4();
  const postUri = user.handle+'/'+uuidv4();
  const createdAt = new Date().toISOString();
  const canonicalUrl = "/post/"+encodeURIComponent(postUri);

  const newPost = {
    uri: postUri,
    canonicalUrl: canonicalUrl,
    author: user.handle,
    createdAt: createdAt,
    updatedAt: createdAt,
    sensitive: false,
    text: text,
    spoilerText: null,
    deletedAt: null,
    inReplyTo: null,
    language: "", // XXX implement a language picker
    conversationId: null,
    local: true,
  };

  postsDB.addPost(newPost);
  setSystemNotifications([...systemNotifications, {uuid: uuidv4(), type: 'status',
    message: <>
      Your new post was saved. <Link to={canonicalUrl}>View post.</Link>
    </>
  }]);

  navigate(canonicalUrl);
}
