// pages/index/index.js
var wx_login = require('../../../utils/wxLogin.js');
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var timer = require('../../../utils/timer.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var page = 1;
var pageSize = 6;
var allPages = 0;
var start_down = '';
var list_down = '';
/**
 * 倒计时
 */
var countDown = function (that, type = 0) {

    if (type == 0) {
        if (start_down) { // 清除之前的倒计时
            clearInterval(start_down)
        }
        var robGoods = that.data.robGoods;
        start_down = setInterval(function () {
            for (var item in robGoods) {
                robGoods[item].finish_time = timer.down(robGoods[item].end_date, null, type);
            }
            that.setData({
                robGoods: robGoods
            })
        }, 1000);
    } else {
        if (list_down) { // 清除之前的倒计时
            clearInterval(list_down)
        }
        var list = that.data.list;
        list_down = setInterval(function () {
            for (var item in list) {
                list[item].finish_time = timer.down(list[item].end_date, null, type);
            }
            that.setData({
                list: list
            })
        }, 1000);
    }


};
var pagingGoods = function (that, type = 0) {
    wx.request({
        url: base_url + 'home/WxRob/pagingGoods',
        data: {
            pageIndex: page,
            pageSize: pageSize,
        },
        method: 'GET',
        success: function (res) {
            var data = res.data.data;
            var dataList = data.dataList;
            if (type == 1) {//点击切换，重新渲染商品
                var list = [];
            } else {
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
                bottom_text: bottom_text
            }, function () {
                countDown(that, 1);
            });
            setTimeout(function () {
                wx.hideLoading()
            }, 100)
            page++;
        }
    })
};
Page({

    /**
     * 页面的初始数据
     */
    data: {
        base_url: base_url,
        robGoods: [],
        list: [],
        showCommission: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中',
        })
        var that = this;
        that.getRobRecommend(that);//获取秒杀产品
        that.setData({
            list: []
        });
        page = 1;
        pagingGoods(that);
    },

    /**
     * 获取首页推荐的秒杀产品
     */
    getRobRecommend(that) {
        tools.httpClient('home/WxRob/getRecommendGoods', {}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    robGoods: data.data
                }, function () {
                    countDown(that, 0);
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
                that.getUserInfo();
            }
        }, 100)
        countDown(that);
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
                //     showCommission: userInfo.is_distributor == 1 ? 1 : 0
                // })
            }
            that.getOptometristByUserId(that);
        })
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
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        if (start_down) { // 清除之前的倒计时
            clearInterval(start_down)
        }
        if (list_down) { // 清除之前的倒计时
            clearInterval(list_down)
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        if (start_down) { // 清除之前的倒计时
            clearInterval(start_down)
        }
        if (list_down) { // 清除之前的倒计时
            clearInterval(list_down)
        }
    },


    /**
     * 跳转商品详情
     */
    goodsDetail(e) {
        var gid = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/rob/goodsDetail/goodsDetail?gid=' + gid,
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
        var that = this;
        if (page > allPages) {
            return false;
        } else {
            pagingGoods(that);
        }
    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        var user_id = userInfo.id ? userInfo.id : 0;
        return {
            title: '限时秒杀',
            path: '/pages/rob/index/index?user_id=' + user_id,
        }
    }
})