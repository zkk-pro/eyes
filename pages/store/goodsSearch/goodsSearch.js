var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var fir = 0;
var firCid = 0;
var cid = 0;//分类id
var page = 1;
var pageSize = 6;
var allPages = 0;
var keywords = '';
let type = 0;
var pagingGoods = function(that) {
  wx.request({
    url: base_url + 'home/WxStore/pagingGoods',
    data: {
      keywords:keywords,
      pageIndex: page,
      pageSize: pageSize,
    },
    method: 'GET',
    success: function(res) {
      var data = res.data.data;
      var dataList = data.dataList;  
      var list = that.data.list;
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
        bottom_text:bottom_text
      });
      // console.log( that.data.list )
      page++;
    }
  })
};

Page({
  data: {
    base_url: base_url,
    list: [],
    cur: -1,
    bottom_text:'加载中',
    showCommission:0,
    keywords:keywords
  },

  onLoad: function(options) {
    var that = this;
    type = options.type ? options.type : 0;
    userInfo = wx.getStorageSync('userInfo');
  },


  onShow:function(){
    var that = this;
    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
      if(userInfo.id){
          that.getUserInfo();
          that.getOptometristByUserId(that);
      }
  },100);
    if(type == 1){
      keywords = "";
    }
    that.setData({
      list: [],
      keywords:keywords
    });
    page = 1;
    pagingGoods(that);
  },

  /**
   * 获取商家信息
   */
  getOptometristByUserId(that) {
    tools.httpClient('home/WxApp/getOptometristByUserId', {user_id: userInfo.id ? userInfo.id : -1}, (error, data) => {
      if (data.errorCode == 0) {
        that.setData({
          showCommission: 1
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
        // that.setData({
        //   showCommission:userInfo.is_distributor == 1 ? 1 : 0
        // })
      }
    })
},
  
  /**
   * 生命周期函数--监听页面关闭
   */
  onUnload: function() {
    type = 0;
  },
  /**
   * 生命周期函数--监听页面关闭
   */
  onHide: function () {
    type = 0;
  },

  /**
   * 商品搜索
   */
  searchGoods(e){
    var that = this;
    keywords = e.detail.value;
    that.setData({
      list: []
    });
    page = 1;
    pagingGoods(that);
  },


  /**
   * 触底加载
   */
  onReachBottom: function() {
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      pagingGoods(that);
    }
  },


  /**
   * 跳转商品详情
   */
  goodsDetail: function(e) {
    var that = this;
    var gid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goodsDetail/goodsDetail?gid=' + gid + '&is_buy=1',
    })

  }
})
