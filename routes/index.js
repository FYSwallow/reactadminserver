var express = require('express')
const md5 = require('blueimp-md5')


var router = express.Router()
require('./file-upload')(router)
const filter = {password: 0, __v: 0} //过滤

const {UserModel, CategoryModel, ProductModel, RoleModel} = require('../db/model')
/* GET home page. */

router.post('/login', function(req, res) {
    const {username, password} = req.body
    UserModel.findOne({username, password: md5(password)}, function(err, user){
        if(user){
            res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
            if(user.role_id){
                RoleModel.findOne({_id: user.role_id}, function(error, role) {
                    if (!error) {
                        user._doc.role = role
                        res.send({status: 0, data: user})
                    }
                })
            } else {
                user._doc.role = {menus: []}
                // 返回登陆成功信息(包含user)
                res.send({status: 0, data: user})
            }
        }else {
            res.send({status: 1, msg: '用户名不存在或密码不正确'})
        }
    })
    
})

// 添加用户
router.post('/manage/user/add', function(req, res) {
    const {username, password } = req.body
    UserModel.findOne({username}, function(err, user) {
        if ( !err) {
            if (user) {
                res.send({status: 1, msg: '此用户已经存在'})
            } else {
                UserModel.create({...req.body, password: md5(password || 'abc123')}, function(err, user2) {
                    if(!err) {
                        res.send({status: 0, data: user2})
                    }
                })
            }

        } else {
            res.send({status: 1, msg: '添加用户异常, 请重新尝试'})
        }
    })
})

// 更新用户

router.post('/manage/user/update', function(req, res) {
    const user = req.body
    UserModel.findOneAndUpdate({_id: user._id}, user, function(err, oldUser) {
        if (!err) {
            const data = Object.assign(oldUser, user)
            res.send({status: 0, data})
        } else {
            res.send({status: 1, msg: '更新用户异常, 请重新尝试'})
        }      
    })
})

// 获取所有用户列表

router.get('/manage/user/list', function(req, res) {
    UserModel.find({username: {'$ne': 'admin'}}, function(err, users) {
        if (!err) {
            RoleModel.find(function(error, roles) {
                if(!error) {
                    res.send({status: 0, data: {users, roles}})
                }
            })
        } else {
            res.send({status: 1, msg: '获取用户列表异常, 请重新尝试'})
        }
    })
})

//删除用户

router.post('/manage/user/delete', function(req, res) {
    const {userId} = req.body
    UserModel.deleteOne({_id: userId}, function(err, user) {
        if (!err) {
            res.send({status: 0, msg: '删除用户成功'})
        }
    })
})

//添加分类
router.post('/manage/category/add', function(req, res) {
    const {categoryName, parentId} = req.body
    console.log({categoryName, parentId})
    new CategoryModel({name: categoryName, parentId}).save(function(err, category){
        if (!err) {
            res.send({status: 0, data: category})
        } else {
            res.send({status: 1, msg: '添加分类异常, 请重新尝试'}) 
        }
    })
})

// 获取一级或某个二级分类列表
router.get('/manage/category/list', function(req, res){
    const parentId = req.query.parentId || 0
    CategoryModel.find({parentId}, function(err, categorys) {
        if (!err) {
            res.send({status: 0, data: categorys})
        } else {
            res.send({status: 1, msg: '获取分类列表异常, 请重新尝试'})
        }
    })
})

//更新品类名称
router.post('/manage/category/update', function(req, res) {
    const {categoryId, categoryName} = req.body
    CategoryModel.findOneAndUpdate({_id: categoryId}, {name: categoryName}, function(err, oldcategory) {
        if (!err) {
            res.send({status: 0, category: oldcategory})
        } else {
            res.send({status: 1, msg: '更新分类名称异常, 请重新尝试'})
        }
    })
    
})

// 根据分类ID获取分类
router.get('/manage/category/info', function(req, res) {
    const {categoryId} = req.query
    console.log(categoryId)
    CategoryModel.findOne({_id: categoryId}, function(err, user) {
        if (!err) {
            res.send({status: 0, data: user})
        } else {
            res.send({status: 1, msg: '获取分类信息异常, 请重新尝试'})
        }
    })
})

