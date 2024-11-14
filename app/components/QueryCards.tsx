import React, { useState, useRef, useEffect, memo } from 'react'
import { useESLogStore, useStore } from '@/utils/store'
import CreateCardModal from '@/components/CreateCardModal'
// import QueryCard, {sample4, sample5} from './_partial/QueryCard'
import TemplateCard from '@/components/_partial/TemplateCard'
import { titleTemplate, queryTemplate } from '@/utils/examples'
import {KeyValuePairGroup} from './_partial/KeyValuePair';

type QueryCardState = {
  id: number
  title: string
  templateStr: string
}

const sampleQueryCards: QueryCardState[] = [
  {
    id: 0,
    title: titleTemplate,
    templateStr: queryTemplate,
  }
]

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
    setTimeout(()=>{ hasReadlocalStorage.current = true }, 3000) // 让监听 queryCards 的 useEffect 冷静一下，不要急着更新

    setClientSideLoaded(true)
  }, []);

  // Save to localStorage whenever queryCards updates
  useEffect(() => {
    if(!hasReadlocalStorage.current) return
    storeQueryCardsStr(JSON.stringify(queryCards))
    console.log('queryCards updated')
  }, [queryCards]);

  return (
    <div className="h-full relative">
      <div className='h-full overflow-y-scroll custom-scroll flex flex-col px-2 pt-28'>
        { queryCards.map((card, index) => (
          <TemplateCard 
            key={index} 
            onEdit={()=>{
              editingCardId.current = card.id
              editTitle.current = card.title
              editTemplate.current = card.templateStr
              setShowEditorModal(true);
            }} 
            onDelete={()=>setQueryCards(queryCards.filter(c=>c.id !== card.id))}
            {...card}
          />
          )
        )
        }
        <div 
          className="m-1 px-2 h-8 w-full border border-solid border-gray-500 rounded-md flex flex-col items-center justify-center cursor-pointer"
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
          />
        }
      </div>
      {clientSideLoaded && <div className='h-24 bg-black border-b border-dashed border-gray-400 absolute top-0 w-full py-2 px-4'>
        全局变量
        <KeyValuePairGroup pairs={gSearchParams} onUpdate={(key_name, newValue) => {
          const newParams = {...gSearchParams, [key_name]: newValue}
          setGlobalSearchParams(newParams)
          storeGlobalSearchParams(newParams)
        }}/>
      </div>}
    </div>
  )
}

export default memo(QueryCards)