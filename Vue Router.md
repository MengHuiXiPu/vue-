## Vue Router 10 条高级技巧

Vue Router 是 Vue.js 官方的路由管理器。

它和 Vue.js 的核心深度集成，让构建单页面应用变得易如反掌。

包含的功能有：

- 嵌套的路由/视图表
- 模块化的、基于组件的路由配置
- 路由参数、查询、通配符
- 基于 Vue.js 过渡系统的视图过渡效果
- 细粒度的导航控制
- 带有自动激活的 CSS class 的链接
- HTML5 历史模式或 hash 模式，在 IE9 中自动降级
- 自定义的滚动条行为

本文是作者是实际项目中遇到的一些总结，主要包括：

1. `响应路由参数变化`
2. `路由匹配`
3. `高级匹配模式`
4. `匹配优先级`
5. `push和replace的第二个第三个参数`
6. `路由视图`
7. `重定向`
8. `使用props解耦$route`
9. `导航守卫`
10. `守卫的next方法`

希望本文对你有所帮助。

# 正文

## 1. 响应路由参数变化

针对复用组件（只是路由参数发生改变），生命周期函数钩子不会被调用，如何能刷新组件了？

- watch监听

```
watch: {
    '$route' (to, from) {
    // 对路由变化作出响应...
    }
}
```

- beforeRouteUpdate

```
beforeRouteUpdate (to, from, next) {
  // react to route changes...
/ / don't forget to call next()
}
```

## 2. 路由匹配

```
{
  // 会匹配所有路径
  path: '*'
}
{
  // 会匹配以 `/user-` 开头的任意路径
  path: '/user-*'
}
```

注意：当使用通配符路由时，请确保路由的顺序是正确的，也就是说含有通配符的路由应该放在最后。路由 { path: '*' } 通常用于客户端 404 错误。

如果你使用了History 模式，请确保正确配置你的服务器。

当使用一个通配符时，$route.params 内会自动添加一个名为 pathMatch 参数。

它包含了 URL 通过通配符被匹配的部分：

```
// 给出一个路由 { path: '/user-*' }
this.$router.push('/user-admin')
this.$route.params.pathMatch // 'admin'
// 给出一个路由 { path: '*' }
this.$router.push('/non-existing')
this.$route.params.pathMatch // '/non-existing'
```

## 3. 高级匹配模式

```
// 命名参数必须有"单个字符"[A-Za-z09]组成
 
// ?可选参数
{ path: '/optional-params/:foo?' }
// 路由跳转是可以设置或者不设置foo参数，可选
<router-link to="/optional-params">/optional-params</router-link>
<router-link to="/optional-params/foo">/optional-params/foo</router-link>
 
// 零个或多个参数
{ path: '/optional-params/*' }
<router-link to="/number">没有参数</router-link>
<router-link to="/number/foo000">一个参数</router-link>
<router-link to="/number/foo111/fff222">多个参数</router-link>
 
 
// 一个或多个参数
{ path: '/optional-params/:foo+' }
<router-link to="/number/foo">一个参数</router-link>
<router-link to="/number/foo/foo111/fff222">多个参数</router-link>
 
// 自定义匹配参数
// 可以为所有参数提供一个自定义的regexp，它将覆盖默认值（[^\/]+）
{ path: '/optional-params/:id(\\d+)' }
{ path: '/optional-params/(foo/)?bar' }
```

## 4. 匹配优先级

有时候一个路径可能匹配多个路由。

此时，匹配的优先级就是按照路由的定义顺序：先定义，优先级最高。

## 5. push和replace的第二个第三个参数

在 2.2.0+版本，可选的在 router.push 或 router.replace 中提供 onComplete 和 onAbort 回调作为第二个和第三个参数。

这些回调将会在导航成功完成 (在所有的异步钩子被解析之后) 或终止 (导航到相同的路由、或在当前导航完成之前导航到另一个不同的路由) 的时候进行相应的调用。在 3.1.0+，可以省略第二个和第三个参数，此时如果支持 Promise，router.push 或 router.replace 将返回一个 Promise。

接下来看几个例子来看看第二个第三个参数的调用时机：

#### 1. 组件1跳转组件2

```
// 组件1
this.$router.push({ name: 'number' }, () => {
  console.log('组件1：onComplete回调');
}, () => {
  console.log('组件1：onAbort回调');
});
// 组件2
beforeRouteEnter(to, from, next) {
  console.log('组件2：beforeRouteEnter');
  next();
},
beforeCreate() {
  console.log('组件2：beforeCreate');
},
created() {
  console.log('组件2：created');
}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

组件之间跳转触发onComplete回调。

#### 2. 组件2跳转组件2（不带参数）

```
this.$router.push({ name: 'number'}, () => {
  console.log('组件2：onComplete回调');
}, () => {
  console.log('组件2,自我跳转：onAbort回调');
});
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

