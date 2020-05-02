<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--订单列表区域-->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="100px">
          <template v-slot:default="slot">
            <el-tag type="success" v-if="slot.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" width="100px">
          <template v-slot:default="slot">
            {{slot.row.is_send}}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template v-slot:default="slot">
            {{slot.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot:default="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox(slot.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
    <!--修改地址对话框-->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" abel-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1" :props="cascaderProps">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>

    <!--物流进度对话框-->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%" @close="addressDialogClosed">
    <el-timeline>
      <!--物流时间线-->
      <el-timeline-item
        v-for="(activity, index) in progressInfo"
        :key="index"
        :timestamp="activity.time">
        {{activity.context}}
      </el-timeline-item>
    </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./city.js"
export default {
  name: '',
  data () {
    return {
      //根据分页获取对应的订单列表
      queryInfo: {
        //搜索关键字
        query: '',
        //当前的页数
        pagenum: 1,
        //单页的数据总条数
        pagesize: 5,
      },
      orderlist: [],
      total: 0,
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          {required: true, message: '请填写省市区/县', trigger: 'blur'}
        ],
        address2: [
          {required: true, message: '请填写详细地址', trigger: 'blur'}
        ],
      },
      cityData: cityData,
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children',
      },
      progressVisible: false,
      //物流信息
      progressInfo: []
    };
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const {data: res} = await this.$http.get('orders', {params: this.queryInfo})
      if(res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    //展示修改地址的对话框
    showBox() {
      this.addressVisible = true
    },
    //
    async showProgressBox() {
      const {data: res} = await this.$http.get('/kuaidi/804909574412544580')
      if(res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }
      this.progressInfo = res.data
      this.progressVisible = true
    }
  },
}
</script>

<style scoped>
.el-cascader {
  width: 100%
}
</style>