import { 
  MDXEditor,
  toolbarPlugin,
    BoldItalicUnderlineToggles, 
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
    UndoRedo
 } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css';


import './static/PostEditor.css';

export default function PostEditor() {
  return (
    <MDXEditor markdown="" autofocus className="post-editor" placeholder="What do you want to share?"
      plugins={[
        codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text' } }),
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: "post-editor-toolbar",
          toolbarContents: () => (
            <>
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <CreateLink />
                <CodeToggle />
                <InsertCodeBlock />
                <ListsToggle />
              </DiffSourceToggleWrapper>
            </>
          ),
        })
      ]}
    />
  );
}
