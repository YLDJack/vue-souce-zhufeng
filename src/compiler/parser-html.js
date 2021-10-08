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

let root = null; //ast语法树的树根
let currentParent; //表示当前父亲是谁
let stack = []; //<div><p><span></span></p></div> [div,p,span]->用户检测标签是否闭合一一对应
const ELEMENT_TYPE = 1; //元素类型
const TEXT_TYPE = 3; //文本类型

function createASTElement(tagName, attrs) {
  return {
    tag: tagName,
    type: ELEMENT_TYPE,
    children: [],
    attrs,
    parent: null,
  };
}

function start(tagName, attrs) {
  // 遇到开始标签 就创建一个AST元素
  let element = createASTElement(tagName, attrs);
  if (!root) {
    //若当前根节点为空，则将创建的第一个元素置为根节点
    root = element;
  }
  currentParent = element; //把当前元素标记成父AST树
  stack.push(element); //将开始标签存放到栈中
}

function chars(text) {
  text = text.replace(/\s/g,'') //替换text中所有的空字符串
  if(text){
    currentParent.children.push({ //将其放入当前父节点的children中
      text,
      type:TEXT_TYPE
    })
  }
}

// <div><p> [div,p]
// <div><p></p></div>  [div,p] -> [div]
function end(tagName) {
  let element = stack.pop(); //拿到的ast对象
  //我要标识当前这个p是属于这个div的儿子
  currentParent = stack[stack.length -1 ];
  if(currentParent){
    console.log(currentParent);
    element.parent = currentParent;
    currentParent.children.push(element); //实现一个树的父子关系
  }
}

// 解析HTML字符串转换成AST
export function parseHTML(html) {
  while (html) {
    let textEnd = html.indexOf("<");
    if (textEnd == 0) {
      // 如果当前'<'索引为0 肯定是一个标签 开始标签 或者 结束标签 （默认第一个为开始标签）
      let startTagMatch = parseStartTag(); //通过这个方法获取到匹配到的结果 tagName,attrs
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs); //1、解析开始标签
        // console.log(startTagMatch);
        // start();
        continue; //如果开始标签匹配完毕后 继续下一次匹配
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length); //</p>匹配'</'到后,删除改文本
        end(endTagMatch[1]); //2、解析结束标签
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
      chars(text); //3、解析文本
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
  return root;
}