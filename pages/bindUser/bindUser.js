// pages/index/index.js
var wx_login = require('../../utils/wxLogin.js');
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var isClick = true;
var isCanSubmit = true;
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
    userInfo = wx.getStorageSync('userInfo');
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
   * 监听页面输入
   */
  listenInput(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var data = {};
    data[type] = e.detail.value;
    that.setData(data);
  },

  /**
   * 绑定分销用户
   */
   bindDistrutor(){
    var that = this;
    var inviteCode = that.data.invite_code;
    if(!inviteCode){
      wx.showToast({
        title:'邀请码不能为空',
        icon:'none',
          duration: 2000
      })
      return false;
    }
    tools.httpClient('home/WxApp/getUserInfoByInviteCode',{invite_code:inviteCode},(error,data)=>{
      if(data.errorCode == 0){
        wx.setStorageSync('inviteCode',inviteCode);
        wx.redirectTo({
          url:'/pages/index/index'
        })
      }else{
        wx.showToast({
          title:'请输入正确的邀请码',
          icon:'none',
            duration: 2000
        })
      }
    })


  },

  /**
   * 跳过
   */
  jumpIndex(){
    wx.setStorageSync('inviteCode','00000000');
    wx.redirectTo({
      url:'/pages/index/index'
    })
    
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



})