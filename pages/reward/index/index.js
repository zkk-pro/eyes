// pages/index/index.js
var wx_login = require('../../../utils/wxLogin.js');
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var page = 1;
var pageSize = 6;
var allPages = 0;
var pagingGoods = function(that,type = 0) {
  wx.request({
    url: base_url + 'home/WxReward/pagingGoods',
    data: {
      pageIndex: page,
      pageSize: pageSize,
    },
    method: 'GET',
    success: function(res) {
      var data = res.data.data;
      var dataList = data.dataList;
      if(type == 1){//点击切换，重新渲染商品
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
      setTimeout(function(){
        wx.hideLoading()
      },100)
      page++;
    }
  })
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    rewardGoods:[],
    list:[],
    showCommission:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    that.getRobRecommend(that);//获取秒杀产品
    that.setData({
      list: []
    });
    page = 1;
    pagingGoods(that);
  },

  /**
   * 获取首页推荐的秒杀产品
   */
  getRobRecommend(that){
    tools.httpClient('home/WxReward/getRecommendGoods', {}, (error, data) => {
      if(data.errorCode == 0){
        that.setData({
          rewardGoods:data.data
        })
      }
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
    var that = this;
    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
      if(userInfo.id){
          that.getUserInfo();
          that.getOptometristByUserId(that);
      }
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
        // that.setData({
        //   showCommission:userInfo.is_distributor == 1 ? 1 : 0
        // })
      }
    })
},

  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          showCommission:1
        })
      }
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
   * 跳转商品详情
   */
  goodsDetail(e){
    var gid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/reward/goodsDetail/goodsDetail?gid='+gid,
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
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      pagingGoods(that);
    }
  },




  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var user_id = userInfo.id ? userInfo.id : 0;
    return {
      title: '限时秒杀',
      path: '/pages/rob/index/index?user_id=' +user_id,
    }
  }
})