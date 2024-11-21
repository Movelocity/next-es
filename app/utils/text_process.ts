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
