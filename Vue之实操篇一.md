## Vue之实操篇一

这是我学习整理的关于 `Vue.js` 系列文章的第一篇，另外还有两篇分别是关于优化和原理的。希望读完这3篇文章，你能对 `Vue` 有个更深入的认识。

## 7种组件通信方式随你选

组件通信是 `Vue` 的核心知识，掌握这几个知识点，面试开发一点问题都没有。

### props/@on+$emit

用于实现父子组件间通信。通过 `props` 可以把父组件的消息传递给子组件：

```
// parent.vue    
<child :title="title"></child>
// child.vue
props: {
    title: {
        type: String,
        default: '',
    }
}
```

这样一来 `this.title` 就直接拿到从父组件中传过来的 `title` 的值了。注意，你不应该在子组件内部直接改变 `prop`，这里就不多赘述，可以直接看官网介绍。

而通过 `@on+$emit` 组合可以实现子组件给父组件传递信息：

```
// parent.vue
<child @changeTitle="changeTitle"></child>
// child.vue
this.$emit('changeTitle', 'bubuzou.com')
```

### 和listeners

`Vue_2.4` 中新增的 `$attrs/$listeners` 可以进行跨级的组件通信。`$attrs` 包含了父级作用域中不作为 `prop` 的属性绑定（`class` 和 `style` 除外），好像听起来有些不好理解？没事，看下代码就知道是什么意思了：

```
// 父组件 index.vue
<list class="list-box" title="标题" desc="描述" :list="list"></list>
// 子组件 list.vue
props: {
    list: [],
},
mounted() {
    console.log(this.$attrs)  // {title: "标题", desc: "描述"}
}
```

在上面的父组件 `index.vue` 中我们给子组件 `list.vue` 传递了4个参数，但是在子组件内部 `props` 里只定义了一个 `list`，那么此时`this.$attrs` 的值是什么呢？首先要去除 `props` 中已经绑定了的，然后再去除 `class` 和 `style`，最后剩下 `title` 和 `desc` 结果和打印的是一致的。基于上面代码的基础上，我们在给 `list.vue` 中加一个子组件：

```
// 子组件 list.vue
<detail v-bind="$attrs"></detial>
// 孙子组件 detail.vue
// 不定义props，直接打印 $attrs
mounted() {
    console.log(this.$attrs)  // {title: "标题", desc: "描述"}
}
```

在子组件中我们定义了一个 `v-bind="$attrs"` 可以把父级传过来的参数，去除 `props`、`class` 和 `style` 之后剩下的继续往下级传递，这样就实现了跨级的组件通信。

`$attrs` 是可以进行跨级的参数传递，实现父到子的通信；同样的，通过`$listeners` 用类似的操作方式可以进行跨级的事件传递，实现子到父的通信。`$listeners` 包含了父作用域中不含 `.native` 修饰的 `v-on` 事件监听器，通过 `v-on="$listeners"` 传递到子组件内部。

```
// 父组件 index.vue
<list @change="change" @update.native="update"></list>

// 子组件 list.vue
<detail v-on="$listeners"></detail>
// 孙子组件 detail.vue
mounted() {
    this.$listeners.change()
    this.$listeners.update() // TypeError: this.$listeners.update is not a function
}
```

### provide/inject组合拳

`provide/inject` 组合以允许一个祖先组件向其所有子孙后代注入一个依赖，可以注入属性和方法，从而实现跨级父子组件通信。在开发高阶组件和组件库的时候尤其好用。

```
// 父组件 index.vue
data() {
    return {
        title: 'bubuzou.com',
    }
}
provide() {
    return {
        detail: {
            title: this.title,
            change: (val) => {
                console.log( val )
            }
        }
    }
}

// 孙子组件 detail.vue
inject: ['detail'],
mounted() {
    console.log(this.detail.title)  // bubuzou.com
    this.detail.title = 'hello world'  // 虽然值被改变了，但是父组件中 title 并不会重新渲染
    this.detail.change('改变后的值')  // 执行这句后将打印：改变后的值 
}
```

> ❝
>
> `provide` 和 `inject` 的绑定对于原始类型来说并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的 property 还是可响应的。这也就是为什么在孙子组件中改变了 `title`，但是父组件不会重新渲染的原因。
>
> ❞

### EventBus

以上三种方式都是只能从父到子方向或者子到父方向进行组件的通信，而我就比较牛逼了😀，我还能进行兄弟组件之间的通信，甚至任意2个组件间通信。利用 `Vue` 实例实现一个 `EventBus` 进行信息的发布和订阅，可以实现在任意2个组件之间通信。有两种写法都可以初始化一个 `eventBus` 对象：

1. 通过导出一个 `Vue` 实例，然后再需要的地方引入：

   ```
   // eventBus.js
   import Vue from 'vue'
   export const EventBus = new Vue()
   ```

   使用 `EventBus` 订阅和发布消息：

   ```
   import {EventBus} from '../utils/eventBus.js'
   
   // 订阅处
   EventBus.$on('update', val => {})
   
   // 发布处
   EventBus.$emit('update', '更新信息')
   ```

