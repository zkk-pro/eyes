const CONFIG = require('../../../utils/config.js');
const tools = require('../../../utils/tools.js');
let app = getApp();
let base_url = CONFIG.API_URL.BASE_URL;
let userInfo = "";
let isCanSubmit = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    let that = this;
    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
    },100)

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
    let that = this;
    let type = e.currentTarget.dataset.type;
    let data = {};
    data[type] = e.detail.value;
    that.setData(data);
  },

  /**
   * 绑定分销用户
   */
  loginIn(){
    let that = this;
    tools.isWxLogin(function (res){
      if(res){
        let account = that.data.account;
        let password = that.data.password;
        if(!account || !password ){
          wx.showToast({
            title:'账号或者密码不能为空',
            icon:'none'
          })
          return false;
        }
        if(!/^[0-9a-zA-Z_]+$/.test(account) || !/^[0-9a-zA-Z_]+$/.test(password) ){
          wx.showToast({
            title:'账号或者密码由字母或者数字或者_组成',
            icon:'none'
          })
          return false;
        }
        if(isCanSubmit == false){
           return false;
        }else{
          isCanSubmit = false;
        }
        wx.showLoading({
          title:'',
          mask:true
        })
        tools.httpClient('home/WxApp/operatorLogin',{userId:userInfo.id,account:account,password:password},(error,data)=>{
          if(data.errorCode == 0){
            wx.redirectTo({
              url:'/pages/operator/operatorCenter/operatorCenter'
            })
          }else{
            wx.showToast({
              title: data.errorInfo ? data.errorInfo : '网络异常',
              icon:'none'
            })
          }
          isCanSubmit = true;
          wx.hideLoading();
        })
      }
    })



  },

  /**
   * 跳过
   */
  jumpIndex(){
    wx.setStorageSync('inviteCode','00000000');
    wx.redirectTo({
      url:'/pages/index/index'
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