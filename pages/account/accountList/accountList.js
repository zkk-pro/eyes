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
    accountList: [],//账户信息
    is_account: false,//true表示有账户
    select_id: '',//选择的账户id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');

  },

  onShow: function () {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    if(userInfo.id > 0){
      that.getAccountList();
    }
   
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

  //选择账户
  selectAccount: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    that.setData({
      select_id: id
    })
  },

  //编辑账户信息
  editAccount: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../editAccount/editAccount?id=' + id,
    })
  },

  //添加账户
  addAccount: function () {
    var that = this;
    wx.navigateTo({
      url: '../addAccount/addAccount',
    })
  },

  //删除账户
  deleteAccount: function () {
    var that = this;
    if (that.data.select_id == '') {//无选择的值
      wx.showModal({
        title: '提示',
        content: '请选择要删除的账户！',
        showCancel: false,
        confirmColor: '#FFAA14',
        success: function (res) {

        }
      })
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '确定要删除账户么？',
      showCancel: true,
      confirmColor: '#FFAA14',
      success: function (res) {
        if (res.confirm) {
          tools.httpClient('home/WxApp/deleteAccount', { id: that.data.select_id }, (error, res) => {
            if (res.errorCode == 0) {
              that.getAccountList(that.data.distributor_id);
            } else {
              wx.showModal({
                title: '提示',
                content: res.errorInfo,
                showCancel: 'false',
                confirmColor: '#FFAA14',
                success: function (res) { }
              })
            }
          });
        }
      }
    })
  }

})