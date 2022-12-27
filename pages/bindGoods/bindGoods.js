// pages/grantStipend/grantStipend.js
const CONFIG = require('../../utils/config.js');
const tools = require('../../utils/tools.js');
const app = getApp();
const base_url = CONFIG.API_URL.BASE_URL;
let userInfo = '';
let gid = 0;
let gpid = 0;
let optometristId = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    goodsInfo:[],
    showModal:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gid = options.gid ? options.gid : 0;//商品id
    gpid = options.gpid ? options.gpid : 0;//规格id
    optometristId = options.optometristId ? options.optometristId : 0;//商家id
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.showLoading({
      title:''
    })
    tools.isWxLogin(function (res){
      if(res){
        setTimeout(function (){
          userInfo = wx.getStorageSync('userInfo');
          that.getPropertyList();
        },100)
      }
    })
  },

  /**
   * 获取商品规格列表
   */
  getPropertyList(){
    let that = this;
    tools.httpClient('home/WxStore/findGoodsInfo',{gid:gid,gpid:gpid,optometrist_id:optometristId},(error,data)=>{
      if(data.errorCode == 0){
          that.setData({
            goodsInfo:data.data,
          })
      }
      wx.hideLoading();
    })
  },

  /**
   * 绑定商品规格
   */
  bindGoodsProperty(){
    let that = this;
    tools.isWxLogin(function (res){
      if(res){
          tools.httpClient("home/WxStore/addStoreBind",{optometrist_id:optometristId,gid:gid,gpid:gpid},(error,data)=>{
            if(data.errorCode == 0){
              wx.showToast({
                title:'绑定成功',
                duration:2000,
                success(res) {
                  that.getPropertyList();
                }
              })
            }else{
              wx.showToast({
                title:data.errorInfo ? data.errorInfo : '绑定失败',
                duration:2000,
                icon:'none'
              })
            }
          })
      }
    })
  },

  /**
   * 解绑
   */
  relieveStoreBind(){
    let that = this;
    tools.isWxLogin(function (res){
      if(res){
        tools.httpClient("home/WxStore/relieveStoreBind",{optometrist_id:optometristId,gid:gid,gpid:gpid},(error,data)=>{
          if(data.errorCode == 0){
            wx.showToast({
              title:'解绑成功',
              duration:2000,
              success(res) {
                that.getPropertyList();
              }
            })
          }else{
            wx.showToast({
              title:data.errorInfo ? data.errorInfo : '解绑失败',
              duration:2000,
              icon:'none'
            })
          }
        })
      }
    })
  },

  /**
   * 返回首页
   */
  goIndex(){
    wx.redirectTo({
      url:'/pages/index/index'
    })
  },

  /**
   * 去下单
   */
  confirmOrder(e){
    let gid = e.currentTarget.dataset.id;
    let gpid = e.currentTarget.dataset.pid;
    wx.redirectTo({
      url:`/pages/store/comfirmOrder/comfirmOrder?gids=${gid}&gpids=${gpid}&counts=1&showPosition=1&optometristId=${optometristId}`
    })
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})
