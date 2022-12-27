var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo =  wx.getStorageSync('userInfo');
var fir = 0; 
var firCid = 0;
var cid = 0;//分类id
var page = 1;
var pageSize = 6;
var allPages = 0;
var firName = '我的收藏';
var isRefresh = 0;
var get_type = 0;//   进入类型
var pagingGoods = function(that,type = 0) {
	wx.request({
		url: base_url + 'home/WxStore/getCollection',
		data: {
      user_id:userInfo.id,
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
				bottom_text:bottom_text
			});
			// console.log( that.data.list )
			page++;
		}
	})
};

Page({
	data: {
		headerBgOpacity: 0,
		base_url: base_url,
		hidden: true, //输入框关闭按钮默认不显示
		list: [],
    cur: -1,
    secCategory:[],//二级分类列表
    firCategory:[],//一级分类列表
    secCur:0,//二级导航选中
    bottom_text:'加载中',
    isShowFirBox:0,//是否显示一级分类弹框
    showCommission:0
	},

	onLoad: function(options) {
    var that = this;
    fir = options.fir ? options.fir : '';
    firCid = options.firCid ? options.firCid : 0;
    isRefresh = options.isRefresh ? options.isRefresh : 0;
    get_type = options.type;
    page = 1;
    that.setData({
      fir:fir,get_type:get_type
    })
    // firName = options.firName ? options.firName : '';
    that.setNavTitle('我的收藏');//设置顶部标题
    if(isRefresh != 1){//来自首页不刷新
      pagingGoods(that);//获取商品
    }
   
		userInfo = wx.getStorageSync('userInfo');
	},
  onShow:function(){
    var that = this;
    if(isRefresh == 1){//来自首页刷新
      isRefresh = 0;
      cid = 0;
      that.setData({
        list: []
      });
      pagingGoods(that);//获取商品
    }

    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
      if(userInfo.id){
          that.getUserInfo();
      }
    },100)
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
          showCommission:userInfo.is_distributor == 1 ? 1 : 0
        })
      }
    })
  },

  /**
   * 设置页面标题
   */
  setNavTitle(firName){
     wx.setNavigationBarTitle({
       title: '我的收藏',
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
   * 防止冒泡
   */
  emptyEvent(){

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
