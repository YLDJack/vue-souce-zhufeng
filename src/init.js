/*
 * @Author: JackYu
 * @Date: 2021-08-29 22:16:10
 * @LastEditors: JackYu
 * @LastEditTime: 2021-09-12 22:17:52
 * @Description: file content
 */
import { initState } from './state'

import {compileToFunction}  from './compiler/index.js'

// 在原型添加init方法
export function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {

        // 数据劫持

        const vm = this  //vue中使用this.options指代用户传递的属性
        vm.$options = options;

        // 初始化状态
        initState(vm);  //分割代码



        // 如果用户传入了el属性，需要将页面渲染出来
        //如果用户传入el 就要实现挂载流程
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this;
        const options = vm.$options;
        el = document.querySelector(el); //将el转换为dom对象

        // 默认先回查找有没有render方法，没用render 会采用template 
        // template也没有就会采用传入的el中的内容

        if (!options.render) {
            // 对模板进行编译
            let template = options.template; //取出模板
            if (!template && el) {
                template = el.outerHTML;  //获取整个el对象，存在兼容性问题，考虑兼容可以创建一个div把el放入div中
            }
            // console.log(template)
            // 我们需要将template 转化为render方法 vue1.0(字符串正则化匹配，性能较差) vue 2.0(虚拟DOM)

            const render = compileToFunction(template);
            options.render = render
        }
        // 后续传的直接使用options.render即可，用户传了render则使用传的render，没传则使用编译好的 
    }
}