var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
//页面初始化数据
var page = 1;
var pageSize = 6;
var allPages = 0;
// var get_info = "正在加载中..";//加载提示 正在加载中 下拉加载更多 没有更多了
var state = ''; //订单状态
var tem_id; //待处理订单的id
var optionData = '';

// 获取数据
var GetList = function(that,tag = 0) {

  wx.request({
    url: base_url + 'home/WxService/pagingUserGoods',
    data: {
      pageIndex: page,
      pageSize: pageSize,
      user_id: userInfo.id,
    },
    success: function(res) {
      //   console.log(res, 'res');
      var dataList = res.data.data.dataList;
      //   console.log(dataList, 'order_state');
      allPages = res.data.data.pageInfo.all_pages;
      if(tag == 1){
        var	list = [];
      }else{
        var list = that.data.list;
      }
      var bottom_text = '~~上拉加载更多~~';
      for (var i = 0; i < dataList.length; i++) {
        if (dataList[i].add_time){
          dataList[i].add_time = dataList[i].add_time.substring(0, 10);
        }
        list.push(dataList[i]);
      }
      if (allPages <= page) {
        bottom_text = '~~暂无更多数据~~';
      }
      that.setData({
        list: list,
        bottom_text: bottom_text
      });
      page++;
      wx.hideLoading()
    }
  });
}

Page({
  data: {
    headerBgOpacity: 0,
    base_url: base_url,
    list: [],
    bottom_text:'加载中'
  },

  onLoad: function(options) {
    var that = this;
    
    userInfo = wx.getStorageSync('userInfo');
    optionData = options;

  },
  //重置分页
  onUnload: function(data) {
    page = 1;
    pageSize = 6;
    allPages = 0;
    this.setData({
      list: [],
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.showLoading({
      title: '',
    })
    var that = this;
    page = 1;
    allPages = 0;
    that.setData({
      list: []
    });
    that.getUserInfo();
    GetList(that);
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
          userInfo:userInfo
        })
      }else{
        that.setData({
          userInfo:userInfo
        })
      }
    })
  },

  /**
   * 触底加载
   */
  onReachBottom: function(options) {
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      GetList(that);
    }
  },


  /**
   * 跳转核销页面
   */
  writeOff(event){
    var oid = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/service/writeOffService/writeOffService?id=${oid}`
    });
  },

  // 跳转到订单详情页
  orderDetail: function (e) {
    console.log(e);
    var oid = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: '/pages/service/serviceDetail/serviceDetail?id=' + oid
    });
  }
})
