// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var type = 0;
var isCanClick = true;
Page({
	data: {
    base_url: base_url,
    cur:1,
    select_index:-1,
    select_id:0,
    money:0,
    balance_fee:0.00
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
        userInfo = wx.getStorageSync('userInfo');
        type = options.type ? options.type : 1;
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
    wx.showLoading();
    setTimeout(function(){
      userInfo = wx.getStorageSync('userInfo');
      if(userInfo.id > 0){
        if(type == 1){//商家
          that.getOptometristInfo();
        }else{
          that.getUserInfo();
        }

        that.getAccountList();
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
            balance_fee:data.data.balance_fee
          })
        }else{
          that.setData({
            userInfo:userInfo,

          })
        }
        wx.hideLoading();
      })
  },

  /**
   * 获取商家信息
   */
  getOptometristInfo(){
    var that = this;
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id},(error,data)=>{
      if(data.errorCode == 0) {
        that.setData({
          balance_fee: data.data.balance_fee
        })
      }
      wx.hideLoading();
    })
  },




  //查找全部
  getAccountList: function (did) {
    var that = this;
    tools.httpClient('home/WxApp/getAccountList', { user_id: userInfo.id}, (error, res) => {
      if (res.errorCode == 0) {
        that.setData({
          accountList: res.data,
          is_account: true
        })
      } else {
        that.setData({
          is_account: false
        })
      }
    });
  },


   



  /** 
   * 切换账户
  */
 changeAccount(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    that.setData({
      select_index:index,
      select_id:id
    })
 },

  /**
   * 跳转账户列表
   */
  accountList(e){
    wx.navigateTo({
      url: '../../account/accountList/accountList',
    })
  },
  /**
   * 提现记录
   */
  recordList(e){
    wx.navigateTo({
      url: '../recordList/recordList',
    })
  },
  //提现金额
  moneyInput: function (e) {
    var that = this;
    that.setData({
      money: e.detail.value
    })
  },

//提交
submit: function () {


  var that = this;
  var aid = that.data.select_id;//账户
  var money = that.data.money;//提现金额
  //查看有无可提现账户
  // if (!that.data.is_account) {
  //   wx.showModal({
  //     title: '提示',
  //     content: '请先添加账户信息！',
  //     showCancel: false,
  //     confirmColor: '#F7971F',
  //     success: function (res) {
  //
  //     }
  //   })
  //   return false;
  // }
  if (money == '' || money <= 0) {
    wx.showModal({
      title: '提示',
      content: '请输入有效的提现金额',
      showCancel: false,
      confirmColor: '#F7971F',
      success: function (res) {

      }
    })
    return false;
  }

  if (parseFloat(money) > parseFloat(that.data.balance_fee)) {
    wx.showModal({
      title: '提示',
      content: '您输入的金额大于账户余额了！',
      showCancel: false,
      confirmColor: '#F7971F',
      success: function (res) {

      }
    })
    return false;
  }

  // if (aid == '') {
  //   wx.showModal({
  //     title: '提示',
  //     content: '请选择要提现的账户！',
  //     showCancel: false,
  //     confirmColor: '#F7971F',
  //     success: function (res) {
  //
  //     }
  //   })
  //   return false;
  // }
  if(isCanClick == false){
    return;
  }else{
    isCanClick = false;
  }
  wx.showLoading();
  tools.httpClient('home/WxApp/cashApply', {
    money: money,
    aid: aid,
    user_id:userInfo.id,
    type:type //提现类型
  }, (error, res) => {
    isCanClick = true;
    wx.hideLoading();
    if (res.errorCode == 0) {
      wx.showModal({
        title: '提示',
        content: '您已成功提交，请等待审核！',
        showCancel: false,
        confirmColor: '#F7971F',
        success: function (res) {
          if (res.confirm) {
            //that.getDistributorInfo();
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: res.errorInfo,
        showCancel: false,
        confirmColor: '#F7971F',
        success: function (res) {

        }
      })
    }
  });

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
  
 


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

  }

});
