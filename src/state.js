/*
 * @Author: JackYu
 * @Date: 2021-08-29 22:24:35
 * @LastEditors: JackYu
 * @LastEditTime: 2021-08-29 22:46:20
 * @Description: file content
 */
import {observe} from './observe/index'
export function initState(vm) {
    const opts = vm.$options  //vue中使用this.options指代用户传递的属性
    //vue的数据来源 属性 方法 数据 计算属性 watch(vue的初始化流默认顺序)
    if (opts.props) {
        initProps(vm);
    }
    if (opts.methods) {
        initMethods(vm);
    }
    if (opts.data) {
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm);
    }
    if (opts.watch) {
        initWatch(vm);
    }
}

function initProps() { }
function initMethods() { }
function initData(vm) {
    //数据的初始化工作
    let data = vm.$options.data;
    //重要
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    //对象劫持 用户改变了数据 我希望可以得到通知 ==》刷新数据
    //MVVM模式 数据变化可以驱动视图变化

    // Object.defineProperty（）给属性增加get和set方法
    observe(data); //响应式原理
}
function initComputed() { }
function initWatch() { }