// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var page = 1;
var pageSize = 12;
var allPages = 0;
var pagingUserCoupon = function(that,type = 0) {
  wx.request({
    url: base_url + 'home/WxApp/pagingUserCoupon',
    data: {
      user_id: userInfo.id ? userInfo.id : -1,
      pageIndex: page,
      pageSize: pageSize,
      state:that.data.state
    },
    method: 'GET',
    success: function(res) {
      var data = res.data.data;
      var dataList = data.dataList;
      if(type == 1){
        var list = [];
      }else{
        var list = that.data.list;
      }

      var bottom_text = '~~上拉加载更多~~';
      allPages = data.pageInfo.all_pages;
      for (var i = 0; i < dataList.length; i++) {
        list.push(dataList[i])
      }
      if (allPages <= page) {
        bottom_text = '~~没有更多啦~~';
      }
      that.setData({
        list: list,
        bottom_text:bottom_text
      });
      // console.log( that.data.list )
      page++;
      setTimeout(function(){
        wx.hideLoading();
      },100)
    },
    fail(res) {
      setTimeout(function(){
        wx.hideLoading();
      },100)
    }
  })
};
Page({
  data: {
    base_url: base_url,
    state:0,
    bottom_text:'暂无数据',
    list:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    // that.getAllAdd();
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
    setTimeout(function(){
      userInfo = wx.getStorageSync('userInfo');
      if(userInfo.id > 0){
        that.getUserInfo();
      }
    },100)
    that.setData({
      list: []
    });
    page = 1;
    pagingUserCoupon(that);
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
        })
      }
    })
  },

  /**
   * 跳转首页
   */
  goIndex(){
    wx.reLaunch({
      url:'../index/index'
    })
  },

  /**
   * 导航切换
   */
  changeState(e){
    let that = this;
    let state = e.currentTarget.dataset.state;
    that.setData({
      state:state
    })
    that.setData({
      list: []
    });
    page = 1;
    pagingUserCoupon(that,1);
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
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      pagingUserCoupon(that);
    }
  },



});
