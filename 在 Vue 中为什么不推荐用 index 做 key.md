# 在 Vue 中为什么不推荐用 index 做 key

前端开发中，只要涉及到列表渲染，那么无论是 React 还是 Vue 框架，都会提示或要求每个列表项使用唯一的 key，那很多开发者就会直接使用数组的 index 作为 key 的值，而并不知道 key 的原理。那么这篇文章就会讲解 key 的作用以及为什么最好不要使用 index 作为 key 的属性值。

# key 的作用

Vue 中使用虚拟 dom 且根据 diff 算法进行新旧 DOM 对比，从而更新真实 dom ，key 是虚拟 DOM 对象的唯一标识, 在 diff 算法中 key 起着极其重要的作用。

## key 在 diff 算法中的角色

其实在 React，Vue 中 diff 算法大致是差不多，但是 diff 比对方式还是有较大差异的，甚至每个版本 diff 都大有不同。下面我们就以 Vue3.0 diff 算法为切入点，剖析 key 在 diff 算法中的作用

具体 diff 流程如下

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

Vue3.0 中 在 patchChildren 方法中有这么一段源码

```
if (patchFlag > 0) {
      if (patchFlag & PatchFlags.KEYED_FRAGMENT) { 
         /* 对于存在 key 的情况用于 diff 算法 */
        patchKeyedChildren(
         ...
        )
        return
      } else if (patchFlag & PatchFlags.UNKEYED_FRAGMENT) {
         /* 对于不存在 key 的情况,直接 patch  */
        patchUnkeyedChildren( 
          ...
        )
        return
      }
    }
```

patchChildren 根据是否存在 key 进行真正的 diff 或者直接 patch。对于 key 不存在的情况我们就不做深入研究了。

我们先来看看一些声明的变量。

```
/*  c1 老的 vnode c2 新的vnode  */
let i = 0              /* 记录索引 */
const l2 = c2.length   /* 新 vnode的数量 */
let e1 = c1.length - 1 /* 老 vnode 最后一个节点的索引 */
let e2 = l2 - 1        /* 新节点最后一个节点的索引 */
```

### 同步头部节点

第一步的事情就是从头开始寻找相同的 vnode，然后进行 patch，如果发现不是相同的节点，那么立即跳出循环。

```
//(a b) c
//(a b) d e
/* 从头对比找到有相同的节点 patch ，发现不同，立即跳出*/
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = (c2[i] = optimized
        ? cloneIfMounted(c2[i] as VNode)
        : normalizeVNode(c2[i]))
        /* 判断 key ，type 是否相等 */
      if (isSameVNodeType(n1, n2)) {
        patch(
          ...
        )
      } else {
        break
      }
      i++
    }
```

流程如下：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

isSameVNodeType 作用就是判断当前 vnode 类型 和 vnode 的 key 是否相等

```
export function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  return n1.type === n2.type && n1.key === n2.key
}
```

其实看到这，已经知道 key 在 diff 算法的作用，就是用来判断是否是同一个节点。

### 同步尾部节点

第二步从尾开始同前 diff

```
//a (b c)
//d e (b c)
/* 如果第一步没有 patch 完，立即，从后往前开始 patch  如果发现不同立即跳出循环 */
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = (c2[e2] = optimized
        ? cloneIfMounted(c2[e2] as VNode)
        : normalizeVNode(c2[e2]))
      if (isSameVNodeType(n1, n2)) {
        patch(
         ...
        )
      } else {
        break
      }
      e1--
      e2--
    }
```

经历第一步操作之后，如果发现没有 patch 完，那么立即进行第二步，从尾部开始遍历依次向前 diff。如果发现不是相同的节点，那么立即跳出循环。流程如下：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

### 添加新的节点

第三步如果老节点是否全部 patch，新节点没有被 patch 完，创建新的 vnode

```
//(a b)
//(a b) c
//i = 2, e1 = 1, e2 = 2
//(a b)
//c (a b)
//i = 0, e1 = -1, e2 = 0
/* 如果新的节点大于老的节点数 ，对于剩下的节点全部以新的 vnode 处理（这种情况说明已经 patch 完相同的 vnode ） */
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor
        while (i <= e2) {
          patch( /* 创建新的节点*/
            ...
          )
          i++
        }
      }
    }
```

流程如下：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

