'use client'
import React, { useState, useEffect } from 'react'
import RecordItem, { RecordItemData } from '@/components/SearchResults/RecordItem'
import { parseEsLog } from '@/utils/text_process'
import { useESLogStore } from '@/components/EsLogPanel/store'
interface RecordListProps {
  searchRes: string
}

const getRecords = (searchRes:string, value_filter: string) => {
  try{
    let hits = JSON.parse(searchRes).hits
    // console.log('hits: ', hits)
    if(!hits.length || hits.length==0) {  // 没有就过滤后再检测
      hits = JSON.parse(parseEsLog(searchRes, value_filter)).hits
      if(!hits.length || hits.length==0) throw new Error('hits 为空')
    }
    console.log("hits count", hits.length)
    return hits
  } catch (err) {
    console.log("err", err)
    console.log('请先尝试过滤json文本, 使得 object.hits 为数组')
  }
  return []
}

const RecordList: React.FC<RecordListProps> = ({ searchRes }) => {
  const { valueFilter } = useESLogStore()
  const [records, setRecords] = useState<RecordItemData[]>([])

  // Update records whenever searchRes or valueFilter changes
  useEffect(() => {
    const newRecords = getRecords(searchRes, valueFilter)
    setRecords(newRecords)
  }, [searchRes, valueFilter])

  return (
    <div className="flex-1 flex flex-col justify-start w-full overflow-y-scroll h-[calc(100vh-24px)] custom-scroll bg-zinc-900">
      {records.map((record: RecordItemData, index: number) => (
        <RecordItem key={index} data={record} />
      ))}
    </div>
  )
}

export default RecordList