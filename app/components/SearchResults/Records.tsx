import React from 'react'
import RecordItem, { RecordItemProps } from '@/components/SearchResults/RecordItem'

interface RecordListProps {
  searchRes: string
}

const getRecords = (searchRes:string) => {
  try{
    const hits = JSON.parse(searchRes).hits
    if(!hits.length || hits.length==0) {
      throw new Error('hits 为空')
    }
    console.log("hits count", hits.length)
    return hits
  } catch (err) {
    console.warn(err)
    return []
  }
}

const RecordList: React.FC<RecordListProps> = ({ searchRes }) => {
  const records = getRecords(searchRes)

  return (
    <div className='w-full h-full overflow-y-auto custom-scroll'>
      <div className='flex flex-col items-center py-2 gap-2'>
        {records.map((record: RecordItemProps, index: number) => (
          <RecordItem key={index} {...record} />
        ))}
      </div>
    </div>
  )
}

export default RecordList