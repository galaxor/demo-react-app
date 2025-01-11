import { realmPlugin } from '@mdxeditor/editor'
import {ElementNode, $createTextNode, Spread, SerializedElementNode, LexicalNode} from 'lexical';
import {SpoilerNode as MdastSpoilerNode, spoilerFromMarkdown, spoilerToMarkdown} from 'mdast-util-inline-spoiler'
import { spoilerSyntax } from "micromark-extension-inline-spoiler";
import { addActivePlugin$, addExportVisitor$, addImportVisitor$, addLexicalNode$, addMdastExtension$, addSyntaxExtension$, addToMarkdownExtension$, LexicalExportVisitor, MdastImportVisitor } from '@mdxeditor/editor'

export type SerializedSpoilerNode = Spread<
  {
    test?: string,
  },
  SerializedElementNode
>;

class SpoilerNode extends ElementNode {
  static getType(): string {
    return 'spoiler';
  }

  isInline(): boolean {
    return true;
  }

  static clone(node: SpoilerNode): SpoilerNode {
    return new SpoilerNode(node.__key);
  }

  createDOM(): HTMLElement {
    const element = document.createElement('span');
    element.className = 'spoiler';
    return element;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  exportJSON(): SerializedSpoilerNode {
    return {...super.exportJSON(), test:'test'};
  }

  static importJSON(_: SerializedSpoilerNode): SpoilerNode {
    return $createSpoilerNode();
  }
}


function $createSpoilerNode() {
  return new SpoilerNode();
}


function $isSpoilerNode(node: LexicalNode | null | undefined): node is SpoilerNode {
  return node instanceof SpoilerNode;
}

const MdastSpoilerVisitor: MdastImportVisitor<MdastSpoilerNode> = {
  testNode: 'spoiler',
  visitNode({ mdastNode, actions }) {
    const spoilerNode = $createSpoilerNode();
    const text = $createTextNode(mdastNode.value);
    spoilerNode.append(text);
    actions.addAndStepInto(spoilerNode)
  }
}

const LexicalSpoilerVisitor: LexicalExportVisitor<SpoilerNode, MdastSpoilerNode> = { 
  testLexicalNode: $isSpoilerNode,
  priority: 100,
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
      [addSyntaxExtension$]: spoilerSyntax({}),
      [addImportVisitor$]: [MdastSpoilerVisitor],
      [addLexicalNode$]: SpoilerNode,
      [addExportVisitor$]: LexicalSpoilerVisitor,
      [addToMarkdownExtension$]: spoilerToMarkdown(),
    });
  }
});
