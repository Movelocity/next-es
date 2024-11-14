import ButtonGroup from '@/components/_partial/ButtonGroup'

type QueryField = {
  cond_type: 'should' | 'must'
  matcher: 'match' | 'match-phrase'
  field: string
  value: string
  alias: string
}

interface QueryCardState {
  params: QueryField[]
  title: string
  startTime: string
  endTime: string
  sort: string
  limit: number
  index: number
}

export const sample4:QueryCardState = {
  params: [
    {
      cond_type: 'must',
      matcher: 'match-phrase',
      field: 'price',
      value: '翻译完毕 - 老品',
      alias: 'param'
    }
  ],
  title: '查询翻译完毕情况',
  startTime: '2023-01-01 00:00:00',
  endTime: '2023-10-01 23:59:59',
  sort: 'asc',
  limit: 150,
  index: 0
};

export const sample5:QueryCardState = {
  params: [
    {
      cond_type: 'should',
      matcher: 'match-phrase',
      field: 'param',
      value: 'USP000012',
      alias: 'translate SPU'
    }
  ],
  title: '按 SPU 查询',
  startTime: '2023-01-01 00:00:00',
  endTime: '2023-12-31 23:59:59',
  sort: 'desc',
  limit: 75,
  index: 1
};

const QueryCard = (props: QueryCardState) => {
  // const [startTime, setStartTime] = useState(props.startTime)
  // const [endTime, setEndTime] = useState(props.endTime)
  const orderOptions = [
    { value: 'asc', label: '升序' },
    { value: 'desc', label: '降序' }
  ];

  return (
    <div className='w-full border border-solid border-zinc-600 bg-zinc-800 rounded-md m-1 px-2'>
      {/** header */}
      <div className='card-header flex flex-row items-center justify-between'>
        <div className='font-bold'>{props.title}</div>
        <ButtonGroup options={orderOptions} onSelect={() => {}} />
        <div className="rounded-sm hover:bg-sky-800 cursor-pointer text-sm px-2">Run</div>
      </div>
      {/** body */}
      <div className='flex flex-col w-full items-center py-2'>

        <div className="flex flex-row">
          <div className="flex flex-col w-[98%] rounded-md mb-1 justifty-around">
            <div className="flex flex-row w-full text-nowrap">
              开始时间
              <input className="bg-zinc-700 rounded-r-sm px-1 outline-none w-[200px] ml-2" value={props.startTime} readOnly/>
            </div>
            <div className="flex flex-row w-full text-nowrap mt-1">
              结束时间
             <input className="bg-zinc-700 rounded-r-sm px-1 outline-none w-[200px] ml-2" value={props.endTime} readOnly/>
            </div>
          </div>
        </div>

        {props.params.map((param, index) => (
          <div className="flex flex-col justify-between w-[98%] rounded-md bg-zinc-600 mb-1" key={index}>
            <div className="flex flex-row justify-between px-2">
              <span>{param.alias}</span>
              <span>{param.matcher}</span>
            </div>
            <input
              className="bg-zinc-700 rounded-r-sm px-2 outline-none w-full" value={param.value} readOnly
            />
          </div>
        ))}
        <div className="flex flex-row justify-between w-[98%] text-sm">
          
          <div className="ml-2 border border-solid border-gray-700 hover:bg-zinc-600 rounded-md px-2 cursor-pointer">+</div>
          
        </div>
      </div>
    </div>
  )
}

export default QueryCard