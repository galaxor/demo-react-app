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
import '@mdxeditor/editor/style.css';


import './static/PostEditor.css';

export default function PostEditor() {
  return (
    <MDXEditor markdown="" autofocus className="post-editor" placeholder="What do you want to share?"
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
                <BlockTypeSelect />
                <CreateLink />
                <CodeToggle />
                <InsertCodeBlock />
                <ListsToggle />
              </DiffSourceToggleWrapper>
            </>
          ),
        }),
        quotePlugin(),
        markdownShortcutPlugin(),
      ]}
    />
  );
}
