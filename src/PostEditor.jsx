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
import { Button } from "@nextui-org/button"
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card"
import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react'
import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router"
import { v4 as uuidv4 } from "uuid"

import DatabaseContext from './DatabaseContext.jsx'
import { PeopleDB } from './logic/people.js'
import PostImageEditor from './PostImageEditor.jsx'
import { PostsDB } from './logic/posts.js'
import SystemNotificationsContext from './SystemNotificationsContext'
import UserContext from './UserContext.jsx'

import { tabOutPlugin, TabOutPlugin } from './editor/tabOut.jsx'

import './static/PostEditor.css'

// You can't post unless there's some text or at least one image.
function isPostDisabled(postText, uploadedImages) {
  const isPostDisabled = postText.length === 0 && Object.keys(uploadedImages).length === 0;
  return isPostDisabled;
}

const PostEditor = forwardRef(function PostEditor(props, ref) {
  const {onSave, onCancel, replyingTo, quotedPost, conversationId} = props;
  const [uploadedImages, setUploadedImages] = useState({});

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
        setUploadedImages({});
      },
      focus() {
        editorRef.current.focus();
      }
    };
  }, []);

  // The "autofocus" prop of MDXEditor doesn't seem to be hooked up to anything, so I'll do it myself!
  useEffect(() => {
    editorRef.current.focus();
  }, []);

  const navigate = useNavigate();

  const imageEditorRef = useRef();

  const [ postText, setPostText ] = useState("");
  const [ postDisabled, setPostDisabled ] = useState(true);

  // XXX Language picker:  Do we make a custom toolbar component, or put it somewhere else?

  return (
    <>
    <div className="post-editor">
      <Card>
        <MDXEditor markdown="" ref={editorRef} autofocus
          placeholder="What do you want to share?"
          onChange={text => { 
            setPostText(text);
            setPostDisabled(isPostDisabled(text, uploadedImages));
          }}
          plugins={[
            tabOutPlugin(),
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
                    <TabOutPlugin />
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
      </Card>
    </div>
    <PostImageEditor ref={imageEditorRef} uploadedImages={uploadedImages} 
      setUploadedImages={(uI) => {
        setPostDisabled(isPostDisabled(postText, uI));
        setUploadedImages(uI); 
      }}  />
    <div className="post-finish-actions">
      <Button variant="solid" color="primary" radius="full" ref={saveButtonRef}
        isDisabled={postDisabled}
        onPress={async () => await savePost({ user, peopleDB, postsDB, text: editorRef.current.getMarkdown(), systemNotifications, setSystemNotifications, onSave, replyingTo, conversationId, quotedPost, imageEditorRef })}>
          Post
      </Button>
      <Button variant="solid" color="danger" radius="full" onPress={() => cancelPost({ editorRef, systemNotifications, setSystemNotifications, onCancel })}>Cancel</Button>
    </div>
    </>
  );
});

export default PostEditor;

async function savePost({ user, peopleDB, postsDB, text, systemNotifications, setSystemNotifications, onSave, replyingTo, conversationId, quotedPost, imageEditorRef }) {
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
  await postsDB.attachImages(newPost.uri, images, createdAt);

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
