function isValidRequest(line:string) {
  return /^(GET|POST) \S+/.test(line);
}
type reqCtx = (reqContext:string, editingLineNum: number) => {method:string, target:string, requestText:string} | null
export const parseReqCtx: reqCtx = (reqContext: string, editingLineNum: number) => {
  const lines = reqContext.split('\n');
  let leadingLineNum = editingLineNum;
  let hasDetectedHead = false;

  // Find the leading line with the request method
  while (leadingLineNum-- > 0) {
    if (isValidRequest(lines[leadingLineNum])) {
      hasDetectedHead = true;
      break;
    }
  }

  if (!hasDetectedHead) {
    console.log('not detected valid head', lines);
    return null;
  }

  let tailingLineNum = leadingLineNum;
  let isJsonStarted = false;
  let stackLevel = 0;

  // Find the tailing line of the JSON structure
  while (tailingLineNum < lines.length) {
    const currentLine = lines[tailingLineNum++];
    
    if (currentLine.includes('{')) {
      isJsonStarted = true;
      stackLevel++;
    }
    if (currentLine.includes('}')) {
      stackLevel--;
    }

    // Break if stack level is zero and JSON has started
    if (isJsonStarted && stackLevel === 0) {
      break;
    }
  }

  // If tailing line is not detected
  if (stackLevel !== 0) {
    console.log('not detected valid tail');
    return null;
  }

  const leadingLine = lines[leadingLineNum];
  console.log('leadingLine', leadingLine);
  
  const [method, target] = leadingLine.split(' ');
  const requestText = lines.slice(leadingLineNum + 1, tailingLineNum).join('\n'); // Adjusted to capture full JSON

  return { method, target: target.split('/')[0], requestText };
};


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
