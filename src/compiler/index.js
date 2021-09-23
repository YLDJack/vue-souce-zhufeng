/*
 * @Author: JackYu
 * @Date: 2021-09-12 22:17:33
 * @LastEditors: JackYu
 * @LastEditTime: 2021-09-12 22:32:21
 * @Description: file content
 */

// AST语法树  用对象来描述原生语法的
// 虚拟dom  用对象来描述dom节点

// html-parser 正则相关 （?：为匹配但不捕获） vue/parser/compiler
// arguments[0] = 匹配的标签 arguments[1] = 匹配的标签名字
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // abc-aaa命名空间  \\斜杠转义
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //<abc-aaa:asdads> ->aaa:asdads
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
// let r = '<a:b>'.match(startTagOpen)
// console.log(r);

//       id       = "asdsad" or  'asdsad'  or  asdsad
// ^我们常见用法是[^0-9]这种，在[]中放到开头，用于表示排除，也就是非的意思.如果^写到了[]的其他地方，也就是不在开头时，它就表示它自己的字面意思了
//^\s*->n个空格  
// [^\s"'<>\/=]+  空格"'<>/存在n个
// (?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)) 
  // :\s*(=)\s* n个空格 = n个空格
  // (?:[^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)  匹配不捕获非""或''或什么都不写n个



const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

// console.log(`aa="123"`.match(attribute));
// console.log(`aa='1234'`.match(attribute));
// console.log(`aa=12345`.match(attribute));

const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 > <div/>-> '>'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;  //  {{aaa}} -> 'aaa'

export function compileToFunction(template) {
  return function render() {};
}

{
  /* <div id="app">
  <p>hello</p>
</div>;

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