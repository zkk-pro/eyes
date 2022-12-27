var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var userInfo = '';//获取缓存中的用户信息 
var base_url = CONFIG.API_URL.BASE_URL;
Page({
  data: {
    base_url: base_url,
    addressList: [],//地址列表
  },

  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
  },

  onShow: function () {
    var that = this;
    that.getAddressList();//获取地址列表
  },

  //获取所有地址
  getAddressList: function () {
    var that = this;
    tools.httpClient('home/WxApp/addressList', { id: userInfo.id }, (error, res) => {
      if (res.errorCode == 0) {//有新消息
        that.setData({
          addressList: res.data
        });
      }
    });
  },

  //设置默认地址
  setDefaultAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    if (that.data.addressList[index].is_default == '1') {//已经是默认地址
      return false;
    }
    wx.showLoading();
    tools.httpClient('home/WxApp/setDefaultAddress', { id: id, user_id: userInfo.id }, (error, res) => {
      wx.hideLoading();
      if (res.errorCode == 0) {//有新消息
        that.setData({
          addressList: []
        })
        that.getAddressList();
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorInfo,
          showCancel: false,
          confirmColor: '#FA8B55',
          success: function (res) {

          }
        })
      }
    });
  },

  //编辑地址
  editAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../editAddress/editAddress?id=' + id,
    })
  },

  //删除地址
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: "确定要删除地址么",
      showCancel: true,
      confirmColor: '#FF4401',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          tools.httpClient('home/WxApp/deleteAddress', { id: id }, (error, res) => {
            wx.hideLoading();
            if (res.errorCode == 0) {//有新消息
              that.setData({
                addressList: []
              })
              that.getAddressList();
            } else {
              wx.showModal({
                title: '提示',
                content: res.errorInfo,
                showCancel: false,
                confirmColor: '#FA8B55',
                success: function (res) {

                }
              })
            }
          });
        } else if (res.cancel) {

        }
      }
    })
  },

  //点击添加地址
  addAddress: function () {
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },
})
