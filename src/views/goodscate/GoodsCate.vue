<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--添加分类的对话框-->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close='addCateDialogClosed'>
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!--表格区域-->
      <el-table
        :data="catelist"
        style="width: 100%;margin-bottom: 20px;"
        row-key="cat_id"
        border
        :tree-props="{children: 'children'}">
        <el-table-column prop="cat_name" label="分类名称" width="180"></el-table-column>
        <el-table-column label="是否有效" width="180">
          <template v-slot:default="slot">
            <i class="el-icon-success" style="color: lightgreen" v-if="slot.row.cat_deleted === false"></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="排序">
          <template v-slot:default="slot">
            <el-tag size="mini" v-if="slot.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="slot.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作">
          <template v-slot:default="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        class="treeTable"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      //商品分类数据
      catelist: [],
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //数据总条数
      total: 0,
      //控制添加分类的对话框
      addCateDialogVisible: false,
      //添加分类的表单数据
      addCateForm: {
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //分类等级(0为一级，1为二级，2为三级)
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        //任意一级都可选择
        checkStrictly: true
      },
      selectedKeys: []
    };
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    //监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //展示添加分类的对话框
    async showAddCateDialog() {
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
      if(res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败！')
      }
      this.parentCateList = res.data
      this.addCateDialogVisible = true
    },
    //级联选择器的选择发生变化时
    parentCateChanged() {
      //如果selectedKeys数组中的length大于0，证明进行了选择
      if(this.selectedKeys.length > 0) {
        //父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        //当前添加的分类的级别正好可以用数组长度表示
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        //没有进行选择，则默认0
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //监听添加分类对话框的关闭
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      //resetFields并不能对级联选择器进行清空
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    }
  }
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%
}
</style>