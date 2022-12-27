var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
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
var   frameIds = '',
      circleIds = '',
      materialIds = '',
      sizeIds = '',
      priceAreaId = 0,
      colorIds = '';

var pagingGoods = function(that) {
  wx.request({
    url: base_url + 'home/WxStore/pagingGoods',
    data: {
      frameIds : frameIds,
      circleIds : circleIds,
      materialIds : materialIds,
      colorIds : colorIds,
      priceAreaId:priceAreaId,
      sizeIds : sizeIds,
      pageIndex : page,
      pageSize : pageSize,
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
  },

  onLoad: function(options) {
    var that = this;
    frameIds = options.frameIds,
    circleIds = options.circleIds,
    materialIds = options.materialIds,
    colorIds = options.colorIds;
    sizeIds = options.sizeId;
    priceAreaId = options.priceAreaId ? options.priceAreaId : 0;
    that.setData({
      list: []
    });
    page = 1;
    pagingGoods(that);
    userInfo = wx.getStorageSync('userInfo');
  },


  onShow:function(){
    var that = this;
   
  },
  
  /**
   * 生命周期函数--监听页面关闭
   */
  onUnload: function() {

  },
  /**
   * 生命周期函数--监听页面关闭
   */
  onHide: function () {

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
      url: '../store/goodsDetail/goodsDetail?gid=' + gid,
    })

  }
})