2. 在 `main.js` 中初始化一个全局的事件总线：

   ```
   // main.js
   Vue.prototype.$eventBus = new Vue()
   ```

   使用：

   ```
   // 需要订阅的地方
   this.$eventBus.$on('update', val => {})
   
   // 需要发布信息的地方
   this.$eventBus.$emit('update', '更新信息')
   ```

如果想要移除事件监听，可以这样来：

```
this.$eventBus.$off('update', {})
```

上面介绍了两种写法，推荐使用第二种全局定义的方式，可以避免在多处导入 `EventBus` 对象。这种组件通信方式只要订阅和发布的顺序得当，且事件名称保持唯一性，理论上可以在任何 2 个组件之间进行通信，相当的强大。但是方法虽好，可不要滥用，建议只用于简单、少量业务的项目中，如果在一个大型繁杂的项目中无休止的使用该方法，将会导致项目难以维护。

### Vuex进行全局的数据管理

`Vuex` 是一个专门服务于 `Vue.js` 应用的状态管理工具。适用于中大型应用。`Vuex` 中有一些专有概念需要先了解下：

- `State`：用于数据的存储，是 `store` 中的唯一数据源；
- `Getter`：类似于计算属性，就是对 `State` 中的数据进行二次的处理，比如筛选和对多个数据进行求值等；
- `Mutation`：类似事件，是改变 `Store` 中数据的唯一途径，只能进行同步操作；
- `Action`：类似 `Mutation`，通过提交 `Mutation` 来改变数据，而不直接操作 `State`，可以进行异步操作；
- `Module`：当业务复杂的时候，可以把 `store` 分成多个模块，便于维护；

对于这几个概念有各种对应的 `map` 辅助函数用来简化操作，比如`mapState`，如下三种写法其实是一个意思，都是为了从 `state` 中获取数据，并且通过计算属性返回给组件使用。

```
computed: {
    count() {
        return this.$store.state.count
    },
    ...mapState({
        count: state => state.count
    }),
    ...mapState(['count']),
},
```

又比如 `mapMutations`， 以下两种函数的定义方式要实现的功能是一样的，都是要提交一个 `mutation` 去改变 `state` 中的数据：

```
methods: {
    increment() {
        this.$store.commit('increment')
    },
    ...mapMutations(['increment']),
}
```

接下来就用一个极简的例子来展示 `Vuex` 中任意2个组件间的状态管理。1、 新建 `store.js`

```
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
    
export default new Vuex.Store({
    state: {
        count: 0,
    },
    mutations: {
        increment(state) {
            state.count++
        },
        decrement(state) {
            state.count--
        }
    },
})
```

2、 创建一个带 `store` 的 `Vue` 实例

```
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './utils/store'
    
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
```

3、 任意组件 `A` 实现点击递增

```
<template>
    <p @click="increment">click to increment：{{count}}</p>
</template>
<script>
import {mapState, mapMutations} from 'vuex'
export default {
    computed: {
        ...mapState(['count'])
    },
    methods: {
        ...mapMutations(['increment'])
    },
}
</script>
```

4、 任意组件 `B` 实现点击递减

```
<template>
    <p @click="decrement">click to decrement：{{count}}</p>
</template>
<script>
import {mapState, mapMutations} from 'vuex'
export default {
    computed: {
        ...mapState(['count'])
    },
    methods: {
        ...mapMutations(['decrement'])
    },
}
</script>
```

以上只是用最简单的 `vuex` 配置去实现组件通信，当然真实项目中的配置肯定会更复杂，比如需要对 `State` 数据进行二次筛选会用到 `Getter`，然后如果需要异步的提交那么需要使用 `Action`，再比如如果模块很多，可以将 `store` 分模块进行状态管理。对于 `Vuex` 更多复杂的操作还是建议去看Vuex 官方文档，然后多写例子。

### Vue.observable实现mini vuex

这是一个 `Vue2.6` 中新增的 `API`，用来让一个对象可以响应。我们可以利用这个特点来实现一个小型的状态管理器。

```
// store.js
import Vue from 'vue'
 
export const state = Vue.observable({
    count: 0,
})

export const mutations = {
    increment() {
        state.count++
    }
    decrement() {
        state.count--
    }
}
// parent.vue
<template>
    <p>{{ count }}</p>
</template>
<script>
import { state } from '../store'
export default {
    computed: {
        count() {
            return state.count
        }
    }
}
</script>
// child.vue
import  { mutations } from '../store'
export default {
    methods: {
        handleClick() {
            mutations.increment()
        }
    }
}
```

### children/root

通过给子组件定义 `ref` 属性可以使用 `$refs` 来直接操作子组件的方法和属性。

```
<child ref="list"></child>
```

比如子组件有一个 `getList` 方法，可以通过如下方式进行调用，实现父到子的通信：

```
this.$refs.list.getList()
```

除了 `$refs` 外，其他3个都是自 `Vue` 实例创建后就会自动包含的属性，使用和上面的类似。

## 6类可以掌握的修饰符

### 表单修饰符

表单类的修饰符都是和 `v-model` 搭配使用的，比如：`v-model.lazy`、`v-model.trim` 以及 `v-model.number` 等。

