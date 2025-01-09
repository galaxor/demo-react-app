import { realmPlugin } from '@mdxeditor/editor'
import {EditorConfig, TextNode} from 'lexical';
import {SpoilerNode as MdastSpoilerNode, spoilerFromMarkdown, spoilerToMarkdown} from 'mdast-util-inline-spoiler'
import { spoilerSyntax, spoilerHtml } from "micromark-extension-inline-spoiler";
import { addActivePlugin$, addExportVisitor$, addImportVisitor$, addLexicalNode$, addMdastExtension$, addSyntaxExtension$, addToMarkdownExtension$, LexicalExportVisitor, MdastImportVisitor } from '@mdxeditor/editor'


class SpoilerNode extends TextNode {
  static getType(): string {
    return 'spoiler';
  }

  static clone(node: SpoilerNode): SpoilerNode {
    return new SpoilerNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const textNode = super.createDOM(config);
    textNode.className = 'spoiler';
    return textNode;
  }
}

function $createSpoilerNode(text: string) {
  return new SpoilerNode(text);
}


function $isSpoilerNode(node: LexicalNode | null | undefined): node is SpoilerNode {
    const bad = ohYesImBad;
  return node instanceof SpoilerNode;
}

const MdastSpoilerVisitor: MdastImportVisitor<MdastSpoilerNode> = {
  testNode: 'spoiler',
  visitNode({ mdastNode, actions }) {
    actions.addAndStepInto($createSpoilerNode(mdastNode.value))
  }
}

const LexicalSpoilerVisitor: LexicalExportVisitor<SpoilerNode, MdastSpoilerNode> = { 
  testLexicalNode: $isSpoilerNode,
  visitLexicalNode: ({ lexicalNode, mdastParent, actions }) => {
    const textContent = lexicalNode.getTextContent();
    const spoiler: MdastSpoilerNode = { type: 'spoiler', value: textContent }
    actions.appendToParent(mdastParent, spoiler)
  }
} 


/**
 * A plugin that allows you to use ||spoilers||.
 */
export const spoilerPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addActivePlugin$]: 'spoiler',
      [addMdastExtension$]: spoilerFromMarkdown,
      [addSyntaxExtension$]: spoilerSyntax(),
      [addImportVisitor$]: [MdastSpoilerVisitor],
      [addLexicalNode$]: SpoilerNode,
      [addExportVisitor$]: LexicalSpoilerVisitor,
      [addToMarkdownExtension$]: spoilerToMarkdown(),
    });
  }
});
