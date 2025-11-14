'use client'
import React, {useState, useRef, useEffect} from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { useSW } from '@/utils/serviceWorker/sw'
import '@/utils/serviceWorker/swRegistration' // Import to make it available globally
import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'

import DragBar from '@/components/ui/DragBar'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { consolas_font } from '@/utils/codemirror'

import RecordList from '@/components/SearchResults/Records'
import { QueryCards } from '@/components/ParamCards'
import { run_query } from '@/utils/service'

import { useESLogStore } from '@/store/esLogStore'
import { parseReqCtx } from '@/utils/text_process'
import OptionGroup from '@/components/OptionGroup'
import Config from './Config'
import WorkspaceSelector from '@/components/workspace/WorkspaceSelector'

const px = (n: number) => `${n}px`


const ESLogPanel = () => {
  useSW()
  const { setSearchReq, setSearchRes, storeSearchReq, storeSearchRes, searchReq, searchRes } = useESLogStore()
  const [leftRatio, setLeftRatio] = useState(0.5);
  const rightRatio = 1 - leftRatio;
  const leftEditorWidth = `calc(${Math.trunc(leftRatio*100)}% - 4px)`;
  const rightEditorWidth = `calc(${Math.trunc(rightRatio*100)}% - 4px)`;

  const updateLeftRatio = (newRatio: number) => {
    localStorage.setItem('leftRatio', newRatio.toString())
    setLeftRatio(newRatio)
  }
  useEffect(() => {
    const savedRatio = localStorage.getItem('leftRatio')
    if (savedRatio) {
      setLeftRatio(parseFloat(savedRatio))
    }
  }, [])

  const left_line_number = useRef(0)
  const doReqeust = async () => {
    const req_ctx = parseReqCtx(searchReq, left_line_number.current)
    if (!req_ctx) return
    const { method, target, requestText } = req_ctx

    console.log('requestText', requestText)

    try{
      const responseText = await run_query(method, target, requestText)
      storeSearchReq(searchReq)
      setSearchRes(responseText)
      storeSearchRes(responseText)
    } catch (e) {
      console.log(e)
    }
  }

  const keyBinding = Prec.highest(
    keymap.of([{
      key: "Ctrl-Enter",
      run: (_) => {
        doReqeust()
        return true;
      },
    }])
  );

  // CodeMirror 需要显式指定高度值
  const [windowHeight, setWindowHeight] = useState(720)
  useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight)
      console.log("window.innerHeight: ", window.innerHeight)
    }
    updateWindowHeight()

    window.addEventListener('resize', updateWindowHeight)
    return () => {
      window.removeEventListener('resize', updateWindowHeight)
    }
  }, [])

  return (
    <div className="w-full flex flex-row">
      <OptionGroup defaultOption={'卡片'} options={['文本', '卡片', '配置']} width={leftEditorWidth} extra={<WorkspaceSelector/>}>
        <CodeMirror
          value={searchReq}
          height={px(windowHeight-48)}
          extensions={[json(), dracula, consolas_font, keyBinding]}
          onChange={setSearchReq}
          theme={'dark'}
          width="100%"
          onUpdate={(ctx)=>{
            const state = ctx.state
            const line_number = state.doc.lineAt(state.selection.main.head).number
            left_line_number.current = line_number
          }}
        />

        <QueryCards />

        <Config />
      </OptionGroup>

      <DragBar className="w-3" updateDrag={updateLeftRatio}/>

      <OptionGroup options={['文本视图', '列表视图']} width={rightEditorWidth}>
        <CodeMirror
          value={searchRes}
          readOnly
          width='100%'
          height={px(windowHeight-48)}
          extensions={[json(), dracula, consolas_font, EditorView.lineWrapping]}
          onChange={setSearchRes}
          theme={'dark'}
          editable={false}
        />

        <RecordList searchRes={searchRes} />
      </OptionGroup>
    </div>
  )
}

export default ESLogPanel