- `.lazy`：对表单输入的结果进行延迟响应，通常和 `v-model` 搭配使用。正常情况下在 `input` 里输入内容会在 `p` 标签里实时的展示出来，但是加上 `.lazy` 后则需要在输入框失去焦点的时候才触发响应。

  ```
  <input type="text" v-model.lazy="name" />
  <p>{{ name }}</p>
  ```

- `.trim`：过滤输入内容的首尾空格，这个和直接拿到字符串然后通过`str.trim()` 去除字符串首尾空格是一个意思。

- `.number`：如果输入的第一个字符是数字，那就只能输入数字，否则他输入的就是普通字符串。

### 事件修饰符

`Vue` 的事件修饰符是专门为 `v-on` 设计的，可以这样使用：`@click.stop="handleClick"`，还能串联使用：`@click.stop.prevent="handleClick"`。

```
<div @click="doDiv">
    click div
    <p @click="doP">click p</p>
</div>
```

- `.stop`：阻止事件冒泡，和原生 `event.stopPropagation()` 是一样的效果。如上代码，当点击 `p` 标签的时候，`div` 上的点击事件也会触发，加上 `.stop` 后事件就不会往父级传递，那父级的事件就不会触发了。

- `.prevent`：阻止默认事件，和原生的 `event.preventDefault()` 是一样的效果。比如一个带有 `href` 的链接上添加了点击事件，那么事件触发的时候也会触发链接的跳转，但是加上 `.prevent` 后就不会触发链接跳转了。

- `.capture`：默认的事件流是：捕获阶段-目标阶段-冒泡阶段，即事件从最具体目标元素开始触发，然后往上冒泡。而加上 `.capture` 后则是反过来，外层元素先触发事件，然后往深层传递。

- `.self`：只触发自身的事件，不会传递到父级，和 `.stop` 的作用有点类似。

- `.once`：只会触发一次该事件。

- `.passive`：当页面滚动的时候就会一直触发 `onScroll` 事件，这个其实是存在性能问题的，尤其是在移动端，当给他加上 `.passive` 后触发的就不会那么频繁了。

- `.native`：现在在组件上使用 `v-on` 只会监听自定义事件 (组件用 `$emit` 触发的事件)。如果要监听根元素的原生事件，可以使用 `.native` 修饰符，比如如下的 `el-input`，如果不加 `.native` 当回车的时候就不会触发 `search` 函数。

  ```
  <el-input type="text" v-model="name" @keyup.enter.native="search"></el-input>
  ```

> ❝
>
> 串联使用事件修饰符的时候，需要注意其顺序，同样2个修饰符进行串联使用，顺序不同，结果大不一样。`@click.prevent.self` 会阻止所有的点击事件，而 `@click.self.prevent` 只会阻止对自身元素的点击。
>
> ❞

### 鼠标按钮修饰符

- `.left`：鼠标左键点击；
- `.right`：鼠标右键点击；
- `.middle`：鼠标中键点击；

### 键盘按键修饰符

`Vue` 提供了一些常用的按键码：

- `.enter`
- `.tab`
- `.delete` (捕获“删除”和“退格”键)
- `.esc`
- `.space`
- `.up`
- `.down`
- `.left`
- `.right`

另外，你也可以直接将 `KeyboardEvent.key` 暴露的任意有效按键名转换为 `kebab-case` 来作为修饰符，比如可以通过如下的代码来查看具体按键的键名是什么：

```
<input @keyup="onKeyUp">
onKeyUp(event) {
    console.log(event.key)  // 比如键盘的方向键向下就是 ArrowDown
}
```

### .exact修饰符

`.exact` 修饰符允许你控制由精确的系统修饰符组合触发的事件。

```
<!-- 即使 Alt 或 Shift 被一同按下时也会触发 -->
<button v-on:click.ctrl="onClick">A</button>

<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button v-on:click.ctrl.exact="onCtrlClick">A</button>

<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button v-on:click.exact="onClick">A</button>
```

### .sync修饰符

`.sync` 修饰符常被用于子组件更新父组件数据。直接看下面的代码：

```
// parent.vue
<child :title.sync="title"></child>
// child.vue
this.$emit('update:title', 'hello')
```

子组件可以直接通过 `update:title` 的形式进行更新父组件中声明了`.sync` 的 `prop`。上面父组件中的写法其实是下面这种写法的简写：

```
<child :title="title" @update:title="title = $event"></child>
```

> ❝
>
> 注意带有 .sync 修饰符的 v-bind 不能和表达式一起使用
>
> ❞

如果需要设置多个 `prop`，比如：

```
<child :name.sync="name" :age.sync="age" :sex.sync="sex"></child>
```

可以通过 `v-bind.sync` 简写成这样：

```
<child v-bind.sync="person"></child>
person: {
    name: 'bubuzou',
    age: 21,
    sex: 'male',
}
```

`Vue` 内部会自行进行解析把 `person` 对象里的每个属性都作为独立的`prop` 传递进去，各自添加用于更新的 `v-on` 监听器。而从子组件进行更新的时候还是保持不变，比如：

```
this.$emit('update:name', 'hello')
```

## 6种方式编写可复用模块

