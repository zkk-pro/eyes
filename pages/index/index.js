// pages/index/index.js
var wx_login = require('../../utils/wxLogin.js');
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var timer = require('../../utils/timer.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var optometristInfo = "";
var is_show =0;
var area = "";
var did = 0;
var date = new Date();
var nowDay = date.toLocaleDateString();//获取今天时间
var intval = '';//定时器
var start_down = '';
var height = 0;
var into = 0;
/**
 * 倒计时
 */
var countDown = function (that) {
    if (start_down) { // 清除之前的倒计时
        clearInterval(start_down)
    }
    var robGoods = that.data.robGoods;

    start_down = setInterval(function () {
        for (var item in robGoods) {
            robGoods[item].finish_time = timer.down(robGoods[item].end_date, null, 0);
        }
        that.setData({
            robGoods: robGoods
        })
    }, 1000);


};

Page({

    /**
     * 页面的初始数据
     */
    data: {
        base_url: base_url,
        slideList: [],
        currentItemId: 0,
        categoryList: [],
        autopPlay: 1,
        rewardGoods: [],
        robGoods: [],
        storeGoods: [],
        storeRankingGoods:[],
        serviceGoods: [],
        parentUser: '',
        adImg: '',
        adSecond: 0,
        showAd: 0,
        showCommission: 0,
        actiInfo: '',//活动信息
        showActiInfo: 0, //是否显示活动的标识
        isUseOther: 0,//是否显示其他配置项
        isServiceShow: 0,//锦鲤卡是否显示
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // wx.showLoading({
        //   title: '加载中',
        // })
        var that = this;
        if (app.globalData.type == 1) {
            height = 34;
        }
        let nav_active = {
            index: 'active',
            cart: '',
            reserve: '',
            setting: '',
            optometrist: '',
            center: '',
            base_url: base_url,
            height: height,
            isUseOther: 0,
            isBusiness: 0,
            isDistribution: 0,
            isShowBusiness: 0,
        };
        that.setData({
            nav_active: nav_active
        })

        did = wx.getStorageSync('did');
        if (options.user_id == undefined || options.user_id == '') {
            did = did ? did : 0;
        } else {
            //判断缓存的did 是否与页面传过来的did 一致
            if (did != options.user_id) {
                did = options.user_id;
            }
        }
        //存到缓存中去
        wx.setStorage({
            key: "did",
            data: did
        })
        that.getSlideList(that);//获取幻灯片
        that.getCategoryList(that);//获取分类
        that.getRewardRecommend(that);//获取抽奖产品
        that.getRobRecommend(that);//获取秒杀产品
        that.getServiceRecommend(that);//获取服务产品
        that.getStoreRecommend(that);//获取百货商城的商品
        that.getStoreRanking(that);//获取排行榜商品
    },

    /**
     * 获取幻灯片
     */
    getSlideList(that) {
        tools.httpClient('home/WxApp/getAllSlide', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    slideList: data.data
                })
            }
        })
    },

    /**
     * 核销
     */
    scanCode() {
        wx.scanCode({
            success(res) {
                console.log(res)
                wx.navigateTo({
                    url: res.path
                })

            }
        })
    },

    /**
     * 获取首页活动信息
     */
    getActiInfo(that) {
        tools.httpClient('home/WxApp/getActiInfo', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    actiInfo: data.data,
                    showActiInfo: 1
                })
            }
        })
    },

    /**
     * 关闭活动遮罩层
     */
    closeActi() {
        this.setData({
            showActiInfo: 0
        })
    },

    /**
     * 跳转活动
     */
    actiDetail() {
        wx.navigateTo({
            url: '../actiDetail/actiDetail'
        })
    },

    /**
     * 获取分类列表
     */
    getCategoryList(that) {
        tools.httpClient('home/WxStore/getAllFirCategory', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    categoryList: data.data
                })
            }
        })
    },

    /**
     * 获取首页推荐的百货产品
     */
    getStoreRecommend(that) {
        tools.httpClient('home/WxStore/getRecommendGoods', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    storeGoods: data.data
                })
            }
        })
    },
     /**
     * 获取首页排行榜商品
     */
    getStoreRanking(that) {
        tools.httpClient('home/WxStore/getRanking', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    storeRankingGoods: data.data
                })
            }
        })
    },

    /**
     * 获取首页推荐的抽奖产品
     */
    getRewardRecommend(that) {
        tools.httpClient('home/WxReward/getRecommendGoods', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    rewardGoods: data.data
                })
            }
        })
    },

    /**
     * 获取首页推荐的抽奖产品
     */
    getServiceRecommend(that) {
        tools.httpClient('home/WxService/getRecommendGoods', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    serviceGoods: data.data
                })
            }
        })
    },

    /**
     * 获取首页推荐的秒杀产品
     */
    getRobRecommend(that) {
        tools.httpClient('home/WxRob/getRecommendGoods', {}, (error, data) => {
            if (data.errorCode == 0) {

                var robGoods = data.data;
                that.setData({
                    robGoods: robGoods
                }, function () {
                    countDown(that);
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        setTimeout(function () {
            userInfo = wx.getStorageSync('userInfo');
            if (userInfo.id) {
                that.getParentUserInfo();
                that.getUserInfo();
                that.getOptometristByUserId(that);
            }
        }, 100)
        that.getConfig();//获取配置信息
        countDown(that);
        that.setData({
            autopPlay: 1,
        });
        that.getActiInfo(that);//获取首页活动
        that.getOtherConfig();//获取其他配置
        that.getServiceConfig();//获取锦鲤卡配置
        that.getShowBusinessConfig();//获取底部商家是否显示
    },

    /**
     * 获取商家信息
     */
    getOptometristByUserId(that) {
        tools.httpClient('home/WxApp/getOptometristByUserId', {user_id: userInfo.id ? userInfo.id : -1}, (error, data) => {
            if (data.errorCode == 0) {
                optometristInfo = data.data;
                wx.setStorageSync('optometristInfo', optometristInfo);
                wx.setStorageSync('is_show', 1);
                let nav_active = that.data.nav_active;
                nav_active['isBusiness'] = 1;
                that.setData({
                    optometristInfo : optometristInfo,
                    is_show:1,
                    nav_active: nav_active,
                    showCommission: 1
                })
                var into = wx.getStorageSync('into');
                if(optometristInfo.is_join == 1 && into != 1) {
                    wx.setStorageSync('into', 1);
                    wx.navigateTo({
                        url: '/pages/store/distribution/distribution?type=1'
                    })
                }
            }
        })
    },

    /**
     * 获取配置
     */
    getConfig() {
        clearInterval(intval);
        var that = this;
        tools.httpClient('home/WxApp/getConfig', {}, (error, data) => {
            if (data.errorCode == 0) {
                var lastDay = wx.getStorageSync('lastday');
                var showModalAd = 0;
                if (lastDay != nowDay && data.data.is_use_index_ad == 1) {
                    showModalAd = 1;
                }
                var adSecond = data.data.colse_second;

                that.setData({
                    adImg: data.data.index_ad,
                    adSecond: adSecond,
                    showAd: showModalAd
                })
                if (showModalAd == 1) {//显示广告，启动定时器
                    intval = setInterval(function () {
                        if (adSecond > 0) {
                            adSecond--;
                            that.setData({
                                adSecond: adSecond
                            })
                        } else {
                            that.hideAd();
                            adSecond = 0;
                            clearInterval(intval);
                            that.setData({
                                adSecond: adSecond
                            })
                        }

                    }, 1000);
                }

            }
        })
    },

    /**
     * 获取用户上级信息
     */
    getParentUserInfo() {
        var that = this;
        tools.httpClient('home/WxApp/getParentUserInfo', {user_id: userInfo.id}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    parentUser: data.data
                })
            } else {
                that.setData({
                    parentUser: ''
                })
            }
        })
    },

    /**
     * 获取其他配置
     */
    getOtherConfig() {
        var that = this;
        tools.httpClient('home/WxApp/getOtherConfig', {}, (error, data) => {
            if (data.errorCode == 0) {
                let nav_active = that.data.nav_active;
                nav_active['isUseOther'] = data.data;
                that.setData({
                    isUseOther: data.data,
                    nav_active: nav_active
                })
            }
        })
    },

    /**
     * 获取其他配置
     */
    getShowBusinessConfig() {
        var that = this;
        tools.httpClient('home/WxApp/getShowBusinessConfig', {}, (error, data) => {
            if (data.errorCode == 0) {
                let nav_active = that.data.nav_active;
                nav_active['isShowBusiness'] = data.data;
                that.setData({
                    nav_active: nav_active
                })
            }
        })
    },

    /**
     * 获取服务配置
     */
    getServiceConfig() {
        var that = this;
        tools.httpClient('home/WxApp/getServiceConfig', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    isServiceShow: data.data,
                })
            }
        })
    },

    /**
     * 获取用户信息
     */
    getUserInfo() {
        var that = this;
        tools.httpClient('home/WxApp/getUserInfo', {user_id: userInfo.id}, (error, data) => {
            if (data.errorCode == 0) {
                userInfo = data.data;
                wx.setStorageSync('userInfo', userInfo);
                // that.setData({
                //   showCommission:userInfo.is_distributor == 1 ? 1 : 0,
                // })
            }
        })
    },

    /**
     * 显示广告
     */
    showAd() {
        this.setData({
            showAd: 1
        });
    },
    /**
     * 显示广告
     */
    hideAd() {
        wx.setStorageSync('lastday', nowDay);
        this.setData({
            showAd: 0
        });
    },


    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.setData({
            autopPlay: 0
        })
        clearInterval(intval);
        if (start_down) { // 清除之前的倒计时
            clearInterval(start_down)
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearInterval(intval);
        if (start_down) { // 清除之前的倒计时
            clearInterval(start_down)
        }
    },

    /**
     * 幻灯片切换
     */
    swiperChange: function (e) {
        var that = this;
        var currentItemId = e.detail.currentItemId ? e.detail.currentItemId : 0;

        that.setData({
            currentItemId: currentItemId
        })


    },
    clickChange: function (e) {
        var that = this;
        var itemId = e.currentTarget.dataset.itemId ? e.currentTarget.dataset.itemId : 0;
        that.setData({
            currentItemId: itemId
        })
        var slideList = that.data.slideList;

        if (slideList[itemId]['id'] == 1 && slideList[itemId]['url']) {
            tools.isWxLogin(function (res) {
                if (res) {
                    userInfo = wx.getStorageSync('userInfo');
                    wx.navigateTo({
                        url: '/pages/webView/webView?url=' + slideList[itemId]['url'],
                    })
                }
            })
        } else {
            if (slideList[itemId]['goods_type'] != 3 && slideList[itemId]['gids'] > 0) {
                if (slideList[itemId]['goods_type'] == 0) {
                    wx.navigateTo({
                        url: '../store/goodsDetail/goodsDetail?gid=' + slideList[itemId]['gids'] + '&is_buy=1',
                    })
                } else if (slideList[itemId]['goods_type'] == 1) {
                    wx.navigateTo({
                        url: '../rob/goodsDetail/goodsDetail?gid=' + slideList[itemId]['gids'] + '&is_buy=1',
                    })
                } else {
                    wx.navigateTo({
                        url: '../reward/goodsDetail/goodsDetail?gid=' + slideList[itemId]['gids'] + '&is_buy=1',
                    })
                }

            } else {//跳转单页面
                if (slideList[itemId]['simple_desc']) {
                    wx.navigateTo({
                        url: `/pages/richText/richText?id=${slideList[itemId]['id']}`,
                    })
                }

            }

        }

    },


    /**
     * 商品搜索
     */
    goodsSearch(e) {
        wx.navigateTo({
            url: '../store/goodsSearch/goodsSearch?type=1',
        })
    },
    /**
     * 跳转分类页面
     */
    goCate(e) {
        var firCid = e.currentTarget.dataset.id;
        var fir = e.currentTarget.dataset.fir;
        var firName = e.currentTarget.dataset.name;
        wx.navigateTo({
            url: '../store/index/index?isRefresh=1&firCid=' + firCid + '&fir=' + fir + '&firName=' + firName,
        })
    },

    /**
     * 跳转配镜页面
     */
    opticianSetting() {
        wx.reLaunch({
            url: '../opticianSetting/opticianSetting'
        })
    },

    /**
     * 查看详情
     */
    goDetail(e) {
        var type = e.currentTarget.dataset.type;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
            url: '../' + type + '/goodsDetail/goodsDetail?gid=' + id + '&is_buy=1',
        })
    },
    /**
     * 跳转到连锁店
     * @param {*} e 
     */
    goChain(e) {
        var userInfo = wx.getStorageSync('userInfo');
        if(!userInfo.id) {
            wx.showToast({
                title:'您还没有登录,请先登录',
                icon:'none'
              })
              return 
        }
        if(optometristInfo.is_join != 1 && userInfo.is_market != 1) {
            wx.showToast({
                title:'您还不是连锁店,请加入后重试',
                icon:'none'
              })
            return 
        }
        wx.navigateTo({
          url: '/pages/store/distribution/distribution?type=1&isRefresh=1'
        })
    },
    /**
     * 跳转到会员店
     * @param {*} e 
     */
    goVip(e) {
        if(!userInfo.id) {
            wx.showToast({
                title:'您还没有登录,请先登录',
                icon:'none'
              })
              return 
        }
        if(optometristInfo.is_join != 0 && userInfo.is_market != 1) {
            wx.showToast({
                title:'您还不是会员店,请加入后重试',
                icon:'none'
              })
            return 
        }
        wx.navigateTo({
          url: '/pages/store/distribution/distribution?type=2&isRefresh=1'
        })
    },
    /**
     * 跳转到特惠商品
     * @param {*} e 
     */
    goPreferential(e) {
        var userInfo = wx.getStorageSync('userInfo');
        if(!userInfo.id) {
            wx.showToast({
                title:'您还没有登录,请先登录',
                icon:'none'
              })
              return 
        }
        wx.navigateTo({
          url: '/pages/store/preferential/preferential?isRefresh=1'
        })
    },
    /**
     * 现金区图片点击事件
     * @param {*} e 
     */
    goCash(e) {
        wx.navigateTo({
          url: '/pages/store/cash/cash?&isRefresh=1'
        })
    },

    /**
     * 查看更多
     */
    lookMore(e) {
        var type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: '../' + type + '/index/index',
        })
    },


    /**
     * 页面滚动时触发
     */
    onPageScroll: function (e) {

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

    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        var user_id = userInfo.id ? userInfo.id : 0;
        return {
            title: '首页',
            path: '/pages/index/index?user_id=' + user_id,
        }
    }
})
