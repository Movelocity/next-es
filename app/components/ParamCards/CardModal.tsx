import React, {useState} from 'react'
import ScreenModal from '@/components/common/ScreenModal'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { consolas_font } from '@/utils/codemirror'
import Button from '@/components/ui/button'

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
      classNames='bg-zinc-800 border border-zinc-500 border-solid rounded-xl shadow-lg backdrop-blur-sm'
    >
      <div className='w-[900px] flex flex-col space-y-2 p-3'>
        {/* Title Input Section */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-200 font-medium">标题:</span>
          <input 
            className="flex-1 bg-gray-700/90 px-2.5 py-1 rounded-md outline-none border border-zinc-600/50 
                       focus:ring-1 focus:ring-blue-600/70 focus:border-blue-500/50 transition-all duration-200"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            spellCheck={false}
          />
        </div>
        
        {/* Template Hint Section */}
        <div className="text-xs text-neutral-400 bg-zinc-700/30 rounded-md px-2.5 py-1.5">
          <span className="font-medium">[ ES请求模板 ]</span>
          <span className="text-green-400 ml-2 font-mono">{'{%xxx%}'}</span>
          <span className="ml-1">配置变量</span>
          <span className="text-sky-400 ml-2 font-mono">{'{%xxx=value%}'}</span>
          <span className="ml-1">配置默认值</span>
          <span className="text-pink-400 ml-2 font-mono">{'{%$xxx%}'}</span>
          <span className="ml-1">使用全局变量</span>
        </div>

        {/* CodeMirror Editor */}
        <div className="rounded-lg overflow-hidden border border-gray-700/50">
          <CodeMirror 
            value={contentText} 
            height="450px"
            maxHeight="60vh"
            extensions={[json(), dracula, consolas_font]}
            onChange={setContentText}
            theme='dark'
            className='w-full'
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 pt-1">
          <Button 
            onClick={handleSave}
            text="保存"
          />
          <Button 
            onClick={handleSaveAsNew}
            text="另存"
          />
          <Button 
            onClick={handleDelete}
            text="删除"
            type="danger"
          />
          <Button 
            onClick={handleCancel}
            text="取消"
            type="secondary"
          />
        </div>
      </div>
    </ScreenModal>
  )
}

export default CardModal