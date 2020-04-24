<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="rolelist" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="slot">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1,i1) in slot.row.children" :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(slot.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <!--嵌套for循环，渲染二级权限-->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(slot.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!--嵌套for循环，渲染三级权限-->
                    <el-tag 
                      type="warning" 
                      v-for="(item3) in item2.children" 
                      :key="item3.id" 
                      closable
                      @close="removeRightById(slot.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="slot">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditRoleDialog(slot.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRole(slot.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(slot.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加角色的对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed">
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改角色的对话框-->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed">
      <!--对话框的内容区域-->
      <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <!--树形控件-->
      <el-tree 
        :data="rightslist" 
        :props="treeProps" 
        show-checkbox 
        default-expand-all 
        node-key="id"
        :default-checked-keys="defKeys"
        ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      //所有角色列表数据
      rolelist: [],
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      rightslist: [],
      //添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      //“添加角色”对话框的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      //“添加角色”对话框的表单数据规则
      addRoleFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
        ],
      },
      //修改角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      //“修改角色”对话框的表单数据
      editRoleForm: {},
      //树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      //树形控件默认选中的节点id值
      defKeys: [],
      //要分配权限的角色id
      roleId: '',
    };
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
    },
    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件，是否继续？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== "confirm") {
        return this.$message.info("取消了删除！")
      }
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      //这里调用getRolesList进行全部角色数据更新的话，会造成页面的角色行刷新为未展开的状态，较影响体验
      //由于删除成功后接口会把该角色全部权限返回回来，所以直接将返回的数据赋值给role.children，这样就可以做到页面不整体刷新
      role.children = res.data
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      //获取所有的权限数据
      const {data: res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      this.rightslist = res.data

      //递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)     
      this.setRightDialogVisible = true
    },
    //通过递归的形式，获取角色下所有第三级权限的id
    getLeafKeys(node, arr) {
      //如果当前node节点不包含children属性，则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    //点击“确定”完成角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}}/rights`,{rids: idStr})
      if(res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    //点击确定按钮，添加角色
    async addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('roles',this.addRoleForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        //添加成功后需要隐藏对话框
        this.addRoleDialogVisible = false
        //重新获取用户列表数据
        this.getRolesList()
      })
    },
    //监听“添加角色”对话框的关闭
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    //“修改角色”的对话框
    async showEditRoleDialog(id) {
      const {data: res} = await this.$http.get('roles/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败！')
      }
      //将请求到的数据保存到data
      this.editRoleForm = res.data
      //对话框显示
      this.editRoleDialogVisible = true
    },
    //点击确定按钮，完成角色修改
    editRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if(!valid) return
        console.log(this.editRoleForm)
        const {data: res} = await this.$http.put('roles/'+this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc,
        })
        if(res.meta.status !== 200){
          return this.$message.error('修改角色信息失败！')
        }
        this.$message.success('修改角色信息成功！')
        //修改成功后需要隐藏对话框
        this.editRoleDialogVisible = false
        //重新获取用户列表数据
        this.getRolesList()
      })
    },
    //监听修改角色对话框的关闭
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    //删除用户
    async removeRole(id) {
      const confirmResule = await this.$confirm('此操作将永久删除该角色，是否继续？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmResule !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('roles/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>