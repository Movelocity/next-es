import React, { useState, useRef, useEffect } from 'react'
import { useESLogStore } from '@/store/esLogStore'
import CardModal from '@/components/ParamCards/CardModal'
import {TemplateCard, KvGroup} from '@/components/ParamCards'
import { titleTemplate, queryTemplate } from '@/utils/examples'

type QueryCardState = {
  id: number
  title: string
  templateStr: string
}

/** 找到一个可用的id，不与已有的id重复 */
const findAvailableId = (cards: QueryCardState[]) => {
  const ids = cards.map(card => card.id)
  for(let i=0; i<=cards.length; i++){
    if(!ids.includes(i)) return i
  }
  return cards.length
}

const QueryCards = () => {
  const { 
    queryCardsStr,
    gSearchParams,
    setQueryCardsStr, 
    setGlobalSearchParams, 
    setTimeLast24Hours 
  } = useESLogStore()
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
      setQueryCardsStr(JSON.stringify(queryCards))
      console.log('queryCards updated')
    }
  }, [queryCards, setQueryCardsStr]);

  return (
    <div className="max-h-[calc(100vh-36px)] flex flex-col overflow-hidden">
      {clientSideLoaded && <div className='flex-shrink-0 h-24 bg-zinc-900 w-full py-2 px-4'>
        <div className='flex flex-row justify-between items-center'>
          <div className='text-gray-300 text-sm'>全局变量</div>
          <div className='text-gray-400 text-xs cursor-pointer' onClick={()=>setTimeLast24Hours()}>近24小时</div>
        </div>
        <KvGroup 
          pairs={gSearchParams} 
          onUpdate={(key_name, newValue) => {
            const newParams = {...gSearchParams, [key_name]: newValue}
            setGlobalSearchParams(newParams)
          }}
        />
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
            <CardModal 
              title={editTitle.current} 
              content={editTemplate.current} 
              closeModal={()=>setShowEditorModal(false)}
              onSave={(title, content) => {
                if(title && content){
                  if(editingCardId.current === -1) {
                    setQueryCards((oldCards)=> 
                      [...oldCards, {id: findAvailableId(oldCards), title:title, templateStr:content}])
                  } else {
                    setQueryCards((oldCards)=> 
                      oldCards.map(card=> card.id === editingCardId.current ? {...card, title:title, templateStr:content} : card))
                  }
                }
              }} 
              onSaveAsNew={(title, content)=>{
                setQueryCards((oldCards)=> 
                  [...oldCards, {id: findAvailableId(oldCards), title:title, templateStr:content}])
              }}
              onDelete={()=>{
                if(editingCardId.current === -1) return
                if(queryCards.length === 1) {  // 如果只有一个卡片，则清空
                  setQueryCards([]);
                  setQueryCardsStr('[]');
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