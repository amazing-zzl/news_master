<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>项目管理</el-breadcrumb-item>
      <el-breadcrumb-item>新闻分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
      >
        <!-- 是否可评论 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.newsIsreview === 1"
            style="color: lightgreen;"
            prop="newsIsreview"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 新闻类型 -->
        <template slot="order" slot-scope="scope">
          {{ scope.row.categoryType }}
        </template>

        <!-- 创建时间 -->
        <template slot="createTime" slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.categoryId)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCategory(scope.row.categoryId)"
            >删除</el-button
          >
        </template>
      </tree-table>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="categoryName">
          <el-input v-model="addCateForm.categoryName"></el-input>
        </el-form-item>
        <el-form-item label="分类类型：" prop="categoryType">
          <el-input v-model="addCateForm.categoryType"></el-input>
        </el-form-item>
        <el-form-item label="能否评论：" prop="newsIsreview">
          <el-input v-model="addCateForm.newsIsreview"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 新闻分类的数据列表，默认为空
      catelist: [],
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "categoryName"
        },
        {
          label: "新闻类型",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order"
        },
        {
          label: "是否可评论",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isok"
        },
        {
          label: "创建时间",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "createTime"
        },
        {
          label: "操作",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "opt"
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        categoryName: "",
        // 父级分类的Id
        categoryType: 0,
        // 分类的等级，默认要添加的是1级分类
        newsIsreview: 1
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        categoryName: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ],
        categoryType: [
          { required: true, message: "请输入分类类型", trigger: "blur" }
        ],
        newsIsreview: [
          { required: true, message: "分类是否可评论", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取新闻分类数据
    async getCateList() {
      const { data: res } = await this.$http.get(
        "/api/news_back/master/categories"
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取新闻分类失败！");
      }

      //console.log(res.data);
      // 把数据列表，赋值给 catelist
      this.catelist = res.data;
      console.log(this.catelist);
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 再展示出对话框
      this.addCateDialogVisible = true;
    },
    async showEditCateDialog(categoryId) {
      this.addCateDialogVisible = true;
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(
        "/api/news_back/master/alterCategories?categoryId=" + categoryId
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！");
      }

      this.addCateForm = res.data;
    },

    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "/api/news_back/master/categories",
          this.addCateForm
        );

        if (res.meta.status !== 200) {
          return this.$message.error("添加分类失败！");
        }

        this.$message.success("添加分类成功！");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    //删除分类
    async removeCategory(categoryId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 用户取消了删除的操作
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }

      // 删除的业务逻辑
      const { data: res } = await this.$http.get(
        "/api/news_back/master/deleteCategory?categoryId=" + categoryId
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败！");
      }

      this.$message.success("删除参数成功！");
      this.getCateList();
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.categoryType = 0;
      this.addCateForm.newsIsreview = 1;
    }
  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
