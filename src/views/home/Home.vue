<template>
  <div>
    <el-container class="home-container">
      <!--头部区域-->
      <el-header>
        <div class="header-left">
          <img src="../../assets/img/logo.png" alt="">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="loginout">退出</el-button>
      </el-header>
      <!--主体区域-->
      <el-container>
        <!--左侧侧边栏-->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!--侧边栏菜单区域-->
          <el-menu 
            background-color="#333744" 
            text-color="#fff" 
            active-text-color="#409eff" 
            unique-opened 
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            :default-active="$route.path">
            <!--一级菜单-->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
              <!--一级菜单的模板区域-->
              <template slot="title">
                <!--图标-->
                <i :class="iconsObj[item.id]"></i>
                <!--文本-->
                <span>{{item.authName}}</span>
              </template>
              <!--二级菜单-->
              <el-menu-item 
              :index="'/' + subItem.path" 
              v-for="subItem in item.children" 
              :key="subItem.id" 
              @click="saveNavState('/'+subItem.path)">
                <!--二级菜单的模板区域-->
                <template slot="title">
                  <!--图标-->
                  <i class="el-icon-menu"></i>
                  <!--文本-->
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!--右侧内容部分-->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
export default {
  name: '',
  data () {
    return {
      //左侧菜单数据
      menulist: [],
      iconsObj: {
        '125': 'el-icon-user-solid',
        '103': 'el-icon-s-cooperation',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-marketing',
      },
      isCollapse: false,
      activePath: '',
    };
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem("activePath")
  },
  methods: {
    //账号退出的处理
    loginout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //获取菜单数据
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    //实现侧边栏横向的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //将当前的路由保存在sessionStorage
    saveNavState(activePath) {
      this.activePath = activePath
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
}
.header-left {
  display: flex;
  align-items: center;
}
.header-left img {
  width: 50px;
  height: 50px;
}
.header-left span {
  margin-left: 15px;
}
.el-aside {
  background-color: #333744;
}
.el-aside .el-menu {
  border-right: none;
}
.el-main {
  background-color: #eeedf1;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer
}
</style>