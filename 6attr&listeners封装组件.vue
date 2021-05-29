attr 和listener可用于一些组件库的二次封装
一个是继承属性  一个是继承事件

   v-bind="$attrs"
   v-on="$listeners">
   <template v-for="item in column">
    <el-table-column v-bind="item" />
   </template>
</el-table>
<script>
export default {
  props:{
      column:{
        type:Array,
        required:true
      }
   }
}
<script>