function isValidRequest(line:string) {
  return /^(GET|POST) \S+/.test(line);
}
type reqCtx = (reqContext:string, editingLineNum: number) => {method:string, target:string, requestText:string} | null
export const parseReqCtx: reqCtx = (reqContext:string, editingLineNum: number) => {
  const lines = reqContext.split('\n');
  let leadingLineNum = editingLineNum
  let hasDetectedHead = false
  while(leadingLineNum-- > 0) {
    if(isValidRequest(lines[leadingLineNum-1])) {  // 没有第0行，但有index=0
      hasDetectedHead = true
      break
    }
    // console.log(lines[leadingLineNum-1], leadingLineNum-1, 'not ok')
  }
  if(!hasDetectedHead) {
    console.log('not detected valid head', lines)
    return null;
  }
  
  let tailingLineNum = leadingLineNum
  let isJsonStarted = false
  let hasDetectedTail = false
  let stackLevel = 0
  while(tailingLineNum++ < lines.length){
    const currentLine = lines[tailingLineNum-1];
    if (currentLine.includes('{') && !currentLine.includes('}')) {  // json 开始
      isJsonStarted = true;
      stackLevel++
    }
    if (currentLine.includes('}')) {  // json 结束
      stackLevel--
    }
    if (isJsonStarted && stackLevel === 0) {  // Break if stack level is zero and JSON has started
      hasDetectedTail = true
      break;
    }
  }
  if(!hasDetectedTail) {
    console.log('not detected valid tail')
    return null
  }

  const leadingLine = lines[leadingLineNum-1];
  console.log('leadingLine', leadingLine)
  let method = leadingLine.split(' ')[0]
  let target = leadingLine.split(' ')[1]
  target = target.split('/')[0]

  const requestText = lines.slice(leadingLineNum, tailingLineNum).join('\n')

  return {method, target, requestText}
}
