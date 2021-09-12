(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /*
   *
   *@param { data} 判断当前数据是不是对象
   *
   */
  function isObject(data) {
    return _typeof(data) === "object" && data !== null;
  }
  /*
   *
   *@param {data,key,value}  给对象设置一个不可枚举属性
   *
   */

  function def(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value: value
    });
  }

  //重写数组的哪些方法 7个 push shift unshift pop reverse sort splice reverse 会导致数组本身发生变化
  // slice()并不会导致数组本身发生变化
  var oldArrayMethods = Array.prototype; // value._proto_ = arrayMethods 原型链查找的问题，会向上查找，先查找我重写的，重写的没有会继续向上查找
  // arrayMethods.__proto__ = oldArrayMethods (原先数组上的方法)

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = ["push", "shift", "unshift", "pop", "reverse", "sort", "splice", "reverse"];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      console.log('用户调用了push方法'); //AOP切片编程

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args); //调用原生的数组方法
      //**push unshift 添加的元素可能还是一个对象，还需要进行监控**

      var inserted; //当前用户插入的元素

      var ob = this.__ob__; //获取observe的实例

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          //3个 新增的属性splice 有删除、新增的功能arr.splice(0,1,{name:1})
          inserted = args.slice(2);
      }

      if (inserted) ob.observerArray(inserted); //**将新增属性继续进行观测,如果不对__ob__进行枚举限制，会造成递归栈溢出**

      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(value) {
      _classCallCheck(this, Observe);

      //vue如果数据的层次过多，需要递归地去解析对象中的属性，依次增加set和get方法
      //value.__ob__ = this  //**给每一个监控过的对象都增加一个__ob__属性 这样array.js中就可以拿到Observe的实例，对新添加的数组元素进行观测**
      // Object.defineProperty(value, "__ob__", {
      //   enumerable: false,
      //   configurable: false,
      //   value: this,
      // });
      // 将上述方法放到工具类中
      def(value, "__ob__", this); // 对数组进行监控

      if (Array.isArray(value)) {
        // 如果是数组的话并不会对索引进行观测 因为会导致性能问题
        // 前端开发中极少地去操作索引
        //重写这三个方法push shift unshift，对数组进行监测即可(函数的劫持)
        value.__proto__ = arrayMethods; //__一定是两个'_',不能漏下
        // 如果数据里放的是对象再监控

        this.observerArray(value);
      } else {
        this.walk(value); //对对象进行观测
      }
    }

    _createClass(Observe, [{
      key: "observerArray",
      value: function observerArray(value) {
        //[{}] 数组中存放对象时再进行检测，其他基本数据类型检测并没有意义
        for (var i = 0; i < value.length; i++) {
          observe(value[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data); //[name,age,address]

        keys.forEach(function (key) {
          defineReactive(data, key, data[key]);
        }); // for(let i =0 ;i<keys.length ;i++){
        //     let key = keys[i];
        //     let value = data[key];
        //     defineReactive(data,key,value) //定义响应式数据
        // }
      }
    }]);

    return Observe;
  }();

  function defineReactive(data, key, value) {
    observe(value); //（若为对象或者数组）递归实现深度检测    对象结构越复杂递归越多，所以对象尽量不要写的层次太深，否则会造成性能的浪费

    Object.defineProperty(data, key, {
      get: function get() {
        //获取值的时候做一些操作
        return value;
      },
      set: function set(newValue) {
        //修改值的时候也可以做一些操作
        if (newValue === value) {
          return;
        }

        observe(newValue); //继续劫持用户设置的值，因为有可能用户设置的值是一个对象

        value = newValue;
      }
    });
  } //把data中的数据 都使用Object.defineProperty（）重新定义 es5
  // Object.defineProperty（）不能兼容IE8 以及以下 vue2 无法兼容ie8


  function observe(data) {
    var isObj = isObject(data);

    if (!isObj) {
      return;
    }

    return new Observe(data); //用来观测数据
  }

  /*
   * @Author: JackYu
   * @Date: 2021-08-29 22:24:35
   * @LastEditors: JackYu
   * @LastEditTime: 2021-08-29 22:46:20
   * @Description: file content
   */
  function initState(vm) {
    var opts = vm.$options; //vue中使用this.options指代用户传递的属性
    //vue的数据来源 属性 方法 数据 计算属性 watch(vue的初始化流默认顺序)

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    //数据的初始化工作
    var data = vm.$options.data; //重要

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; //对象劫持 用户改变了数据 我希望可以得到通知 ==》刷新数据
    //MVVM模式 数据变化可以驱动视图变化
    // Object.defineProperty（）给属性增加get和set方法

    observe(data); //响应式原理
  }

  /*
   * @Author: JackYu
   * @Date: 2021-09-12 22:17:33
   * @LastEditors: JackYu
   * @LastEditTime: 2021-09-12 22:32:21
   * @Description: file content
   */
  // AST语法树  用对象来描述原生语法的
  // 虚拟dom  用对象来描述dom节点 
  // html-parser 正则相关 （？：为匹配不捕获）
  function compileToFunction(template) {
    return function render() {};
  }

  /*
   * @Author: JackYu
   * @Date: 2021-08-29 22:16:10
   * @LastEditors: JackYu
   * @LastEditTime: 2021-09-12 22:17:52
   * @Description: file content
   */

  function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
      // 数据劫持
      var vm = this; //vue中使用this.options指代用户传递的属性

      vm.$options = options; // 初始化状态

      initState(vm); //分割代码
      // 如果用户传入了el属性，需要将页面渲染出来
      //如果用户传入el 就要实现挂载流程

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); //将el转换为dom对象
      // 默认先回查找有没有render方法，没用render 会采用template 
      // template也没有就会采用传入的el中的内容

      if (!options.render) {
        // 对模板进行编译
        options.template; //取出模板
        // 我们需要将template 转化为render方法 vue1.0(字符串正则化匹配，性能较差) vue 2.0(虚拟DOM)


        var render = compileToFunction();
        options.render = render;
      } // 后续传的直接使用options.render即可，用户传了render则使用传的render，没传则使用编译好的 

    };
  }

  /*
   * @Author: JackYu
   * @Date: 2021-08-22 23:02:02
   * @LastEditors: JackYu
   * @LastEditTime: 2021-08-29 22:18:58
   * @Description: Vue的核心代码
   */

  function Vue(options) {
    // 进行Vue的初始化操作
    this._init(options);
  } // 通过引入文件的方式，给Vue原型上添加方法


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
