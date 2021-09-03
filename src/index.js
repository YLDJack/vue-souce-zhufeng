/*
 * @Author: JackYu
 * @Date: 2021-08-22 23:02:02
 * @LastEditors: JackYu
 * @LastEditTime: 2021-08-29 22:18:58
 * @Description: Vue的核心代码
 */

import { initMixin } from './init'

// Vue的核心代码 只是vue的一个声明
function Vue(options) {
    // 进行Vue的初始化操作
    this._init(options)
}

// 通过引入文件的方式，给Vue原型上添加方法
initMixin(Vue);

export default Vue