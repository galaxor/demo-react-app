// XXX I'm trying to make it so you can tab out of the editor with the tab key.
// I've been trying to cut corners in learning about the API for this editor
// and it's not working.  So I'm gonna set it aside and come back to it when
// I'm ready to learn about the plugins API.

import { useCellValue, useCellValues } from '@mdxeditor/gurx'
import { ConditionalContents, editorInFocus$, editorRootElementRef$, inFocus$ } from '@mdxeditor/editor'

import { realmPlugin } from '@mdxeditor/editor'


export const tabOutPlugin = realmPlugin({
  init: (realm) => {
    // const [ eif, f ] = useCellValues([editorInFocus$, inFocus$]);
    // const editorRootElementRef = useCellValue(editorRootElementRef$);

    // console.log("Initted!", editorInFocus$, inFocus$, editorRootElementRef);
  },

  update: (realm) => {
    // const [ eif, f ] = useCellValues([editorInFocus$, inFocus$]);
    // const editorRootElementRef = useCellValue(editorRootElementRef$);

    // console.log("Focus?", editorInFocus$, inFocus$, editorRootElementRef);
  }
});

export function TabOutPlugin() {
  const [ eif, f ] = useCellValues([editorInFocus$, inFocus$]);
  const editorRootElementRef = useCellValue(editorRootElementRef$);

  return (
    <ConditionalContents options={[
      {
        when: editor => { 
          // console.log("Hihi", editor, eif, f);
          return true; 
        },
        contents: () => "Heeey",
      }
    ]} />
  );
}
