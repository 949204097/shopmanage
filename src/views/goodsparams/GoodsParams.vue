<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--警告区域-->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader :options="catelist" :props="cateProps" v-model="selectedCateKeys" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!--tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--动态参数区域-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabld" @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="slot">
                <!--循环渲染Tag标签-->
                <el-tag v-for="(item, i) in slot.row.attr_vals" :key="i" closable @close="handleClose(i, slot.row)">{{item}}</el-tag>
                <!--添加按钮区域，添加按钮与文本框的切换-->
                <el-input
                  class="input-new-tag"
                  v-if="slot.row.inputVisible"
                  v-model="slot.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slot.row)"
                  @blur="handleInputConfirm(slot.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slot.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>>
            <el-table-column label="操作">
              <template slot-scope="slot">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(slot.row.attr_id)">修改</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(slot.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--静态属性区域-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabld" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="slot">
                <!--循环渲染Tag标签-->
                <el-tag v-for="(item, i) in slot.row.attr_vals" :key="i" closable @close="handleClose(i, slot.row)">{{item}}</el-tag>
                <!--添加按钮区域，添加按钮与文本框的切换-->
                <el-input
                  class="input-new-tag"
                  v-if="slot.row.inputVisible"
                  v-model="slot.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slot.row)"
                  @blur="handleInputConfirm(slot.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slot.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>>
            <el-table-column label="操作">
              <template slot-scope="slot">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(slot.row.attr_id)">修改</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(slot.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!--添加参数与添加属性的对话框-->
      <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" abel-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!--修改参数与修改属性的对话框-->
      <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" abel-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      //商品分类列表
      catelist: [],
      //级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //tab页签选中的name属性
      activeName: 'many',
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      //控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加参数的表单数据
      addForm: {
        attr_name: ''
      },
      //添加表单的验证规则
      addFormRules: {
        attr_name: [
          {required: true, message: '请输入参数名称', trigger: 'blur'}
        ]
      },
      //控制修改对话框的显示与隐藏
      editDialogVisible: false,
      //修改参数的表单数据
      editForm: {},
      //控制按钮与文本框的切换显示
      inputVisible: false,
      //文本框中输入的内容
      inputValue: ''
    };
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取所有的商品分类列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data
    },
    //获取参数的列表数据
    async getParamsData() {
      if(this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //根据所选择的分类id和当前所处的面板，获得对应的参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params: {sel: this.activeName}})
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      //原本返回的数据是用空格分割的字符串，现在转为数组
      //如果返回的数据为空那么不进行分割，直接返回空数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        //控制添加按钮与文本框的切换
        item.inputVisible = false
        //文本框中输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if(this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //级联选择器选中项发生变化
    handleChange() {
      this.getParamsData()
    },
    //tab页签点击事件的处理函数
    handleTabClick() {
      //console.log(this.activeName)
      this.getParamsData()
    },
    //监听对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //点击确定按钮，完成添加
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if(res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    //点击按钮，展示修改的对话框
    async showEditDialog(attr_id) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params: {attr_sel:this.activeName}})
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //点击确定按钮，完成修改
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
          attr_name: this.editForm.attr_name, 
          attr_sel: this.activeName,
          attr_vals: this.editForm.attr_vals,})
        if(res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //删除参数
    async removeParams(attr_id) {
      const confirmResule = await this.$confirm('此操作将永久删除该参数，是否继续？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResule !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    //添加按钮切换为输入框
    showInput(row) {
      row.inputVisible = true
      //$nextTick作用是等待输入框渲染完毕后，再获取输入框并设置焦点
      this.$nextTick(_ => {
        //两个refs可取到当前操作的input
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //对标签的操作上传到服务器
    async saveAttrVals(row) {
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name: row.attr_name, 
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')})
      if(res.meta.status !== 200) {
        return this.$message.error('操作失败！')
      }
      this.$message.success('操作成功！')
    },
    //当文本框失去焦点或按下回车键执行，添加标签
    handleInputConfirm(row) {
      //trim为去除字符串前后的空格
      if(row.inputValue.trim().length !== 0){
        row.attr_vals.push(row.inputValue)
        this.saveAttrVals(row)
      }
      row.inputValue = ""
      row.inputVisible = false
    },
    //删除标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabld() {
      return this.selectedCateKeys.length !== 3
    },
    //选中的三级分类的id
    cateId() {
      if(this.selectedCateKeys.length === 3){
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.button-new-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>