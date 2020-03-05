<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>新闻管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加新闻</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加新闻信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="新闻图片"></el-step>
        <el-step title="新闻内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="新闻名称" prop="newsTitle">
              <el-input v-model="addForm.newsTitle"></el-input>
            </el-form-item>

            <el-form-item
              label="是否可评论（1可评论，0不可评论）"
              prop="newsIsreview"
            >
              <el-input
                v-model="addForm.newsIsreview"
                type="number"
                maxlength="1"
              ></el-input>
            </el-form-item>

            <el-form-item label="新闻分类" prop="newsCategory">
              <el-cascader
                expand-trigger="hover"
                :options="catelist"
                :props="cateProps"
                v-model="addForm.newsCategory"
                @change="handleChange"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="新闻图片" name="1">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="新闻内容" name="2">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.newsContent"></quill-editor>
            <!-- 添加新闻的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加新闻</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  data() {
    return {
      activeIndex: "0",
      addForm: {
        // 添加新闻的表单数据对象
        newsTitle: "",
        newsIsreview: 1,
        // 新闻所属的分类数组
        newsCategory: [],
        // 图片的数组
        // newsPicture: [],
        // 新闻的详情描述
        newsContent: ""
      },
      addFormRules: {
        newsTitle: [
          { required: true, message: "请输入新闻名称", trigger: "blur" }
        ],
        newsIsreview: [
          {
            required: true,
            message: "是否可评论",
            trigger: "blur"
          }
        ],
        newsCategory: [
          { required: true, message: "请选择新闻分类", trigger: "blur" }
        ]
      },
      // 新闻分类列表
      catelist: [],
      cateProps: {
        label: "categoryName",
        value: "categoryId",
        children: "children"
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: " ",
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      previewPath: "",
      previewVisible: false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有新闻分类数据
    async getCateList() {
      const { data: res } = await this.$http.get(
        "/api/news_back/master/categories"
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取新闻分类数据失败！");
      }

      this.catelist = res.data;
      console.log(this.catelist);
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      // console.log(this.addForm.newsCategory);
      // if (this.addForm.newsCategory.length !== 3) {
      //   this.addForm.newsCategory = [];
      // }
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页名字是：' + oldActiveName)
      // console.log('即将进入的标签页名字是：' + activeName)
      // return false
      if (oldActiveName === "0" && this.addForm.newsCategory.length !== 1) {
        this.$message.error("请先选择新闻分类！");
        return false;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2. 从 newsPicture 数组中，找到这个图片对应的索引值
      const i = this.addForm.newsPicture.findIndex(x => x.pic === filePath);
      // 3. 调用数组的 splice 方法，把图片信息对象，从 newsPicture 数组中移除
      this.addForm.newsPicture.splice(i, 1);
      console.log(this.addForm);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response);
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2. 将图片信息对象，push 到newsPicture数组中
      this.addForm.newsPicture.push(picInfo);
      console.log(this.addForm);
    },
    // 添加新闻
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！");
        }
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addForm);
        form.newsCategory = form.newsCategory.join(",");
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log(form);

        // 发起请求添加新闻
        // 新闻的名称，必须是唯一的
        const { data: res } = await this.$http.post(
          "/api/news_back/master/addnews",
          form
        );

        if (res.meta.status !== 200) {
          return this.$message.error("添加新闻失败！");
        }

        this.$message.success("添加新闻成功！");
        this.$router.push("/newsList");
      });
    }
  },
  computed: {
    cateId() {
      if (this.addForm.newsCategory.length === 3) {
        return this.addForm.newsCategory[2];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
