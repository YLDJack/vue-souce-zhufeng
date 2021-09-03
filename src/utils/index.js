/*
 *
 *@param { data} 判断当前数据是不是对象
 *
 */
export function isObject(data) {
  return typeof data === "object" && data !== null;
}

/*
 *
 *@param {data,key,value}  给对象设置一个不可枚举属性
 *
 */
export function def(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false,
    configurable: false,
    value: value,
  });
}
