// pages/fen/commissionRecord/commissionRecord.js
var wx_login = require('../../../utils/wxLogin.js');
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var userInfo = "";
var base_url = CONFIG.API_URL.BASE_URL;
//页面初始化数据
var page = 1;
var pageSize = 15;
var allPages = 0;
var render = function (that) {
  tools.httpClient('home/WxApp/pagingAutoRecord', {
    user_id: userInfo.id,
    pageIndex: page,
    pageSize: pageSize
  }, (error, res) => {
    var dataList = res.data.dataList;
    allPages = res.data.pageInfo.all_pages;
    if (page >= allPages) {
      that.setData({
        bottom_text: '~~没有更多了~~'
      })
    } else {
      that.setData({
        bottom_text: '~~上拉加载更多~~'
      })
    }
    var list = that.data.list;
    for (var i = 0; i < dataList.length; i++) {
      list.push(dataList[i])
    }
    that.setData({
      list: list,
    });
    page++;
  });
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url: base_url,
    list: [],//奖金记录
    bottom_text: '~~加载中~~',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');

    //查询师傅管理
    page = 1;
    allPages = 0;
    that.setData({
      list: [],
    })
    render(that);

  },

  /**
   * 触底加载
   */
  onReachBottom: function () {
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      render(that);
    }
  },




})