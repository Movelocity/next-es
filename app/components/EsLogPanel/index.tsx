'use client'
import React, {useState, useRef, useEffect} from 'react'
import CodeMirror from '@uiw/react-codemirror'

import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'

import cn from 'classnames'

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


const filterValue = `param,createTime,message`

const getRecords = (searchRes:string, value_filter: string) => {
  try{
    let hits = JSON.parse(searchRes).hits
    // console.log('hits: ', hits)
    if(!hits.length || hits.length==0) {  // 没有就过滤后再检测
      hits = JSON.parse(parseEsLog(searchRes, value_filter)).hits
      if(!hits.length || hits.length==0) throw new Error('hits 为空')
    }
    console.log("hits count", hits.length)
    return hits
  } catch (err) {
    console.log("err", err)
    console.log(' 请先尝试过滤json文本, 使得 object.hits 为数组')
  }
  return []
}

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
  
  const [leftRatio, setLeftRatio] = useState(0.3);
  const rightRatio = 1 - leftRatio;
  const leftEditorWidth = `calc(${Math.trunc(leftRatio*100)}% - 4px)`
  const rightEditorWidth = `calc(${Math.trunc(rightRatio*100)}% - 4px)`

  const [isListView, setIsListView] = useState(false)
  const [isCardView, setIsCardView] = useState(true)

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
      setIsListView(false)
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

  const [windowHeight, setWindowHeight] = useState(720)
  useEffect(() => {
    setWindowHeight(window.innerHeight)
    console.log("window.innerHeight: ", window.innerHeight)
  }, [])

  return (
    <div className='h-full w-full flex flex-col'>
      <div className="h-full w-full flex flex-row">
        <div className='h-full flex flex-col' style={{width: leftEditorWidth}}>
          <OptionGroup defaultOption={'Cards'} options={['Json', 'Cards']} onSelect={(v)=>{
            if( v == 'Json') {
              setIsCardView(false)
            } else {
              setIsCardView(true)
            }
          }} />
          <div className='h-full w-full relative'>
            <div className={cn('w-full', !isCardView&&'overflow-y-scroll custom-scroll')} style={{height: px(windowHeight-56)}}>
              {isCardView ? 
                <QueryCards /> 
                : 
                <CodeMirror 
                  value={searchReq} 
                  height={px(windowHeight-36)}
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
            }
            </div>
  
            {/** 左下角过滤输入过滤字段 */}
            {/* <InputButton buttonText="Filter" onButtonClick={doReqeust} initialValue=''/> */}
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
        </div>

        <DragBar className="w-3" updateDrag={setLeftRatio}/>

        <div className='h-full flex flex-col' style={{width: rightEditorWidth}}>
          <div className="flex flex-row">
            <OptionGroup options={['Json', 'List']} onSelect={(v)=>{
              if( v == 'List') {
                setIsListView(true)
              } else {
                setIsListView(false)
              }
            }} />
          </div>
          { isListView ? 
            <RecordList records={getRecords(searchRes, value_filter)} />
            :
            <CodeMirror 
              value={searchRes}
              readOnly
              width='100%'
              height={px(windowHeight-36)}
              extensions={[json(), dracula, consolas_font, EditorView.lineWrapping]}
              onChange={setSearchRes}
              theme={'dark'}
              editable={false}
            />
          }
        </div>
      </div>
    </div>
  )
}

export default ESLogPanel