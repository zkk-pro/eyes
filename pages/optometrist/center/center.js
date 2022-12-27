// pages/index/index.js
var wx_login = require('../../../utils/wxLogin.js');
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    optometristInfo:''
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

    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
      // if(userInfo.id){
        that.getOptometristByUserId(that);
      // }
    },100)
  },

  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    console.log(userInfo.id);
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
          that.setData({
            optometristInfo:data.data
          });

      }else{
        //无商家信息返回登录页面
       wx.redirectTo({
         url:'../index/index'
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
   * 页面跳转
   */
  jumpPage(e){
     let type = e.currentTarget.dataset.type;
     let name  = this.data.optometristInfo.name;
     let phone  = this.data.optometristInfo.phone;
     let address  = this.data.optometristInfo.address;
     let license  = this.data.optometristInfo.license ? this.data.optometristInfo.license :'';
    let page = {
       "edit":'../editOptometrist/editOptometrist',
       "applyWithdrawal":"/pages/optometrist/autoRecord/autoRecord",
       "writeoff":'../writeOff/writeOff',
       "agreeRule" : `../agreementImg/agreementImg?name=${name}&phone=${phone}&address=${address}&license=${license}`
     };
     wx.navigateTo({
       url:page[type]
     })
  },


  /**
   * 核销
   */
  scanCode(){
    wx.scanCode({
      success (res) {
          console.log(res)
       wx.navigateTo({
           url:res.path
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