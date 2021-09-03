/*
 * @Author: JackYu
 * @Date: 2021-08-29 22:41:50
 * @LastEditors: JackYu
 * @LastEditTime: 2021-08-29 22:45:19
 * @Description: file content
 */

import { isObject, def } from "../utils/index";
import { arrayMethods } from "./array.js";

class Observe {
  constructor(value) {
    //vue如果数据的层次过多，需要递归地去解析对象中的属性，依次增加set和get方法
    //value.__ob__ = this  //**给每一个监控过的对象都增加一个__ob__属性 这样array.js中就可以拿到Observe的实例，对新添加的数组元素进行观测**

    // Object.defineProperty(value, "__ob__", {
    //   enumerable: false,
    //   configurable: false,
    //   value: this,
    // });
    // 将上述方法放到工具类中
    def(value, "__ob__", this); 

    // 对数组进行监控
    if (Array.isArray(value)) {
      // 如果是数组的话并不会对索引进行观测 因为会导致性能问题
      // 前端开发中极少地去操作索引
      //重写这三个方法push shift unshift，对数组进行监测即可(函数的劫持)
      value.__proto__ = arrayMethods;  //__一定是两个'_',不能漏下
      // 如果数据里放的是对象再监控
      this.observerArray(value);
    } else {
      this.walk(value); //对对象进行观测
    }
  }
  observerArray(value) {
    //[{}] 数组中存放对象时再进行检测，其他基本数据类型检测并没有意义
    for (let i = 0; i < value.length; i++) {
      observe(value[i]);
    }
  }

  walk(data) {
    let keys = Object.keys(data); //[name,age,address]
    keys.forEach((key) => {
      defineReactive(data, key, data[key]);
    });
    // for(let i =0 ;i<keys.length ;i++){
    //     let key = keys[i];
    //     let value = data[key];
    //     defineReactive(data,key,value) //定义响应式数据
    // }
  }
}

function defineReactive(data, key, value) {
  observe(value); //（若为对象或者数组）递归实现深度检测    对象结构越复杂递归越多，所以对象尽量不要写的层次太深，否则会造成性能的浪费
  Object.defineProperty(data, key, {
    get() {
      //获取值的时候做一些操作
      return value;
    },
    set(newValue) {
      //修改值的时候也可以做一些操作
      if (newValue === value) {
        return;
      }
      observe(newValue); //继续劫持用户设置的值，因为有可能用户设置的值是一个对象
      value = newValue;
    },
  });
}

//把data中的数据 都使用Object.defineProperty（）重新定义 es5
// Object.defineProperty（）不能兼容IE8 以及以下 vue2 无法兼容ie8
export function observe(data) {
  let isObj = isObject(data);
  if (!isObj) {
    return;
  }
  return new Observe(data); //用来观测数据
}
