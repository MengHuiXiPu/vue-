有时候我们需要在子组件上监听一些事件，但是不论你怎么点它都没反应，为什么呢？
<template>

<div>

<Child @click='test'/>
</div>

</template>
因为这么些vue会认为，你自定义了一个click事件，要通过子组件的$emit('click')才能出发。如果我们需要在父组件上就触发呢。那就需要用到native修饰符
<Child @click.native='test'/>