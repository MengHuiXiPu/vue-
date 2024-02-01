# 通过自定义 Vue 指令实现前端曝光埋点

埋点就是网站分析的一种常用的数据采集方法。

埋点按照获取数据的方式一般可以分为以下 3 种：

- 页面埋点：统计用户进入或离开页面的各种维度信息，如页面浏览次数（PV）、浏览页面人数（UV）、页面停留时间、浏览器信息等。
- 点击埋点：统计用户在应用内的每一次点击事件，如新闻的浏览次数、文件下载的次数、推荐商品的命中次数等。
- 曝光埋点：统计具体区域是否被用户浏览到，如活动的引流入口的显示、投放广告的显示等。

政采云前端团队（ZooTeam）通过**浑仪系统**实现数据采集及数据可视化，分析量化的能力

浑仪系统的数据采集是基于**代码侵入式埋点方案**实现的，提供了自动发送和手动调用埋点信息上报接口发送两种方式实现埋点数据上报。其中**页面埋点**和**点击埋点**是使用自动上报的方式实现，在 DOM 节点挂载特殊属性，通过**埋点采集 JSSDK \**监听挂载了相应属性对应的事件，在事件触发时进行埋点数据上报。\*\*曝光\*\*埋点\**由于涉及到**有效曝光逻辑的判断，自动上报不能满足相应的需求，所以我们采用手动调用接口方式进行埋点数据上报。

### 有效曝光

先举个例子：

