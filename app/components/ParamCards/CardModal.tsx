import React, {useState} from 'react'
import ScreenModal from '@/components/common/ScreenModal'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { consolas_font } from '@/utils/cm_helper'

interface CardModalProps {
  title: string
  content: string
  onSave: (title: string, content: string) => void
  onSaveAsNew: (title: string, content: string) => void
  onDelete: () => void
  closeModal: () => void
}

const CardModal: React.FC<CardModalProps> = ({title, content, onSave, onDelete, onSaveAsNew, closeModal}) => {
  const [titleText, setTitleText] = useState(title);
  const [contentText, setContentText] = useState(content)
  

  const handleSave = () => {
    onSave(titleText, contentText)
    closeModal()
  }

  const handleSaveAsNew = () => {
    onSaveAsNew(titleText, contentText)
    closeModal()
  }

  const handleDelete = () => {
    onDelete()
    closeModal()
  }

  const handleCancel = () => {
    closeModal()
  }

  return (
    <ScreenModal
      stayBackground={false}
      show={true}
      closeOnBgClick={false}
      closeModal={closeModal}
      classNames='bg-zinc-800 border border-neutral-800 border-solid rounded-xl'
    >
      <div className='w-[600px] flex flex-col space-y-1 p-1'>
        {/* Title Input Section */}
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-200">标题:</span>
          <input 
            className="flex-1 bg-zinc-700 px-2 py-0.5 rounded outline-none focus:ring-1 focus:ring-sky-500"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            spellCheck={false}
          />
        </div>
        
        {/* Template Hint Section */}
        <div className="text-xs text-neutral-400">
          <span>[ ES请求模板 ]</span>
          <span className="text-green-500 ml-1">{'{%xxx%}'}</span>
          <span className="ml-1">配置变量</span>
          <span className="text-sky-500 ml-1">{'{%xxx=value%}'}</span>
          <span className="ml-1">配置默认值</span>
          <span className="text-pink-500 ml-1">{'{%$xxx%}'}</span>
          <span className="ml-1">使用全局变量</span>
        </div>

        {/* CodeMirror Editor */}
        <CodeMirror 
          value={contentText} 
          height="350px"
          extensions={[json(), dracula, consolas_font]}
          onChange={setContentText}
          theme='dark'
          className='w-full rounded overflow-hidden'
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-1.5 pt-1.5">
          <button 
            onClick={handleSave}
            className="px-1 bg-sky-700 hover:bg-sky-600 rounded transition-colors"
          >
            保存
          </button>
          
          <button 
            onClick={handleSaveAsNew}
            className="px-1 bg-sky-700 hover:bg-sky-600 rounded transition-colors"
          >
            另存为新模板
          </button>

          <button 
            onClick={handleDelete}
            className="px-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
          >
            删除
          </button>
          
          <button 
            onClick={handleCancel}
            className="px-3 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </ScreenModal>
  )
}

export default CardModal