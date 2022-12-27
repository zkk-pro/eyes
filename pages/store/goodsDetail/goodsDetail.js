var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var wx_login = require('../../../utils/wxLogin.js');
import WxParse from '../../../wxParse/wxParse.js';

var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var page = 1; //分页显示 当前页
var pageSize = 3; //一页显示的评论的数量
var totalPage = 0; //总页数
var gid = 0;
var did = 0;
var loading = true; //是否可触发滚动加载
var goodsInfo = {};
var standard = 0; //商品规格 0同意规格 1多规格
var is_buy = 0; //  是否是正常购买
var type = 0; //  是否是铺货页面进入 0:否 1:是
Page({
    data: {
        base_url: base_url,
        current: 0, //记录当前tab的index
        list: [],
        count: 1, //商品数量，默认为1
        firstIndex: -1,
        attrValueList: [],
        maskHidden: true,
        img_height: wx.getSystemInfoSync().windowWidth, //轮播图高度
        showCommission: 0,
        show_sale: 0,
        reserveCounts: 0,
        counts: 0,
        isBusiness: 0,
        imgList: [],
        heart: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        var that = this;
        wx.showLoading();
        //获取到商品id
        gid = options.gid ? options.gid : 185;
        is_buy = options.is_buy;
        type = options.type;
        that.setData({
            type: type
        })
        userInfo = wx.getStorageSync('userInfo');
        // 获取用户IP
        // wx.request({
        //     url: 'https://pv.sohu.com/cityjson?ie=utf-8',
        //     success: (res) => {
        //         let ipObj =  JSON.parse(res.data.split("=")[1].slice(0,res.data.split("=")[1].length-1))
        //         console.log("ip", ipObj)

        //     },
        //     fail: ()=>{
        //         wx.showToast({
        //           title: '请重新进入页面，网络繁忙！',
        //           icon: "none",
        //         })
        //     }
        // })
        
        //获取商品详情
        wx.request({
            url: base_url + 'home/WxStore/getGoodsDetail',
            data: {
                gid: gid,
                user_id: userInfo.id,
                
            },
            method: 'GET',
            success: function (res) {
                var data = res.data.data;
                if (!data.detail_desc) {
                    data.detail_desc = "<view style='text-align: center'>暂无信息</view>"
                }
                data.detail_desc = tools.richReplaceImg(data.detail_desc);
                goodsInfo = data;
                standard = data.standard;

                //  获取商品图片
                var imgList = [];
                imgList.push(base_url + goodsInfo.img_url);
                console.log(goodsInfo.image_list.length);
                for (var i = 0; i < goodsInfo.image_list.length; i++) {
                    console.log(goodsInfo.image_list[i].img_url);
                    imgList.push(base_url + goodsInfo.image_list[i].img_url);
                }
                that.setData({
                    imgList: imgList,
                    show_sale: goodsInfo.show_sale,
                    goodsInfo: data,
                    description: data.detail_desc,
                    propertyPrice: data.price,
                    singlePrice: data.price,
                    inventory: data.inventory,
                    order_fee: Number(data.order_fee).toFixed(2),
                    order_below_fee: Number(data.order_below_fee || 0),
                    propertyinventory: data.inventory,
                    heart: goodsInfo.heart
                });
                setTimeout(function () {
                    wx.hideLoading()
                }, 300)
                //html转wxml
                WxParse.wxParse('description', 'html', that.data.description, that, 0);
            }
        });
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
        //获取购物车商品数量
        that.getReserveOrCartCount(0);
        //获取铺货商品数量
        that.getReserveOrCartCount(1);
        //获取商品属性
        wx.request({
            url: base_url + 'home/WxStore/getPropertyGroup',
            data: {
                gid: gid
            },
            method: 'GET',
            success: function (res) {
                var data = res.data.data;
                that.setData({
                    commodityAttr: data,
                    includeGroup: data
                });
                //拟合数据用于输出到页面
                that.distachAttrValue(that.data.commodityAttr);
                if (that.data.commodityAttr.length == 1) {
                    for (var i = 0; i < that.data.commodityAttr[0].attrValueList.length; i++) {
                        that.data.attrValueList[i].selectedValue = that.data.commodityAttr[0].attrValueList[i].attrValue;
                    }
                    that.setData({
                        attrValueList: that.data.attrValueList
                    });

                }
            }
        });
        setTimeout(function () {
            userInfo = wx.getStorageSync('userInfo');
            if (userInfo.id > 0) {
                that.getUserInfo();
            }
        }, 100)
    },

    //预览图片，放大预览
    preview(event) {
        console.log(event.currentTarget.dataset.src)
        console.log(this.data.imgList)
        // return
        let currentUrl = event.currentTarget.dataset.src
        wx.previewImage({
            current: currentUrl, // 当前显示图片的http链接
            urls: this.data.imgList // 需要预览的图片http链接列表
        })
    },
    /**
     * 点击收藏
     * @param {*} e 
     */
    heart_fill(e) {
        var that = this;
        var userInfo = wx.getStorageSync('userInfo');
        if (!userInfo.id) {
            wx.showToast({
                title: '您还没有登录,请先登录',
                icon: 'none',
                duration: 2000
            })
            return
        }
        tools.httpClient('home/WxStore/createCollection', {
            goods_id: gid,
            user_id: userInfo.id
        }, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    heart: 1
                });
            } else {
                wx.showToast({
                    title: data.errorInfo,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    /**
     *  取消收藏
     * @param {*} e 
     */
    heart(e) {
        var that = this;
        var userInfo = wx.getStorageSync('userInfo');
        if (!userInfo.id) {
            wx.showToast({
                title: '您还没有登录,请先登录',
                icon: 'none',
                duration: 2000
            })
            return
        }
        tools.httpClient('home/WxStore/deleteCollection', {
            goods_id: gid,
            user_id: userInfo.id
        }, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    heart: 0
                });
            } else {
                wx.showToast({
                    title: data.errorInfo,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    /**
     * 获取商家信息
     */
    getOptometristByUserId(that) {
        tools.httpClient('home/WxApp/getOptometristByUserId', {
            user_id: userInfo.id ? userInfo.id : -1
        }, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    isBusiness: 1,
                    showCommission: 1
                })
            }
        })
    },

    /**
     * 获取购物车/铺货数量
     */
    getReserveOrCartCount(type = 0) {
        let that = this;
        let url = 'home/WxStore/getCartCount';
        if (type == 1) {
            url = 'home/WxStore/getReserveCount';
        }
        tools.httpClient(url, {
            account: userInfo.account
        }, (error, res) => {
            if (type == 1) {
                that.setData({
                    reserveCounts: res
                });
            } else {
                that.setData({
                    counts: res
                });
            }

        })
    },

    /**
     * 铺货商品列表
     */
    reserveGoods() {
        wx.navigateTo({
            url: '../reserveGoods/reserveGoods'
        });
    },


    /* 获取数据 */
    distachAttrValue: function (commodityAttr) {
        //参数为元素数据组合
        /**
         将后台返回的数据组合成类似
         {
           attrKey:'型号',
           attrValueList:['1','2','3']
         }
         */
        // 把数据对象的数据（视图使用），写到局部内
        //获取空数组
        var attrValueList = this.data.attrValueList;
        // 遍历获取的数据
        for (var i = 0; i < commodityAttr.length; i++) {
            for (var j = 0; j < commodityAttr[i].propertyList.length; j++) {
                //传入参数   开始时attrValueList为空数组[]
                var attrIndex = this.getAttrIndex(commodityAttr[i].propertyList[j].name, attrValueList);
                // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
                if (attrIndex >= 0) {

                    // 如果属性值数组中没有该值，push新值；否则不处理
                    if (!this.isValueExist(commodityAttr[i].propertyList[j].value, attrValueList[attrIndex].attrValues)) {
                        attrValueList[attrIndex].attrValues.push(commodityAttr[i].propertyList[j].value);
                    }
                } else {
                    //插入新的属性名
                    attrValueList.push({
                        attrKey: commodityAttr[i].propertyList[j].name,
                        //attrValues为数组
                        attrValues: [commodityAttr[i].propertyList[j].value]
                    });
                }
            }
        }
        //设置每个属性值的状态为true，代表可点击
        for (var i = 0; i < attrValueList.length; i++) {
            for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                if (attrValueList[i].attrValueStatus) {
                    attrValueList[i].attrValueStatus[j] = true;
                } else {
                    attrValueList[i].attrValueStatus = [];
                    attrValueList[i].attrValueStatus[j] = true;
                }
            }
        }
        //设置最终拼合的数据
        this.setData({
            attrValueList: attrValueList
        });
    },

    /**
     * 生命周期函数--监听页面关闭
     */
    onUnload: function () {
        page = 1;
    },


    /**
     * 获取属性索引
     */
    getAttrIndex: function (attrName, attrValueList) {
        //返回值为-1表示不存在此属性名，需插入新属性名
        // 判断数组中的attrKey是否有该属性值
        for (var i = 0; i < attrValueList.length; i++) {
            if (attrName == attrValueList[i].attrKey) {
                break;
            }
        }
        var aa = i < attrValueList.length ? i : -1;
        return aa;
    },

    /**
     * 判断新拼合的数据中是否存在原始数据中的属性值 返回值为true代表原始数据已加入新拼合的数据
     */
    isValueExist: function (value, valueArr) {
        //value为原始数据的值 valueArr为组合后值的数组
        // 判断是否已有属性值
        for (var i = 0; i < valueArr.length; i++) {
            if (valueArr[i] == value) {
                break;
            }
        }
        return i < valueArr.length;
    },

    /* 选择属性值事件 */
    selectAttrValue: function (e) {
        //获取到拼合的数据
        var attrValueList = this.data.attrValueList;
        var index = e.currentTarget.dataset.index; //属性索引
        var key = e.currentTarget.dataset.key;
        var value = e.currentTarget.dataset.value;
        if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
            if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
                // 取消选中
                this.disSelectValue(attrValueList, index, key, value);
            } else {
                // 选中
                this.selectValue(attrValueList, index, key, value);
            }

        }
    },
    /* 选中 */
    selectValue: function (attrValueList, index, key, value, unselectStatus) {
        var includeGroup = [];
        if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
            var commodityAttr = this.data.commodityAttr;
            // 其他选中的属性值全都置空
            for (var i = 0; i < attrValueList.length; i++) {
                for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                    attrValueList[i].selectedValue = '';
                }
            }
        } else {
            var commodityAttr = this.data.includeGroup;
        }
        for (var i = 0; i < commodityAttr.length; i++) {
            for (var j = 0; j < commodityAttr[i].propertyList.length; j++) {
                if (commodityAttr[i].propertyList[j].name == key && commodityAttr[i].propertyList[j].value == value) {
                    includeGroup.push(commodityAttr[i]);
                }
            }
        }
        attrValueList[index].selectedValue = value;

        // 判断属性是否可选
        for (var i = 0; i < attrValueList.length; i++) {
            for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                attrValueList[i].attrValueStatus[j] = false;
            }
        }

        for (var k = 0; k < attrValueList.length; k++) {
            for (var i = 0; i < includeGroup.length; i++) {
                for (var j = 0; j < includeGroup[i].propertyList.length; j++) {
                    if (attrValueList[k].attrKey == includeGroup[i].propertyList[j].name) {
                        for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
                            if (attrValueList[k].attrValues[m] == includeGroup[i].propertyList[j].value) {
                                attrValueList[k].attrValueStatus[m] = true;
                            }
                        }
                    }
                }
            }
        }
        this.setData({
            attrValueList: attrValueList,
            includeGroup: includeGroup
        });
        var selNum = 0;
        for (var i = 0; i < this.data.attrValueList.length; i++) {
            if (this.data.attrValueList[i].selectedValue) {
                selNum++;
            }
        }
        if (selNum == this.data.attrValueList.length) {
            this.setData({
                selectedProperty: includeGroup[0],
                propertyPrice: includeGroup[0].price,
                singlePrice: includeGroup[0].price,
                inventory: includeGroup[0].inventory
            });
        }
        var count = 0;
        for (var i = 0; i < attrValueList.length; i++) {
            for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                if (attrValueList[i].selectedValue) {
                    count++;
                    break;
                }
            }
        }
        if (count < 2) { // 第一次选中，同属性的值都可选
            this.setData({
                firstIndex: index
            });
        } else {
            this.setData({
                firstIndex: -1
            });
        }
    },
    /* 取消选中 */
    disSelectValue: function (attrValueList, index, key, value) {
        var commodityAttr = this.data.commodityAttr;
        attrValueList[index].selectedValue = '';

        // 判断属性是否可选
        for (var i = 0; i < attrValueList.length; i++) {
            for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                attrValueList[i].attrValueStatus[j] = true;
            }
        }
        this.setData({
            includeGroup: commodityAttr,
            attrValueList: attrValueList
        });

        for (var i = 0; i < attrValueList.length; i++) {
            if (attrValueList[i].selectedValue) {
                this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
            }
        }
    },


    /**
     * 加载更多
     */
    loadMore: function (options) {
        var that = this;

        if (page > totalPage) {
            return false;
        } else {
            if (loading == true) {
                pagingComment(options, that);
            }

        }
    },

    /**
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
            that.setData({
                count: goodsCount,
                propertyPrice: price
            });
        } else {
            goodsCount--;
            if (goodsCount < 1) {
                goodsCount = 1;
            }
            var price = (goodsCount * Number(that.data.singlePrice)).toFixed(2);
            that.setData({
                count: goodsCount,
                propertyPrice: price
            });
        }

    },
    /**
     * 获取用户信息
     */
    getUserInfo() {
        var that = this;
        tools.httpClient('home/WxApp/getUserInfo', {
            user_id: userInfo.id
        }, (error, data) => {
            if (data.errorCode == 0) {
                userInfo = data.data;
                wx.setStorageSync('userInfo', userInfo);
                that.setData({
                    userInfo: userInfo,
                    // showCommission: userInfo.is_distributor == 1 ? 1 : 0
                })
                that.getOptometristByUserId(that);
            } else {
                that.setData({
                    userInfo: userInfo
                })
            }
        })
    },

    /**
     * 分享
     */
    share() {
        tools.isWxLogin(function (res) {
            wx.navigateTo({
                url: '/pages/goodShare/goodShare?type=0&gid=' + gid,
            })
        })
    },
    /* 查阅图片 */
    previewImage(e) {
        wx.previewImage({
            urls: [e.target.dataset.item],
        })
    },

    /**
     * 关闭多规格弹层
     */
    offMask: function () {
        this.setData({
            maskHidden: true
        });
    },

    /**
     * 打开弹层
     */
    onMask: function () {
        this.setData({
            maskHidden: false
        });
    },

    /**
     * 点击操作 加入购物车/立即购买
     */
    operator: function (e) {
        let that = this;
        tools.isWxLogin(function (res) {
            if (res) {
                //获取到操作类型 0加入购物车 1立即购买 3加入铺货
                let index = e.currentTarget.dataset.index;
                //判断是否为多规格 多规格需要显示多规格选择弹层
                if (standard == 1 || standard == 0) {
                    //判断属性弹层是否打开 如果是打开的判断属性是否选择完全
                    if (that.data.maskHidden) {
                        that.setData({
                            maskHidden: false
                        });
                    } else {
                        let value = [];
                        let i = 0;
                        for (i = 0; i < that.data.attrValueList.length; i++) {
                            if (!that.data.attrValueList[i].selectedValue) {
                                break;
                            }
                            value.push(that.data.attrValueList[i].selectedValue);
                        }
                        if (i < that.data.attrValueList.length) {
                            wx.showToast({
                                title: '请完善属性',
                                icon: 'none',
                                duration: 2000
                            })
                        } else if (isInventory(that.data) == false && index != 3) {
                            //判断库存是否足够
                            wx.showToast({
                                title: '库存不足',
                                icon: 'none',
                                duration: 2000
                            })
                            return false;
                        } else {
                            //获取商品信息
                            let gid = that.data.goodsInfo.id;
                            let gpid = standard == 1 ? that.data.includeGroup[0].id : 0;
                            let account = userInfo.account;
                            let goods_count = that.data.count;
                            console.log(index);
                            switch (parseInt(index)) {
                                case 1: //直接购买
                                    let gids = gid;
                                    let gpids = gpid;
                                    let counts = goods_count;
                                    wx.navigateTo({
                                        url: '/pages/store/comfirmOrder/comfirmOrder?gids=' + gids + '&gpids=' + gpids + '&counts=' + counts + '&is_buy=' + is_buy,
                                    })
                                    break;
                                case 2: //加入铺货
                                    that.insertCartOrReserve(gid, account, goods_count, gpid, 1);
                                    break;
                                default: //加入购物车
                                    that.insertCartOrReserve(gid, account, goods_count, gpid, 0);
                                    break;
                            }

                        }
                    }
                }
            }
        }); //判断用户是否登录
    },

    /**
     * 加入购物车/铺货
     */
    insertCartOrReserve(gid, account, goods_count, gpid, type = 0) {
        let that = this;
        let is_reserve_sale = that.data.goodsInfo.is_reserve_sale;
        let reserve_notice = that.data.goodsInfo.reserve_notice;
        let url = 'home/WxStore/insertCartGoods';
        if (type == 1) {
            url = 'home/WxStore/addReserveGoods';
        }

        tools.httpClient(url, {
            gid: gid,
            account: account,
            goods_count: goods_count,
            gpid: gpid
        }, (error, data) => {
            if (data.errorCode == 0) {
                that.setData({
                    maskHidden: true
                });

                wx.showToast({
                    title: is_reserve_sale == 1 ? reserve_notice : '添加成功',
                    icon: 'none',
                    duration: 2000
                });
                that.getReserveOrCartCount(type);
            } else {
                wx.showToast({
                    title: data.errorInfo,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },

    //跳转购物车
    cart: function (e) {
        var that = this;
        wx.navigateTo({
            url: '../cartGoods/cartGoods',
        })
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
            path: '/pages/store/goodsDetail/goodsDetail?gid=' + gid + '&user_id=' + userInfo.id,
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