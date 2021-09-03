//重写数组的哪些方法 7个 push shift unshift pop reverse sort splice reverse 会导致数组本身发生变化
// slice()并不会导致数组本身发生变化

let oldArrayMethods = Array.prototype;
// value._proto_ = arrayMethods 原型链查找的问题，会向上查找，先查找我重写的，重写的没有会继续向上查找
// arrayMethods.__proto__ = oldArrayMethods (原先数组上的方法)
export let arrayMethods = Object.create(oldArrayMethods);
 
const methods = [
  "push",
  "shift",
  "unshift",
  "pop",
  "reverse",
  "sort",
  "splice",
  "reverse",
];

methods.forEach(method=>{
      arrayMethods[method] = function (...args){
            console.log('用户调用了push方法');//AOP切片编程
            const result = oldArrayMethods[method].apply(this,args);//调用原生的数组方法
            //**push unshift 添加的元素可能还是一个对象，还需要进行监控**
            let inserted; //当前用户插入的元素
            let ob = this.__ob__;  //获取observe的实例
            switch(method){
                  case 'push':
                  case 'unshift':
                        inserted = args;
                        break;
                  case 'splice':  //3个 新增的属性splice 有删除、新增的功能arr.splice(0,1,{name:1})
                        inserted = args.slice(2);
                  default:
                        break;

            }
            if(inserted) ob.observerArray(inserted); //**将新增属性继续进行观测,如果不对__ob__进行枚举限制，会造成递归栈溢出**
            return result;
      }
})