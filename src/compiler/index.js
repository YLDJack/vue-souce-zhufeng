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

const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

// console.log(`aa="123"`.match(attribute));
// console.log(`aa='1234'`.match(attribute));
// console.log(`aa=12345`.match(attribute));

const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 > <div/>-> '>'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //  {{aaa}} -> 'aaa'



function start(tagName, attrs) {
  console.log("开始标签", tagName, "属性是", attrs);
}

function chars(text) {
  console.log("文本是：", text);
}

function end(tagName){
  console.log('结束标签：',tagName);
}

// 解析HTML字符串
function parseHTML(html) {
  while (html) {
    let textEnd = html.indexOf("<");
    if (textEnd == 0) {
      // 如果当前'<'索引为0 肯定是一个标签 开始标签 或者 结束标签 （默认第一个为开始标签）
      let startTagMatch = parseStartTag(); //通过这个方法获取到匹配到的结果 tagName,attrs
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        // console.log(startTagMatch);
        // start();
        continue; //如果开始标签匹配完毕后 继续下一次匹配
      }
      let endTagMatch = html.match(endTag);
      if(endTagMatch){
        advance(endTagMatch[0].length); //</p>匹配'</'到后,删除改文本
        end(endTagMatch[1]);
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd); //     <p>hello</p> </div>; text则为<p>前的文本（标签中本身可以放的文本）， textEnd为文本的距离
    }
    if (text) {
      //如果text存在，则说明有文本，则需要去除该文本
      advance(text.length);
      chars(text);
    }
  }
}
// 截取解析后的html字符串
function advance(n) {
  html = html.substring(n);
}
// 解析开始的标签
function parseStartTag() {
  let start = html.match(startTagOpen);
  if (start) {
    // console.log(start);
    const match = {
      //匹配到的标签
      tagName: start[1],
      attrs: [],
    };
    advance(start[0].length); //将标签删除
    // console.log(html);
    let end, attr;
    // 不停地去解析html获取html属性，直到遇到结束标签为止
    while (
      !(end = html.match(startTagClose) && (attr = html.match(attribute)))
    ) {
      // 对属性进行解析
      advance(attr[0].length); //将匹配到的属性去掉
      match.attrs.push({
        name: attr[1],
        value: attr[3] || attr[4] || attr[5], //attr[3]默认为双引号中的值 attr[4]为单引号中的值 attr[5]为没有符号中的值
      });
      // console.log(html);
    }
    if (end) {
      //去掉标签的'>'
      // 循环完之后需要把end也删去
      advance(end[0].length);
      return match;
    }
  }
}

export function compileToFunction(template) {
  let root = parseHTML(template); //将template转换为AST语法树
  return function render() {};
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
