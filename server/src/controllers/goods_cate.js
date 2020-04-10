const Cate = require('../models/Good_cate')


// 添加分类
function addCate(req, res, next) {
  const body = req.body
  Cate.findOne({
    cate_name: body.cate_name
  }, (err, succ) => {
    if (err) {
      return res.status(500).json({
        err_code: 0,
        message: 'Interval Error.'
      })
    }
    if (succ) {
      return res.status(200).json({
        err_code: 1,
        message: 'Cate  name has already exists.'
      })
    }
    new Cate(body).save((err, data) => {
      if (err) {
        return res.status(500).json({
          err_code: 500,
          message: 'Interval Error.'
        })
      }
      if (!data) {
        return res.status(200).json({
          err_code: 1,
          message: 'Add cate failed.'
        })
      }
      res.status(200).json({
        err_code: 0,
        message: 'Add cate success.'
      })
    })
  })
}

// 根据id查询分类列表
function queryCateById(req, res, next) {
  const id = req.body.id
  Cate.findById(id, (err, succ) => {
    if (err) {
      return res.status(500).json({
        err_code: 500,
        message: 'Interval Error.',
      })
    }
    if (!succ) {
      return res.status(200).json({
        err_code: 1,
        message: 'ID is Invalid.'
      })
    }
    res.status(200).json({
      err_code: 0,
      message: 'Query Success.',
      data: succ
    })
  })
}

// 根据条件查询和模糊查询
function queryCate(req, res, next) {
  const body = req.body
  const pagenum = parseInt(body.pagenum, 10) || 1
  const pagesize = parseInt(body.pagesize, 10) || 5
  const query = body.query || ''
  // 参数验证
  if(query) {
    const reg = new RegExp(query, 'i')
    Cate.find({cate_name: {$regex: reg}})
        .skip((pagenum - 1) * pagesize)
        .limit(pagesize)
        .exec((err, succ) => {
          if (err) {
            return res.status(500).json({
              err_code: 500,
              message: 'Interval Error.'
            })
          }
          if (!succ) {
            return res.status(200).json({
              err_code: 200,
              message: 'Query Invalid.'
            })
          }
          // 查询总记录数
          Cate.find().count((err, ret) => {
            if (err) return
            if (!ret) return
            res.status(200).json({
              err_code: 0,
              message: 'Query Success.',
              data: succ,
              total: ret
            })
          })
        })
  } else {
    Cate.find()
        .skip((pagenum - 1) * pagesize)
        .limit(pagesize)
        .exec((err, succ) => {
          if (err) {
            return res.status(500).json({
              err_code: 500,
              message: 'Interval Error.'
            })
          }
          if (!succ) {
            return res.status(200).json({
              err_code: 1,
              message: 'Query Failed.'
            })
          }
          Cate.find().count((err, ret) => {
            if (err) return
            if (!ret) return
            res.status(200).json({
              err_code: 0,
              message: 'Query Success.',
              data: succ,
              total: ret
            })
          })
        })
  }
}

// 根据id修改分类列表
function editCateById(req, res, next) {
  const body = req.body
  Cate.findByIdAndUpdate(body._id, {
    cate_name: body.cate_name,
    cate_desc: body.cate_desc
  }, (err, succ) => {
    if (err) {
      return res.status(500).json({
        err_code: 500,
        message: 'Interval Error.'
      })
    }
    if (!succ) {
      return res.status(200).json({
        err_code: 1,
        message: 'Updated Error.'
      })
    }
    res.status(200).json({
      err_code: 0,
      message: 'Updated Success.'
    })
  })
}

// 根据id删除分类列表
function deleteCateById(req, res, next) {
  const id = req.body.id
  Cate.findByIdAndRemove(id, (err, succ) => {
    if (err) {
      return res.status(500).json({
        err_code: 500,
        message: 'Interval Error.'
      })
    }
    if (!succ) {
      return res.status(200).json({
        err_code: 1,
        message: 'ID is invalid.'
      })
    }
    res.status(200).json({
      err_code: 0,
      message: 'Delete Cate Success.'
    })
  })
}

module.exports = {
  addCate,
  queryCateById,
  queryCate,
  editCateById,
  deleteCateById
}