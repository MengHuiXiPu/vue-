#  Vue 源码

## 从 new 一个 Vue的实例粗来开始

**准备工作：** chrome 打开 **Vue github 地址**[1]

```
> cd 「你的路径」
> git clone https://github.com/vuejs/vue.git
> code vue (ps: 此命令为用VS code 打开 vue 项目)
复制代码
```

**看一下vue 项目的目录结构：**

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQSlsO9piaic1TzTHdz8ibIu1Rl9lLaVVkbVg7qlGRvQ0Fo7ET1rdBJric6fr3hS9ZmeeViczWbSGVBZnpg/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)image.png

哇，结构很清晰噢！好像莫名的木有那么复杂嘛（为分析源码做心理建设）

**全局安装 serve：**

```
> npm i -g serve
Or
> yarn global add serve
> serve .
复制代码
```

**So you shoud open in:** localhost:5000

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQSlsO9piaic1TzTHdz8ibIu1RlB3HtXNDCwjH6yN8icZEFAVu8f6Uzo3vzd6AASd6wV5Z2T1gorjEz1LA/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)image.png

咦～ 项目的目录结构就在浏览器可视化了。

点击 **examples** ，再找到 **markdown**， 此时你的url是 **http://localhost:5000/examples/markdown/**[2]

哇哦，可以玩了。例如:

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQSlsO9piaic1TzTHdz8ibIu1Rla3W1HUbX80fyTMJBEaxvyia7mziaDX5LhE2nQpJKGKMsdY12TYbcKHPw/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)image.png

咦～ 左边写markdown 语法，右边就实时展示粗来了？No，这个不重要。重要的是，代码！

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Vue.js markdown editor example</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://unpkg.com/marked@0.3.6"></script>
    <script src="https://unpkg.com/lodash@4.16.0"></script>
    <!-- Delete ".min" for console warnings in development -->
    <script src="../../dist/vue.min.js"></script>
  </head>
  <body>

    <div id="editor">
      <textarea :value="input" @input="update"></textarea>
      <div v-html="compiledMarkdown"></div>
    </div>

    <script>
      new Vue({
        el: '#editor',
        data: {
          input: '# hello'
        },
        computed: {
          compiledMarkdown: function () {
            return marked(this.input, { sanitize: true })
          }
        },
        methods: {
          update: _.debounce(function (e) {
            this.input = e.target.value
          }, 300)
        }
      })
    </script>

  </body>
</html>
复制代码
```

细看我们的 script 标签， `new Vue({...})` 是不是开始有点东西了？

再

```
 <!DOCTYPE html>
<html lang="en">
  <head>
    ...
  </head>
  <body>
    <!-- template for the modal component -->
    <script type="text/x-template" id="modal-template">
    ...
    </script>

    <!-- app -->
    <div id="app">
      <button id="show-modal" @click="showModal = true">Show Modal</button>
      <!-- use the modal component, pass in the prop -->
      <modal v-if="showModal" @close="showModal = false">
        <!--
          you can use custom content here to overwrite
          default content
        -->
        <h3 slot="header">custom header</h3>
      </modal>
    </div>

    <script>
      // register modal component
      Vue.component('modal', {
        template: '#modal-template'
      })

      // start app
      new Vue({
        el: '#app',
        data: {
          showModal: false
        }
      })
    </script>
  </body>
</html>

复制代码
```

这个栗子的功能很简单，就是页面上一个按钮，点击按钮会弹出一个框。你大概会觉得有点无聊，没关系，马上开始搞事情。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

现在，你把 template for modal 那个script里的标签删掉，在点击页面上那个按钮。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)页面上即没有框弹出来，控制台也木有提示任何报错信息。同样，你干掉 注册全局Vue组件，得到的结果是 页面内容有变化，但依然木有出现弹框。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

**那么，只根据以上的尝试，总结以下几点：**

- 一个页面就是一个 Vue 的实例。因为 有标准的 `new` 语法
- 如果页面要使用其它组件（app 代码之外的组件），必须要先注册
- script 标签里居然写了 类似 html 的标签（例如 **div**），那肯定是要编译成正在可执行的代码

废话不多说，加几行代码看看。

```
 const app =  new Vue({
        el: '#app',
        data: {
          showModal: false
        }
      })

