(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

  // AST语法树  用对象来描述原生语法的
  // 虚拟dom  用对象来描述dom节点
  // html-parser 正则相关 （?：为匹配但不捕获） vue/parser/compiler
  // arguments[0] = 匹配的标签 arguments[1] = 匹配的标签名字
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // abc-aaa命名空间  \\斜杠转义

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //<abc-aaa:asdads> ->aaa:asdads

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  // let r = '<a:b>'.match(startTagOpen)
  // console.log(r);
  //       id       = "asdsad" or  'asdsad'  or  asdsad
  // ^我们常见用法是[^0-9]这种，在[]中放到开头，用于表示排除，也就是非的意思.如果^写到了[]的其他地方，也就是不在开头时，它就表示它自己的字面意思了
  //^\s*->n个空格
  // [^\s"'<>\/=]+  空格"'<>/存在n个
  // (?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+))
  // :\s*(=)\s* n个空格 = n个空格
  // (?:[^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)  匹配不捕获非""或''或什么都不写n个

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // console.log(`aa="123"`.match(attribute));
  // console.log(`aa='1234'`.match(attribute));
  // console.log(`aa=12345`.match(attribute));

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 > <div/>-> '>'

  var root = null; //ast语法树的树根

  var currentParent; //表示当前父亲是谁

  var stack = []; //<div><p><span></span></p></div> [div,p,span]->用户检测标签是否闭合一一对应

  var ELEMENT_TYPE = 1; //元素类型

  var TEXT_TYPE = 3; //文本类型

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs: attrs,
      parent: null
    };
  }

  function start(tagName, attrs) {
    // 遇到开始标签 就创建一个AST元素
    var element = createASTElement(tagName, attrs);

    if (!root) {
      //若当前根节点为空，则将创建的第一个元素置为根节点
      root = element;
    }

    currentParent = element; //把当前元素标记成父AST树

    stack.push(element); //将开始标签存放到栈中
  }

  function chars(text) {
    text = text.replace(/\s/g, ''); //替换text中所有的空字符串

    if (text) {
      currentParent.children.push({
        //将其放入当前父节点的children中
        text: text,
        type: TEXT_TYPE
      });
    }
  } // <div><p> [div,p]
  // <div><p></p></div>  [div,p] -> [div]


  function end(tagName) {
    var element = stack.pop(); //拿到的ast对象
    //我要标识当前这个p是属于这个div的儿子

    currentParent = stack[stack.length - 1];

    if (currentParent) {
      console.log(currentParent);
      element.parent = currentParent;
      currentParent.children.push(element); //实现一个树的父子关系
    }
  } // 解析HTML字符串转换成AST


  function parseHTML(html) {
    while (html) {
      var textEnd = html.indexOf("<");

      if (textEnd == 0) {
        // 如果当前'<'索引为0 肯定是一个标签 开始标签 或者 结束标签 （默认第一个为开始标签）
        var startTagMatch = parseStartTag(); //通过这个方法获取到匹配到的结果 tagName,attrs

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs); //1、解析开始标签
          // console.log(startTagMatch);
          // start();

          continue; //如果开始标签匹配完毕后 继续下一次匹配
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length); //</p>匹配'</'到后,删除改文本

          end(endTagMatch[1]); //2、解析结束标签

          continue;
        }
      }

      var text = void 0;

      if (textEnd >= 0) {
        text = html.substring(0, textEnd); //     <p>hello</p> </div>; text则为<p>前的文本（标签中本身可以放的文本）， textEnd为文本的距离
      }

      if (text) {
        //如果text存在，则说明有文本，则需要去除该文本
        advance(text.length);
        chars(text); //3、解析文本
      }
    } // 截取解析后的html字符串


    function advance(n) {
      html = html.substring(n);
    } // 解析开始的标签


    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        // console.log(start);
        var match = {
          //匹配到的标签
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); //将标签删除
        // console.log(html);

        var _end, attr; // 不停地去解析html获取html属性，直到遇到结束标签为止


        while (!(_end = html.match(startTagClose) && (attr = html.match(attribute)))) {
          // 对属性进行解析
          advance(attr[0].length); //将匹配到的属性去掉

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] //attr[3]默认为双引号中的值 attr[4]为单引号中的值 attr[5]为没有符号中的值

          }); // console.log(html);
        }

        if (_end) {
          //去掉标签的'>'
          // 循环完之后需要把end也删去
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    //处理属性 拼接成属性的字符串
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var _str = '';

      if (attrs.name === 'style') {
        (function () {
          var obj = {}; // style="color: red;font-size: 14px;" => {style:{color:'red'},id:name,}

          attrs.value.splice(';').forEach(function (item) {
            //属性之间都是以';'为分割
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1]; //使用结构赋值获取到属性的key和value


            obj[key] = value; //生成相应的属性对象
          });
          attrs.value = obj;
        })();
      }

      _str += "".concat(attrs.name, ":").concat(JSON.stringify(attrs.value));
    }

    return "{".concat(str.slice(0, -1), "}"); //去掉尾巴的','号
  }

  function generate(el) {
    //[{name:'id',value:'app'},{}] -> {id:app,a:1,b:2}
    var code = "_c(\"".concat(el.tag, "\",\n  ").concat(el.attrs.length ? genProps(el.attrs) : 'undefined', ")"); //传入属性

    return code;
  }

  function compileToFunction(template) {
    //1)解析html字符串
    var root = parseHTML(template); //将template转换为AST语法树
    // 需要将ast语法书生成最终的render函数 就是字符串拼接（模板引擎）

    var code = generate(root); //生成render最核心的方法
    //   <div id="app">
    //   <p>hello {{name}}</p>
    //   </div>
    // 核心思路就是将模板转换成 下面这段字符串
    //  将ast树，再次转换成js的语法
    //_c("div",{id:app},_c("p",undefined,_v('hello'+ _s(name)))，_v('hello'))  将name转换为字符串

    console.log(code);
    return function render() {};
  }
  // {
  //   tag:'div',
  //   data:{id:app},
  //   children:[]
  // }

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
        var template = options.template; //取出模板

        if (!template && el) {
          template = el.outerHTML; //获取整个el对象，存在兼容性问题，考虑兼容可以创建一个div把el放入div中
        } // console.log(template)
        // 我们需要将template 转化为render方法 vue1.0(字符串正则化匹配，性能较差) vue 2.0(虚拟DOM)


        var render = compileToFunction(template);
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

}));
//# sourceMappingURL=vue.js.map
