'use client'
import React, {useState, useRef, useEffect} from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { useSW } from '@/utils/sw'
import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'

import DragBar from '@/components/DragBar'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { consolas_font } from '@/utils/cm_helper'

import RecordList from '@/components/SearchResults/Records'
import QueryCards from '@/components/ParamCards/QueryCards'
import { run_query } from '@/utils/service'

import { useESLogStore, useStore } from './store'
import { parseReqCtx } from '@/utils/text_process'
import OptionGroup from '@/components/OptionGroup'
import { useRatio } from './useRatio'
import Config from './Config'

const px = (n: number) => `${n}px`

const ESLogPanel = () => {
  useSW()
  const eslogStore = useESLogStore()


  const { setSearchReq, setSearchRes } = eslogStore.getState()
  const { storeSearchReq, storeSearchRes} = eslogStore.getState()
  const searchReq = useStore(state => state.searchReq)
  const searchRes = useStore(state => state.searchRes)

  const left_line_number = useRef(0)
  
  const { leftEditorWidth, rightEditorWidth, setLeftRatio } = useRatio()

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
    setWindowHeight(window.innerHeight)
    console.log("window.innerHeight: ", window.innerHeight)
  }, [])

  return (
    <div className="h-[100vh] w-full flex flex-row">
      <OptionGroup defaultOption={'Cards'} options={['Raw', 'Cards', 'Config']} width={leftEditorWidth}>
        <CodeMirror 
          value={searchReq} 
          height={px(windowHeight-24)}
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

      <DragBar className="w-3" updateDrag={setLeftRatio}/>

      <OptionGroup options={['Raw', 'List']} width={rightEditorWidth}>
        <CodeMirror 
          value={searchRes}
          readOnly
          width='100%'
          height={px(windowHeight-24)}
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