console.log('Vue.component:',Vue.component)
console.log('Vue:',Vue, 'new Vue:', app)
复制代码
```

看图：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

哇！打印出来的结果令人欣喜！你看到了什么？？咱就抛开以往的知识，**你觉得你认识哪几个单词？**

先看 **Vue.component** 的打印结果。

- 明显，这是个 **function**，并且直接return 了一个 类似于经历了判断语句后的...结果？（图中红框表示）
- 入参好像暂时看不出什么，先暂留。

再看 **new Vue({...})** 的打印结果.

- Vue 本身也是个 function

- Vue 的实例 挂了很多属性，其中有些比较眼熟

- - vnode：猜测是虚拟DOM？
  - $createEmelemt: 这tm不是创建节点的意思？
  - _watcher: 这个单词监听的意思？

下一步：打个断点！如图

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

然后页面刷新，代码停在了。你会发现代码会经过 emptyObject、Vnode、Observer、Watcher处（因为我打好断点了，你可以根据上图自行找到并打好断点）。

最终，你会到这里。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

有木有觉得这段代码和上面哪里看到的很像？对！就是console 打印出来的 **Vue.component** .

破案了！终于找到看源码的入口了！！

## 冷静一下，先想想我们如何顺利的进入源码世界

你写Vue，你会看到哪些东西？咱就从最简单的（所见即所得）开始。

### 模板编译

将 **template** 转换为 **渲染函数**，也就是我们常说的**render** 。（React 当中也有 **render** 函数的概念，但它们不是一个东西，有一样也有区别）

```
// 此为 我们在  template 中 使用（写）的 HTML标签语法内容，
<button id="show-modal" @click="showModal = true">Show Modal</button>
复制代码
那，其对应的render函数是什么？
render(h){
    return h(
    'button',
    {
        on: {
            click: ()=> this.showModal = true
        }
    },
    Show Modal
    )
}
复制代码
```

啊 哈？你问我 那个 h ， 那个 on 是什么东西？哎呦，我好像一下子没刹住，车开远了。没事，后面会解释（虚拟 DOM） 。至于如何证明模板编译最终是个render，其实你在webpack打包后的文件里稍微找一下便一目了然了。`我们的.vue 文件就会被转化成render函数（通过 vue-loader）。`

先来个小证明：render函数 到底是个什么东西。加行代码:

```
      // register modal component
      Vue.component('modal', {
        template: '#modal-template'
      })

      // start app
     const vm =  new Vue({
        el: '#app',
        data: {
          showModal: false
        }
      })
     console.log('render:',vm.$options.render)
