/**
 * 商品详情页js
 * @author micheal
 * @since 2017-01-23
 */
var CONFIG = require('../../utils/config.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var tools = require('../../utils/tools.js');
import {
  getAuthor,
  getMap
} from "../../utils/util.js";
Page({
  data: {
    base_url: base_url,
    userInfo: [], //用户数据
    list: [],
    showCommission: 0,
    isShowMore: 0
  },
  onLoad: async function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var id = options.id ? options.id : 0; //订单id
    var type = options.type ? options.type : 0; //判断详情类型 0商城 1抢购 2抽奖
    var writeOff = options.writeoff ? options.writeoff : 0; //核销
    that.setData({
      type: type,
      writeOff: writeOff
    });
    var url = '';
    if (type == 0) {
      url = 'home/WxStore/findOrder';
    } else if (type == 1) {
      url = 'home/WxRob/findOrder';
    } else {
      url = 'home/WxReward/findOrder';
    }

    userInfo = wx.getStorageSync('userInfo');
    const flag = await getAuthor("scope.userLocation");
    if (flag) {
      await getMap();
      this.setData({
        userMap: wx.getStorageSync("userMap")
      })
    }
    //获取商品信息
    wx.request({
      url: base_url + url,
      data: {
        "oid": id,
        lat: flag ? this.data.userMap.latitude : "",
        lng: flag ? this.data.userMap.longitude : ""
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (result) {
        var orderInfo = result.data.data;
        orderInfo['real_money'] = Number(orderInfo['total_price']) + Number(orderInfo['balance_fee']);
        that.setData({
            orderInfo: orderInfo
          },
          function () {
            if (type == 2) {
              that.getAllOrder();
            }

          }
        );
      }
    });
  },

  onShow: function () {
    this.getOptometristByUserId(this);
  },
  openNearShop(e){
    console.log(e.target);
    const lat = e.target.dataset.obj.latitude;
    const lng = e.target.dataset.obj.longitude;
    console.log(e.target.dataset,lat,lng);
    wx.openLocation({
      latitude: Number(lat),
      longitude: Number(lng),
    })
  },

  /**
   * 获取当前订单的参与者
   */
  getAllOrder() {
    var that = this;
    tools.httpClient('home/WxReward/getAllOrderByGroup', {
      group_id: that.data.orderInfo.group_id
    }, (error, data) => {
      if (data.errorCode == 0) {
        that.setData({
          list: data.data
        });
      }
    })
  },

  /**
   * 查看更多
   */
  showMore() {
    this.setData({
      isShowMore: 1
    });
  },
  /**
   * 复制快递单号
   */
  copyCode: function (e) {
    var express_number = this.data.orderInfo.express_number;
    if (express_number == null || express_number == '') {
      wx.showToast({
        title: '暂无订单号',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    wx.setClipboardData({
      data: express_number,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              title: '复制成功',
            });
          }
        })
      }
    })
  },


  /**
   * 核销操作
   */
  operator() {
    let that = this;
    let type = that.data.type;
    let sendType = 1;
    if (type == 1) {
      sendType = 2;
    } else if (type == 2) {
      sendType = 3;
    } else {
      sendType = 1;
    }
    tools.isWxLogin(function (res) {
      if (res) {
        let oid = that.data.orderInfo.id;
        let userInfo = wx.getStorageSync('userInfo');
        tools.httpClient('home/WxApp/writeOffOrder', {
          type: sendType,
          oid: oid,
          user_id: userInfo.id
        }, (error, data) => {
          if (data.errorCode == 0) {
            wx.showToast({
              title: '核销成功',
              duration: 2000,
              success(res) {
                setTimeout(function () {
                  wx.redirectTo({
                    url: '/pages/optometrist/center/center',
                  })
                }, 1500)
              }
            })
          } else {
            wx.showToast({
              title: data.errorInfo,
              icon: 'none',
              duration: 2000
            })
          }
        })
      }

    })

  },
  /**
   * 获取商家信息
   */
  getOptometristByUserId(that) {
    tools.httpClient('home/WxApp/getOptometristByUserId', {
      user_id: userInfo.id ? userInfo.id : -1
    }, (error, data) => {
      if (data.errorCode == 0) {
        that.setData({
          showCommission: 1
        })
      }
    })
  },

});