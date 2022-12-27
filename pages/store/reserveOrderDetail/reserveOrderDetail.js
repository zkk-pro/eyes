/**
 * 商品详情页js
 * @author micheal
 * @since 2017-01-23
 */
var CONFIG = require('../../../utils/config.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var tools = require('../../../utils/tools.js');
Page({
  data: {
    base_url: base_url,
    userInfo: [],//用户数据
    list:[],
    isShowMore:0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var id = options.id ? options.id : 0;//订单id
    var url = 'home/WxStore/findReserveOrder';
    userInfo = wx.getStorageSync('userInfo');
    //获取商品信息
    wx.request({
      url: base_url + url,
      data: {"oid": id},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (result) {
        var orderInfo = result.data.data;
        orderInfo['real_money'] = Number(orderInfo['total_price']) + Number(orderInfo['balance_fee']);
        that.setData({
              orderInfo: orderInfo
            });
      }
    });
  },

  onShow: function () {

  },

  /**
   * 复制快递单号
   */
  copyCode: function(e) {
    var express_number = this.data.orderInfo.express_number;
    if (express_number == null || express_number == '') {
      wx.showToast({
        title: '暂无订单号',
        icon : 'none'
      });
      return false;
    }
    wx.setClipboardData({
      data: express_number,
      success (res) {
        wx.getClipboardData({
          success (res) {
            wx.showToast({
              title: '复制成功',
            });
          }
        })
      }
    })
  },

});