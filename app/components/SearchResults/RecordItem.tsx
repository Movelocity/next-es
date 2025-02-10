import React, { useState, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { EditorView, keymap } from '@codemirror/view'
import { consolas_font } from '@/utils/cm_helper'
import { Prec } from '@codemirror/state'

export interface RecordItemData {
  createTime: string
  param: string
  message: string
  level?: string
}
interface RecordItemProps {
  data: RecordItemData;
}
const RecordItem: React.FC<RecordItemProps> = ({ data }) => {
  // 鼠标选中段落，ctrl+Enter 进行 json 格式化
  const [showDetail, setShowDetail] = useState(false)

  // 数据检查，如果data不完整，返回空壳
  if(!data.createTime || !data.param || !data.message) {
    return <div className="flex flex-col w-[98%] mx-2 my-1 rounded-sm border border-gray-500 border-solid bg-gray-800">
      <div className="text-gray-300 ml-2 text-sm">解析失败，仅支持 valueFilter: param,createTime,message</div>
    </div>
  }

  const [displayContent, setDisplayContent] = useState(data.message.replace('\n', ''))
  const itemRef = useRef<HTMLDivElement>(null)

  const selection_range = useRef({from: 0, to: 0})

  const handleDetailToggle = () => {
    const wasShown = showDetail
    setShowDetail(!showDetail)
    // 如果是从展开状态关闭，且标题处于sticky状态，则滚动到元素位置
    if (wasShown && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect()
      if (rect.top <= 0) {
        itemRef.current.scrollIntoView({ behavior: 'auto' })
      }
    }
  }

  const reformatSelectedJson = () => {
    console.log('formatting...')
    const target = displayContent.slice(selection_range.current.from, selection_range.current.to)
    if(target.length === 0) return
    try{
      const jsonObj = JSON.parse(target)
      const reparsedJson = JSON.stringify(jsonObj, null, 2)
      const prevText = displayContent.slice(0, selection_range.current.from)
      const afterText = displayContent.slice(selection_range.current.to)
      if(afterText.length === 0) {
        setDisplayContent([prevText, reparsedJson].join('\n'))
      } else {
        setDisplayContent([prevText, reparsedJson, afterText].join('\n'))
      }
    } catch(e) {
      console.log(e)
    }
  }

  const autoFormatJson = () => {
    // Find the first { and last } in the text
    let firstBrace = displayContent.indexOf('{')
    let lastBrace = displayContent.lastIndexOf('}')

    // 如果找不到{，则尝试找[
    if(firstBrace === -1) {
      firstBrace = displayContent.indexOf('[')
      lastBrace = displayContent.lastIndexOf(']')
    }
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) return

    // Update selection range
    selection_range.current = {
      from: firstBrace,
      to: lastBrace + 1  // Include the last brace
    }
    
    // Call the existing format function
    reformatSelectedJson()
  }

  const keyBinding = Prec.highest(
    keymap.of([{
      key: "Ctrl-Enter",
      run: (_) => {
        reformatSelectedJson()
        return true;
      },
    }])
  );

  return (
    <div ref={itemRef} className="flex flex-col w-[98%] mx-2 my-1 rounded-sm border border-gray-500 border-solid bg-gray-800">
      {/** 点击展开详情 */}
      <div className="flex flex-row justify-start items-end hover:bg-gray-700 cursor-pointer px-2 sticky top-0 z-10 bg-gray-800" onClick={handleDetailToggle}>
        <div className=""> &gt; </div>
        <div className="text-gray-300 ml-2 text-sm">{data.param}</div>
        <div className="ml-2">{data.message.slice(0, 41)}</div>
        <div className='absolute right-7 text-gray-300 text-sm'>{data.createTime}</div>
      </div>

      {showDetail && (
        <div className="px-2 relative">
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
          <button 
            className="absolute right-4 top-2 bg-gray-700 hover:bg-gray-600 rounded-sm px-1 text-xs" 
            onClick={autoFormatJson}
            title="根据{}自动格式化。若格式化失败需手动选择文本区域, Ctrl+Enter"
          >
            Format
          </button>
        </div>
      )}
    </div>
  )
}

export default RecordItem