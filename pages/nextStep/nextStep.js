// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var isCanClick = true;

Page({
  data: {
    base_url: base_url,
    choseType:1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');

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
   * 选择类型
   */
  changeType(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    that.setData({
      choseType:type
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
   * 监听页面输入
   */
  listenInput(e){
    this.setData({
      opinoin:e.detail.value
    })
  },

  /**
   * 提交信息
   */
  submitOrder(){
    var that = this;
    var choseType = that.data.choseType;
    var settingInfo =  wx.getStorageSync('settingInfo');
    if(choseType == 2){//提交信息 无度数
      var settingData = {
        priceAreaId : settingInfo.priceAreaId,
        brandId : settingInfo.brandId,
        sizeId : settingInfo.sizeId,
        functionId : settingInfo.functionId,
        refractionId : settingInfo.refractionId,
        positionId : settingInfo.positionId,
        frameIds : settingInfo.frameIds,
        circleIds  : settingInfo.circleIds,
        materialIds : settingInfo.materialIds,
        colorIds : settingInfo.colorIds,
        sex : settingInfo.sex,
        message : settingInfo.message,
        user_id : userInfo.id
      };
      if(isCanClick == false){
          return
      }else{
        isCanClick = false;
      }
      tools.httpClient('home/WxApp/addSettingOrder',settingData,(error,data)=>{
        isCanClick = true;
        if(data.errorCode == 0){
          var oid = data.data.addOrderId;
         
          wx.showModal({
            title: '提示',
            content: '订单提交成功！可以导航查看附近商家处进行配镜',
            showCancel: true,
            confirmText: '立即支付',
            confirmColor: '#FE8B23',
            success: function(res) {
              if (res.confirm) {
                wx.showActionSheet({
                  itemList: ['微信支付', `余额支付(￥${userInfo.recharge_money})`],
                  success (res) {
                    if(res.tapIndex == 1) {//余额支付
                      tools.httpClient('home/WxApp/payOrderByBalance',{oid:oid,type:0},(error,data)=>{
                        if(data.errorCode == 0){
                          wx.removeStorageSync('settingInfo');
                          wx.showModal({
                            title: '提示',
                            content: '支付成功,定制产品下单后5分钟内可以退款，超时不退',
                            showCancel: false,
                            confirmText: '确定',
                            confirmColor: '#FE8A22',
                            success: function(res) {
                              if (res.confirm) {
                                wx.redirectTo({
                                  url: '/pages/myConsume/myConsume?currentTab=1',
                                })
                              }
                            }
                          })

                        }else if(data.errorCode == 5){//余额不足采用微信支付
                          wx.request({
                            url: base_url + '../extend/pay/request/WxSettingPay.php?oid=' + oid,
                            data: {
                              oid: oid
                            },
                            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                            success: function(res) {
                              wx.requestPayment({
                                'timeStamp': res.data.timeStamp,
                                'nonceStr': res.data.nonceStr,
                                'package': res.data.package,
                                'signType': 'MD5',
                                'paySign': res.data.paySign,
                                'success': function(res) {
                                  wx.removeStorageSync('settingInfo');
                                  wx.showModal({
                                    title: '提示',
                                    content: '支付成功,定制产品下单后5分钟内可以退款，超时不退',
                                    showCancel: false,
                                    confirmText: '确定',
                                    confirmColor: '#FE8A22',
                                    success: function(res) {
                                      if (res.confirm) {
                                        wx.redirectTo({
                                          url: '/pages/myConsume/myConsume?currentTab=1',
                                        })
                                      }
                                    }
                                  })
                              
                                }
                              });
  
                            }
                          })
                        }else{
                          wx.showToast({
                            title: data.errorInfo,
                            icon:'none',
                            duration:2000
                          })
                        }
                      })
                    }else{//微信支付
                      wx.request({
                          url: base_url + '../extend/pay/request/WxSettingPay.php?oid=' + oid,
                          data: {
                            oid: oid
                          },
                          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                          success: function(res) {
                            wx.requestPayment({
                              'timeStamp': res.data.timeStamp,
                              'nonceStr': res.data.nonceStr,
                              'package': res.data.package,
                              'signType': 'MD5',
                              'paySign': res.data.paySign,
                              'success': function(res) {
                                wx.removeStorageSync('settingInfo');
                                wx.showModal({
                                  title: '支付成功',
                                  content: '温馨提示：配镜类产品为定制产品，下单后5分钟内可申请退款，超过5分钟则无法退款，敬请谅解。',
                                  showCancel: false,
                                  confirmText: '确定',
                                  confirmColor: '#FE8A22',
                                  success: function(res) {
                                    if (res.confirm) {
                                      wx.redirectTo({
                                        url: '/pages/myConsume/myConsume?currentTab=1',
                                      })
                                    }
                                  }
                                })
                            
                              }
                            });

                          }
                        })


                    }
                    console.log(res.tapIndex)
                  },
                  fail (res) {
                    console.log(res.errMsg)
                  }
                })
              }
            }
          })

        }else{
          wx.showToast({
            title: data.errorInfo,
            icon:'none'
          })
        }
      })

    }else{
        wx.navigateTo({
          url: `/pages/settingGoods/settingGoods?frameIds=${settingInfo.frameIds}&circleIds=${settingInfo.circleIds}&materialIds=${settingInfo.materialIds}&colorIds=${settingInfo.colorIds}&sizeId=${settingInfo.sizeId}&priceAreaId=${settingInfo.priceAreaId}`,
        })
    }
  
   
   
   
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

  },




  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

  }

});
