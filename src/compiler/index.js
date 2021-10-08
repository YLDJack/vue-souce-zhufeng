/*
 * @Author: JackYu
 * @Date: 2021-09-12 22:17:33
 * @LastEditors: JackYu
 * @LastEditTime: 2021-09-12 22:32:21
 * @Description: file content
 */

import {parseHTML} from './parser-html'

export function compileToFunction(template) {
  //1)解析html字符串
  let root = parseHTML(template); //将template转换为AST语法树
  console.log(root);
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