今天需求评审了一个需求，需要实现一个详情页，这个详情页普通用户和管理员都能进去，但是展示的数据有稍有不同，但绝大部分是一样的；最主要的区别是详情对于普通用户是纯展示，而对于管理员要求能够编辑，然后管理员还有一些别的按钮权限等。需求看到这里，如果在排期的时候把用户的详情分给开发A做，而把管理员的详情分给B去做，那这样做的结果就是开发A写了一个详情页，开发B写了一个详情页，这在开发阶段、提测后的修改 `bug` 阶段以及后期迭代阶段，都需要同时维护这 2 个文件，浪费了时间浪费了人力，所以你可以从中意识到编写可复用模块的重要性。

而 `Vue` 作者尤大为了让开发者更好的编写可复用模块，提供了很多的手段，比如：组件、自定义指令、渲染函数、插件以及过滤器等。

### 组件

组件是 `Vue` 中最精髓的地方，也是我们平时编写可复用模块最常用的手段，但是由于这块内容篇幅很多，所以不在这里展开，后续会写相关的内容进行详述。

### 使用混入mixins

什么是混入呢？从代码结构上来看，混入其实就是半个组件，一个 `Vue` 组件可以包括 `template`、`script` 和 `style` 三部分，而混入其实就是 `script` 里面的内容。一个混入对象包含任意组件选项，比如 `data`、`methods`、`computed`、`watch` 、生命周期钩子函数、甚至是 `mixins` 自己等，混入被设计出来就是旨在提高代码的灵活性、可复用性。

什么时候应该使用混入呢？当可复用逻辑只是 `JS` 代码层面的，而无 `template` 的时候就可以考虑用混入了。比如需要记录用户在页面的停留的时间，那我们就可以把这段逻辑抽出来放在 `mixins` 里：

```
// mixins.js
export const statMixin = {
    methods: {
        enterPage() {},
        leavePage() {},
    },
    mounted() {
        this.enterPage()
    },
    beforeDestroyed() {
        this.leavePage()
    }
}
```

然后在需要统计页面停留时间的地方加上：

```
import { statMixin } from '../common/mixins'
export default {
    mixins: [statMixin]
}
```

使用混入的时候要注意和组件选项的合并规则，可以分为如下三类：

- `data` 将进行递归合并，对于键名冲突的以组件数据为准：

  ```
  // mixinA 的 data
  data() {
      obj: {
          name: 'bubuzou',
      },
  }
  
  // component A
  export default {
      mixins: [mixinA],
      data(){
          obj: {
              name: 'hello',
              age: 21
          },
      },
      mounted() {
          console.log( this.obj )  // { name: 'bubuzou', 'age': 21 }    
      }
  }
  ```

- 对于生命周期钩子函数将会合并成一个数组，混入对象的钩子将先被执行：

  ```
  // mixin A
  const mixinA = {
      created() {
          console.log( '第一个执行' )
      }
  }
  
  // mixin B
  const mixinB = {
      mixins: [mixinA]
      created() {
          console.log( '第二个执行' )
      }
  }
  
  // component A
  export default {
      mixins: [mixinB]
      created() {
          console.log( '最后一个执行' )
      }
  }
  ```

- 值为对象的选项，例如 `methods`、`components` 和 `directives`，将被合并为同一个对象。两个对象键名冲突时，取组件对象的键值对。

### 自定义指令

除了 `Vue` 内置的一些指令比如 `v-model`、`v-if` 等，`Vue` 还允许我们自定义指令。在 `Vue2.0` 中，代码复用和抽象的主要形式是组件。然而，有的情况下，你仍然需要对普通 `DOM` 元素进行底层操作，这时候就会用到自定义指令。比如我们可以通过自定义一个指令来控制按钮的权限。我们期望设计一个如下形式的指令来控制按钮权限：

```
<button v-auth="['user']">提交</button>
```

通过在按钮的指令里传入一组权限，如果该按钮只有 `admin` 权限才可以提交，而我们传入一个别的权限，比如 `user`，那这个按钮就不应该显示了。接下来我们去注册一个全局的指令：

```
// auth.js
const AUTH_LIST = ['admin']

function checkAuth(auths) {
    return AUTH_LIST.some(item => auths.includes(item))
}

function install(Vue, options = {}) {
    Vue.directive('auth', {
        inserted(el, binding) {
            if (!checkAuth(binding.value)) {
                el.parentNode && el.parentNode.removeChild(el)
            }
        }
    })
}

export default { install }
```

然后我们需要在 `main.js` 里通过安装插件的方式来启用这个指令：

```
import Auth from './utils/auth'
Vue.use(Auth)
```

### 使用渲染函数

这里将使用渲染函数实现上面介绍过的的权限按钮。使用方式如下，把需要控制权限的按钮包在权限组件 `authority` 里面，如果有该权限就显示，没有就不显示。

```
<authority :auth="['admin']">
    <button>提交</button>
</authority>
```

然后我们用渲染函数去实现一个 `authority` 组件：

```
<script>
const AUTH_LIST = ['admin', 'user', 'org']

function checkAuth(auths) {
    return AUTH_LIST.some(item => auths.includes(item))
}
export default {
    functional: true,
    props: {
        auth: {
            type: Array,
            required: true
        }
    },
    render(h, context) {
        const { props,  scopedSlots} = context
        return checkAuth(props.auth) ? scopedSlots.default() : null
    }
}
</script>
```

