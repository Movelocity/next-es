import React from 'react'
import RecordItem, { RecordItemProps } from '@/components/SearchResults/RecordItem'

interface RecordListProps {
  records: RecordItemProps[]
}

const RecordList: React.FC<RecordListProps> = ({ records }) => {
  console.log("records:", records)
  return (
    <div className="flex flex-col justify-start w-full overflow-y-scroll h-[calc(100vh-60px)] custom-scroll bg-zinc-900">
      {records.map((record, index) => (
        <RecordItem key={index} {...record} />
      ))}
    </div>
  )
}

export default RecordList