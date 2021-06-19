/**
 * 将对象添加当作参数拼接到URL上面
 * @param baseUrl 需要拼接的url
 * @param obj 参数对象
 * @returns {string} 拼接后的对象
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: object): string {
  let parameters = '';
  let url = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  if (/\?$/.test(baseUrl)) {
    url = baseUrl + parameters;
  } else {
    url = baseUrl.replace(/\/?$/, '?') + parameters;
  }
  return url;
}

/**
 * 解析获取URL的查询字符串query
 * @method: getQuery
 * @param {string} urlStr
 * @return string
 */
export function getQuery(urlStr: string): string{
  const url = require('url')
  return url.parse(urlStr).query;
}
/**
 * 解析URL的查询字符串为对象形式
 * @method: parseQuery
 * @param {string} query
 * @return object
 */
export function parseQuery(query: string): object{
  const qs = require('querystring')
  return qs.parse(query)
}
/**
 * 序列化URL的查询字符串
 * @method: serialize
 * @param {object} urlObj
 * @return string
 */
export function serialize(urlObj: object): string{
  const qs = require('querystring')
  return qs.stringify(urlObj)
}

export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}