import React, {useState} from 'react'
import ScreenModal from './ScreenModal'
import CodeMirror from '@uiw/react-codemirror'
// import { useESLogStore, useStore } from '@/utils/store'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { consolas_font } from '@/utils/cm_helper'

interface CreateCardModalProps {
  title: string
  content: string
  onSave: (title: string, content: string) => void
  closeModal: () => void
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({title, content, onSave, closeModal}) => {

  const [titleText, setTitleText] = useState(title);
  const [contentText, setContentText] = useState(content)
  return (
    <ScreenModal
      stayBackground={false}
      show={true}
      closeOnBgClick={false}
      closeModal={() => { closeModal() }}
      classNames='bg-zinc-800 border border-neutral-800 border-solid rounded-xl'
    >
      <div className='overflow-hidden w-[600px] flex flex-col items-start pl-1 transition'>
        <span className=" ml-1 w-full flex flex-row text-nowrap">
          标题:
          <input className="bg-zinc-700 w-[90%] ml-2 px-1 outline-none font-sans rounded-sm" value={titleText} onChange={(e)=>{setTitleText(e.target.value)}} spellCheck={false}/>
        </span>
        
        <div className="h-1"></div>
        {/* <span className="text-xs ml-1">{`[ ES请求模板 ] {%xxx%} 配置变量 {%xxx=value%} 配置默认值 {%$xxx%} 使用全局变量`}</span> */}
        <span className="text-xs ml-1">
          {"[ ES请求模板 ] "} 
          <span className="text-green-500">{`{%xxx%}`}</span> 配置变量，
          <span className="text-sky-500">{` {%xxx=value%}`}</span> 配置默认值，
          <span className="text-pink-500">{` {%$xxx%}`}</span> 使用全局变量
        </span>
        <CodeMirror 
          value={contentText} 
          height="350px"
          extensions={[json(), dracula, consolas_font]}
          onChange={setContentText}
          theme={'dark'}
          className='w-full'
        />
        <div className="flex flex-row w-full justify-around mt-1">
          <div 
            className="w-[40%] flex flex-row justify-center cursor-pointer rounded-sm px-2 bg-sky-700 hover:bg-sky-600" 
            onClick={()=>{
              onSave(titleText, contentText)
              closeModal()
            }}>
              保存
          </div>
          <div 
            className="w-[40%] flex flex-row justify-center cursor-pointer rounded-sm px-2 bg-zinc-700 hover:bg-zinc-600" 
            onClick={()=>{
              closeModal()
            }}>
              取消
          </div>
        </div>
      </div>
    </ScreenModal>
  )
}

export default CreateCardModal