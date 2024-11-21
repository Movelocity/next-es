
export function clearTripleQuotes(jsonString: string): string {
    const sequence = jsonString.split('"""');
    for(let i = 1; i < sequence.length; i += 2){
      sequence[i] = sequence[i].replaceAll('"', '\\"').replaceAll('\n', '\\n')
    }
    return sequence.join('"');
}

function parseJson(jsonString: string) {
  jsonString = clearTripleQuotes(jsonString);
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(error)
    console.warn('invalid json: '+jsonString)
    return {}
  }
}

export function parseJsonEsLog(jsonString: string, keepFields: string[]): any {
  const obj = parseJson(jsonString)
  console.log(keepFields)
  try{
    const result: { total: number; hits: any[] } = { total: 0, hits: [] };
    const hits = obj.hits
    result.total = hits.total.value
    result.hits = []
    for(const hit of hits.hits){
      const _source = (hit as any)._source
      if(!_source) continue
      const item: { [key: string]: any } = {};
      for(const field of keepFields){
        item[field] = _source[field]
      }
      result.hits.push(item)
    }
    console.log('filterResult: ', result)
    return result
  } catch (error) {
    console.warn(error, jsonString, keepFields)
  }
  return obj
}

export function parseEsLog(jsonString: string, fields: string):string {
  const keepFields = fields.split(',').map(item => item.trim())
  return JSON.stringify(parseJsonEsLog(jsonString, keepFields), null, 2)
}
