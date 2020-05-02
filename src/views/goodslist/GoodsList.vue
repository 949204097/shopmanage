<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getSearchList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!--商品列表区域-->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="价格(元)" prop="goods_price" width="70px"></el-table-column>
        <el-table-column label="重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" width="150px">
          <template slot-scope="slot">
            {{slot.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot:default="slot">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(slot.row.goods_id)"></el-button>
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
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      //根据分页获取对应的商品列表
      queryInfo: {
        //搜索关键字
        query: '',
        //当前的页数
        pagenum: 1,
        //单页的数据总条数
        pagesize: 5,
      },
      goodslist: [],
      total: 0
    };
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    //搜索数据
    getSearchList() {
      //搜索时必须将页码重置为1，否则会出现搜索结果为空的情况，因为搜索的结果可能只有一页，而如果传入其它页码，返回必然为空
      this.queryInfo.pagenum = 1
      this.getGoodsList()
    },
    async removeGoodsById(id) {
      const confirmResule = await this.$confirm('此操作将永久删除该商品，是否继续？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResule !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete(`goods/${id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      }
      this.$message.success('删除商品成功！')
      //当最后一页只有一行数据并删除后，重新获取数据时的页码必须减去1
      if(this.goodslist.length == 1 && this.queryInfo.pagenum > 1) {
        this.queryInfo.pagenum --
      }
      this.getGoodsList()
    },
    goAddpage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped>

</style>