// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var user_id = 0;
var acti_id = 0;
var page = 1;
var pageSize = 6;
var allPages = 0;

var pagingGoods = function(that,type = 0) {
  wx.request({
    url: base_url + 'home/WxService/pagingGoods',
    data: {
      pageIndex: page,
      pageSize: pageSize,
    },
    method: 'GET',
    success: function(res) {
      var data = res.data.data;
      var dataList = data.dataList;
      if(type == 1){//点击切换，重新渲染商品
        var list = [];
      }else{
        var list = that.data.list;
      }
      var bottom_text = '~~上拉加载更多~~';
      allPages = data.pageInfo.all_pages;
      for (var i = 0; i < dataList.length; i++) {
        list.push(dataList[i])
      }
      if (allPages <= page) {
        bottom_text = '~~没有更多啦~~';
      }
      that.setData({
        list: list,
        // bottom_text:bottom_text
      });
      setTimeout(function(){
        wx.hideLoading()
      },100)
      page++;
    }
  })
};
Page({
  data: {
    base_url: base_url,
    acti_bg: base_url + 'bg/acti_detail.png?r='+Math.random(),
    actiInfo:'',
    bottom_text:'',
    allUserRecord:[],
    totalCount:0,
    totalCommission:0,
    isServiceShow:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    user_id = options.user_id ? options.user_id : 0;
    acti_id = options.acti_id ? options.acti_id : 0;
    if (user_id > 0) {//用户id存在，则更改did的值
      wx.setStorageSync("did",user_id);
    }
    wx.setStorageSync("actiId",acti_id);//活动id存入缓存
    that.setData({
      list: []
    });
    page = 1;
    pagingGoods(that);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 跳转商品详情
   */
  goodsDetail(e){
    var gid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/service/goodsDetail/goodsDetail?gid='+gid,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;

    setTimeout(function(){
      userInfo = wx.getStorageSync('userInfo');
      that.getActiInfo(that);
      if(userInfo.id > 0){
        that.getUserInfo();

      }
    },100)
    that.getServiceConfig();
  },

 /**
   * 获取服务配置
   */
  getServiceConfig(){
    var that = this;
    tools.httpClient('home/WxApp/getServiceConfig',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          isServiceShow:data.data,
        })
      }
    })
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
        })

      }
    })
  },

  /**
   * 获取当前用户，当前活动是否有未领取的优惠券
   */
  getCurrentUserCoupon(actiId){
    var that = this;
    tools.httpClient('home/WxApp/getCurrentUserCoupon',{user_id:userInfo.id,acti_id:actiId},(error,data)=>{
      if(data.errorCode == 0){
        let parentName = data.data.parent_name;
        let couponInfo = "满"+data.data.condition_value+"减"+data.data.value;

        wx.showModal({
          title: '提示',
          content: `${parentName}邀请您立即领取${couponInfo}券`,
          showCancel: false,
          confirmText: '立即领取',
          confirmColor: '#FE8A22',
          success: function(res) {
            if (res.confirm) {
               that.returnUserCommission(couponInfo,data.data.id);
            }
          }
        })

      }
    })
  },

  /**
   * 给用户上级返现以及领取优惠券
   */
  returnUserCommission(couponInfo,couponId){
    var that = this;
    tools.httpClient('home/WxApp/returnUserCommission',{user_id:userInfo.id,acti_id:that.data.actiInfo.id,coupon_id:couponId},(error,data)=>{
      if(data.errorCode == 0){
        wx.showModal({
          title: '提示',
          content: `恭喜您获得${couponInfo}券一张，可在我的优惠券中查看`,
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#FE8A22',
          success: function(res) {
            if (res.confirm) {

            }
          }
        })
      }
    })
  },

  /**
   * 获取页面数据
   */
  allUserRecord(actiId){
    var that = this;
    tools.httpClient('home/WxApp/allUserRecord',{user_id:userInfo.id,acti_id:actiId},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          allUserRecord:data.data,
          totalCount:data.totalCount,
          totalCommission:data.totalCommission,
        })
      }
    })
  },

  /**
   * 获取首页活动信息
   */
  getActiInfo(that){
    tools.httpClient('home/WxApp/getActiInfo', {acti_id:acti_id}, (error, data) => {
      if(data.errorCode == 0){
        let actiInfo = data.data;
        if (!actiInfo.details) {
          actiInfo.details = "<view style='text-align: center'>暂无信息</view>"
        }
        actiInfo.details = tools.richReplaceImg(actiInfo.details);
        that.allUserRecord(actiInfo.id);
        that.getCurrentUserCoupon(actiInfo.id);
        that.setData({
          actiInfo:actiInfo,
        })

      }else{
        that.setData({
          bottom_text:'活动已结束，敬请期待'
        })
      }
    })
  },


  /**
   * 进入海报页面
   */
  goShare(){
    var that = this;
    tools.isWxLogin(function (res){
      if(res){
        wx.navigateTo({
          url:`../actiShare/actiShare?acti_id=${that.data.actiInfo.id}`
        })
      }
    })

  },

  /**
   * 用户登录
   */
  isLogin(){
    tools.isWxLogin(function (res){

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
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      pagingGoods(that);
    }
  },




  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var user_id = userInfo.id ? userInfo.id : 0;
    var acti_id = this.data.actiInfo.id;
    return {
      title: this.data.actiInfo.name,
      path: `pages/actiDetail/actiDetail?user_id=${user_id}&acti_id=${acti_id}`,
    }
  }

});