全局注册这个组件：

```
// main.js
import Authority from './components/authority'
Vue.component('authority', Authority)
```

### 使用过滤器

`Vue` 提供了自定义过滤器的功能，主要应用场景是想要将数据以某种格式展示出来，而原始数据又不符合这种格式的时候。比如有一组关于人的数据，如下：

```
[{
    name: '张茂',
    population: 'young',
}, {
    name: '王丽',
    population: 'middle',
}, {
    name: '郝鹏程',
    population: 'child',
}]
```

其中有一项是关于按照年龄划分的群体类型 `population`，而它是用 `code`进行标识的，我们希望在展示的时候能够显示成对应的中文意思，比如 `young` 显示成青年。那我们就可以定义一个如下的局部过滤器：

```
export default {
    filters: {
        popuFilters(value) {
            if (!value) { return '未知' }
            let index = ['child', 'lad', 'young', 'middle', 'wrinkly'].indexOf(value)
            return index > 0 && ['儿童', '少年', '青年', '中年', '老年'][index] || '未知'
        }
    }
}
```

使用过滤器的时候只要在 `template` 中这样使用即可：

```
<p>{{ item.population | popuFilters }}</p>
```

### 自定义插件

在某些情况下，我们封装的内容可能不需要使用者对其内部代码结构进行了解，其只需要熟悉我们提供出来的相应方法和 `api` 即可，这需要我们更系统性的将公用部分逻辑封装成插件，来为项目添加全局功能，比如常见的 `loading` 功能、弹框功能等。

开发 `Vue` 的插件应该暴露一个 `install` 方法。这个方法的第一个参数是`Vue` 构造器，第二个参数是一个可选的选项对象。可以通过如下4种方式来自定义插件：

```
MyPlugin.install = function (Vue, options) {
  // 1. 添加全局方法或 property
  Vue.myGlobalMethod = function () {
    // 逻辑...
  }

  // 2. 添加全局资源
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // 逻辑...
    }
    ...
  })

  // 3. 注入组件选项
  Vue.mixin({
    created: function () {
      // 逻辑...
    }
    ...
  })

  // 4. 添加实例方法
  Vue.prototype.$myMethod = function (methodOptions) {
    // 逻辑...
  }
}
```

然后需要在入口文件，比如 `main.js` 中注册插件：

```
import MyPlugin from './plugins/plugins.js'
Vue.use(MyPlugin)
```

## 3种方式手写优雅代码

平时写项目的时候我们都是在第一时间完成需求功能的开发、提测修改`bug` 等，然后开开心心的等待着发布生产以为没啥事情了。其实回过头来细细的看我们平时写的代码，可能会发现很多地方都是值得优化的，比如对于很多重复性很强的代码，比如对于某些写得很繁杂的地方。优雅的代码可以化机械为自动、化繁为简，看人开了如沐春风，心情大好。这里列了几个在 `Vue` 中一定会遇到的问题，然后通过优雅的方式进行解决。

### 自动化导入模块

在开发一个稍微大点的项目的时候，会习惯将路由按照模块来划分，然后就可能会出现如下这种代码：

```
// router.js
import Vue from 'vue'
import Router from 'vue-router'
// 导入了一大堆路由文件
import mediator from './mediator'
import judges from './judges'
import disputeMediation from './disputeMediation'
import onlineMediation from './onlineMediation'
import useraction from './useraction'
import organcenter from './organcenter'
import admin from './admin'

let routeList = []
routeList.push(mediator, judges, disputeMediation, onlineMediation, useraction, organcenter, admin)
 
export default new Router({
    mode: 'history',
    routes: routeList,
})
```

其实真实的远远不止这么点，就我本地项目而言就有20几个路由文件，写了一大堆的导入代码，显得很臃肿，更无奈的是每当需要新增一个路由模块，还得再次 `import` 再次 `push`，那么有没有什么办法可以解决这个问题呢？答案自然是有的。

利用 `webpack` 的 `require.context` 就可以很优雅的解决这个问题，使用语法如下：

```
require.context(
    directory,  // 搜索的目录
    useSubdirectories = true,  // 是否搜索子目录
    regExp = /^\.\/.*$/,  // 匹配的目标文件格式
    mode = 'sync'  // 同步还是异步
)
```

有了这个语法，我们就能很容易的写出下面的代码：

```
import Vue from 'vue'
import Router from 'vue-router'

let routeList = []
let importAll = require.context('@/publicResource/router', false, /\.js$/)
importAll.keys().map(path => {
    // 因为 index.js 也在 @/publicResource/router 目录下，所以需要排除
    if (!path.includes('index.js')) {          
        //兼容处理：.default 获取 ES6 规范暴露的内容; 后者获取 commonJS 规范暴露的内容
        let router = importAll(path).default || importAll(path)
        routeList(router)
    }
})
 
export default new Router({
    mode: 'history',
    routes: routeList,
})
```

其实不仅仅只是用在导入路由模块这里，对于项目里任何需要导入大量本地模块的地方都可以使用这种方式来解决。

### 模块化注册插件

