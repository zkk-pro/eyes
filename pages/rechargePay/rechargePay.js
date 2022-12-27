// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';


Page({
  data: {
    base_url: base_url,
    rechargeSend:[],
    money:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    that.getRechargeSendInfo();
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
  },

  /**
   * 监听金额输入
   */
  money(e){
     this.setData({
       money:e.detail.value
     })
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
          userInfo:userInfo
        })
      }else{
        that.setData({
          userInfo:userInfo
        })
      }
    })
  },

  /**
   * 获取充值送信息
   */
  getRechargeSendInfo(){
    var that = this;
    tools.httpClient('home/WxApp/rechargeSendList',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          rechargeSend:data.data
        })
      }else{
        that.setData({
          rechargeSend:[]
        })
      }
    })
  },

  /**
   * 添加充值订单
   */
  addRechargeOrder(){
    var that = this;
    tools.isWxLogin(function(res){
        var money = that.data.money;
        userInfo = that.data.userInfo;
        var digits = /^[1-9][0-9]*$/;
        if(!digits.test(money)){
            wx.showToast({
              title: '金额不合法',
              icon:'none',
                duration: 2000
            })
            return false;
        }
        wx.showLoading({
          mask:true
        })
        tools.httpClient('home/WxApp/addRechargeOrder',{"money":money,"user_id":userInfo.id},(error,data)=>{
          var oid = data.data;
          if(data.errorCode == 0){
            wx.request({
              url: base_url + '../extend/pay/request/WxRechargePay.php?oid=' + oid,
              data: {
                oid: oid
              },
              method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
              success: function(res) {
                wx.hideLoading();
                wx.requestPayment({
                  'timeStamp': res.data.timeStamp,
                  'nonceStr': res.data.nonceStr,
                  'package': res.data.package,
                  'signType': 'MD5',
                  'paySign': res.data.paySign,
                  'success': function(res) {
                    wx.showToast({
                      title: '支付成功',
                      icon: 'success',
                      duration: 3000,
                      success(){
                        wx.navigateBack();
                      },
                    });

                  }
                });

              },
              fail(){
                wx.hideLoading()
              }
            })
          }else{
            wx.hideLoading();
            wx.showToast({
              title: data.errorInfo,
              icon:'none',
                duration: 2000
            })
          }
        })

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

  }

});
