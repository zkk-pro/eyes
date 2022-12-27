// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
Page({
	data: {
    base_url: base_url,
    balanceFee:'0.00'
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
    userInfo = wx.getStorageSync('userInfo');
    var height = 0;
		if(app.globalData.type==1){
			height = 34;
		}
  
     that.setData({
      navH: app.globalData.navHeight,
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
            userInfo:userInfo,
            balanceFee:userInfo.balance_fee
          })
        }else{
          that.setData({
            userInfo:userInfo
          })
        }
      })
  },

  /**
   * 页面跳转
   */
  jumpPage(e){
      var that = this;
      var type = e.currentTarget.dataset.type;
      var urlList = {
        "withdrawal":'/pages/applyWithdrawal/applyWithdrawal',
        "record":'/pages/fen/commissionRecord/commissionRecord',
        "myteam":'/pages/fen/myTeam/myTeam',
        "qrcode":'/pages/fen/promotionsPage/promotionsPage',
        "applyWithdrawal":"/pages/fen/applyWithdrawal/applyWithdrawal?type=0",
        "becomeRecharge":"/pages/fen/becomeRecharge/becomeRecharge"
      };

        wx.navigateTo({
          url: urlList[type],
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
   * 返回上一页
   */
  goBack(e){
    wx.navigateBack()
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
  

});
