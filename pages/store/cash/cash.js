const { data } = require('../../../utils/area.js');
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
var firName = '';
var isRefresh = 0;
var get_type = 0;//   进入类型

var pagingGoods = function(that,type = 0) {
  console.log("needhere",cid)
	wx.request({
		url: base_url + 'home/WxStore/pagingGoods',
		data: {
      cid: cid,
      type:get_type,
      user_id:userInfo.id,
      firCid:firCid,
			pageIndex: page,
			pageSize: pageSize,
		},
		method: 'GET',
		success: function(res) {
      console.log(res.data);
      if(res.data.errorCode != 0) {
          wx.navigateTo({
          url: '../../index/index'
        })
      }
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

    let nav_active = {
      index: '',
      cart: '',
      reserve: '',
      setting: '',
      optometrist: '',
      center: '',
      base_url: base_url,
      height: 34,
      isUseOther: 0,
      isBusiness: 1,
      isDistribution: 1,
      isShowBusiness: 0,
    };
    that.setData({
      nav_active: nav_active
    });

    fir = options.fir ? options.fir : '';
    firCid = options.firCid ? options.firCid : 0;
    isRefresh = options.isRefresh ? options.isRefresh : 0;
    get_type = options.type;
    that.setData({
      fir:fir,get_type:get_type
    })
    firName = options.firName ? options.firName : '';
    that.setNavTitle(firName);//设置顶部标题
    // that.getFirCategory();//获取所有的一级分类
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
      that.getFirCategory();//获取所有的一级分类
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
       title: firName,
     })
  },

  /**
   * 获取所有的一级分类
   */
  getFirCategory(){
      var that = this;
      tools.httpClient('home/WxStore/getAllFirCategory',{},(error,data)=>{
         if(data.errorCode == 0){
          // fir = fir != '' ? fir : data.data[0].fir;
          // firCid = firCid > 0 ? firCid  : data.data[0].id;
          that.setNavTitle(firName != '' ? firName : '全部' );//设置顶部标题
            that.setData({
              // fir:fir,
              // secCur:data.data[0].id,
              firCategory:data.data
            })
            that.getSecCategory();//获取所有的二级分类
         }
      })
  },


  /**
   * 获取一级分类下所有二级分类
   */
  getSecCategory(){
    var that = this;
    that.setData({
      list: []
    });
    page = 1; 
    tools.httpClient('home/WxStore/getAllFirCategory',{fir:fir},(error,data)=>{
        if(data.errorCode == 0){
            that.setData({
              secCategory:data.data
            })
            pagingGoods(that);
        }else{
          that.setData({
            secCategory:[]
          })
          pagingGoods(that);
        }
    });
  },



	/**
	 * 生命周期函数--监听页面关闭
	 */
	onUnload: function() {
    console.log("cloesehere",cid)
	},
  /**
 * 生命周期函数--监听页面关闭
 */
  onHide: function () {
    console.log("cloesehere",cid)
  },

  /**
   * 切换二级分类
   */
  changeSec(e){
    var that = this;
    cid = e.currentTarget.dataset.id;
    firName = e.currentTarget.dataset.name;
    that.setNavTitle(firName);//设置顶部标题
    page = 1;
    that.setData({
      secCur:cid,
      list: []
    })
    pagingGoods(that,1);
  },

  /**
   * 显示一级分类弹框
   */
  showFirBox(){
      this.setData({
        isShowFirBox:1,//是否显示一级分类弹框 1显示
      })
  },

  /**
   * 关闭一级分类弹框
   */
  hiddenFirBox(){
    this.setData({
      isShowFirBox:0,//是否显示一级分类弹框 1显示
    })
  },
  /**
   * 防止冒泡
   */
  emptyEvent(){

  },

  /**
   * 切换一级分类
   */
  changeFir(e){
    var that = this;
    var name = e.currentTarget.dataset.name;
    fir = e.currentTarget.dataset.fir;
    firCid = e.currentTarget.dataset.id;
    cid = 0;//二级分类id置为0
    that.setData({
      fir:fir,
      secCur:0,
      isShowFirBox:0,//是否显示一级分类弹框 1显示
    })
    that.setNavTitle(name);//设置顶部标题
    // that.getSecCategory();//获取所有的二级分类
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
			url: '../goodsDetail/goodsDetail?gid=' + gid + '&is_buy=1&type=0',
		})
	}
})
