#  Vue 组件

## 注册组件

⭐️无论是全局注册和局部注册，都是提供一个组件名和一个组件配置对象

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQyL45xTE6m0FUy6mMPYDAUxLmVIaibZ6aTo8iawou8glNGG4LagJHkSeequ7gmCG8o2AvCUWrqQRsw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)1 注册组件.png

## 组件Props

⭐️组件的配置选项props作用是实现父子通信，而且它本质是proxy

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQyL45xTE6m0FUy6mMPYDAULd4zrQbMrGibLSSdasAYAHvibmwBO6mtXe1tfAWESe4ricq1Knz81E87w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)2组件Props.png

## 非属性特性

⭐️非属性的特性指的是：组件中没有定义在`props`或`emits`选项中的特性，这些特性会有继承的特点

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQyL45xTE6m0FUy6mMPYDAUbRIXkO4VFq0GZhic4I0ZxiaE5lhzJPubxMDrUrxV4Yp0Zq2nDqspHbyQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)3非属性特性.png

## 自定义事件

⭐️利用`props`可以实现父子通信，通过自定义事件我们可以实现子父通信，在子组件中通过`$emit()`派发事件并传递参数，在父级组件通过监听事件

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQyL45xTE6m0FUy6mMPYDAUeWNaYycjkJGYFTNv4pwClks2EWvQ6Dibo922QaA19nxRJk9rSgUQWPQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)4自定义事件.png

## 插槽slot

⭐️插槽是一种内容分发技术，可以在组件模板中使用`<slot>`占位

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQyL45xTE6m0FUy6mMPYDAUadAg8Gx3OghGHek4rIicia1fSWorcPeDbZ6n4f0o4daWx9pSetTVUZsQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)5插槽slot.png

## 依赖注入：Provide和Inject

⭐️作用是更方便的实现跨层级传参；用法是在祖辈上`Provide`，在后代上`Inject`

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQyL45xTE6m0FUy6mMPYDAULeb0MQqAepe7oxtnQGgNwR7aDIpCsUKJPMudpuSGic0IUYF3vDuqicfw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)6依赖注入：Provide和Inject.png

## 动态组件和异步组件

⭐️动态组件其实时通过`<component>`元素实现，通过它的`is`属性切换不同的组件；而异步组件的注册跟正常注册的注册类似，只是它是通过`defineAsyncComponent`方法定义一个异步组件配置

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQyL45xTE6m0FUy6mMPYDAUibw1ntnYnWpB9M8jrYibQzJP8BNKqHAseVRNZTaFD9j7NSzJiaSS3hAtw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)7动态组件和异步组件.png

