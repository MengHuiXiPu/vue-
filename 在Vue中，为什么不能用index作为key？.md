# 在Vue中，为什么不能用index作为key？

结论1，使用index作为key,会导致diff中的优化失效（降低了复用性，违背了虚拟DOM的初衷），原本可以复用的东西不能被复用，增加了性能开销，

2.使用index作为key,在删除数据的时候，因为vue不会深入的对比子组件的文本内容，会错误移除VDOM中的节点，（index的值是不固定的）

##### 一、key的作用是什么？

key的作用众所周知，看一个demo就知道：

```
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<body>
    <ul id="app">
        <li v-for="(item,index) in list" :key="index">{{item}}</li>
    </ul>

    <script>
        new Vue({
            el: '#app',
            data() {
                return {
                    list: [1, 2, 3]
                }
            }
        })
    </script>
</body> 
复制代码
```

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRibsFMJY5BMib6jc5bLHxCEdOy799ktxVQJo15du5oMzjvk8mpSYibAI2g/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)image-20220924222650595.png

在vue中key可以没有，没有也可以运行并且不会报错，但是建议加上key。

另外，我们必须知道，vue中key运用的地方------配合v-for使用。**key是vue中虚拟dom标记的唯一标识，通过这个key，diff算法能更加准确和快捷。不使用key的情况下，因为vue的就地更新会选择复用节点，之前的状态被保存，可能会产生一系列的bug**。另外，key的唯一性可以被map数据结构充分利用，时间复杂度仅为o（1）。

简单来说，key是唯一标识，为了让diff算法更准确的找到需要被对比的两个节点。

##### 二、什么是虚拟DOM？

虚拟DOM结构就是一个对象而已，其中描述了每一层容器的特征。在beroreCreated执行的时候，DOM树并没有生成。

虚拟DOM光说肯定是不可理解的，那我们就用代码说话：

```
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<body>
        <div id="app">
            <ul>
                <item v-for="(num,index) in list" :key="index":num="num":class=`item${num}`></item>
            </ul>
            <button @click="change">change</button>
        </div>

        <script>
            new Vue({
                el: '#app',
                data() {
                    return {
                        list: [1, 2, 3]
                    }
                },
                methods: {
                    change() {
                        this.list.reverse()
                    }
                },
                //也可以使用原生JS添加DOM结构，不考虑性能的时候
                components: {
                    item: {
                        props: ['num'],
                        template: `<div>{{num}}</div>`,
                        name: 'child'
                    }
                }
            })
            
            
            // let ul = document.getElementById('app');
            // for (let i = 1; i <= 3; i++) {
            //  let li = document.createElement('li');
            //  li.innerHTML = i;
            //  ul.appendChild(li);
            // }
        </script>
    </body>
复制代码
```

*先生成虚拟DOM结构，而不是编译：*

```
vnode = {
    tag: 'ul',
    children: [
        {
            tag: 'li',
                children: [{
                    vnode: {
                        text: '1'
                    }
                }]
        },
        {
            tag: 'li',
                children: [{
                    vnode: {
                        text: '2'
                    }
                }]
        },
        {
            tag: 'li',
                children: [{
                    vnode: {
                        text: '3'
                    }
                }]
        },
    ]
}
复制代码
```

*再将html编写成真实的DOM结构：*

```
再编译成真实DOM结构
    <li>1</li>
    <li>2</li>
    <li>3</li>
复制代码
```

`虚拟DOM存在的意义就是，减少真实DOM结构的操作，对于浏览器来说，减少开销，提高性能`。

##### 三、什么是diff算法?

只要数据源发生变化，就一定会触发watcher观察者函数（Object。defineProperty（））的回调函数，去驱动视图更新，(加_是为了表明这是vue自带的方法)

> 回调：
>
> ```
> vm._update(vm._render()),
>  _render会生成vnode
>  _update会拿着vnoe去__patch__去查找不同
>  __patch__中启动的就是diff算法
> 复制代码
> ```

```
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<body>
    <div id="app">
        <ul>
            <item v-for="(item,index) in list" :key="item.id" :num="item.num" :class=`item${item.num}`></item>
    </ul>
    <button @click="change">change</button>
</div >
    <script>
        new Vue({
            el: '#app',
        data() {
            return {
            list: [1, 2, 3]
        },
        methods: {
            change() {
            this.list.reverse()
        }
        },
        components: {
            item: {
            props: ['num'],
        template: `<div>{{ num }}</div>`,
        name: 'child'
            }
        }
    })
    </script>
</body >
复制代码
```

当点击按钮change以后，list反转变为：list:[3,2,1]，diff算法会根据DOM树，从上到下，从左到右判断值是否更新。问题是，为什么diff就知道谁跟谁去进行比对呢？这就是key的作用了，key是唯一标识符，diff算法会根据key去比对。

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRdaHQGtdoA9WDJDN2qFbmpevqbtRYbBcBV7ASic7KiabxzkiaxYaOHh8Fw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)image-20220924231614758.png

##### 四、为什么不能用index作为key？

基于前三者的知识基础，我们才能更好地理解，为什么不能用index作为key？这里将通过三个demo来展示：

###### （1）index不能作为key--情景一

demo1：

