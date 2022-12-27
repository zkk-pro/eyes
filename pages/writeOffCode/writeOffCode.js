// pages/grantStipend/grantStipend.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var codeImg = '';
var oid = 0;
var type = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    canvasHidden:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading();
    oid = options.oid ? options.oid : 0;
    type = options.type ? options.type : 0;//0配镜 1商城 2秒杀 3抽奖
    userInfo = wx.getStorageSync('userInfo');
    that.getOrderInfo();
  },

  /**
   * 获取订单信息
   */
  getOrderInfo(){
    var that = this;
    var url = 'home/WxApp/findSettingOrder';
    var data = {id:oid};
    if(type == 1){ //1商城
      url = 'home/WxStore/findOrder';
      data = {oid:oid};
    }else if(type == 2){//2秒杀
      url = 'home/WxRob/findOrder';
      data = {oid:oid};
    }else if(type == 3){//3抽奖
      url = 'home/WxReward/findOrder';
      data = {oid:oid};
    }

    tools.httpClient(url,data,(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          orderInfo:data.data,
          total_price: Number(data.data.total_price) + Number(data.data.balance_fee)
        })
        that.getShareCode(that);
      }
    });

  },





  /**
   * 获取二维码
   */
  getShareCode(that){
    var sendType = 0;
    if(type == 0){//配镜
      sendType = 4;
    }else  if(type == 1){//商城
      sendType = 5;
    }else  if(type == 2){//秒杀
      sendType = 6;
    }else  if(type == 3){//抽奖
      sendType = 7;
    }
    if(sendType == 0){
      return;
    }
    tools.httpClient('home/WxApp/getCode',{oid:oid,type:sendType,user_id:userInfo.id},(error,data)=>{
      if(data.errorCode == 0){
        var code = data.data + '?r=' + Math.random();
        that.setData({
          code:code
        });
      }
      wx.hideLoading();
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var user_id = userInfo.id ? userInfo.id : 0;
    return {
      title: '首页',
      path: '/pages/index/index?user_id=' +user_id,
    }
  }
})
