import React from 'react'
import RecordItem, { RecordItemProps } from '@/components/SearchResults/RecordItem'
import { parseEsLog } from '@/utils/json_filter'

interface RecordListProps {
  searchRes: string
  value_filter: string
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
    console.log(' 请先尝试过滤json文本, 使得 object.hits 为数组')
  }
  return []
}

const RecordList: React.FC<RecordListProps> = ({ searchRes, value_filter }) => {
  const records = getRecords(searchRes, value_filter)
  console.log("records:", records)
  return (
    <div className="flex-1 flex flex-col justify-start w-full overflow-y-scroll h-[calc(100vh-24px)] custom-scroll bg-zinc-900">
      {records.map((record: RecordItemProps, index: number) => (
        <RecordItem key={index} {...record} />
      ))}
    </div>
  )
}

export default RecordList