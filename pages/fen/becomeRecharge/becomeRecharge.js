// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var isCanClick = true;
Page({
  data: {
    base_url: base_url,
    money:0,
    balance_fee:0.00
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
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
    var that = this;
    wx.showLoading();
    setTimeout(function(){
      userInfo = wx.getStorageSync('userInfo');
      that.getUserInfo();
    },100)

  },

  /**
   * 获取用户信息
   */
  getUserInfo(){
    var that = this;
    tools.httpClient('home/WxApp/getUserInfo',{user_id:userInfo.id},(error,data)=>{
      if(data.errorCode == 0){
        userInfo = data.data;
        wx.setStorageSync('userInfo', userInfo);
        that.setData({
          userInfo:userInfo,
          balance_fee:data.data.balance_fee
        })
      }else{
        that.setData({
          userInfo:userInfo,

        })
      }
      wx.hideLoading();
    })
  },






  //提现金额
  moneyInput: function (e) {
    var that = this;
    that.setData({
      money: e.detail.value
    })
  },

//提交
  submit: function () {


    var that = this;
    var money = that.data.money;//提现金额

    if (money == '' || money <= 0) {
      wx.showModal({
        title: '提示',
        content: '请输入有效的转入金额',
        showCancel: false,
        confirmColor: '#F7971F',
        success: function (res) {

        }
      })
      return false;
    }

    if (parseFloat(money) > parseFloat(that.data.balance_fee)) {
      wx.showModal({
        title: '提示',
        content: '您输入的金额大于可转入金额了！',
        showCancel: false,
        confirmColor: '#F7971F',
        success: function (res) {

        }
      })
      return false;
    }
    if(isCanClick == false){
      return;
    }else{
      isCanClick = false;
    }
    wx.showLoading();
    tools.httpClient('home/WxApp/becomeRecharge', {
      money: money,
      user_id:userInfo.id
    }, (error, res) => {
      isCanClick = true;
      wx.hideLoading();
      if (res.errorCode == 0) {
        wx.showModal({
          title: '提示',
          content: '操作成功',
          showCancel: false,
          confirmColor: '#F7971F',
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack()
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorInfo,
          showCancel: false,
          confirmColor: '#F7971F',
          success: function (res) {

          }
        })
      }
    });

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
   * 返回上一页
   */
  goBack(e){
    wx.navigateBack()
  },

  /**
   * 页面滚动时触发
   */
  onPageScroll: function (e){

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

  }

});
