var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var userInfo = '';//获取缓存中的用户信息 
var base_url = CONFIG.API_URL.BASE_URL;
Page({
  data: {
    base_url: base_url,
    id: '',//地址id
    call_name: '',//收货人
    phone: '',//联系电话
    post: '',//邮政
    address: '',//所在地区
    detail: '',//详细地址
    region: [],//地区
  },

  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    var id = options.id;
    that.setData({
      id: id,
    })
    that.getAddressInfo(id);//获取地址信息
  },

  //获取地址信息
  getAddressInfo: function (id) {
    var that = this;
    tools.httpClient('home/WxApp/getAddressById', {
      id: id
    }, (error, res) => {
      if (res.errorCode == 0) {//有新消息
        that.setData({
          call_name: res.data.call_name,
          phone: res.data.phone,
          post: res.data.post,
          address: res.data.address.city,
          detail: res.data.address.detail
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorInfo,
          showCancel: false,
          confirmColor: '#FFA402',
          success: function (res) {

          }
        })
      }
    });
  },

  //选择地区
  bindRegionChange: function (e) {
    this.setData({
      address: e.detail.value[0] + ' ' + e.detail.value[1] + ' ' + e.detail.value[2]
    })
  },

  //收货人
  nameInput: function (e) {
    var that = this;
    that.setData({
      call_name: e.detail.value
    })
  },

  //手机号码
  phoneInput: function (e) {
    var that = this;
    that.setData({
      phone: e.detail.value
    })
  },

  //邮政编码
  postInput: function (e) {
    var that = this;
    that.setData({
      post: e.detail.value
    })
  },

  //详细地址
  detailInput: function (e) {
    var that = this;
    that.setData({
      detail: e.detail.value
    })
  },

  //保存
  submit: function () {
    var that = this;
    var call_name = that.data.call_name;
    var phone = that.data.phone;
    var post = that.data.post;
    var address = that.data.address;
    var detail = that.data.detail;
    //判断信息是否填写完整
    if (call_name == '' || phone == '' || post == '' || address == '' || detail == '') {
      wx.showModal({
        title: '提示',
        content: '请完善信息！',
        showCancel: false,
        confirmColor: '#FFA402',
        success: function (res) {

        }
      })
      return false;
    }
    if (!/^\d{11}$/.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    wx.showLoading();
    tools.httpClient('home/WxApp/updateAddress', {
      id: that.data.id,
      call_name: call_name,
      phone: phone,
      post: post,
      address: address,
      detail: detail
    }, (error, res) => {
      wx.hideLoading();
      if (res.errorCode == 0) {//有新消息
        wx.showModal({
          title: '提示',
          content: '恭喜您，修改成功！',
          showCancel: false,
          confirmColor: '#FFA402',
          success: function (res) {
            wx.navigateBack();
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorInfo,
          showCancel: false,
          confirmColor: '#FFA402',
          success: function (res) {

          }
        })
      }
    });
  }
})
