import React, { useState, useRef, useEffect } from 'react'
import { useESLogStore, useStore } from '@/components/EsLogPanel/store'
import CreateCardModal from '@/components/ParamCards/CardModal'
import TemplateCard from '@/components/ParamCards/TemplateCard'
import { titleTemplate, queryTemplate } from '@/utils/examples'
import {KeyValuePairGroup} from './KeyValuePair';

type QueryCardState = {
  id: number
  title: string
  templateStr: string
}

const QueryCards = () => {
  const eslogStore = useESLogStore()
  const { queryCardsStr, storeQueryCardsStr, setGlobalSearchParams, storeGlobalSearchParams } = eslogStore.getState()
  const gSearchParams = useStore(state => state.gSearchParams)
  const [ showEditorModal, setShowEditorModal ] = useState(false)
  const [ queryCards, setQueryCards ] = useState<QueryCardState[]>([])
  const editingCardId = useRef(-1);
  const editTitle = useRef(titleTemplate);
  const editTemplate = useRef(queryTemplate);

  const hasReadlocalStorage = useRef(false)
  const [clientSideLoaded, setClientSideLoaded] = useState(false);

  // Load from localStorage on component mount
  useEffect(() => {
    setQueryCards(JSON.parse(queryCardsStr));
    setClientSideLoaded(true)
    hasReadlocalStorage.current = true;  // 直接设置为true，不需要延迟
  }, [queryCardsStr]);

  // Save to localStorage whenever queryCards updates, skip the first render
  useEffect(() => {
    // 确保只有在有实际数据时才进行保存
    if (hasReadlocalStorage.current && queryCards.length > 0) {
      storeQueryCardsStr(JSON.stringify(queryCards))
      console.log('queryCards updated')
    }
  }, [queryCards, storeQueryCardsStr]);

  return (
    <div className="max-h-[calc(100vh-36px)] flex flex-col overflow-hidden">
      {clientSideLoaded && <div className='flex-shrink-0 h-24 bg-zinc-900 w-full py-2 px-4'>
        全局变量
        <KeyValuePairGroup pairs={gSearchParams} onUpdate={(key_name, newValue) => {
          const newParams = {...gSearchParams, [key_name]: newValue}
          setGlobalSearchParams(newParams)
          storeGlobalSearchParams(newParams)
        }}/>
      </div>}
      <div className='flex-1 min-h-0 w-full overflow-y-auto custom-scroll'>
        <div className='flex flex-col items-center py-2 gap-2'>
          { queryCards.map((card, index) => (
            <TemplateCard
              key={index} 
              onEdit={()=>{
                editingCardId.current = card.id
                editTitle.current = card.title
                editTemplate.current = card.templateStr
                setShowEditorModal(true);
              }} 
              {...card}
            />
            )
          )
          }

          <div 
            className="h-8 w-[98%] border border-solid border-gray-500 rounded-sm flex items-center justify-center cursor-pointer mb-12"
            onClick={() => { 
              editingCardId.current=-1; 
              setShowEditorModal(true);
              editTitle.current = ''
              editTemplate.current = ''
            }}

          >+</div>

          { showEditorModal && 
            <CreateCardModal 
              title={editTitle.current} 
              content={editTemplate.current} 
              closeModal={()=>setShowEditorModal(false)}
              onSave={(title, content) => {
                if(title && content){
                  if(editingCardId.current === -1) {
                    setQueryCards((oldCards)=> 
                      [...oldCards, {id: oldCards.length, title:title, templateStr:content}])
                  } else {
                    setQueryCards((oldCards)=> 
                      oldCards.map(card=> card.id === editingCardId.current ? {...card, title:title, templateStr:content} : card))
                  }
                }
              }} 
              onSaveAsNew={(title, content)=>{
                setQueryCards((oldCards)=> 
                  [...oldCards, {id: oldCards.length, title:title, templateStr:content}])
              }}
              onDelete={()=>{
                if(editingCardId.current === -1) return
                if(queryCards.length === 1) {  // 如果只有一个卡片，则清空
                  setQueryCards([]);
                  storeQueryCardsStr('[]');
                } else {
                  setQueryCards(queryCards.filter(c=>c.id !== editingCardId.current))
                }
              }}
            />
          }
        </div>
      </div>
      
    </div>
  )
}

export default QueryCards