复制代码
```

这句console 打印出了什么？如图：

那么，这件事情是在哪里处理的？源码位置：`/vue-dev/src/platforms/web/entry-runtime-with-compiler.js`

**ps: 只截取部分源码代码, 关键位置我用中文注释了。**

忽略代码：code ...

```
// 只截取部分源码 
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el) // 获取传入的el对象

  /* istanbul ignore if */ 
  /* el不可以是 body 和 html对象 */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 将template/el 转成 render 函数。render挂在this.options 身上
  if (!options.render) { // 如果没有render属性，则 想办法 搞一个 render 函数
    let template = options.template
    if (template) { 
      if (typeof template === 'string') {
        // code ...
        template = idToTemplate(template) //该方法返回 el 的innerHTML
        // code ...
      } else if (template.nodeType) { // nodeType 是代表 template 和 el 是一样的。
        template = template.innerHTML // 如果模板是element ，拿template的 innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') { // 啥也不是，非法
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)； // 没有template，就用el的 outerHTML 作为模板
    }
    if (template) { // 好的，经过以上处理，这时候肯定有模板了！
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // 敲黑板，划重点！！ 此处 compileToFunctions 把 template 转换成 render 函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        // code ...
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      //code...
    }
  }
  // 最终，要渲染DOM了。 
  return mount.call(this, el, hydrating)
}
复制代码
```

稍微小结一下（**new Vue({...})** 到底干了什么）：

1. `最终目标是为了渲染真实DOM`

2. `$mount` 要把 `template/el` 转化成`render`

3. - 先判断`this.$options` 身上有无 `render` 方法，若没有则需要转化
   - `template`不存在则转化 `el`

4. 递归调用mount，并且矫正 this指向（必须一直指向Vue）

咦～ 太啰嗦了。总结成一句话就是：要保证Vue.$options.render方法是存在的。因为要计算VDOM。

回到开始，那render函数打印出来到底是个什么东西？如图：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

我把代码format一下：

```
  (function anonymous(
  ) {
    with (this) {
      return _c(
        'div',
        { attrs: { "id": "app" } },
        [_c(
          'button',
          {
            attrs: { "id": "show-modal" },
            on: { "click": function ($event) { showModal = true } }
          },
          [_v("Show Modal")]
        ),
        _v(" "),
        (showModal)
          ?
          _c('modal',
            {
              on: { "close": function ($event) { showModal = false } }
            },
            [
              _c('h3',
                { attrs: { "slot": "header" }, slot: "header" },
                [_v("custom header")]
              )]
          )
          :
          _e()],
        1)
    }
  })
复制代码
```

看得出，转化后的render函数其实就是个匿名函数（不是闭包）。其中 `_c` 方法其实就是 上述 所说的 `h`（啪！这是个误会，很容易被人误会。_c 就是 h ？）。

这里还有个小点，就是为什么会有 `showModal ? _c : _e` ? 它代表什么？哈哈，我把模板代码写出来看看。

```
    <div id="app">
      <button id="show-modal" @click="showModal = true">Show Modal</button>
      <!-- use the modal component, pass in the prop -->
      <modal v-if="showModal" @close="showModal = false">
        <!--
          you can use custom content here to overwrite
          default content
        -->
        <h3 slot="header">custom header</h3>
      </modal>
    </div>
复制代码
```

对，你猜的没错。`v-if="showModal"` 就是 `showModal ? _c : _e` ， 而且是DOM 有和无的差别。

ps: 有人想问 `with (this)` 是个什么意思了。它的意思是，在with的作用域内，this为该域的最高级别的对象。也就是在with的作用域内的“window”， 访问 _c、_e等 会默认找至 with。

然而，根据常识，一般 `_x` 这种单字母格式的方法一般都在 core 目录下，Vue 也不例外。

- _c: `/src/core/instance/render.js`
- _v/_s 等 : `/src/core/render-helpers/index.js`

so, 有必要找到定义 `_c` 的方法的位置。上源码：

```
export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false) // 1
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true) // 2

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm) // 3
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}
复制代码
```

请仔细看三个点， 代码中为加了数字标识。

1. 定义 **vm._c** ， 通过调用 `createElement` 得到，其传入的最后一个参数为false。
2. 定义 **vm.$createElement** ， 通过调用 `createElement` 得到，其传入的最后一个参数为 true。
3. isUpdatingChildComponent

小结一下：

- **vm._c** 和 **vm.$createElement** 其实是一个东西，只不过处理 children 的方式不一样。（暂时不细说）
- 正式环境 `production` 模式下，是不会去判断当前子组件是否正在更新，因为再去比较vm是需要一笔开销的。但开发环境就无所谓了，甚至还需要去做对比。因为dev 模式下，vm的体积是要比 production 大很多。

再看下 `/src/core/render-helpers/index.js`。这个看了之后，估计就能清晰很多了。

```
/* @flow */
//code ...
import ...
//code ...

export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
  target._d = bindDynamicKeys // 1
  target._p = prependModifier
}