相信写 `Vue` 的同学们都知道 `element-ui` 这个组件库，在使用这个组件库的时候大部分都是只使用某些个别的组件，所以基本上都是按需引入需要的组件，然后就有如下一堆 `Vue.use()` 的代码：

```
// main.js
import Vue from 'vue'
import {
    Input,
    Radio,
    RadioGroup,
    Checkbox,
    CheckboxGroup,
    Select
    // 还有很多组件
} from 'element-ui'

Vue.use(Input)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Select)
```

这样写是没任何问题的，就是看着不够简洁舒服，那更优雅的做法是把这块逻辑抽到一个文件里，然后通过注册插件的方式来使用他们：

```
// elementComponent.js
import {
    Input,
    Radio,
    RadioGroup,
    Checkbox,
    CheckboxGroup,
    Select
    // 还有很多组件
} from 'element-ui'

const components = {
    Input,
    Radio,
    RadioGroup,
    Checkbox,
    CheckboxGroup,
    Select
}
function install(Vue){
    Object.keys(components).forEach(key => Vue.use(components[key]))
}
export default { install }
```

然后在 `main.js` 里使用这个插件：

```
// main.js
import Vue from 'vue'
import elementComponent from './config/elementComponent'
Vue.use(elementComponent)
```

### 优雅导出请求接口

不知道大伙是如何定义请求接口的，就我目前这个项目而言，是这么做的：

```
// api.js
import http from './config/httpServer.js'

 /* 登入页面获取公钥 */
export const getPublicKey = (data) => {
    return http({ url: '/userGateway/user/getPublicKey' }, data)
}

// 用户登录
export const login = data => {
    return http({ url: '/userGateway/userSentry/login' }, data)
}

// 验证码登录
export const loginByCode = data => {
    return http({ url: '/userGateway/userSentry/loginByCode' }, data)
}
```

在组件中使用接口：

```
<script>
import { getPublicKey } from './config/api.js'
export default {
    mounted() {
        getPublicKey().then(res => {
            // xxx
        }).catch(err => {
            // xxx
        })
    }
}
</script>
```

这一切都很正常，但，我们这个项目总共有200多个接口，按照上面这种定义方式的话，一个接口定义加上空行需要占用 5 行，所以如果把全部接口都定义到这个 `api.js` 里需要占用 1000 行左右，看了实在让人心很慌呀。所以觉得应该这个地方应该可以优化一下。

```
/userGateway/user/getPublicKey
```

上面这是一个后端给接口路径，斜杆把这个路径划分成 3 个子串，而最后一个子串必定是唯一的，所以我们可以从中做文章。于是乎就有了下面的代码：

```
// api.js
const apiList = [
    '/userGateway/user/getPublicKey',  // 登入页面获取公钥
    '/userGateway/userSentry/login',  // 用户登录
    '/userGateway/userSentry/loginByCode',  // 验证码登录
]

let apiName, API = {}
apiList.forEach(path => {
    // 使用正则取到接口路径的最后一个子串，比如: getPublicKey
    apiName = /(?<=\/)[^/]+$/.exec(path)[0]      
    API[apiName] = (data) => {
        return http({url: path}, data)
    }
})
export { API }
```

这样大概就把定义一个接口需要占用 5 行缩小到只需要 1 行了，大大减小了文件内容。在浏览这个文件的时候，我的鼠标滚轮也不会一直在滚滚滚了。

如果是这样定义接口的话，那在使用的时候还需要做点变化的：

```
<script>
import { API } from './config/api.js'
export default {
    mounted() {
        API.getPublicKey().then(res => {
            // xxx
        }).catch(err => {
            // xxx
        })
    }
}
</script>
```

## 4种$event传参方式

在进行实际项目开发的时候经常会需要通过事件传递参数，这里总结了4种应用场景。

### 用于组件通信

比如子组件通过 `$emit` 来调用父组件方法的时候，可以在父组件中用 `$event` 接收到从子组件传递过来的参数：

```
// 子组件
<button @click="$emit('changeText', '18px')">点击加大字号</button>
// 父组件
<blog-post @changeText="changeText('article', $event)"></blog-post>
changeText(type, value) {
    console.log(type, value)  // 'article' '18px'
}
```

如果子组件传递过来的参数有多个，这个时候用 `$event` 就不太行了，此时可以用 `arguments` 代替：

```
// 子组件
<button @click="$emit('changeText', 'red', '18px')">点击改变样式</button>
// 父组件
<blog-post @changeText="changeText(...arguments, 'article')"></blog-post>
changeText(...value) {
    console.log( value )  // ['red', '18px', 'article']
}
```

### 传递原生DOM事件对象

比如我们需要获取到当前的点击元素，就可以通过给点击事件传递`$event` 参数：

```
<button @click="submit('first', $event)">提交</button>
submit(type, event) {
    const target = event.target.tagName
}
```

### 用于第三方类库事件回调

比如有一个组件里使用了好几个 `element-ui` 的分页组件，每个分页都有一个 `current-change` 事件，用来处理当分页改变之后的事情，这样的话我们就需要写多个回调函数，但是如果用以下方式，我们就也可以只写一个函数，通过 `type` 来判断是哪个分页的回调，而 `$event` 则用来传递 `current-change` 回调默认的参数：

