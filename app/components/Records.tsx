import React, { useState, useRef, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { EditorView, keymap } from '@codemirror/view'
import { consolas_font } from '@/utils/cm_helper'
import { Prec } from '@codemirror/state'

interface RecordItemProps {
  createTime: string
  param: string
  message: string
  level?: string
}
const RecordItem: React.FC<RecordItemProps> = ({ createTime,  param, message }) => {
  // 鼠标选中段落，ctrl+Enter 进行 json 格式化
  const [showDetail, setShowDetail] = useState(false)
  const [displayContent, setDisplayContent] = useState(message.replace('\n', ''))

  const selection_range = useRef({from: 0, to: 0})

  const reformatSelectedJson = useCallback(() => {
    console.log('format')
    const target = displayContent.slice(selection_range.current.from, selection_range.current.to)
    if(target.length === 0) return
    try{
      const jsonObj = JSON.parse(target)
      const reparsedJson = JSON.stringify(jsonObj, null, 2)
      const prevText = displayContent.slice(0, selection_range.current.from)
      const afterText = displayContent.slice(selection_range.current.to)
      console.log(afterText)
      if(afterText.length === 0) {
        setDisplayContent([prevText, reparsedJson].join('\n'))
      } else {
        setDisplayContent([prevText, reparsedJson, afterText].join('\n'))
      }
    } catch(e) {
      console.log(e)
    }
  }, [displayContent, selection_range])

  const keyBinding = Prec.highest(
    keymap.of([{
      key: "Ctrl-Enter",
      run: (view) => {
        reformatSelectedJson()
        return true;
      },
    }])
  );

  return (
    <div className="flex flex-col w-[98%] mx-2 my-1 rounded-md border border-gray-500 border-solid bg-gray-800">
      <div className="relative flex flex-row justify-start items-end hover:bg-gray-700 cursor-pointer px-2" onClick={()=>{setShowDetail(!showDetail)}}>
        <div className=""> &gt; </div>
        <div className="text-gray-300 ml-2 text-sm">{param}</div>
        <div className="ml-2">{message.slice(0, 41)}</div>
        <div className='absolute right-7 text-gray-300 text-sm'>{createTime}</div>
      </div>
      {showDetail && (
        <div className="px-2">
          <CodeMirror 
            value={displayContent} 
            max-height="150px"
            extensions={[json(), dracula, consolas_font, EditorView.lineWrapping, keyBinding]}
            theme={'dark'}
            width='100%'
            onChange={setDisplayContent}
            onUpdate={(ctx)=>{
              const state = ctx.state
              const from = state.selection.ranges[0].from
              const to = state.selection.ranges[0].to
              selection_range.current = {from, to}
            }}
          />
        </div>
      )}
    </div>
  )
}

interface RecordListProps {
  records: RecordItemProps[]
}

const RecordList: React.FC<RecordListProps> = ({ records }) => {
  return (
    <div className="flex flex-col justify-start w-full overflow-y-scroll h-[calc(100vh-60px)] custom-scroll bg-zinc-900">
      {/* <div className='ml-2'>display records: {records.length}</div> */}
      {records.map((record, index) => (
        <RecordItem key={index} {...record} />
      ))}
    </div>
  )
}

export default RecordList