组件自我跳转当不带参数时触发onAbort回调。但是当自我跳转带参数时可能情况就有点不一样。

#### 3. 组件2跳转组件2（带参数）

```
this.$router.push({ name: 'number', params: { foo: this.number}}, () => {
    console.log('组件2：onComplete回调');
}, () => {
    console.log('组件2,自我跳转：onAbort回调');
});
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

组件自我带参数跳转，onComplete回调、onAbort回调回调都不会触发。

## 6. 路由视图

有时候想同时 (同级) 展示多个视图，而不是嵌套展示，例如创建一个布局，有 sidebar (侧导航) 和 main (主内容) 两个视图，这个时候命名视图就派上用场了。

你可以在界面中拥有多个单独命名的视图，而不是只有一个单独的出口。

如果 router-view 没有设置名字，那么默认为 default。

```
<router-view class="view one"></router-view>
<router-view class="view two" name="a"></router-view>
<router-view class="view three" name="b"></router-view>
```

一个视图使用一个组件渲染，因此对于同个路由，多个视图就需要多个组件。

确保正确使用 components 配置 (带上 s)：

```
const router = new VueRouter({
routes: [
  {
    path: '/',
    components: {
        default: Foo,
        a: Bar,
        b: Baz
    }
    }
  ]
});
```

## 7. 重定向

```
{ path: '/a', redirect: '/b' }
{ path: '/a', redirect: { name: 'foo' }}
{ path: '/a', redirect: to => {
  // 方法接收 目标路由 作为参数
  // return 重定向的 字符串路径/路径对象
}}
```

注意：导航守卫并没有应用在跳转路由上，而仅仅应用在其目标上。

在上面这个例子中，为 /a 路由添加一个 beforeEach 或 beforeLeave 守卫并不会有任何效果。

## 8. 使用props解耦$route

在组件中使用 $route 会使之与其对应路由形成高度耦合，从而使组件只能在某些特定的 URL 上使用，限制了其灵活性。

```
// router文件
// 对于包含命名视图的路由，你必须分别为每个命名视图添加 `props` 选项：
{
  path: '/number/:name',
  props: true,
  // 对象模式 props: { newsletterPopup: false }
  // 函数模式 props: (route) => ({ query: route.parmas.name })
  name: 'number',
  component: () => import( /* webpackChunkName: "number" */ './views/Number.vue')
}
// 组件获取
export default{
  props: ['name']
}
```

## 9. 导航守卫

#### 1. 三种全局守卫

- router.beforeEach 全局前置守卫 进入路由之前。
- router.beforeResolve 全局解析守卫2.5.0新增。在beforeRouteEnter调用之后调用。
- router.afterEach 全局后置钩子 进入路由之后。

```
// 入口文件
import router from './router'
 
// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('beforeEach 全局前置守卫');
next();
});
// 全局解析守卫
router.beforeResolve((to, from, next) => {
  console.log('beforeResolve 全局解析守卫');
next();
});
// 全局后置守卫
router.afterEach((to, from) => {
  console.log('afterEach 全局后置守卫');
});
```

#### 2. 路由独享守卫

- beforeEnter全局前置守卫进入路由之前。

```
{
    path: '/number/:name',
    props: true,
    name: 'number',
    // 路由独享守卫
    beforeEnter: (to, from, next) => {
        console.log('beforeEnter 路由独享守卫');
        next();
    },
    component: () => import( /* webpackChunkName: "number" */ './views/Number.vue')
}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

#### 3. 组件内守卫

- beforeRouteEnter
- beforeRouteUpdate(2.2新增)
- beforeRouteLeave

```
beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
    console.log('beforeRouteEnter 组件内进入守卫');
    next();
},
beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
    console.log('beforeRouteUpdate 组件内更新守卫');
    next();
},
beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    console.log('beforeRouteLeave 组件内离开守卫');
    next();
}
```

- 组件1跳转到组件2，然后组件2跳转组件2本身![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)
- 组件1跳转到组件2，然后组件2跳转组件1![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

## 10. 守卫的 next 方法

next: 调用该方法 resolve 钩子。

- next(): 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。
- next(false): 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。
- next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。你可以向 next 传递任意位置对象，且允许设置诸如 replace: true、name: 'home' 之类的选项以及任何用在 router-link 的 to prop 或 router.push 中的选项。
- next(error): (2.4.0+) 如果传入 next 的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 router.onError() 注册过的回调。