![图片](https://mmbiz.qpic.cn/mmbiz_png/vzEib9IRhZD7V00BhTkCC6UiafyZu4mYxwcjbXNSGUj41n9waFVleMMn7ibia6icqKGuwtPggSkicpVFQhCmxsL0ic6rQ/640?wx_fmt=png&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)

上图是某电商首页底部的推荐区域，为了衡量用户对推荐结果的感兴趣程度，需要计算推荐区域的点击率（点击次数/曝光次数）。为了保证点击率的准确性，我们必须确保用户真正的浏览到了这些商品，由于用户浏览商品的不确定性会发生相同商品的频繁曝光，我们还要避免重复的曝光行为。所以我们需要制定一套逻辑来规定何时进行曝光埋点的数据上报。比如：

1. 商品卡片必须完全的出现在浏览器可视化区域内。
2. 商品必须在可视化区域内停留 5s 以上。
3. 用户进入页面到离开页面相同的商品只进行一次曝光。

满足以上规定的曝光就是一次**有效曝光**。了解了有效曝光后，我们来看看曝光埋点实现最重要的一环，如何判断元素出现在页面的可视化区域内。

### 判断元素出现在页面的可视化区域内

我们首先想到商品曝光类似于图片懒加载的形式，通过监听 scroll 事件，调用 Element.getBoundingClientRect() 方法以获取相关元素的边界信息，然后判断元素是否出现在页面的可视化区域内。由于 scroll 事件频发触发，计算量很大，所以很容易造成性能问题，虽然我们可以采用防抖节流等方式去解决。

目前有一个新的 IntersectionObserver API，提供了一种异步检测目标元素与祖先元素或 viewport（**可视窗口**）相交情况变化的方法。可以自动"观察"元素是否可见。

### IntersectionObserver基本用法

```
let options = {
    root: document.querySelector('#scrollArea'),
    rootMargin: '0px',
    threshold: 1.0
}
let callback =(entries, observer) => {
  entries.forEach(entry => {});
};
let observer = new IntersectionObserver(callback, options);
```

IntersectionObserver 是浏览器原生提供的构造函数，接受两个参数：`callback` 是可见性变化时的回调函数，`option` 是配置对象（该参数可选），返回一个 `observer` 实例。我们可以看到，创建一个 IntersectionObserver 对象，接受两个参数：callback 可见性变化时的回调函数，该回调函数将会在**目标（target）元素和根（root）\**元素的交集大小超过\**阈值（threshold**）规定的大小时候被执行。

options 是配置对象，它有以下字段：

- root：指定根 (**root**) 元素，用于检查目标的可见性。必须是目标元素的父级元素。如果未指定或者为 `null`，则默认为浏览器视窗。
- rootMargin：根 (**root**) 元素的外边距。类似于 CSS 中的 margin 属性。默认值为 0。
- threshold：target 元素和 root 元素相交程度达到该值的时候 `callback` 函数将会被执行，可以是单一的Number 也可以是 Number 数组，当为数组时每达到该值都会执行 `callback` 函数。

我们通过实例的方法可以指定观察哪个 DOM 节点。实例的方法有：

- IntersectionObserver.observe()：使 IntersectionObserver 开始监听一个目标元素。
- IntersectionObserver.disconnect()：使 IntersectionObserver 对象停止监听工作。
- IntersectionObserver.takeRecords()：返回所有观察目标的 IntersectionObserverEntry 对象数组。
- IntersectionObserver.unobserve()：使 IntersectionObserver 停止监听特定目标元素。

**IntersectionObserverEntry** 对象提供目标元素的信息，一共有七个属性：

- IntersectionObserverEntry.target ：需要观察的目标元素，是一个 DOM 节点对象 。
- IntersectionObserverEntry.boundingClientRect：返回包含目标元素的边界信息。边界的计算方式与 `Element.getBoundingClientRect()` 相同。
- IntersectionObserverEntry.intersectionRect ：用来描述根和目标元素的相交区域的信息。
- IntersectionObserverEntry.intersectionRatio：返回 `intersectionRect` 与 `boundingClientRect` 的比例值，0 为完全不可见，1 为完全可见。
- IntersectionObserverEntry.isIntersecting：返回一个布尔值, 如果根与目标元素相交（即从不可视状态变为可视状态），则返回 `true`。如果返回 `false`，变换是从可视状态到不可视状态。
- IntersectionObserverEntry.rootBounds ：根元素的区域的信息。
- IntersectionObserverEntry.time：可见性状态发生改变时间的时间戳，单位为毫秒。

目标元素的可见性变化时，就会调用观察器的回调函数 `callback`。`callback`函数的参数 `entries` 是一个数组，每个成员都是一个 IntersectionObserverEntry 对象，`observer` 是被调用的 IntersectionObserver 实例。`callback` 函数一般会被调用两次，一次是目标元素进入可视化区域，另一次是离开可视化区域。配置 `options.threshold` 会影响 `callback` 函数的调用次数。

我们再来看看 Intersection Observer API 的浏览器兼容情况

![图片](https://mmbiz.qpic.cn/mmbiz_png/vzEib9IRhZD7V00BhTkCC6UiafyZu4mYxwribF0vicMHbbmXm291wpcrooVjXdNkAvCgXy0AA0ssMVtAKxBY4boibvA/640?wx_fmt=png&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)

我们看到是存在兼容性问题的，好在已经有了兼容的 polyfill (https://github.com/w3c/IntersectionObserver/tree/master/polyfill)。当前浏览器不支持 Intersection Observer API 时，使用 `Element.getBoundingClientRect()` 去实现 Intersection Observer API。

### 具体实现

了解了 Intersection Observer 的基本用法了以后，下面我们来实现前端的曝光埋点。因为业务是基于 Vue 实现的，所以我们通过自定义 Vue 指令实现前端的曝光埋点。

首先我们自定义一个 visually 指令，当指令第一次绑定在元素上时使用 IntersectionObserver 监听目标元素，当指令从元素上解绑时停止监听目标元素。

```
const options = {
    root: null, //默认浏览器视窗
    threshold: 1 //元素完全出现在浏览器视窗内才执行callback函数。
}
const callback =(entries, observer) => {
  entries.forEach(entry => {});
};
const observer = new IntersectionObserver(callback, options);
const addListenner = (ele, binding) => {
 observer.observe(ele);
};
const removeListener = (ele) => {
  observer.unobserve(ele);
};
//自定义曝光指令
Vue.directive('visually', {
  bind: addListenner,
  unbind: removeListener,
});
```

我们需要一个 List 将已经上报过的埋点信息记录下来，防止重复曝光。

```
let visuallyList = []; //记录已经上报过的埋点信息
const addListenner = (ele, binding) => {
 if(visuallyList.indexOf(binding.value) !== -1) return;
 
 observer.observe(ele);
};
```

我们将要上报的信息绑定在目标元素的 'visually-data' 属性中，当目标元素出现在视窗内时，并停留 5 秒以上时，我们上报埋点信息。

```
let timer = {}; //增加定时器对象
const callback = entries => {
  entries.forEach(entry => {
    let visuallyData = null;
    try {
      visuallyData = JSON.parse(entry.target.getAttribute('visually-data'));
    } catch (e) {
      visuallyData = null;
      console.error('埋点数据格式异常', e);
    }
    //没有埋点数据取消上报
    if (!visuallyData) {
      observer.unobserve(entry.target);
      return;
    }
    
    if (entry.isIntersecting) {
      timer[visuallyData.id] = setTimeout(function() {
        //上报埋点信息
        sendUtm(visuallyData).then(res => {
          if (res.success) {
            //上报成功后取消监听
            observer.unobserve(entry.target);
            visuallyList.push(visuallyData.id);
            timer[visuallyData.id] = null;
          }
        });
      }, 5000);
  } else {
    if (timer[visuallyData.id]) {
      clearTimeout(timer[visuallyData.id]);
      timer[visuallyData.id] = null;
    }
  }
  });
};
```

最后我们引入 polyfill 实现 IE 的兼容，封装一个全局指令。

```
require('intersection-observer');
export default Vue => {
 ...
  //自定义曝光指令
  Vue.directive('visually', {
    bind: addListenner,
    unbind: removeListener,
  });
};
```

我们通过 Vue.use() 引入组件后，就可以在业务代码中直接通过指令实现曝光埋点。曝光数据 visuallyData 中必须要有一个唯一 ID。

```
<div v-visually="visuallyData.id" :visually-data="JSON.stringify(visuallyData)" class="browse"></div>
```

### 总结

埋点是数据分析的基础，埋点数据统计的准确性对后续的数据分析非常重要，所以我们在统计曝光埋点的时候一定要基于适用场景优先制定曝光埋点的规则。本文只是针对前端曝光埋点的实现方案，如有问题处，请大佬们多多交流。