### 删除多余节点

第四步如果新节点全部被 patch，老节点有剩余，那么卸载所有老节点

```
//i > e2
//(a b) c
//(a b)
//i = 2, e1 = 2, e2 = 1
//a (b c)
//(b c)
//i = 0, e1 = 0, e2 = -1
else if (i > e2) {
   while (i <= e1) {
      unmount(c1[i], parentComponent, parentSuspense, true)
      i++
   }
}
```

流程如下：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

### 最长递增子序列

到了这一步，比较核心的场景还没有出现，如果运气好，可能到这里就结束了，那我们也不能全靠运气。剩下的一个场景是新老节点都还有多个子节点存在的情况。那接下来看看，Vue3 是怎么做的。为了结合 move、新增和卸载的操作

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

每次在对元素进行移动的时候，我们可以发现一个规律，如果想要移动的次数最少，就意味着需要有一部分元素是稳定不动的，那么究竟能够保持稳定不动的元素有一些什么规律呢？

可以看一下上面这个例子：c  h  d  e  VS  d  e  i  c，在比对的时候，凭着肉眼可以看出只需要将 c 进行移动到最后，然后卸载 h，新增 i 就好了。d  e 可以保持不动，可以发现 d  e 在新老节点中的顺序都是不变的，d 在 e 的后面，下标处于递增状态。

```
这里引入一个概念，叫最长递增子序列。
官方解释：在一个给定的数组中，找到一组递增的数值，并且长度尽可能的大。
有点比较难理解，那来看具体例子：

const arr = [10, 9, 2, 5, 3, 7, 101, 18]
=> [2, 3, 7, 18]
这一列数组就是arr的最长递增子序列，其实[2, 3, 7, 101]也是。
所以最长递增子序列符合三个要求：
1、子序列内的数值是递增的
2、子序列内数值的下标在原数组中是递增的
3、这个子序列是能够找到的最长的
但是我们一般会找到数值较小的那一组数列，因为他们可以增长的空间会更多。
```

那接下来的思路是：如果能找到老节点在新节点序列中顺序不变的节点们，就知道，哪一些节点不需要移动，然后只需要把不在这里的节点插入进来就可以了。**因为最后要呈现出来的顺序是新节点的顺序，移动是只要老节点移动，所以只要老节点保持最长顺序不变，通过移动个别节点，就能够跟它保持一致。** 所以在此之前，先把所有节点都找到，再找对应的序列。最后其实要得到的则是这一个数组：[2, 3, 新增 , 0]。其实这就是 diff 移动的思路了

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

# 为什么不要用 index

### 性能消耗

使用 index 做 key，破坏顺序操作的时候， 因为每一个节点都找不到对应的 key，导致部分节点不能复用,所有的新 vnode 都需要重新创建。

例子：

```
<template>
  <div class="hello">
    <ul>
      <li v-for="(item,index) in studentList" :key="index">{{item.name}}</li>
      <br>
      <button @click="addStudent">添加一条数据</button>
    </ul>

  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      studentList: [
        { id: 1, name: '张三', age: 18 },
        { id: 2, name: '李四', age: 19 },
      ],
    };
  },
  methods:{
    addStudent(){
      const studentObj = { id: 3, name: '王五', age: 20 };
      this.studentList=[studentObj,...this.studentList]
    }
  }
}
</script>
```

我们先把 Chorme 调试器打开，我们双击把里面文本修改一下

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

我们运行以上上面的代码，看下运行结果

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

从上面运行结果可以看出来，我们只是添加了一条数据，但是三条数据都需要重新渲染是不是很惊奇，我明明只是插入了一条数据，怎么三条数据都要重新渲染？而我想要的只是新增的那一条数据新渲染出来就行了。

上面我们也讲过 diff 比较方式,下面根据 diff 比较绘制一张图，看看具体是怎么比较的吧

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

当我们在前面加了一条数据时 index 顺序就会被打断，导致新节点 key 全部都改变了，所以导致我们页面上的数据都被重新渲染了。

下面我们下面生成 1000 个 DOM 来比较一下采用 index ，和不采用 index 性能比较，为了保证 key 的唯一性我们采用 uuid 作为 key

我们用 index 做为 key 先执行一遍