//添加商品
router.post('/manage/product/add', function(req, res) {
    const product = req.body
    console.log(product)
    ProductModel.create(product, function(err, product){
        if (!err) {
            res.send({status: 0, data: product})
        } else {
            res.send({status: 1, msg: '添加产品异常, 请重新尝试'})
        }
    })
})

//更新商品

router.post('/manage/product/update', function(req, res) {
    const product = req.body
    ProductModel.findOneAndUpdate({_id: product._id}, product, function(err, user) {
        if (!err) {
            res.send({status: 0})
        } else {
            res.send({status: 1, msg: '更新商品名称异常, 请重新尝试'})
        }
    })
})

//删除商品
router.get('/manage/product/delete', function(req, res) {
    const {id} = req.query
    console.log(id)
    ProductModel.deleteOne({_id: id}, function(err, product) {
        if (!err) {
            res.send({status: 0, msg: '删除商品成功'})
        } else {
            res.send({status: 1, msg: '删除商品异常,请重新尝试'})
        }
    })
})

//对商品进行上架/下架处理

router.post('/manage/product/updateStatus', function(req, res) {
    const {productId, status} = req.body
    console.log({productId, status})
    ProductModel.findOneAndUpdate({_id: productId}, {status}, function(err, product) {
        if (!err) {
            res.send({status: 0})
        } else {
            res.send({status: 1, msg: '下架商品异常, 请重新尝试'})
        }
    })
})

// 获取商品分页列表
router.get('/manage/product/list', function(req, res) {
    const {pageNum, pageSize} = req.query
    console.log(pageNum, pageSize)

    ProductModel.find({},function(err, products) {
        if (!err) {
            pageFilter(products, pageNum, pageSize)
            res.send({status: 0, data: pageFilter(products, pageNum, pageSize)}) 
        } else {
            res.send({status: 1, msg: '获取商品列表异常, 请重新尝试'})
        }
    })
})

// 搜索产品列表
router.get('/manage/product/search', (req, res) => {
    const {pageNum, pageSize, searchName, productName, productDesc} = req.query
    console.log({pageNum, pageSize, searchName, productName, productDesc})

    let contition = {}
    if (productName) {
      contition = {name: new RegExp(`^.*${productName}.*$`)}
    } else if (productDesc) {
      contition = {desc: new RegExp(`^.*${productDesc}.*$`)}
    }
    ProductModel.find(contition)
      .then(products => {
        res.send({status: 0, data: pageFilter(products, pageNum, pageSize)})
      })
      .catch(error => {
        console.error('搜索商品列表异常', error)
        res.send({status: 1, msg: '搜索商品列表异常, 请重新尝试'})
      })
})

// 添加角色
router.post('/manage/role/add', (req, res) => {
    const {roleName} = req.body
    RoleModel.create({name: roleName}, function(err, role) {
        if (!err) {
            res.send({status: 0, data: role})
        } else {
            res.send({status: 1, msg: '添加角色异常, 请重新尝试'})
        }
    })
})
  
// 获取角色列表
router.get('/manage/role/list', (req, res) => {
    RoleModel.find(function(err, roles) {
        if(!err) {
            res.send({status: 0, data: roles})
        } else {
            res.send({status: 1, msg: '获取角色列表异常, 请重新尝试'})
        }
    })
})

//更新角色列表
router.post('/manage/role/update', (req, res) => {
    const role = req.body
    role.auth_time = Date.now()
    RoleModel.findOneAndUpdate({_id: role._id}, role)
      .then(oldRole => {
        // console.log('---', oldRole._doc)
        res.send({status: 0, data: {...oldRole._doc, ...role}})
      })
      .catch(error => {
        console.error('更新角色异常', error)
        res.send({status: 1, msg: '更新角色异常, 请重新尝试'})
      })
  })

module.exports = router


// 筛选分组信息
function pageFilter(products, pageNum, pageSize) {
    pageNum = pageNum * 1
    pageSize = pageSize * 1
    const total = products.length
    const pages = parseInt(Math.ceil(total / pageSize))
    const start = pageSize * (pageNum - 1)
    const end = start + pageSize <= total ? start + pageSize : total
    const list = []

    for (let i = start; i < end; i++) {
        list.push(products[i])
    }
    return {
        pageNum,
        total,
        pages,
        pageSize,
        list
    }
}