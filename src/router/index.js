import Vue from 'vue'
import Router from 'vue-router'
import Login from "../views/login/Login"
import Home from "../views/home/Home"
import Welcome from "../views/welcome/Welcome"
import Users from "../views/users/Users"
import Rights from "../views/rights/Rights"
import Roles from "../views/roles/Roles"
import GoodsCate from "../views/goodscate/GoodsCate"
import GoodsParams from "../views/goodsparams/GoodsParams"
import GoodsList from "../views/goodslist/GoodsList"
import GoodsAdd from "../views/goodsadd/GoodsAdd"
import Order from "../views/order/Order"

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: GoodsCate
        },
        {
          path: '/params',
          component: GoodsParams
        },
        {
          path: '/goods',
          component: GoodsList
        },
        {
          path: '/goods/add',
          component: GoodsAdd
        },
        {
          path: '/orders',
          component: Order
        }
        
      ]
    },

  ],
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //如果是登录页那么直接放行
  if(to.path === '/login'){
    next()
  }
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) {
    //如果token不存在则跳到登录页
    next('/login')
  } else {
    //否则放行
    next()
  }
})

export default router