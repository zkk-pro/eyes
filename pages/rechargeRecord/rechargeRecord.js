// pages/fen/commissionRecord/commissionRecord.js
var wx_login = require('../../utils/wxLogin.js');
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var userInfo = "";
var base_url = CONFIG.API_URL.BASE_URL;
//页面初始化数据
var page = 1;
var pageSize = 10;
var allPages = 0;
var render = function (that) {
  tools.httpClient('home/WxApp/pagingRechargeRecord', {
    user_id: userInfo.id,
    pageIndex: page,
    pageSize: pageSize
  }, (error, res) => {
    var dataList = res.data.dataList;
    allPages = res.data.pageInfo.all_pages;
    if (page >= allPages) {
      that.setData({
        getMore: '~~没有更多了~~'
      })
    } else {
      that.setData({
        getMore: '~~上拉加载更多~~'
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
    did:'',//分销商主键
    list: [],//奖金记录
    getMore: '~~加载中~~',
    showMask:false,//详情显示
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

  //点击查看详情
  getOrderInfo:function(e){
    var that = this;
    var oid = e.currentTarget.dataset.oid;
    var parent_fee = e.currentTarget.dataset.fee;
    var order_time = e.currentTarget.dataset.time;
    //获取订单信息
    wx.showLoading();
    tools.httpClient('home/WxApp/getOrderInfo', {
      oid: oid
    }, (error, res) => {
      wx.hideLoading();
      that.setData({
        showMask:true,
        user_name: res.data.nick_name,
        money: parent_fee,
        service_name: res.data.service_name,
        counts: res.data.service_count,
        order_num: res.data.order_num,
        total_price: res.data.total_price,
        order_time: res.data.add_time,
        return_time: order_time,
      })
    });

  },

  //关闭弹框
  closeMask:function(){
    this.setData({
      showMask:false
    })
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