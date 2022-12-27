// pages/order/confirmOrder/confirmOrder.js
const CONFIG = require('../../../utils/config.js');
const tools = require('../../../utils/tools.js');
const app = getApp();
const base_url = CONFIG.API_URL.BASE_URL;
let userInfo = '';
let myData = '';
let optionsData = ''; //传递的参数
//加载页面 获取数据
let loadPage = function (that, options) {
    if (optionsData) {
        myData = options;
        myData.user_id = userInfo.id;
        tools.httpClient("home/WxStore/getConfirmReserveOrderData", myData, (error, data) => {
            //获取到默认地址
            let addressList = data.addressList;
            if (addressList.length > 0) {
                for (let i = 0; i < addressList.length; i++) {
                    if (addressList[i].is_default == 1) {
                        that.setData({
                            address: addressList[i]
                        });
                        break;
                    }
                }
            }
            that.setData({
                orderFee: data.orderFee,
                base_url: base_url,
                goodsList: data.data,
            });
            //隐藏loading
            wx.hideLoading()
        })

    } else {
        //隐藏loading
        wx.hideLoading()
    }
};

Page({
    data: {
        index: 0,
        base_url: base_url,
        payArray: ['微信支付', '余额支付'],
        payIndex: 0,
        orderFee: 0

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        userInfo = wx.getStorageSync('userInfo');
        optionsData = options;

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this;
        //打开loading
        wx.showLoading({
            title: ''
        });
        loadPage(that, optionsData);
        //来自铺货清单，设置铺货清单data
        that.setData({
            cgids: optionsData.cgids,
        });
        userInfo = wx.getStorageSync('userInfo');
        if (userInfo.id) {
            that.getUserInfo();
        }
    },


    /**
     * 获取用户信息
     */
    getUserInfo() {
        let that = this;
        tools.httpClient('home/WxApp/getUserInfo', {user_id: userInfo.id}, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    "rechargeMoney": data.data.recharge_money
                })
            }
        })
    },

    /**
     * 提交订单
     */
    submitOrder: function (e) {
        let that = this;
        //定义要提交的数据
        let subData = {};
        //用户信息
        subData.account = userInfo.account;
        subData.pay_method = that.data.payIndex;
        //地址
        let addr = that.data.address;
        let goodsList = that.data.goodsList;
        if (typeof (addr) != 'undefined') {
            let address = that.data.address;
            subData.address_text = address.call_name + '--' + address.phone + '--' + address.address.city + address.address.detail;
            subData.address = JSON.stringify({
                "call_name": address.call_name,
                "phone": address.phone,
                "address": (address.address.city + address.address.detail)
            });
        } else {
            wx.showToast({
                title: '请完善收货地址',
                icon: 'none',
                duration: 1000
            });
            return false;
        }
        //留言信息
        if (that.data.message) {
            subData.message = that.data.message;
        }
        //gids ,gpids, counts
        let subGids = [];
        let subGpids = [];
        let subCounts = [];
        for (let i = 0; i < that.data.goodsList.length; i++) {
            if (that.data.goodsList[i].updown == 1) {
                subGids.push(that.data.goodsList[i].id);
                subGpids.push(that.data.goodsList[i].property.id);
                subCounts.push(that.data.goodsList[i].goods_count);
            }
        }
        if (subGids.length == 0) {
            wx.showToast({
                title: '商品已下架',
                icon: 'none',
                duration: 1000
            })
            return false;
        } else {
            subData.gids = subGids.join(',');
            subData.gpids = subGpids.join(',');
            subData.counts = subCounts.join(',');
        }
        //来自铺货清单
        subData.cgids = that.data.cgids;
        wx.showLoading({
            title: '',
            mask: true
        })
        wx.request({
            url: base_url + 'home/WxStore/addReserveOrder',
            data: subData,
            method: 'GET',
            success: function (res) {
                //console.log(res, 'klj');
                if (res.data.errorCode == 0) {
                    if (res.data.data.state == 0) {
                        let oid = res.data.data.addOrderId;
                        wx.request({
                            url: base_url + '../extend/pay/request/WxReservePay.php?oid=' + oid,
                            data: {
                                oid: oid
                            },
                            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                            success: function (res) {
                                wx.requestPayment({
                                    'timeStamp': res.data.timeStamp,
                                    'nonceStr': res.data.nonceStr,
                                    'package': res.data.package,
                                    'signType': 'MD5',
                                    'paySign': res.data.paySign,
                                    'success': function (res) {
                                        wx.hideLoading()
                                        wx.showModal({
                                            title: '提示',
                                            content: '支付成功',
                                            showCancel: false,
                                            confirmText: '确定',
                                            confirmColor: '#FE8A22',
                                            success: function (res) {
                                                if (res.confirm) {
                                                    wx.redirectTo({
                                                        url: '/pages/store/storeReserveOrder/storeReserveOrder',
                                                    })
                                                }
                                            }
                                        })

                                    },
                                    fail() {
                                        wx.hideLoading()
                                    }
                                });

                            },
                            fail() {
                                wx.hideLoading()
                            }
                        })
                    } else {//已支付
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '支付成功',
                            showCancel: false,
                            confirmText: '确定',
                            confirmColor: '#FE8A22',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.redirectTo({
                                        url: '/pages/store/storeReserveOrder/storeReserveOrder',
                                    })
                                }
                            }
                        })
                    }

                } else {
                    wx.hideLoading()
                    wx.showToast({
                        title: res.data.errorInfo,
                        icon: 'none',
                        duration: 1000
                    })
                }
            },
            fail() {
                wx.hideLoading()
            }
        });

    },

    /**
     * 监听页面输入
     */
    listenInput(e) {
        let that = this;
        let type = e.currentTarget.dataset.type;
        let data = {};
        data[type] = e.detail.value;
        that.setData(data);
    },

    /**
     * 选择支付方式
     */
    bindPayChange(e) {
        this.setData({
            payIndex: e.detail.value
        });
    },


    /**
     * 选择地址
     */
    selectAddress: function () {
        wx.navigateTo({
            url: '/pages/address/addressList/addressList'
        })
    },

    /**
     * 获取留言信息
     */
    messageCont: function (e) {
        this.setData({
            message: e.detail.value
        });
    },


});
