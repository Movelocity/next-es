'use client'
import React, {useState, useRef, useEffect} from 'react'
import CodeMirror from '@uiw/react-codemirror'

import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'

import DragBar from '@/components/DragBar'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { consolas_font } from '@/utils/cm_helper'

import { parseEsLog } from '@/utils/json_filter'
import RecordList from '@/components/SearchResults/Records'
import QueryCards from '@/components/ParamCards/QueryCards'
import { run_query } from '@/utils/service'

import { useESLogStore, useStore } from './store'
import { parseReqCtx } from '@/utils/text_process'
import OptionGroup from '@/components/OptionGroup'
import { useRatio } from './useRatio'


const filterValue = `param,createTime,message`

const px = (n: number) => `${n}px`

const ESLogPanel = () => {
  const eslogStore = useESLogStore()

  const { setSearchReq, setSearchRes } = eslogStore.getState()
  const { storeSearchReq, storeSearchRes} = eslogStore.getState()
  const searchReq = useStore(state => state.searchReq)
  const searchRes = useStore(state => state.searchRes)

  // const result_value = useRef(searchRes)
  const left_line_number = useRef(0)
  const [value_filter, setValueFilter] = useState(filterValue)
  
  const { leftEditorWidth, rightEditorWidth, setLeftRatio } = useRatio()

  const doReqeust = async () => {
    const req_ctx = parseReqCtx(searchReq, left_line_number.current)
    if (!req_ctx) return
    const { method, target, requestText } = req_ctx

    console.log('requestText', requestText)

    try{
      const responseText = await run_query(method, target, requestText)
      // result_value.current = responseText as string
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
    <div className="h-full w-full flex flex-row">
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

        <div className={'w-full overflow-y-scroll custom-scroll'}>
          {/** 左下角过滤输入过滤字段 */}
          <div className="flex flex-row justify-around items-center w-full">
            <input 
              value={value_filter} 
              onChange={(e)=> {setValueFilter(e.target.value)}}
              className="bg-zinc-800 text-white pl-2 font-mono w-[70%] text-sm rounded-sm h-6 outline-none" 
              spellCheck="false"
            />
            <div 
              className='cursor-pointer rounded-sm hover:bg-zinc-800 px-3' 
              onClick={()=>{setSearchRes(parseEsLog(searchRes, value_filter))}}
            >
              Filter
            </div>
          </div>
        </div>
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
        <RecordList searchRes={searchRes} value_filter={value_filter} />
      </OptionGroup>
    </div>

  )
}

export default ESLogPanel