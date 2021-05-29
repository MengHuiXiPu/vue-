
const router=new VueRouter({
    routes:{
        {
            path:'/',
            name:'Home',
            component:()=>import('/home')
        },
        {
            path:'about',
            name:'About',
            component:()=>import('./About')
        }
    }
})