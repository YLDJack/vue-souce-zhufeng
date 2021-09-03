/*
 * @Author: JackYu
 * @Date: 2021-08-29 22:16:10
 * @LastEditors: JackYu
 * @LastEditTime: 2021-08-29 22:46:02
 * @Description: file content
 */
import {initState} from './state'

// 在原型添加init方法
export function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {

        // 数据劫持

        const vm = this  //vue中使用this.options指代用户传递的属性
        vm.$options = options;

        // 初始化状态
        initState(vm);  //分割代码
    }
}