复制代码
```

看，是不是清晰了很多。**原来那么多`_`开头的函数都是在这被赋予的。** 其中看下 `bindDynamicKeys`， 是的，你想得没错，你用 v-for 的时绑定的key 就是它完成的！（此处求源码打脸，我就不翻了……）

emmm, 好像前面的栗子还出现了 _v 方法，还是得解释一下 `createTextVNode` 方法。

path: `src/core/vdom/vnode.js`

```
// code...
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// code...
复制代码
```

唉，这没啥好说的了。就是有个 VNode类，可以new 出 空的vnode（虚拟节点）和 文本类型的vnode。至于vnode可以访问哪些属性和方法，你可以继续追根溯源……

这里，为了让大家能更深刻的理解html -> render 的过程，给个好玩的地址：**template-explorer**[3]

Q: 我们知道 template 最终也是要转化成 js 的，不然浏览器咋识别？那 template是如何转化成 最终的js的？答：template -> AST -> 优化后的AST -> render

好吧，继续上源码。path: `/src/compiler/index.js`

```
/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options) // template -> AST
  if (options.optimize !== false) {
    optimize(ast, options) // AST -> 优化后的AST
  }
  const code = generate(ast, options) // 优化后的AST -> code.render
  return {
    ast,
    render: code.render, // 这个render 是 string， 使用时需要转化成function
    staticRenderFns: code.staticRenderFns // 静态渲染函数，能得到一颗静态的VNode树
  }
})

复制代码
```

这段源码不多，关键位置有中午注释，一看即懂。

## Vue 的 组件化到底是个啥

官方说法是：Vue 组件 就是一个拥有预定义属性的 Vue 实例。**说人话就是：`new Vue({...})`**

那一个Vue组件包含哪些东西？很明了了……

1. 样式
2. js脚本
3. template

那么，Vue 中 可以注册 **全局组件** 和 **局部组件** 。如何做的呢？再来回顾一下上面的一个栗子：

```
  // register modal component 。modal 就是全局组件
      Vue.component('modal', {
        template: '#modal-template'
      })

      // start app
     const vm =  new Vue({
        el: '#app',
        data: {
          showModal: false
        }
      })
复制代码
```

很明显，通过 Vue.component 注册全局组件。上源码，path：`/src/core/global-api/index.js`

```
// code ...
export function initGlobalAPI (Vue: GlobalAPI) {
 // code ...
  Object.defineProperty(Vue, 'config', configDef) // 响应式……的开始？
// code ...

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue // 把Vue 的构造函数赋给 Vue.options._base

  extend(Vue.options.components, builtInComponents) // keep-alive setting

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
复制代码
```

有个单词组很敏感，`initAssetRegisters` ， 啥？初始化什么东西？上源码

```
// path: /src/shared/constants.js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]

// path:/src/core/global-api/assets.js
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object // 这里能看出啥？？
    ): Function | Object | void {
      if (!definition) { // 2. 如果没传 definition ，说明可以直接获取先前已经定义好的全局组件
        return this.options[type + 's'][id]
      } else { 
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition) // 3. 把组件的配置选项转化成组件的构造函数
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition //最终进行全局注册
        return definition
      }
    }
  })
}
复制代码
```

直接小结一下：

1. Vue[type] 直接定义了三个Vue的属性方法，分别是 `Vue.component`,`Vue.directive`,`Vue.filter`
2. 不给配置信息就认为是直接取已经定义过的全局组件。
3. 如果是调用 Vue.component ，那这会把你的配置信息转化成组件的构造函数（方便Vue实例访问其它方法属性）
4. 全局注册。下回再访问此组件Id，就会直接返回组件了。

Q：`definition: Function | Object // 这里能看出啥？？` 这行代码有什么用？

答：**据说 Vue 也可以写 jsx。道理在这，因为jsx就是个 fuction**

Q：为什么说每个Vue组件是Vue实例呢？

答：因为Vue组件继承了Vue。path: `/src/core/global-api/extend.js`

```
/* @flow */

import ...

export function initExtend (Vue: GlobalAPI) {
  //code ...

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this
    // code...

    const Sub = function VueComponent (options) {
      this._init(options)
    }
    // 此处Sub类继承了Super，Super 是this ，this指向Vue。 所以Sub的实例能访问Vue的属性
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
   
   // code...
  
    return Sub
  }
}

复制代码
```