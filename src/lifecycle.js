export function lifecycleMixin(Vue) {
  Vue.prototype._update = function () {};
}

export function mountComponent(vm, el) {
  const options = vm.$options; //options中有render方法
  vm.$el = el; //真实的dom元素

  //渲染页面
  //Watcher 每次数据变化后，会重新执行updateComponent方法，
  //vm._render 通过vm._render（原型上的方法）,调用当前实例上的render方法，渲染虚拟DOM
  //vm._update 拿到虚拟结点之后，会传点给update方法  update拿到虚拟结点之后，会更新真实结点
  let updateComponent = () => {
    //无论是渲染还是更新都会调用此方法
    //返回的都是虚拟dom
    vm._update(vm._render());
  };
  //渲染Watcher 每个组件都有一个watcher  响应式原理
  new Watcher(vm, updateComponent, () => {}, true); //true表示他是一个渲染watcher  第三个函数时回调方法
}
