/*
 * @Author: JackYu
 * @Date: 2021-09-12 22:17:33
 * @LastEditors: JackYu
 * @LastEditTime: 2021-09-12 22:32:21
 * @Description: file content
 */

import { parseHTML } from "./parser-html";

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //  {{aaa}} -> 'aaa'

function genProps(attrs) {
  //处理属性 拼接成属性的字符串
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let str = "";
    if (attrs.name === "style") {
      let obj = {};
      // style="color: red;font-size: 14px;" => {style:{color:'red'},id:name,}
      attrs.value.splice(";").forEach((item) => {
        //属性之间都是以';'为分割
        let [key, value] = item.split(":"); //使用结构赋值获取到属性的key和value
        obj[key] = value; //生成相应的属性对象
      });
      attrs.value = obj;
    }
    str += `${attrs.name}:${JSON.stringify(attrs.value)}`;
  }
  return `{${str.slice(0, -1)}}`; //去掉尾巴的','号
}

//生成孩子节点
function genChildren(el) {
  let children = el.children;
  if (children && children.length > 0) {
    return `${children.map((c) => gen(c)).join(",")}`;
  } else {
    return false;
  }
}

function gen(node) {
  if (node.type == 1) {
    //元素标签
    return generate(node);
  } else {
    //正则问题 lastIndex
    // -> _v("a" + _s(name) + "b" + _s(age) + 'c')  不停地匹配"{}"
    //defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //  {{aaa}} -> 'aaa'
    let text = node.text; // a {{name}} b{{age}} c
    let tokens = [];
    let match, index;
    // 每次的偏移量 buff.split()(源码)
    let lastIndex = (defaultTagRE.lastIndex = 0); //只要是全局匹配 就需要将lastIndex每次匹配调到0处
    while ((match = defaultTagRE.exec(text))) {
      index = match.index;
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      //放入lastIndex（匹配到的模板字符串的最大索引）后的字符
      //放入 a {{name}} b{{age}} c 中未匹配到的C
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    return `_v(${tokens.join("+")})`;
  }
}

function generate(el) {
  //[{name:'id',value:'app'},{}] -> {id:app,a:1,b:2}
  let children = genChildren(el);
  let code = `_c("${el.tag}",
  ${el.attrs.length ? genProps(el.attrs) : "undefined"}${
    children ? `,${children}` : ""
  }
  )`; //传入属性

  return code;
}

export function compileToFunction(template) {
  //1)解析html字符串
  let root = parseHTML(template); //将template转换为AST语法树

  // 需要将ast语法书生成最终的render函数 就是字符串拼接（模板引擎）
  let code = generate(root); //生成render最核心的方法

  //   <div id="app">
  //   <p>hello {{name}}</p>
  //   </div>

  // 核心思路就是将模板转换成 下面这段字符串
  //  将ast树，再次转换成js的语法
  //_c("div",{id:app},_c("p",undefined,_v('hello'+ _s(name)))，_v('hello'))  将name转换为字符串

  //所有模板的引擎实现 都需要new Function + with(添加作用域)
  //模板上使用实例上的属性
  //实现模板引擎：1.拼接字符串 2.增加with 3.new function
  let renderFn = new Function(`with(this){return ${code}}`); //renderFn.call(xxx) -> new Function(`with(xxx){return ${code}}`)
  return renderFn;
}

{
  /* 
<div id="app">
   <p>hello</p>
</div>;
-->>
start div: attrs:[{name:'id',value:'app'}]
start p 
text hello
end p
end div

//AST语法树 描述html语法(比虚拟dom更详细)
let root = {
  // 节点类型  元素类型：1  文本类型：3   nodeType
  type: 1,
  // 标签名，如div
  tag: "div",
  // 节点所包含的属性
  attrs: [{ name: "id", value: "app" }],
  parent: null,
  // 子节点指针
  children: [
    {
      type: 1,
      tag: "p",
      attrs: [],
      parent: root,
      type: 1,
      children: [
        {
          text: "hello",
          type: 3,
        },
      ],
    },
  ],
}; */
}

// 虚拟dom
// {
//   tag:'div',
//   data:{id:app},
//   children:[]
// }