```
<template>
  <div class="hello">
    <ul>
      <button @click="addStudent">添加一条数据</button>
      <br>
      <li v-for="(item,index) in studentList" :key="index">{{item.id}}</li>
    </ul>
  </div>
</template>

<script>
import uuidv1 from 'uuid/v1'
export default {
  name: 'HelloWorld',
  data() {
    return {
      studentList: [{id:uuidv1()}],
    };
  },
  created(){
    for (let i = 0; i < 1000; i++) {
      this.studentList.push({
        id: uuidv1(),
      });
    }
  },
  beforeUpdate(){
    console.time('for');
  },
  updated(){
    console.timeEnd('for')//for: 75.259033203125 ms
  },
  methods:{
    addStudent(){
      const studentObj = { id: uuidv1() };
      this.studentList=[studentObj,...this.studentList]
    }
  }
}
</script>
```

换成 id 作为 key

```
<template>
  <div class="hello">
    <ul>
      <button @click="addStudent">添加一条数据</button>
      <br>
      <li v-for="(item,index) in studentList" :key="item.id">{{item.id}}</li>
    </ul>
  </div>
</template>
  beforeUpdate(){
    console.time('for');
  },
  updated(){
    console.timeEnd('for')//for: 42.200927734375 ms
  },
```

从上面比较可以看出，用唯一值作为 key 可以节约开销

### 数据错位

上述例子可能觉得用 index 做 key 只是影响页面加载的效率，认为少量的数据影响不大，那下面这种情况，用 index 就可能出现一些意想不到的问题了，还是上面的场景，这时我先再每个文本内容后面加一个 input 输入框，并且手动在输入框内填写一些内容，然后通过 button 向前追加一位同学看看

```
<template>
  <div class="hello">
    <ul>
      <li v-for="(item,index) in studentList" :key="index">{{item.name}}<input /></li>
      <br>
      <button @click="addStudent">添加一条数据</button>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      studentList: [
        { id: 1, name: '张三', age: 18 },
        { id: 2, name: '李四', age: 19 },
      ],
    };
  },
  methods:{
    addStudent(){
      const studentObj = { id: 3, name: '王五', age: 20 };
      this.studentList=[studentObj,...this.studentList]
    }
  }
}
</script>
```

我们往 input 里面输入一些值，添加一位同学看下效果：![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

这时候我们就会发现，在添加之前输入的数据错位了。添加之后王五的输入框残留着张三的信息，这很显然不是我们想要的结果。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

从上面比对可以看出来这时因为采用 index 作为 key 时，当在比较时，发现虽然文本值变了，但是当继续向下比较时发现 Input DOM 节点还是和原来一摸一样，就复用了，但是没想到 input 输入框残留输入的值，这时候就会出现输入的值出现错位的情况

# 解决方案

既然知道用 index 在某些情况下带来很不好的影响，那平时我们在开发当中怎么去解决这种情况呢？其实只要保证 key 唯一不变就行，一般在开发中用的比较多就是下面三种情况。

1. 在开发中最好每条数据使用唯一标识固定的数据作为 key，比如后台返回的 ID，手机号，身份证号等唯一值
2. 可以采用 Symbol 作为 key，Symbol 是 ES6 引入了一种新的原始数据类型 Symbol ，表示独一无二的值，最大的用法是用来定义对象的唯一属性名。

```
let a=Symbol('测试')
let b=Symbol('测试')
console.log(a===b)//false
```

1. 可以采用 uuid 作为 key ，uuid 是 Universally Unique Identifier 的缩写，它是在一定的范围内（从特定的名字空间到全球）唯一的机器生成的标识符

我们采用上面第一种方案作为 key 再看一下上面情况，如图所示。key 相同的节点都做到了复用。起到了diff 算法的真正作用。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

# 总结

- **用 index 作为 key 时，在对数据进行，逆序添加，逆序删除等破坏顺序的操作时，会产生没必要的真实 DOM更新，从而导致效率低**
- **用 index 作为 key 时，如果结构中包含输入类的 DOM，会产生错误的 DOM 更新**
- **在开发中最好每条数据使用唯一标识固定的数据作为 key，比如后台返回的 ID，手机号，身份证号等唯一值**
- **如果不存在对数据逆序添加，逆序删除等破坏顺序的操作时，仅用于渲染展示用时，使用 index 作为 key 也是可以的（但是还是不建议使用，养成良好开发习惯）。**

