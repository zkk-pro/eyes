// pages/grantStipend/grantStipend.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var codeImg = '';
var id = 0;
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
    id = options.id ? options.id : 1;
    userInfo = wx.getStorageSync('userInfo');
    that.getOrderInfo();
  },

  /**
   * 获取订单信息
   */
  getOrderInfo(){
    var that = this;
    var url = 'home/WxService/getUserGoods';
    tools.httpClient(url, {id:id},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          goodsInfo:data.data,
        })
        that.getShareCode(that);
      }
    });

  },





  /**
   * 获取二维码
   */
  getShareCode(that){
    tools.httpClient('home/WxApp/getCode',{oid:id,type:10,user_id:userInfo.id},(error,data)=>{
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
