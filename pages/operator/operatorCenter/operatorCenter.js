// pages/index/index.js
const CONFIG = require('../../../utils/config.js');
const tools = require('../../../utils/tools.js');
//index.js
let app = getApp();
let base_url = CONFIG.API_URL.BASE_URL;
let userInfo = "";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    operatorInfo:'',
    userInfo:userInfo
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    userInfo = wx.getStorageSync('userInfo');
    that.setData({
      userInfo:userInfo
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
    let  that = this;
    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
      that.getOperatorInfo(that);
    },100)
  },

  /**
   * 获取运营信息
   */
  getOperatorInfo(that){
    tools.httpClient('home/WxApp/getOperatorInfo',{userId:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
        let operatorInfo = data.data;
        that.setData({
          operatorInfo:operatorInfo
        },function (){
          if(operatorInfo.is_use == 0){
            wx.showToast({
              title:'账号已停用',
              icon:'none',
              success(res) {
                 setTimeout(function (){
                   wx.redirectTo({
                     url:'../login/login'
                   })
                 },1500)
              }
            })
          }
        });

      }else{
        //无商家信息返回登录页面
        wx.redirectTo({
          url:'../login/login'
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
    let page = {
      "applyWithdrawal":'../applyWithdrawal/applyWithdrawal',
      "goodsList":"../goodsList/goodsList",
      "saleData":'../saleData/saleData',
    };
    wx.navigateTo({
      url:page[type]
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