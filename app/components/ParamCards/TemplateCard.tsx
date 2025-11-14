'use client'

import React, { useState, useEffect } from 'react';
import { parseReqCtx } from '@/utils/text_process'
import { run_query } from '@/utils/service'
import { useESLogStore } from '@/store/esLogStore'
import { KvItem } from '@/components/ParamCards';

type TemplateCardState = {
  id: number
  title: string
  templateStr: string
  onEdit: (id: number) => void
};

const TemplateCard: React.FC<TemplateCardState> = ({ id, title, templateStr, onEdit }) => {
  const { 
    gSearchParams,
    setSearchRes, 
    storeSearchRes, 
    cancelSearching,
    setIsSearching,
    setSearchingControl,
  } = useESLogStore()
  const [kvMap, setKvMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
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

    parseSearchText();
  }, [templateStr]);

  // Function to handle run button click
  const handleRun = async () => {
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
      setIsSearching(true)
      const searchingControl = new AbortController()
      setSearchingControl(searchingControl)
      const responseText = await run_query(method, target, requestText, searchingControl.signal as AbortSignal)
      cancelSearching()  // 自动清理资源，包括 abort controller
      setSearchRes(responseText)
      storeSearchRes(responseText)
    } catch (e) {
      cancelSearching()
      console.log(e)
    }
  };

  return (
    <div className='w-[98%] border border-solid border-zinc-600 bg-zinc-800 rounded-sm px-2 text-white'>
      <div className='flex flex-row items-center justify-between'>
        <div className='font-bold'>{title}</div>
        <div className="flex flex-row">
          <button onClick={()=>onEdit(id)} className="px-2 hover:bg-zinc-600 bg-zinc-700 rounded-sm cursor-pointer text-sm">编辑</button>
          <button onClick={handleRun} className="px-2 hover:bg-sky-600 bg-sky-700 rounded-sm cursor-pointer text-sm ml-2">运行</button>
        </div>
      </div>
      <div className='flex flex-col w-full'>
        {Object.entries(kvMap).filter(([key_name]) => !key_name.startsWith('$')).map(([key_name, value], index) => (
          <KvItem 
            key={index} 
            index={index}
            key_name={key_name} 
            value={value} 
            updateValue={(key_name: string, newValue: string) => {
              setKvMap((prev) => ({ ...prev, [key_name]: newValue }));
            }} 
          />
        ))}
      </div>
    </div>
  );

};

export default TemplateCard;