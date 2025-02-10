'use client'

import React, { useState, useEffect } from 'react';
import { parseReqCtx } from '@/utils/text_process'
import { run_query } from '@/utils/service'
import { useESLogStore } from '@/components/EsLogPanel/store'
import { KeyValuePair } from './KeyValuePair';

type TemplateCardState = {
  id: number
  title: string
  templateStr: string
  onEdit: (id: number) => void
  onDelete: (id: number) => void
};

const TemplateCard: React.FC<TemplateCardState> = ({ id, title, templateStr, onEdit, onDelete }) => {
  const eslogStore = useESLogStore()
  const { setSearchRes, storeSearchRes } = eslogStore.getState()

  const [kvMap, setKvMap] = useState<{ [key: string]: string }>({});
  // Function to parse searchText and initialize kvMap
  const parseSearchText = () => {
    const regex = /{%(.+)([^%]*)%}/g;
    const matches = Array.from(templateStr.matchAll(regex));
    const initialMap: { [key: string]: string } = {};

    matches.forEach((match) => {
      const matchText = match[1]
      // if(matchText.startsWith('$')) return
      if(matchText.includes('=')) {
        const parts = match[1].split('=');
        const key = parts[0].trim();
        const defaultVal = parts[1];
        initialMap[key] = defaultVal;
      } else {
        initialMap[matchText] = '';
      }
    });

    setKvMap(initialMap);
  };

  useEffect(() => {
    parseSearchText();
  }, [templateStr]);

  // Function to handle run button click
  const handleRun = async () => {
    const { gSearchParams } = eslogStore.getState()
    console.log(gSearchParams)
    let finalTemplate = templateStr;
    Object.entries(kvMap).forEach(([key, value]) => {
      if (key.startsWith('$')) { //  && Object(gSearchParams).hasOwnProperty(key)
        finalTemplate = finalTemplate.replace(`{%${key}%}`, Object(gSearchParams)[key]);
      } else {
        finalTemplate = finalTemplate.replace(new RegExp(`{%${key}=[^%]*%}|{%${key}%}`, 'g'), value);
      }
    });
    
    const req_ctx = parseReqCtx(finalTemplate, 2)
    if (!req_ctx) return
    const { method, target, requestText } = req_ctx
    console.log("requestText", requestText);
    try{
      const responseText = await run_query(method, target, requestText)
      setSearchRes(responseText)
      storeSearchRes(responseText)
    } catch (e) {
      console.log(e)
    }
  };

  return (
    <div className='w-full border border-solid border-zinc-600 bg-zinc-800 rounded-md m-1 px-2 text-white'>
      <div className='flex flex-row items-center justify-between'>
        <div className='font-bold'>{title}</div>
        <div className="flex flex-row">
          <button onClick={()=>onEdit(id)} className="px-2 hover:bg-zinc-600 bg-zinc-700 rounded-sm cursor-pointer text-sm">Edit</button>
          <button onClick={()=>onDelete(id)} className="px-2 hover:bg-zinc-600 bg-zinc-700 rounded-sm cursor-pointer text-sm ml-2">Del</button>
          <button onClick={handleRun} className="px-2 hover:bg-sky-600 bg-sky-700 rounded-sm cursor-pointer text-sm ml-2">Run</button>
        </div>
      </div>
      <div className='flex flex-col w-full'>
        {Object.entries(kvMap).filter(([key_name]) => !key_name.startsWith('$')).map(([key_name, value], index) => (
          <KeyValuePair 
            key={index} 
            index={index}
            key_name={key_name} 
            value={value} 
            updateValue={(key_name: string, newValue: string) => {
              setKvMap((prev) => ({ ...prev, [key_name]: newValue }));
            }} 
          />
        ))}
        {/* <KeyValuePairGroup pairs={kvMap} onUpdate={(newPairs) => setKvMap(newPairs)}/> */}
      </div>
    </div>
  );
};

export default TemplateCard;