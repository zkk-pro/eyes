// pages/index/index.js
var wx_login = require('../../../utils/wxLogin.js');
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var isClick = true;
var isCanSubmit = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    code_text: "获取验证码",
    phone:'',
    code:'',      //用户填入的验证码
    code_val:'',  //实际发送的验证码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 监听页面输入
   */
  listenInput(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var data = {};
    data[type] = e.detail.value;
    that.setData(data);
  },

  //获取验证码
  sendCode:function(){
    var that = this;
    tools.isWxLogin(function (res) {
      if (res) {
        if (isClick == false) {
          return false;
        } else {

          isClick = false;
        }
        var phone = that.data.phone;
        var preg = /^[0-9]{11}$/;
        if (phone == "" || phone == null || phone == undefined) {
          isClick = true;
          wx.showToast({
            title: "手机号不可为空",
            icon:'none',
            duration: 1500
          })
          return false;
        }
        if (!preg.test(phone)) {
          isClick = true;
          wx.showToast({
            title: '手机号格式不正确',
            icon: 'none',
          })
          return false;
        }
        wx.showLoading({
          title: '发送中',
        });
        tools.httpClient('home/WxApp/sendCode', { phone: phone }, (error, data) => {
          wx.hideLoading();
          if (data.errorCode == 0) {
            wx.showToast({
              title: '发送成功',
            })
            //倒计时
            var downTime = 60;
            that.setData({
              code_text: downTime + "s后重发"
            })
            var time = setInterval(function () {
              downTime--;
              that.setData({
                code_text: downTime + "s后重发"
              })
              if (downTime == 0) {
                clearInterval(time);
                that.setData({
                  code_text: "获取验证码"
                })
                isClick = true;
              }
            }, 1000)
            that.setData({
              code_val: data.data
            })
          } else {
            wx.showToast({
              title: '发送失败',
              icon: 'none',
            })
            isClick = true;
          }
        })
      }
    })

  },

  /**
   * 绑定商家
   */
  bindOptometristUser(){
    var that = this;
    tools.isWxLogin(function(res) {
      if(res){
        var phone = that.data.phone;
        var code = that.data.phoneCode;
        var code_val = that.data.code_val;
        if (phone == '' || phone == null) {
          wx.showToast({
            title: '手机号不能为空',
            icon:'none',
            duration: 1500
          });
          return false;
        }
        if (code == '' || code == null) {
          wx.showToast({
            title: '验证码不能为空',
            icon:'none',
            duration: 1500
          });
          return false;
        }

        if (code != code_val) {
          wx.showToast({
            title: '验证码不正确',
            icon:'none',
            duration: 1500
          });
          return false;
        }
        tools.httpClient('home/WxApp/bindOptometristUser',{user_id:userInfo.id,phone:phone},(error,data)=>{
          if(data.errorCode == 0){
            wx.showToast({
              title:'绑定成功',
              success(e){
                setTimeout(function() {
                  wx.navigateTo({
                    url:'../center/center'
                  })
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

      }
    })
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



})