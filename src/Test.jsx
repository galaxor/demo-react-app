import {
  MDXEditor,
} from '@mdxeditor/editor'

import {micromark} from 'micromark'
import { fromMarkdown } from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import { gfmStrikethrough, gfmStrikethroughHtml } from 'micromark-extension-gfm-strikethrough'
import {gfmStrikethroughFromMarkdown, gfmStrikethroughToMarkdown} from 'mdast-util-gfm-strikethrough'

import { spoilerSyntax, spoilerHtml } from "micromark-extension-inline-spoiler";

import { spoilerFromMarkdown, spoilerToMarkdown } from 'mdast-util-inline-spoiler'

import { spoilerPlugin } from './editor/plugins/spoiler/index.ts'

const testText = "`hello` ||hello|| ~~hello~~";

function Test2() {
  return (
    <MDXEditor markdown={testText} />
  );
}

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

  return <>
    {asHtml} {"\n"} {roundTrip}
    <MDXEditor 
      markdown={testText}
      plugins={[spoilerPlugin()]}
    />
  </>;
}
