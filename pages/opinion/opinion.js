// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';


Page({
	data: {
    base_url: base_url,
    opinoin:''
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
  addOpinion(){
    var that = this;
    var opinion = that.data.opinoin;
    var user_id = userInfo.id;
    var nick_name =  userInfo.nick_name;
    if(opinion == '' || opinion == null){
        wx.showToast({
          title: '反馈内容不能为空',
          icon:'none',
          duration:2000
        })
        return
    }
    tools.httpClient('home/WxApp/addOpinion',{
      opinion:opinion,
      user_id:user_id,
      nick_name:nick_name
    },(error,data)=>{
        if(data.errorCode == 0){
            wx.showToast({
              title: '提交成功',
              duration:2000,
              success(){
                setTimeout(function(){
                  wx.navigateBack();
                },1000)
              }
            })
        }else{
          wx.showToast({
            title: data.errorInfo,
            icon:'none'
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
