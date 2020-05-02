<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!-- 2.为echarts准备一个展示区域 -->
      <div id="main" style="width: 750px;height: 400px;"></div>
    </el-card>
  </div>
</template>

<script>
//1.导入echarts
import echarts from 'echarts'
import _ from 'lodash'
export default {
  name: '',
  data () {
    return {
      //需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    };
  },
  async mounted() {
    //3.初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    //4.准备数据和配置项
    const {data: res} = await this.$http.get('reports/type/1')
    if(res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }
    //合并两个对象(三种方法)
    const result = _.merge(res.data, this.option)
    //const result = {...this.option, ...res.data}
    //const result = Object.assign(this.option, res.data)
    //5.展示
    myChart.setOption(result)
  }
}
</script>

<style scoped>

</style>