// pages/goodsList/goodsList.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url: base_url,
    account_type: 0,//  0支付宝 1银行卡
    name: '',//姓名
    account: '',//帐号,
    account_bank: '',//银行卡
    typeArray: ['微信', '银行卡','支付宝'],//性别数组
    typeIndex: 0,// 0支付宝 1银行卡
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
  },

  //选择类型
  bindPickerChange: function (e) {
    this.setData({
      typeIndex: e.detail.value,
      account_type: e.detail.value
    })
  },

  //姓名
  nameInput: function (e) {
    var that = this;
    that.setData({
      name: e.detail.value
    })
  },

  //账户
  accountInput: function (e) {
    var that = this;
    that.setData({
      account: e.detail.value
    })
  },

  //银行
  bankInput: function (e) {
    var that = this;
    that.setData({
      account_bank: e.detail.value
    })
  },

  //添加账户
  submit: function () {
    var that = this;
    var account_type = that.data.account_type;
    var name = that.data.name;
    var account = that.data.account;
    var account_bank = that.data.account_bank;
    var user_id = userInfo.id;
    if (name == '' || account == '') {
      wx.showModal({
        title: '提示',
        content: '请完善信息！',
        showCancel: false,
        confirmColor: '#FFAA14',
        success: function (res) {

        },
      })
      return false;
    }
    //判断如果是银行卡
    if (account_type == 1 && account_bank == '') {
      wx.showModal({
        title: '提示',
        content: '请完善信息！',
        showCancel: false,
        confirmColor: '#FFAA14',
        success: function (res) {

        },
      })
      return false;
    }
    wx.showLoading();
    tools.httpClient('home/WxApp/addAccount', {
      'user_id': user_id,
      'account_type': account_type,
      'name': name,
      'nick_name': userInfo.nick_name,
      'account': account,
      'account_bank': account_bank,
    }, (error, res) => {
      wx.hideLoading();
      if (res.errorCode == 0) {//添加成功
        wx.showModal({
          title: '提示',
          content: '恭喜您！添加成功！',
          showCancel: false,
          confirmColor: '#FFAA14',
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack();
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorInfo,
          showCancel: false,
          confirmColor: '#FFAA14',
          success: function (res) {

          }
        })
      }
    });
  }

})