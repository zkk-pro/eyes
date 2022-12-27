// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var type = 0;//判断展示关于我们还是疑问解答的标志

Page({
  data: {
    base_url: base_url,
    content:"<view style='text-align: center'>暂无信息</view>",
    isAgree:1,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    that.getConfig();
    var height = 0;
    if(app.globalData.type==1){
      height = 34;
    }
    that.setData({
      height:height
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
   * 获取配置
   */
  getConfig(){
    var that = this;
    tools.httpClient('home/WxApp/getConfig',{},(error,data)=>{
      if(data.errorCode == 0){
        var content = tools.richReplaceImg(data.data.distributorAgree);
        that.setData({
          content:content
        })
      }
    })
  },

  /**
   * 是否同意协议切换
   */
  isAgree(){
    var that = this;
    if(that.data.isAgree == 1){
      that.setData({
        isAgree:0
      })
    }else{
      that.setData({
        isAgree:1
      })
    }
  },

  /**
   * 提交同意协议
   */
  agreeDistributor(){
    var that = this;
    var isAgree = that.data.isAgree;
    if(isAgree != 1){
      wx.showToast({
        title:'请先同意协议',
        icon:'none',
          duration: 2000
      })
      return;
    }

    tools.isWxLogin(function(res){
      if(res){
          tools.httpClient('home/WxApp/agreeDistributor',{user_id:userInfo.id},(error,data)=>{
            if(data.errorCode == 0){
               wx.redirectTo({
                 url:'/pages/fen/distributorCenter/distributorCenter'
               })
            }else{
              wx.showToast({
                title:'网络异常请重试',
                icon:'none',
                  duration: 2000
              })
            }
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
