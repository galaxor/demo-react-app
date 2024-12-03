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
import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react'
import { Link } from "react-router-dom"
import { useNavigate } from "react-router"
import { v4 as uuidv4 } from "uuid"

import DatabaseContext from './DatabaseContext.jsx'
import { PeopleDB } from './logic/people.js'
import PostImageEditor from './PostImageEditor.jsx'
import { PostsDB } from './logic/posts.js'
import SystemNotificationsContext from './SystemNotificationsContext'
import UserContext from './UserContext.jsx'


import './static/PostEditor.css'

const PostEditor = forwardRef(function PostEditor(props, ref) {
  const {onSave, onCancel, replyingTo, quotedPost, conversationId} = props;

  const editorRef = useRef(null);
  const db = useContext(DatabaseContext);
  const { user } = useContext(UserContext);
  const peopleDB = new PeopleDB(db);
  const postsDB = new PostsDB(db);

  const {systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const saveButtonRef = useRef();

  useImperativeHandle(ref, () => {
    return {
      clear() {
        editorRef.current.setMarkdown("");
      },
    };
  }, []);

  // The "autofocus" prop of MDXEditor doesn't seem to be hooked up to anything, so I'll do it myself!
  useEffect(() => {
    editorRef.current.focus();
  });

  const navigate = useNavigate();

  const imageEditorRef = useRef();

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
    <PostImageEditor ref={imageEditorRef} />
    <div className="post-finish-actions">
      <button className="button" ref={saveButtonRef} onClick={() => savePost({ user, peopleDB, postsDB, text: editorRef.current.getMarkdown(), systemNotifications, setSystemNotifications, onSave, replyingTo, conversationId, quotedPost, imageEditorRef })}>Post</button>
      <button className="button button-cancel" onClick={() => cancelPost({ editorRef, systemNotifications, setSystemNotifications, onCancel })}>Cancel</button>
    </div>
    </>
  );
});

export default PostEditor;

function savePost({ user, peopleDB, postsDB, text, systemNotifications, setSystemNotifications, onSave, replyingTo, conversationId, quotedPost, imageEditorRef }) {
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
    type: "markdown",
    text: text,
    spoilerText: null,
    deletedAt: null,
    inReplyTo: replyingTo ?? null,
    language: "", // XXX implement a language picker
    conversationId: conversationId,
    local: true,
  };

  postsDB.addPost(newPost);

  if (quotedPost) {
    postsDB.quoteBoost({boostersPostUri: postUri, boostedPostUri: quotedPost.uri, boosterHandle: user.handle});
  }

  setSystemNotifications([...systemNotifications, {uuid: uuidv4(), type: 'success',
    message: <>
      Your new post was saved. <Link to={canonicalUrl}>View post.</Link>
    </>
  }]);

  const images = imageEditorRef.current.getImages();
  postsDB.attachImages(newPost.uri, images);

  newPost.authorPerson = peopleDB.get(user.handle);

  typeof onSave === "function" && onSave(newPost);
}

function cancelPost({editorRef, systemNotifications, setSystemNotifications, onCancel}) {
  const currentText = editorRef.current.getMarkdown();

  if (currentText === "" || confirm("Are you sure you want to cancel this post and lose what you've written?")) {
    setSystemNotifications([...systemNotifications, {uuid: uuidv4(), type: 'warn',
      message: <>
        You clicked "Cancel", so your post was not saved.
      </>
    }]);

    typeof onCancel === "function" && onCancel();
  }
}
