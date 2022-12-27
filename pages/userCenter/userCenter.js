// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var height = 0;

Page({
    data: {
        base_url: base_url,
        teamNum: 0,
        upgradeNum: 0,
        waitPay: 0,
        waitSend: 0,
        waitGet: 0,
        readyGet: 0,
        success: 0,
        isShow: 0,
        showRecharge: 0,
        isUseOther: 0,
        isServiceShow: 0,
        operatorInfo: [],//业务员信息
        isCanSubmitApply: 1,
        isBusiness: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        userInfo = wx.getStorageSync('userInfo');

        if (app.globalData.type == 1) {
            height = 34;
        }
        let nav_active = {
            index: '',
            cart: '',
            reserve: '',
            setting: '',
            optometrist: '',
            center: 'active',
            base_url: base_url,
            height: height,
            isUseOther: 0,
            isBusiness: 0,
            isShowBusiness: 0,
        };
        that.setData({
            nav_active: nav_active
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
            if (userInfo.id > 0) {
                that.getUserInfo();
            }
        }, 100)

        that.getOtherConfig();//获取其他显示配置
        that.getServiceConfig();//获取服务配置
        that.getShowBusinessConfig();//获取商家显示
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
     * 获取用户信息
     */
    getUserInfo() {
        var that = this;
        tools.httpClient('home/WxApp/getUserInfo', {user_id: userInfo.id}, (error, data) => {
            if (data.errorCode == 0) {
                userInfo = data.data;
                wx.setStorageSync('userInfo', userInfo);
                that.setData({
                    userInfo: userInfo,
                    showRecharge: data.showRecharge
                })
                that.getOptometristByUserId(that);
                that.getOperatorInfo(that);//获取运营信息
                that.getOptometristApply();//获取是否存在入驻信息
            } else {
                that.setData({
                    userInfo: userInfo,
                    showRecharge: data.showRecharge
                })
            }
        })
    },

    /**
     * 获取是否存在入驻审核信息
     */
    getOptometristApply() {
        let that = this;
        tools.httpClient('home/WxApp/getOptometristApply', {userId: userInfo.id ? userInfo.id : -1}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    isCanSubmitApply: 0
                });
            }
        })
    },


    /**
     * 获取运营信息
     */
    getOperatorInfo(that) {
        tools.httpClient('home/WxApp/getOperatorInfo', {userId: userInfo.id ? userInfo.id : -1}, (error, data) => {
            if (data.errorCode == 0) {
                let operatorInfo = data.data;
                that.setData({
                    operatorInfo: operatorInfo
                });
            }
        })
    },


    /**
     * 页面跳转
     */
    jumpPage(e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
        let operatorInfo = that.data.operatorInfo;
        var urlList = {
            "fen": '/pages/fen/distributorCenter/distributorCenter',
            "successOrder": '/pages/myConsume/myConsume',
            "optometrist": '/pages/optometrist/center/center',
            "opinion": '/pages/opinion/opinion',
            "address": '/pages/address/addressList/addressList',
            "editUser": '/pages/editUser/editUser',
            'rewardOrder': '/pages/reward/rewardOrder/rewardOrder',
            'rewardOrder_0': '/pages/reward/rewardOrder/rewardOrder?currentTab=0',
            'rewardOrder_1': '/pages/reward/rewardOrder/rewardOrder?currentTab=1',
            'rewardOrder_2': '/pages/reward/rewardOrder/rewardOrder?currentTab=2',
            'rewardOrder_3': '/pages/reward/rewardOrder/rewardOrder?currentTab=3',
            'storeOrder': '/pages/store/storeOrder/storeOrder',
            'storeOrder_0': '/pages/store/storeOrder/storeOrder?currentTab=0',
            'storeOrder_1': '/pages/store/storeOrder/storeOrder?currentTab=1',
            'storeOrder_2': '/pages/store/storeOrder/storeOrder?currentTab=a',
            'storeOrder_3': '/pages/store/storeOrder/storeOrder?currentTab=3',
            'storeOrder_4': '/pages/store/storeOrder/storeOrder?currentTab=5',
            'reserveOrder': '/pages/store/storeReserveOrder/storeReserveOrder',
            'reserveOrder_0': '/pages/store/storeReserveOrder/storeReserveOrder?currentTab=0',
            'reserveOrder_1': '/pages/store/storeReserveOrder/storeReserveOrder?currentTab=1',
            'reserveOrder_2': '/pages/store/storeReserveOrder/storeReserveOrder?currentTab=2',
            'reserveOrder_3': '/pages/store/storeReserveOrder/storeReserveOrder?currentTab=3',
            'robOrder': '/pages/rob/robOrder/robOrder',
            'robOrder_0': '/pages/rob/robOrder/robOrder?currentTab=0',
            'robOrder_1': '/pages/rob/robOrder/robOrder?currentTab=1',
            'robOrder_2': '/pages/rob/robOrder/robOrder?currentTab=a',
            'robOrder_3': '/pages/rob/robOrder/robOrder?currentTab=3',
            'robOrder_4': '/pages/rob/robOrder/robOrder?currentTab=5',
            'recharge': '/pages/rechargePay/rechargePay',
            'rechargeRecord': '/pages/rechargeRecord/rechargeRecord',
            'myActiCoupon': '/pages/myActiCoupon/myActiCoupon',
            'serviceGoods': '/pages/service/serviceOrder/serviceOrder',
            'operator': operatorInfo.id > 0 ? '/pages/operator/operatorCenter/operatorCenter' : '/pages/operator/login/login',
            'optometristApply': '/pages/optometrist/optometristApply/optometristApply',
            'businessPage':'/pages/businessPage/businessPage',
            'heart':'/pages/store/heart/heart',
            'eyeData':'/pages/eyeData/eyeData',
        };
        tools.isWxLogin(function (res) {
            if (res) {
                userInfo = that.data.userInfo;
                let isCanSubmitApply = that.data.isCanSubmitApply;
                if (isCanSubmitApply != 1 && type == 'optometristApply') {
                    wx.showToast({
                        title: '请耐心等待后台审核',
                        icon: 'none',
                        duration: 2000
                    })
                    return false;
                }

                if (type == 'fen' && userInfo.is_distributor == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '您还不是店长，请在平台消费成为店长后，再进入',
                        showCancel: false,
                        confirmText: '我知道了',
                        confirmColor: '#FE8A22',
                        success: function (res) {

                        }
                    })
                    return false;
                }

                if (type == 'fen' && userInfo.is_agree_distributor != 1) {
                    wx.navigateTo({
                        url: '/pages/fen/distributorAgree/distributorAgree',
                    })
                } else {
                    wx.navigateTo({
                        url: urlList[type],
                    })
                }


            }
        })


    },

    /**
     * 获取商家信息
     */
    getOptometristByUserId(that) {
        tools.httpClient('home/WxApp/getOptometristByUserId', {user_id: userInfo.id ? userInfo.id : -1}, (error, data) => {
            if (data.errorCode == 0) {
                let nav_active = that.data.nav_active;
                nav_active['isBusiness'] = 1;
                that.setData({
                    nav_active: nav_active,
                    isBusiness: 1
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
     * 登录
     */
    goLogin() {
        tools.isWxLogin(function (res) {

        })
        // wx.navigateTo({
        //   url: '/pages/wxlogin/login',
        // })
    },

    /**
     * 复制内容到剪切板
     */
    copyText(e) {
        var code = e.currentTarget.dataset.code;
        wx.setClipboardData({
            data: code,
            success(res) {
                wx.showToast({
                    title: '复制成功',
                    duration: 2000
                })
            },
            fail(res) {
                wx.showToast({
                    title: '复制失败',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },


    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

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

    }

});