```
// 页面列表的分页
<el-pagination 
    @current-change="changePage('main', $event)">
</el-pagination>

// 弹窗A列表的分页
<el-pagination 
    @current-change="changePage('modalA', $event)">
</el-pagination>

// 弹窗B列表的分页
<el-pagination 
    @current-change="changePage('modalB', $event)">
</el-pagination>
changePage(type, page) {
    const types = ['main', 'modalA', 'modalB']
    types[type] && (this[types[type]].pageIndex = page) && this.getList(type)
}
```

### 使用箭头函数处理

对于第三种场景，使用第三方类库组件的时候，需要给事件回调增加额外的参数，如果默认的回调参数只有1个那么我们就可以使用上面的那种方式，但是如果回调参数有多个的话，用 `$event` 就不好处理了，可以使用箭头函数。比如文件上传的时候，有个 `on-change` 属性，当文件变化的时候就会触发回调，正常情况下我们这样写是没问题的：

```
<el-upload :on-change="changeFile">
    <el-button>上传</el-button>
</el-upload>
changeFile(file, fileList) {}
```

但是如果一个组件里有多个文件上传，而我们又不想写多个`changeFile`，那就需要传递额外的参数 `type` 了 ：

```
<el-upload :on-change="(file, fileList) => changeFile('org', file, fileList)">
    <el-button>上传</el-button>
</el-upload>
changeFile(type, file, fileList) {}
```

## 3种深入watch的用法

### 立即执行

`watch` 是 `Vue` 中的侦听器，可以侦听一个 `Vue` 实例上的数据，当数据变动的时候，就会触发该侦听器。所以他的应用场景就是：当某个数据变动后需要做什么的时候就可以使用 `watch` 啦。对于 `watch`，平常我们写得最多的估计是如下这种写法：

```
watch: {
    list: function(val) {
        this.getMsg()
    }
}
```

如果我们希望组件初始化的时候就执行一次 `getMsg` 方法，可以直接在 `mounted` 里调用：

```
mounted() {
    this.getMsg()
}
```

其实，还有一种更加简便的写法，通过给 `watch` 设置 `immediate: true`，即可：

```
watch: {
    list: {
        handler(val) {  // 注意别写错成 handle
            this.getMsg()
        },
        immediate: true
    }
}
```

### 深度监听

侦听器对于属性变更后会自动调用一次，但是仅限于该属性本身，如果变更的是属性的属性，则不会触发侦听回调，如果想要实现这个功能可以给`watch` 加上 'deep: true' 即可：

```
watch: {
    obj: {
        handler(val) { // do something },
        deep: true
    }
},
mounted() {
    this.obj.name = 'bubuzou'  // 将触发 handler
}
```

### 多个handlers

实际上，`watch` 可以设置为数组，支持类型为 `String`、`Object` 和 `Function`。触发后，多个处理函数都将被调用。

```
watch: {
    obj: [
        'print',
        {
            handler: 'print',
            deep: true
        },
        function(val, oldValue) {
            console.log(val)
        }
    ]
},
methods: {
    print() {
        console.log(this.obj)
    }
}
```

## 5个其他开发小技巧

掌握 `Vue` 的开发小技巧，在一些特定的场景下真的很管用，这里列了一些常用的小技巧。

### 函数式组件实现零时变量

我们在使用插槽的时候，知道有一个叫做插槽 `prop` 的知识，今天我们用他和函数式组件结合在一块，实现一个零时变量的组件：

```
// tempvar.vue
<script>
export default {
    functional: true,
    render(h, context) {
        const { props,  scopedSlots} = context
        return scopedSlots.default && scopedSlots.default(props || {})
    }
}
</script>
```

定义好了函数式组件，我们就可以在需要的地方引入且使用他：

```
<template>
<tempvar
    :var1="`hello ${user.name}`"
    :var2="user.age ? user.age : '18'">
    <template v-slot="{var1, var2}">
       姓名： {{ var1 }}
       年龄：{{ var2 }}
    </template>
</tempvar>
</template>
<script>
    import tempvar from '@/components/tempvar.vue'
    export default {
        data() {
            return {
                obj: {
                    name: 'bubuzou',
                    age: 12,
                },
            }
        }
        components: {
            tempvar
        }  
    }
</script>
```

可能细心的小伙伴发现了，要把名字前加个 `hello`、默认年龄设置为 `18`用计算属性就可以了呀？为啥还要搞那么复杂，专门用一个函数式组件去实现呢？其实这个小技巧还是很有必要存在的，当许多组件都有这种数据的重新计算的时候，如果没有使用这个技巧，那么就需要写很多很多的计算属性，而有了函数式组件 `tempvar` 后，只需要在组件里引入他，然后写插槽就好了。就相当于把写计算属性的功夫花在了写插槽上了。总而言之，两种方式都可以实现类似的属性计算功能，该怎么选，随你喜欢啦。

### 调试template（不推荐）

在开发调试的时候经常会需要通过 `console.log` 来打印出某个数据对象来查看其内部的结构或者字段值，但是这样做肯定不必在 `template` 里将其输出更直接。比如有这样一个数据：

