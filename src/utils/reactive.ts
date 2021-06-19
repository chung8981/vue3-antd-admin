import { isObject } from "@/utils/is/index"
export function reactive(obj): object {
  if (typeof obj !== 'object' && obj != null) {
      return obj
  }
  // Proxy相当于在对象外层加拦截
  const observed = new Proxy(obj, {
      get(target, key: string, receiver) {
          const res = Reflect.get(target, key, receiver)
          console.log(`获取${key}:${res}`)
          return isObject(res) ? reactive(res) : res
      },
      set(target, key: string, value, receiver) {
          const res = Reflect.set(target, key, value, receiver)
          console.log(`设置${key}:${value}`)
          return res
      },
      deleteProperty(target, key: string) {
          const res = Reflect.deleteProperty(target, key)
          console.log(`删除${key}:${res}`)
          return res
      }
  })
  return observed
}