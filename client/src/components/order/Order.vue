<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 顶部搜索区域 -->
      <el-row>
        <!-- 搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入订单编号" v-model="queryInfo.query" class="input-with-select" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="expand" label="订单详情" width="80">
          <template slot-scope="scope">
            <el-row class="line">用户收货地址：{{ scope.row.user_address }}</el-row>
            <el-row class="line"><h1 class="goods">商 品</h1></el-row>
            <el-row v-for="item in scope.row.order_list" :key="item._id" class="line">
              <el-col :span="8">商品名称：{{ item.goods_name }}</el-col>
              <el-col :span="8">数量：2</el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column label="订单编号" prop="order_id" width="200"></el-table-column>
        <el-table-column label="用户名" prop="uname" width="80"></el-table-column>
        <el-table-column label="金额" prop="price">
          <template slot-scope="scope">
            {{ scope.row.price }} ￥
          </template>
        </el-table-column>
        <el-table-column label="订单状态" prop="order_status">
          <template slot-scope="scope">
            <span class="unsend" v-if="scope.row.order_status === 0">未发货</span>
            <span class="send" v-else>已发货</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="timer" width="180">
          <template slot-scope="scope">
            {{ scope.row.timer | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="note"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="sendGood(scope.row._id)">发货</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orderList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const {data: res} = await this.$http.post('api/queryorder', this.queryInfo)
      if (res.err_code !== 0) {
        return this.$message.error('获取订单列表失败！')
      }
      this.orderList = res.data
      this.total = res.total
    },
    // 发货
    async sendGood(id) {
      const {data: res} = await this.$http.post('api/queryorderbyid', {id: id})
      if (res.err_code !== 0) {
        return this.$message.warning('服务器正忙，请稍后重试！')
      }
      res.data.order_status = 1
      const {data: ret} = await this.$http.put('api/editorder', res.data)
      if (ret.err_code !== 0) {
        return this.$message.error('发货失败！')
      }
      this.$message.success('发货成功！')
      this.getOrderList()
    },
    // 分页页码
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getOrderList()
    },
    // 分页页面大小
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getOrderList()
    }
  }
}
</script>

<style lang="less" scoped>
.send{
  color: #67C23A;
}
.unsend{
  color: #E6A23C;
}
.goods{
  font-size: 14px;
  margin: 0;
}
.line{
  margin: 15px 0;
}
</style>