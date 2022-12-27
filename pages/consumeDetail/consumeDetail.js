/**
 * 商品详情页js
 * @author micheal
 * @since 2017-01-23
 */
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';

Page({
  data: {
    base_url: base_url,
    userInfo: [],//用户数据
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var id = options.id ? options.id : 0;//订单id
    var writeOff = options.writeoff ? options.writeoff : 0;//核销
    that.setData({
      writeOff:writeOff
    });
    userInfo = wx.getStorageSync('userInfo');
    //获取商品信息
    wx.request({
      url: base_url + 'home/WxApp/findSettingOrder',
      data: {"id": id},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (result) {
        var orderInfo = result.data.data;
        orderInfo['real_money'] = Number(orderInfo['total_price']) + Number(orderInfo['balance_fee']);
        that.setData({orderInfo: orderInfo});
      }
    });
  },

  onShow: function () {

  },

  /**
   * 核销操作
   */
  operator(){
    let that = this;
    tools.isWxLogin(function (res){
      if(res){
        let oid = that.data.orderInfo.id;
        let userInfo = wx.getStorageSync('userInfo');
        tools.httpClient('home/WxApp/writeOffOrder',{type:0,oid:oid,user_id:userInfo.id},(error,data)=>{
          if(data.errorCode == 0){
            wx.showToast({
              title:'核销成功',
              duration:2000,
              success(res) {
                setTimeout(function (){
                 wx.redirectTo({
                   url: '/pages/optometrist/center/center',
                 })
                },1500)
              }
            })
          }else{
            wx.showToast({
              title:data.errorInfo,
              icon:'none',
                duration: 2000
            })
          }
        })
      }

    })

  },


});