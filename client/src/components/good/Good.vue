<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 顶部搜索区域 -->
      <el-row :gutter="20">
        <!-- 顶部搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入商品名称" v-model="queryInfo.query" class="input-with-select" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 分页 -->
        <el-col :span="8" :offset="4" class="pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 7, 11]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
      <div class="shopgoods">
        <div class="goodslist point">
          <div class="addgood">
            <i class="el-icon-plus" @click="showAddGoodsDialog"> 添加商品</i>
          </div>
        </div>
        <div class="goodslist" v-for="item in goodsList" :key="item._id">
          <!-- 头部图片区域 -->
          <div class="topimg">
            <img :src="item.goods_pic" alt="">
          </div>
          <div class="goodsinfo">
            <h4>{{ item.goods_name }}</h4>
            <ul>
              <li>分类：{{ item.goods_cate }}</li>
              <li>原产地：{{ item.goods_address }}</li>
              <li><i>现价：{{ item.now_price }} 元</i></li>
              <li>原价：{{ item.old_price }} 元</li>
              <li>库存：{{ item.inventory }} 件</li>
              <li>销量：{{ item.sales }} 件</li>
              <li>规格：{{ item.goods_size }} /份</li>
            </ul>
          </div>
          <div class="goodsfooter">
            <div class="edit dag">
              <i class="el-icon-edit" @click="showEditGoodsDialog(item._id)"></i>
            </div>
            <div class="increament dag">
              <i class="el-icon-plus" @click="addInventory(item._id)"></i>
            </div>
            <div class="decreate dag">
              <i class="el-icon-minus" @click="decreaseInventory(item._id)"></i>
            </div>
            <div class="delete dag">
              <i class="el-icon-delete" @click="deleteGoodsById(item._id)"></i>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 添加商品的对话框 -->
    <el-dialog
      title="添加商品"
      :visible.sync="addGoodsDialogVisible"
      width="50%"
      @close="addGoodsDialogClosed">
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addGoodsForm.goods_name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cate">
          <el-select v-model="addGoodsForm.goods_cate" placeholder="请选择分类">
            <el-option
              v-for="item in cateList" :key="item._id"
              :label="item.cate_name"
              :value="item.cate_name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品产地" prop="goods_address">
          <el-input v-model="addGoodsForm.goods_address" placeholder="请输入商品产地"></el-input>
        </el-form-item>
        <el-form-item label="现价" prop="now_price">
          <el-input v-model="addGoodsForm.now_price" placeholder="请输入商品现在的价格"></el-input>
        </el-form-item>
        <el-form-item label="原价" prop="old_price">
          <el-input v-model="addGoodsForm.old_price" placeholder="请输入商品原来的价格"></el-input>
        </el-form-item>
        <el-form-item label="库存" prop="inventory">
          <el-input v-model="addGoodsForm.inventory" placeholder="请输入商品库存"></el-input>
        </el-form-item>
        <el-form-item label="销量" prop="sales">
          <el-input v-model="addGoodsForm.sales" placeholder="请输入商品销量"></el-input>
        </el-form-item>
        <el-form-item label="规格" prop="goods_size">
          <el-input v-model="addGoodsForm.goods_size" placeholder="请输入商品规格，带单位"></el-input>
        </el-form-item>
        <!-- 图片上传 -->
        <el-form-item label="图片" prop="goods_pic" class="uploadimg">
          <el-upload
            class="upload-demo"
            :action="imgUploadUrl"
            :on-preview="handlePreview"
            :on-success="handleSuccess"
            list-type="picture"
            :limit="1"
            name="goods_pic">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGoods">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialobVisible"
      width="30%"
      class="preimg">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
    <!-- 修改商品的对话框 -->
    <el-dialog
      title="修改商品信息"
      :visible.sync="editGoodsDialogVisible"
      width="50%"
      @close="editGoodsDialogClosed">
        <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="80px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cate">
            <el-select v-model="editGoodsForm.goods_cate" placeholder="请选择分类">
              <el-option
              v-for="item in cateList" :key="item._id"
              :label="item.cate_name"
              :value="item.cate_name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="商品产地" prop="goods_address">
            <el-input v-model="editGoodsForm.goods_address" placeholder="请输入商品产地"></el-input>
          </el-form-item>
          <el-form-item label="现价" prop="now_price">
            <el-input v-model="editGoodsForm.now_price" placeholder="请输入商品现在的价格"></el-input>
          </el-form-item>
          <el-form-item label="原价" prop="old_price">
            <el-input v-model="editGoodsForm.old_price" placeholder="请输入商品原来的价格"></el-input>
          </el-form-item>
          <el-form-item label="库存" prop="inventory">
            <el-input v-model="editGoodsForm.inventory" placeholder="请输入商品库存"></el-input>
          </el-form-item>
          <el-form-item label="销量" prop="sales">
            <el-input v-model="editGoodsForm.sales" placeholder="请输入商品销量"></el-input>
          </el-form-item>
          <el-form-item label="规格" prop="goods_size">
            <el-input v-model="editGoodsForm.goods_size" placeholder="请输入商品规格，带单位"></el-input>
          </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表
      goodsList: [],
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      // 总页数
      total: 0,
      // 控制添加商品对话框的显示与隐藏
      addGoodsDialogVisible: false,
      // 添加商品表单数据
      addGoodsForm: {
        goods_name: '',
        goods_cate: '',
        goods_address: '',
        now_price: 0,
        old_price: 0,
        inventory: 0,
        sales: 0,
        goods_size: '',
        goods_pic: ''
      },
      // 添加商品表单验证规则
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_cate: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
        goods_address: [
          { required: true, message: '请选择商品产地', trigger: 'blur' }
        ],
        now_price: [
          { required: true, message: '请输入商品现在的价格', trigger: 'blur' }
        ],
        old_price: [
          { required: true, message: '请输入商品以前的价格', trigger: 'blur' }
        ],
        inventory: [
          { required: true, message: '请输入商品的库存量', trigger: 'blur' }
        ],
        sales: [
          { required: true, message: '请输入商品的已卖出的量', trigger: 'blur' }
        ],
        goods_size: [
          { required: true, message: '请输入商品的规格，带上单位', trigger: 'blur' }
        ]
      },
      // 图片上传
      imgUploadUrl: 'http://127.0.0.1:3000/api/upload',
      previewPath: '',
      previewDialobVisible: false,
      // avartar
      avatar: '',
      // 控制编辑商品信息对话框的显示与隐藏
      editGoodsDialogVisible: false,
      editGoodsForm: '',
      // 编辑商品信息表单的校验
      editGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_cate: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
        goods_address: [
          { required: true, message: '请选择商品产地', trigger: 'blur' }
        ],
        now_price: [
          { required: true, message: '请输入商品现在的价格', trigger: 'blur' }
        ],
        old_price: [
          { required: true, message: '请输入商品以前的价格', trigger: 'blur' }
        ],
        inventory: [
          { required: true, message: '请输入商品的库存量', trigger: 'blur' }
        ],
        sales: [
          { required: true, message: '请输入商品的已卖出的量', trigger: 'blur' }
        ],
        goods_size: [
          { required: true, message: '请输入商品的规格，带上单位', trigger: 'blur' }
        ]
      },
      // 增加库存
      addkc: '',
      // 减少库存
      decreasekc: '',
      // 商品分类列表
      cateList: []
    }
  },
  created() {
    this.getGoodsList()
    this.getCateList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const {data: res} = await this.$http.post('api/querygoods', this.queryInfo)
      if (res.err_code !== 0) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodsList = res.data
      this.total = res.total
    },
    // 展示添加商品的对话框
    showAddGoodsDialog() {
      this.addGoodsDialogVisible = !this.addGoodsDialogVisible
    },
    // 图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.goods_pic
      this.previewDialobVisible = true
    },
    // 图片上传成功
    handleSuccess(response) {
      this.avatar = response.data.goods_pic
      this.addGoodsForm.goods_pic = response.data.goods_pic
    },
    // 添加商品
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (valid) {
          const {data: res} = await this.$http.post('api/addgoods', this.addGoodsForm)
          if (res.err_code === 1) {
            return this.$message.warning('该商品已存在！')
          }
          if (res.err_code === 500) {
            return this.$message.error('添加商品失败！')
          }
          this.$message.success('成功添加该商品！')
          this.getGoodsList()
          this.addGoodsDialogVisible = false
        }
        return false
      })
    },
    // 关闭添加商品的对话框
    addGoodsDialogClosed() {
      this.$refs.addGoodsFormRef.resetFields()
      this.avatar = ''
    },
    // 分页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 分页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoodsById(id) {
      const confirmRet = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRet !== 'confirm') {
        return this.$message.info('已取消该删除操作！')
      }
      const {data: res} = await this.$http.post('api/deletegoods',{id: id})
      if (res.err_code !== 0) {
        return this.$message.error('删除商品失败！')
      }
      this.$message.success('成功删除该商品！')
      this.getGoodsList()
    },
    // 点击按钮，打开修改商品信息的对话框
    async showEditGoodsDialog(id) {
      const {data: res} = await this.$http.post('api/querybyid', {id: id})
      if (res.err_code !== 0) {
        return this.$message.error('服务器繁忙，请稍后重试！')
      }
      this.editGoodsForm = res.data
      this.editGoodsDialogVisible = true
    },
    // 关闭修改商品信息的对话框
    editGoodsDialogClosed() {
      this.$refs.editGoodsFormRef.resetFields()
    },
    // 提交商品修改信息
    editGoods() {
      this.$refs.editGoodsFormRef.validate(async valid => {
        if (valid) {
          const {data: res} = await this.$http.put('api/editgoods', this.editGoodsForm)
          if (res.err_code !== 0) {
            return this.$message.error('修改商品信息失败！')
          }
          this.$message.success('修改商品信息成功！')
          this.getGoodsList()
          this.editGoodsDialogVisible = false
        }
        return false
      })
    },
    // 点击按钮增加库存
    async addInventory(id) {
      // 先查询
      const {data: res} = await this.$http.post('api/querybyid', {id: id})
      if (res.err_code !== 0) {
        return this.$message.error('服务器繁忙，请稍后重试！')
      }
      this.addkc = res.data
      this.addkc.inventory = this.addkc.inventory + 1
      
      const {data: ret} = await this.$http.put('api/editgoods', this.addkc)
      if (ret.err_code !== 0) {
        return this.$message.error('服务器繁忙，请稍后重试！')
      }
      this.getGoodsList()
    },
    // 点击按钮减少库存
    async decreaseInventory(id) {
      const {data: res} = await this.$http.post('api/querybyid', {id: id})
      if (res.err_code !== 0) {
        return this.$message.error('服务器繁忙，请稍后重试！')
      }
      this.decreasekc = res.data
      this.decreasekc.inventory = this.decreasekc.inventory - 1
      
      const {data: ret} = await this.$http.put('api/editgoods', this.decreasekc)
      if (ret.err_code !== 0) {
        return this.$message.error('服务器繁忙，请稍后重试！')
      }
      this.getGoodsList()
    },
    // 获取商品分类
    async getCateList() {
      const {data: res} = await this.$http.post('api/querycate')
      if (res.err_code !== 0) {
        return this.$message.warning('服务器繁忙，请稍后重试！')
      }
      this.cateList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-card{
  overflow: auto;
}
ul{
  list-style-type: none;
  margin: 0;
  padding: 0;
}
ul li{
  float: left;
  width: 40%;
  font-size: 12px;
  line-height: 28px;
  text-align: left;
  margin: 0 10px;
  border-bottom: 1px #eee solid;
  i{
    color: #f00;
    font-weight: 700;
    font-style: normal;
  }
}
li:last-child{
  border: none;
}
.shopgoods{
  display: flex;
  height: 480px;
  margin-top: 25px;
  flex-wrap: wrap;
  // justify-content: space-between;
  // background-color: #F1F2F7;
  .goodslist{
    position: relative;
    width: 24%;
    height: 450px;
    margin-bottom: 10px;
    padding: 30px 0 0;
    box-shadow: 0 0 5px #ddd;
    .addgood{
      position: absolute;
      top: 50%;
      left: 50%;
      color: #bbb;
      line-height: 64px;
      text-align: center;
      transform: translate(-50%, -50%);
      // background: #f00;
    }
    .topimg{
      width: 200px;
      height: 200px;
      margin: 0 auto 30px;
      // background-color: #f00;
      img{
         width: 200px;
         height: 200px;
         border-radius: 50%;
      }
    }
    .goodsinfo{
      font-size: 14px;
      text-align: center;
    }
    .goodsfooter{
      position: absolute;
      bottom: 0;
      display: flex;
      width: 100%;
      height: 44px;
      text-align: center;
      border-top: 1px #ccc solid;
      background-color: #FAFBFA;
      .dag{
        flex: 1;
        height: 18px;
        line-height: 18px;
        margin-top: 10px;
        border-right: 1px #ddd solid;
        cursor: pointer;
      }
      .delete{
        border: none;
      }
    }
  }
  .goodslist:not(:nth-child(4n)) {
    margin-right: calc(4% / 3);
  }
  .point{
    cursor: pointer;
  }
}
.el-pagination{
  margin: 5px 0 0;
  padding: 0;
  height: 40px;
}
.pagination{
  line-height: 40px;
}
</style>