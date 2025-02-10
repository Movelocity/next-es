
export const run_query = async (method: string, index:string, jsonQuery:string) =>{
  JSON.parse(jsonQuery); // Validate JSON
  // const response = await fetch('http://localhost:8000/search/'+index, {
  const response = await fetch('/api/search?index='+index, {
    method: 'POST',  // 暂时不要管 GET 请求
    headers: {
      'Content-Type': 'application/json'
    },
    body: jsonQuery
  })
  // console.log(response)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return JSON.stringify(data, null, 2);
}
