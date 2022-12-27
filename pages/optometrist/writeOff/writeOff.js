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
var type = 0;//0消费券 1百货 2秒杀 3抽奖
var pagingOrder = function(that,tag = 0) {
  let url = 'home/WxApp/pagingSettingOrder';
  if(type == 1){
    url = 'home/WxStore/pagingOrder';
  }else if(type == 2){
    url = 'home/WxRob/pagingOrder';
  }else if(type == 3){
    url = 'home/WxReward/pagingOrder';
  }else if(type == 4){
    url = 'home/WxService/pagingUserRecord';
  }

  wx.request({
    url: base_url + url,
    data: {
      pageIndex: page,
      pageSize: pageSize,
      optometrist_id: that.data.optometristInfo.id
    },
    method: 'GET',
    success: function(res) {
      var data = res.data.data;
      var dataList = data.dataList;
      if(tag == 1){//通过点击来的
        var list = [];
      }else{
        var list = that.data.list;
      }

      var bottom_text = '~~上拉加载更多~~';
      allPages = data.pageInfo.all_pages;
      for (var i = 0; i < dataList.length; i++) {
        if(type == 0){
          dataList[i]['frame_json_data'] = JSON.parse(dataList[i]['frame_json_data']);
          dataList[i]['optic_json_data'] = JSON.parse(dataList[i]['optic_json_data']);
        }

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
    currentTab:1,
    optometristInfo:[],
    isUseOther:0,
    isServiceShow:0
  },

  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    type = options.type ? options.type : 1;
  },


  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{

      if(data.errorCode == 0){
        that.setData({
          optometristInfo:data.data
        });
        that.setData({
          list: []
        });
        page = 1;
        pagingOrder(that);

      }else{
        //无商家信息返回登录页面
        wx.redirectTo({
          url:'../index/index'
        })
      }
    })
  },



  //点击导航
  swichNav: function(e, options) {
    var that = this;
    type = e.currentTarget.dataset.current;
    //设置页面显示样式 分页数据初始化
    that.setData({
      currentTab: type,
       list: []
    });
    page = 1;
    pagingOrder(that,1);
  },

  onShow:function(){
    var that = this;

    userInfo = wx.getStorageSync('userInfo');
    if(userInfo.id > 0){
      that.getOptometristByUserId(that);
    }

    that.getOtherConfig();//获取其他配置
    that.getServiceConfig();//获取服务配置
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
   * 获取其他配置
   */
  getOtherConfig(){
    var that = this;
    tools.httpClient('home/WxApp/getOtherConfig',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          isUseOther:data.data
        })
      }
    })
  },

  /**
   * 查看详情
   */
  orderDetail(e){
    var id = e.currentTarget.dataset.oid;
    var type = e.currentTarget.dataset.type;
    var url = `/pages/consumeDetail/consumeDetail?id=${id}`;
    if(type == 1){
      url = `/pages/orderDetail/orderDetail?id=${id}&type=0`;
    }else if(type == 2){
      url = `/pages/orderDetail/orderDetail?id=${id}&type=1`;
    }else if(type == 3){
      url = `/pages/orderDetail/orderDetail?id=${id}&type=2`;
    }else if(type == 4){
      url = `/pages/service/serviceDetail/serviceDetail?id=${id}`;
    }
    wx.navigateTo({
      url:url
    })
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
      pagingOrder(that);
    }
  }

})