```
obj: {
    name: 'bubuzou',
    age: 21,
}
```

在模板中展示：

```
<p>{{ obj }}</p>
```

页面渲染完成后会看到：

```
{ "name": "bubuzou", "age": 21 }
```

对于这样的渲染结果虽然没什么问题，但是如果这个 `obj` 是层级很深且字段很多的数据，显示出来就会一堆数据砸在一块，丝毫没有阅读体验。

因此基于这个背景，我们可以将 `console.log` 挂载在 `Vue` 的实例原型上：

```
// main.js
Vue.prototype.$log = window.console.log
```

然后就可以开开心心在模板中使用他了：

```
<p>{{ $log( obj ) }}</p>
```

这样会在浏览器控制台输出当前的数据对象，在显示效果上和`console.log` 直接打印别无二致。

但说了这么多，使用 `Vue` 进行开发调试还是强烈推荐官方的vue-devtools 工具，谁用谁知道。

### 监听子组件的钩子函数

通常如果我们想在子组件钩子函数触发的时候通知父组件，我们可以这样做：

```
// parent.vue
<child @mounted="doSomething"></child>
// child.vue
this.$emit('mounted')
```

其实还有一种更加简单的写法，那就是使用 `hookEvent`：

```
<child @hook:mounted="doSomething"></child>
```

钩子函数除了以上用法，还可以通过动态注册做一些别的事情，比如组件销毁前进行资源的释放：

```
mounted() {
    let setIntervalId = setInterval(() => {
        console.log(888);
    }, 1000)
    
    this.$once("hook:beforeDestroy", () => {
        clearInterval(setIntervalId)
        setIntervalId = null
    })
}
```

### 路由参数解耦

参数解耦，啥意思呢？别着急，我们先来看比如对于这么一串路由：

```
const router = [{
    path: '/home/:type/:id',
    name: 'Home',
    component: Home,
}]
```

当前页面的路径是 `http://xxx/detail/preview/21?sex=male`，平时我们写代码的时候或多或少的会写出这种代码，在组件里使用 `$route` 给组件传参数：

```
mounted() {
    if (this.$route.params.type === 'preview') {
        this.isPreview = true
    } else {
        this.isPreview = false
    }
    this.id = this.$route.params.id
    this.sex = this.$route.query.sex
}
```

这样子写本身没什么问题，就是会使得组件和路由高度耦合，让组件只能在含有特定 `URL` 的页面中使用，限制了组件的通用性。其实，我们可以通过 `props` 传参，来解耦路由参数，将上面的路由配置改成如下：

```
const router = [{
    path: '/home/:type/:id',
    name: 'Home',
    component: Home,
    props: (route) => ({
        type: route.params.type,
        id: route.params.id,
        sex: route.query.sex,
    })
}]
```

然后在组件 `props` 加上参数：

```
props: ['type', 'id', 'sex']
```

组件里使用参数的时候就不需要用 `this.$route`，而是可以直接 `this.type` 即可。这样一来，这个组件就可以在任何地方使用了。

### 深度作用选择器

当给 `style` 加上 `scoped`，页面渲染完成后会给 `html` 和 `css` 选择器加上哈希值用于表示唯一性：

```
<div class="home" data-v-fae5bece>
    <button data-v-fae5bece class="el-button el-button-primary">提交</button>
</div>
.home .el-button[data-v-fae5bece] {
    font-size: 20px;
}
```

对于在 `style` 中被加了 `scoped` 的组件，其样式将只能作用于组件内部，不会对其子组件造成影响。比如有这样一个组件：

```
// 父组件
<div class="home">
    <el-button type="primary">父按钮</button>
    <child></child>
</div>

<style lang="scss" scoped>
.home .el-button {
    font-size: 20px;
}
</style>
// 子组件
<div class="child">
    <el-button type="primary">子按钮</button>
</div>
```

当页面渲染出来后，会是如下结果：

```
<div class="home" data-v-fae5bece>
    <button data-v-fae5bece class="el-button el-button-primary">父按钮</button>
    <div class="child" data-v-fae5bece>
        <button class="el-button el-button-primary">子按钮</button>
    </div>
</div>
```

根据上面的 `html`，我们可以看到 `.home .el-button[data-v-fae5bece]`这个选择器作用不到子按钮这个 `button`。

在实际项目中，我们有时候需要让父组件的样式能作用到子组件，即使父组件的 `style` 上加了 `scoped`，那这个时候就需要用到深度作用选择器 `>>>`，比如在刚刚的例子上可以给父组件样式加上深度作用选择器。

> ❝
>
> 深度作用选择器会被 `Vue Loader` 处理，且只能在有预处理器的地方使用。由于某些预处理器比如 `Sass` 不能正确解析 `>>>`，所以我们可以使用它的别名：`/deep/` 或 `::v-deep` 来替代。
>
> ❞

```
<style lang="scss" scoped>
.home {
    /deep/ .el-button {
        font-size: 20px;
    }
}
</style>
```

加上深度作用选择器后，选择器会由原来的：

```
.home .el-button[data-v-fae5bece] {}
```

变成如下的：

```
.home[data-v-fae5bece] .el-button {}
```

