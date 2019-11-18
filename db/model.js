const mongoose = require('mongoose')
const md5 = require('blueimp-md5')

mongoose.connect('mongodb://localhost:27017/reactadmin')
const conn = mongoose.connection
conn.on('connected', () => {
    console.log('数据库连接成功')
})

const userSchema = mongoose.Schema({
    username: {type: String, required: true}, // 用户名
    password: {type: String, required: true}, // 密码
    phone: String,
    email: String,
    create_time: {type: Number, default: Date.now},
    role_id: String
})

const UserModel = mongoose.model('users', userSchema)

UserModel.findOne({username: 'admin'}, function(err, user){
    if(!user){
        UserModel.create({username: 'admin', password: md5('admin')})
    }
})
exports.UserModel = UserModel


const categorySchema = mongoose.Schema({
    name: {type: String, required: true},
    parentId: {type: String, required: true}
})

const CategoryModel = mongoose.model('categorys', categorySchema)
exports.CategoryModel = CategoryModel

const productSchema = mongoose.Schema({
    categoryId: {type: String, required: true}, // 所属分类的id
    pCategoryId: {type: String, required: true}, // 所属分类的父分类id
    name: {type: String, required: true}, // 名称
    price: {type: Number, required: true}, // 价格
    desc: {type: String},
    status: {type: Number, default: 1}, // 商品状态: 1:在售, 2: 下架了
    imgs: {type: Array, default: []}, // n个图片文件名的json字符串
    detail: {type: String}
})

const ProductModel = mongoose.model('product', productSchema)
exports.ProductModel = ProductModel

const roleSchema = new mongoose.Schema({
    name: {type: String, required: true}, // 角色名称
    auth_name: String, // 授权人
    auth_time: Number, // 授权时间
    create_time: {type: Number, default: Date.now}, // 创建时间
    menus: Array // 所有有权限操作的菜单path的数组
})
  
// 3. 定义Model(与集合对应, 可以操作集合)
const RoleModel = mongoose.model('roles', roleSchema)
exports.RoleModel = RoleModel
