// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var type = 0;//判断展示关于我们还是疑问解答的标志
var id = 0;
Page({
	data: {
    base_url: base_url,
    content:"<view style='text-align: center'>暂无信息</view>"
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
    userInfo = wx.getStorageSync('userInfo');
    id = options.id ? options.id : 0
    that.getConfig();
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
    
    
  },

  /**
   * 获取配置
   */
  getConfig(){
      var that = this;
      tools.httpClient('home/WxApp/getSlide',{id:id},(error,data)=>{
        if(data.errorCode == 0){
              var content = tools.richReplaceImg(data.data.simple_desc);
            that.setData({
              content:content
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
