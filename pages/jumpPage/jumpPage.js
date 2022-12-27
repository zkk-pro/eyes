// pages/grantStipend/grantStipend.js
const CONFIG = require('../../utils/config.js');
const tools = require('../../utils/tools.js');
const app = getApp();
const base_url = CONFIG.API_URL.BASE_URL;
let userInfo = '';
let gid = 0;
let gpid = 0;
let type = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gid = options.gid ? options.gid : 211;//商品id
    gpid = options.gpid ? options.gpid : 0;//规格id
    type = options.type ? options.type : 0;//0产品码 1规格码

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
           that.getOptometristByUserId();
         },100)
      }
    })
  },

  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){//是商家
        wx.redirectTo({
          url:`/pages/bindGoods/bindGoods?gid=${gid}&gpid=${gpid}&optometristId=${data.data.id}`
        })
      }else{//不是商家
        if(type == 1){//规格码进入下单页面
          wx.redirectTo({
            url:`/pages/store/comfirmOrder/comfirmOrder?gids=${gid}&gpids=${gpid}&counts=1&showPosition=1`
          })
        }else{
          wx.redirectTo({
            url:`/pages/store/goodsDetail/goodsDetail?gid=${gid}`
          })
        }

      }
      wx.hideLoading();
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
