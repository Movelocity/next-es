
/** 
 * 搜索ES并返回字符串
 * 
 * @param method 请求方法
 * @param index 索引
 * @param jsonQuery 查询条件，格式按照ES的查询语法
 * @returns 查询结果，格式化后的json字符串
 */
export const run_query = async (method: string, index:string, jsonQuery:string, signal?: AbortSignal) =>{
  try {
    JSON.parse(jsonQuery); // Validate JSON
  } catch (error) {
    throw new Error('参数格式错误');
  }
  const response = await fetch('/api/search?index='+index, {
    method: 'POST',  // 暂时不要管 GET 请求
    headers: {
      'Content-Type': 'application/json'
    },
    body: jsonQuery,
    signal: signal
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return JSON.stringify(data, null, 2);
}
