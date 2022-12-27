var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var page = 1;
var pageSize = 12;
var allPages = 0;
var latitude = '';
var longitude = '';
var height = 0;
var pagingOptometrist = function(that) {
  wx.request({
    url: base_url + 'home/WxApp/pagingOptometrist',
    data: {
      longitude:longitude,
      latitude:latitude,
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
    bottom_text:'加载中',
    isUseOther:0//是否显示其他配置项
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
   
    if(app.globalData.type==1){
      height = 34;
    }
    let nav_active = {
      index:'',
      cart: '',
      reserve:'',
      setting: '',
      optometrist: 'active',
      center: '',
      base_url:base_url,
      height:height,
      isUseOther:0,
      isBusiness:0,
      isShowBusiness:0,
    };
    that.setData({
      nav_active: nav_active
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow:function(){
    var that = this;

    tools.getLocation(function (error,data){
      if(data){
        latitude = data.latitude;
        longitude = data.longitude;
        wx.setStorageSync("area",{
          "latitude":latitude,
          "longitude":longitude
        })
        that.setData({
          list: []
        });
        page = 1;
        pagingOptometrist(that);
      }else{
        that.setData({
          list: []
        });
        page = 1;
        pagingOptometrist(that);
      }
    })
    that.getOtherConfig();//获取其他显示配置
    userInfo = wx.getStorageSync('userInfo');
    that.getOptometristByUserId(that);
    that.getShowBusinessConfig();
  },


  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
        let nav_active = that.data.nav_active;
        nav_active['isBusiness'] = 1;
        that.setData({
          nav_active: nav_active
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
        let nav_active = that.data.nav_active;
        nav_active['isUseOther'] = data.data;
        that.setData({
          isUseOther:data.data,
          nav_active: nav_active
        })
      }
    })
  },

  /**
   * 获取其他配置
   */
  getShowBusinessConfig(){
    var that = this;
    tools.httpClient('home/WxApp/getShowBusinessConfig',{},(error,data)=>{
      if(data.errorCode == 0){
        let nav_active = that.data.nav_active;
        nav_active['isShowBusiness'] = data.data;
        that.setData({
          nav_active: nav_active
        })
      }
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
   * 打电话
   */
  call(e){
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  /**
   * 打开定位
   */
  openLocation(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var list = that.data.list;
    wx.openLocation({
      latitude: parseFloat( list[index]['latitude']),
      longitude: parseFloat( list[index]['longitude']),
      address: list[index]['address'],
      success(res){
        console.log(res,'success');
      },
      fail(res){
        console.log(res,'fail');
      }
    })

  },


  /**
   * 触底加载
   */
  onReachBottom: function() {
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      pagingOptometrist(that);
    }
  }

})
