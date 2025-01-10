import {
  MDXEditor,
  toolbarPlugin,
    BoldItalicUnderlineToggles, 
    CodeToggle,
    markdownShortcutPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

import { useEffect, useRef } from 'react'

import {micromark} from 'micromark'
import { fromMarkdown } from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import { gfmStrikethrough, gfmStrikethroughHtml } from 'micromark-extension-gfm-strikethrough'
import {gfmStrikethroughFromMarkdown, gfmStrikethroughToMarkdown} from 'mdast-util-gfm-strikethrough'

import { spoilerSyntax, spoilerHtml } from "micromark-extension-inline-spoiler";

import { spoilerFromMarkdown, spoilerToMarkdown } from 'mdast-util-inline-spoiler'

import { spoilerPlugin } from './editor/plugins/spoiler/index.ts'

const testText = "`hello` ||hello|| ~~hello~~";

export default function Test() {
  const output = micromark(testText, {
    extensions: [gfmStrikethrough(), spoilerSyntax()],
    htmlExtensions: [gfmStrikethroughHtml(), spoilerHtml()]
  })

  const asHtml = <div id="direct-to-html"><pre>{output}</pre></div>;

  const ast = fromMarkdown(testText, {
    extensions: [gfmStrikethrough(), spoilerSyntax()],
    mdastExtensions: [gfmStrikethroughFromMarkdown(), spoilerFromMarkdown]
  })

  console.log(ast);

  const roundTrip = toMarkdown(ast, {
    extensions: [gfmStrikethroughToMarkdown({}), spoilerToMarkdown({})],
  })

  const mdxRef = useRef(null);

  useEffect(() => {
    document.getElementById('victory').innerText = mdxRef.current.getMarkdown();
  });

  return <>
    {asHtml} {"\n"} {roundTrip}
    <div className="border-1 border-color-black">
    <MDXEditor 
      ref={mdxRef}
      markdown={testText}
      plugins={[
        spoilerPlugin(),
        toolbarPlugin({
          toolbarClassName: "post-editor-toolbar",
          toolbarContents: () => (
            <>
              <BoldItalicUnderlineToggles />
              <CodeToggle />
            </>
          ),
        }),
      ]}
    />
    </div>

    <div id="victory"></div>
  </>;
}