```
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <body>
        <div id="app">
            <ul>
                <item v-for="(num,index) in list" :key="index" :num="num" :class=`item${num}`></item>
            </ul>
            <button @click="change">change</button>
        </div>
        <script>
            new Vue({
                el: '#app',
                data() {
                    return {
                        list: [1, 2, 3]
                    }
                },
                methods: {
                    change() {
                        this.list.reverse()
                    }
                },
                components: {
                    item: {
                        props: ['num'],
                        template: `<div>{{num}}</div>`,
                        name: 'child'
                    }
                }
            })
            
        </script>
    </body>
复制代码
```

demo2：

```
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<body>
    <div id="app">
        <ul>
            <item v-for="(item,index) in list" :key="item.id" :num="item.num" :class=`item${item.num}`></item>
        </ul>
        <button @click="change">change</button>
    </div>
    <script>
        new Vue({
            el: '#app',
            data() {
                return {
                    list: [{
                        id: 0,
                        num: 1
                    }, {
                        id: 1,
                        num: 2
                    }, {
                        id: 2,
                        num: 3
                    }]
                }
            },
            methods: {
                change() {
                    this.list.reverse()
                }
            },
            components: {
                item: {
                    props: ['num'],
                    template: `<div>{{num}}</div>`,
                    name: 'child'
                }
            }
        })
    </script>
</body>
复制代码
```

demo1与demo2的区别在于，key值不一样，demo1是index作为key，而demo2是list中的id作为key。需要注意的是，当我们点击change按钮以后，注意观察代码是如何变化的：

demo1点击前后变化：

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRTsJAhpe8FG4pqsicap3wU9mkyDotQyulSNuJo6IHWNbZqpoiaPAYGfGA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRLCwO2fRKxGy5gYCLiaFAfTQ4icJNxuLZFo18RHicg0iccnIBHAzF80UFxA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

demo2点击前后变化：

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRMZdegd5G04L3GXyX2icBg7ibBrLmb8ibnuDiaKfIOXdd4HRSoRjR4Dciacg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRL6Und2r1OpVrGDYqkkMx5BFjM8HuEptlqbuGyru17MhIJCBUlIicwUg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

表面上，demo1只是调换了item1和item3的位置，点击后也是就改变了item1和item3；而demo2三个都改变了。这时有人就会觉得使用index作为key改动DOM结构还更小，岂不是更好？

实际上，眼见不一定为实。我们看看真实的样子：

demo1的改变前后对比：

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRfvFdniaH3RoZibBHibdhGSN3aOS3OrVWPtDsMQRypjDEWwCTdptosAeEw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)image-20220924233734875.png

demo2改变前后对比：

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRicv398UBrp4vILFrGbVqR5ibiccG0LdQhChH78iaSswmI8quTVqlmMSyvg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)image-20220924234018713.png

是不是震惊了！！！_demo2的list实际上的key和num一一对应着，并没有改变_，只是顺序不一样了。而demo1还改变了两个值。所以，这就是不能使用index作为key的原因之一了。

> 使用index作为key，会导致diff中的优化失效（降低了复用性，违背了虚拟DOM的初衷）。原本可以复用的东西，不能被复用，徒然增加了性能开销，浪费性能

###### （2）index不能作为key---情景二

接下来看看demo3，demo3将会淋漓尽致的展现index作为key的bug：

```
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <body>
        <div id="app">
            <ul>
                <item v-for="(item,index) in student" :key="index"></item>
                //<item v-for="(item,index) in list" :key="item.id"></item>
            </ul>
            
            <button @click="change">change</button>
        </div>
        <script>
            new Vue({
                el: '#app',
                data() {
                    return {
                        list: [{
                            id: 0,
                            num: 1
                        }, {
                            id: 1,
                            num: 2
                        }, {
                            id: 2,
                            num: 3
                        }],
                        student: [1, 2, 3]
                    }
                },
                methods: {
                    //删除数据
                    change() {
                        this.student.splice(0, 1)
                        //this.list.splice(0, 1)
                    }
                },
                components: {
                    item: {
                        template: `<div>{{Math.random()}}</div>`,
                    }
                }
            })
        </script>
    </body>
复制代码
```

当删除的时候，又会发生什么意想不到事情呢？

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRGiczS8lk8nd4HoxB7iaC0O4mcaibL04mWx3H6htKx8EWOYwp4I3JoTuow/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRfE30VPwfXbXkyKfTiaiczYWxnrr72grhAwYvKQUqzeYFu9b74z1zB6eA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

右图是删除之后的结果，惊讶的发现，我们_删除的明明是第一个数据，而页面展示是删除了第三个数据_。小小的脑袋真的会有大大的疑问。但是通过虚拟DOM，你就会恍然大悟了。

**当用index作为key时，因为diff算法会就地更新，会复用key:0的这个节点，比对的时候，key:0的节点存在，则比对key:1，也存在，而多出了key:2,则会将其删除。**

![图片](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq2mFYEc2kKuKic6OraWTibeRKgAKuBmcfuheNlUyQP7UiaRMiaU2w5fHlSL6FryLmFRI9DLmf3r0qw1Q/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)image-20220925121112842.png

> 使用index作为key时，在删除数据时，因为vue不会深入地区对比子组件的文本内容，所以会错误移除VDOM中的节点（index的值是不固定的）。

这个例子，文本内容使用的是随机数，所以数据对不上不必太在意。另外，既然index的值不固定，不能作为key，那么扩展一下，可不可以使用随机数作为key呢？答案自然是不能够。因为key值无论是删除还是反转，根本就不能找到相同的key，diff算法就毫无意义了，压根没有复用性可言。

在这个demo3里，数据源放了list这个数据，可言尝试循环它，来对比index作为key的结果，将会更加