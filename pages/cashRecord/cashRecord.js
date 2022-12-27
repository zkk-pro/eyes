// pages/index/index.js
var wx_login = require('../../utils/wxLogin.js');
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var area = "";
var did = 0;
var page = 1;
var pageSize = 10;
var allPages = 0;
var bStop = true;
var keyword = '';
var pagingCashRecord = function (that,click=0) {
  tools.httpClient('home/WxApp/pagingCashRecord', {
    pageIndex: page,
    pageSize: pageSize,
    user_id:userInfo.id ? userInfo.id : 0,
    type:that.data.cur
  }, (error, data) => {
    bStop = true;
    var res = data;
    var data = data.data;
    if(click == 1){
      var list = [];
    }else{
      var list = that.data.list;
    }
    var bottom_text = '~~上拉加载更多~~';
    //成功查询到结果集
    if (res.errorCode == 0) {  //查询成功
      for (var i = 0; i < data.dataList.length; i++) {
        list.push(data.dataList[i]);
      }
      allPages = data.pageInfo.all_pages;
    }
    if (allPages <= page) {
      bottom_text = '~~暂无更多数据~~';
    }
    that.setData({ list: list, bottom_text: bottom_text });
    page++;
    wx.hideLoading();
  });
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    base_url:base_url,
    bottom_text:'加载中',
    cur:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    wx.showLoading({
      title: '加载中',
    })
    page = 1;
    that.setData({
      list:[]
    })
    pagingCashRecord(that);
  },

  /**
   * 跳转详情
   */
  noticeDetail(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/noticeDetail/noticeDetail?id='+id,
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
   * 导航切换
   */
  changeNav(e){
    var that = this;
    var cur = e.currentTarget.dataset.cur;
    that.setData({
      cur:cur,
      list:[]
    })
    page = 1;
    pagingCashRecord(that,1);
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
    if (bStop) {
      bStop = false;
      var that = this;
      if (page > allPages) {
        return false;
      } else {
        pagingCashRecord(that);
      }
    } else {

      return false;
    }
  },
  
 


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

  }
})