// pages/fen/commissionRecord/commissionRecord.js
var wx_login = require('../../../utils/wxLogin.js');
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var userInfo = "";
var base_url = CONFIG.API_URL.BASE_URL;
//页面初始化数据
var page = 1;
var pageSize = 10;
var allPages = 0;
var render = function (that) {
  tools.httpClient('home/WxApp/pagingCashRecord', {
    user_id: userInfo.id,
    pageIndex: page,
    pageSize: pageSize
  }, (error, res) => {
    var dataList = res.data.dataList;
    allPages = res.data.pageInfo.all_pages;
    if (page >= allPages) {
      that.setData({
        getMore: '~~没有更多了~~'
      })
    } else {
      that.setData({
        getMore: '~~上拉加载更多~~'
      })
    }
    var list = that.data.list;
    for (var i = 0; i < dataList.length; i++) {
      list.push(dataList[i])
    }
    that.setData({
      list: list,
    });
    page++;
  });
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url: base_url,
    did:'',//分销商主键
    list: [],//奖金记录
    getMore: '~~加载中~~',
    showMask:false,//详情显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
   
    //查询师傅管理
    page = 1;
    allPages = 0;
    that.setData({
      list: [],
    })
    render(that);

  },

  //点击查看详情
  getOrderInfo:function(e){
    var that = this;
    var oid = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    var money = e.currentTarget.dataset.money;
    var order_time = e.currentTarget.dataset.time;
    if(type != 1 && type != 2 && type != 3 && type != 4){
        return;
    }
    var url = '';
    if(type == 1){//商城
      url = 'home/WxStore/findOrder';
    }else if(type == 2){//秒杀
      url = 'home/WxRob/findOrder';
    }else if(type == 3){//抽奖
      url = 'home/WxReward/findOrder';
    }else if(type == 4){//用户充值
      url = 'home/WxApp/findRechargeOrder';
    }

    //获取订单信息
    wx.showLoading();
    tools.httpClient(url, {
      oid: oid
    }, (error, res) => {
      wx.hideLoading();
      console.log(res);
      let goodsName = [];
      let count = 0;
      let totalPrice = 0;
      if(type != 4){
        let goodsList = res.data.goods_list;
        for(let i = 0;i < goodsList.length;i++){
          goodsName.push(goodsList[i]['goods_name']);
          count += parseInt(goodsList[i]['count']);
        }
        totalPrice = Number( parseFloat(res.data.total_price) +  parseFloat(res.data.balance_fee) );
      }else{
        totalPrice = res.data.money;
      }
      that.setData({
        showMask:true,
        user_name: res.data.nick_name,
        money: money,
        service_name:goodsName.join(","),
        counts: count,
        order_num: res.data.order_num,
        total_price:totalPrice,
        order_time: res.data.add_time,
        return_time: order_time,
        type:type
      })
    });

  },

  //关闭弹框
  closeMask:function(){
    this.setData({
      showMask:false
    })
  },

  //空事件
  emptyEvent(){

  },
  
	/**
     * 触底加载
     */
  onReachBottom: function () {
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      render(that);
    }
  },




})