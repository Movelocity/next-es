import {EditorView} from '@codemirror/view'

export const consolas_font = EditorView.theme({
  ".cm-content": {
    // fontFamily: "Menlo, Monaco, Lucida Console, monospace",
    fontFamily: "Consolas, Monaco, Lucida Console, monospace",
    fontSize: "12px"
  },
});