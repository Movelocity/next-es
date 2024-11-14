
export function clearTripleQuotes(jsonString: string): string {
    const sequence = jsonString.split('"""');
    for(let i = 1; i < sequence.length; i += 2){
      sequence[i] = sequence[i].replaceAll('"', '\\"').replaceAll('\n', '\\n')
    }
    return sequence.join('"');
}

function parseJson(jsonString: string): any {
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
  const obj:any = parseJson(jsonString)
  try{
    const result:any = {}
    const hits = obj.hits
    result['total'] = hits.total.value
    result['hits'] = []
    for(let hit of hits.hits){
      const _source:any = (hit as any)._source
      if(!_source) continue
      const item:any = {}
      for(let field of keepFields){
        item[field] = _source[field]
      }
      result.hits.push(item)
    }
    return result
  } catch (error) {
    console.warn(error)
  }
  return {}
}

export function parseEsLog(jsonString: string, fields: string):string {
  const keepFields = fields.split(',').map(item => item.trim())
  return JSON.stringify(parseJsonEsLog(jsonString, keepFields), null, 2)
}
