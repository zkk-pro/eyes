var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var wx_login = require('../../../utils/wxLogin.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var page = 1;//分页显示 当前页
var pageSize = 3;//一页显示的评论的数量
var totalPage = 0;//总页数
var gid = 0;
var did = 0;
var loading = true;//是否可触发滚动加载
var goodsInfo = {};
var shareId = 0;

Page({
    data: {
        base_url: base_url,
        current: 0,//记录当前tab的index
        list: [],
        count: 1,//商品数量，默认为1

        maskHidden: true,
        img_height: wx.getSystemInfoSync().windowWidth,//轮播图高度
        showCommission:0,
        show_sale:0,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.showLoading();
        //获取到商品id
        gid = options.gid ? options.gid : 1;
        shareId = options.shareId ? options.shareId : 0;
        userInfo = wx.getStorageSync('userInfo');
        //获取商品详情
        wx.request({
            url: base_url + 'home/WxService/getGoodsDetail',
            data: {gid: gid,user_id:userInfo.id},
            method: 'GET',
            success: function (res) {
                var data = res.data.data;
                if (!data.detail_desc) {
                    data.detail_desc = "<view style='text-align: center'>暂无信息</view>"
                }
                data.detail_desc = tools.richReplaceImg(data.detail_desc);
                goodsInfo = data;

                that.setData({
                    show_sale:goodsInfo.show_sale,
                    goodsInfo: data,
                    propertyPrice: data.price,
                    singlePrice: data.price,
                    inventory: data.inventory,
                });
                setTimeout(function() {
                    wx.hideLoading()
                },300)
                
            }
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        setTimeout(function (){
            userInfo = wx.getStorageSync('userInfo');
            if(userInfo.id){
                that.getUserInfo();
            }
        },100)
    },

    /**
     * 生命周期函数--监听页面关闭
     */
    onUnload: function () {
        page = 1;

    },

    onHide:function (){

    },

    /**
     * 加载更多
     */
    loadMore: function (options) {

    },
    /*
    * 商品数量操作
    */
   goodsCount: function (e) {
       var that = this;
       //获取操作类型 0减少商品数量 1增加商品数量 最少为1
       var optType = e.currentTarget.dataset.type;
       //获取到默认的商品数量
       var goodsCount = that.data.count;
       if (optType == 1) {
           goodsCount++;
           var price = (goodsCount * Number(that.data.singlePrice)).toFixed(2);
           that.setData({count: goodsCount, propertyPrice: price});
       } else {
           goodsCount--;
           if (goodsCount < 1) {
               goodsCount = 1;
           }
           var price = (goodsCount * Number(that.data.singlePrice)).toFixed(2);
           that.setData({count: goodsCount, propertyPrice: price});
       }

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
            showCommission:userInfo.is_distributor == 1 ? 1 : 0
        })
      }else{
        that.setData({
          userInfo:userInfo
        })
      }
    })
},
    /**
     * 分享
     */
    share(){
        tools.isWxLogin(function(res){
            wx.navigateTo({
            url: '/pages/goodShare/goodShare?type=9&gid='+gid,
            })
        })
    },

    /**
     * 关闭多规格弹层
     */
    offMask: function () {
        this.setData({maskHidden: true});
    },

    /**
     * 打开弹层
     */
    onMask: function () {
        this.setData({maskHidden: false});
    },

    /**
     * 点击操作 加入购物车/立即购买
     */
    operator: function (e) {
      var that = this;
      tools.isWxLogin(function(res) {
		if(res){
            //判断属性弹层是否打开 如果是打开的判断属性是否选择完全
            if (that.data.maskHidden) {
                that.setData({maskHidden: false});
            } else {
                var value = [];
                if (isInventory(that.data) == false) {
                    //判断库存是否足够
                    wx.showToast({
                        title: '库存不足',
                        icon: 'none',
                        duration: 2000
                    })
                    return false;
                } else {
                    //获取商品信息
                    var gid = that.data.goodsInfo.id;
                    var account = userInfo.account;
                    var goods_count = that.data.count;
                    var gids = gid;
                    var counts = goods_count;
                    wx.navigateTo({
                        url: '../comfirmOrder/comfirmOrder?gids=' + gids + '&counts=' + counts + '&shareId='+shareId,
                    })

                }
            }
        }
	  });//判断用户是否登录
  },

    
 //跳转首页
 goIndex: function (e) {
    var that = this;
    wx.reLaunch({
        url: '/pages/index/index',
    })
},
    

    /**
     * 转发
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: this.data.goodsInfo.name,
            path: '/pages/service/goodsDetail/goodsDetail?gid='+gid+'&user_id='+userInfo.id+'&shareId='+shareId,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    }
});

/**
 * 判断库存
 */
function isInventory(data) {
    //库存
    var inventory = Number(data.inventory);
    //购物车数量
    var count = Number(data.count);
    if (inventory >= count) {
        return true;
    } else {
        return false;
    }
};