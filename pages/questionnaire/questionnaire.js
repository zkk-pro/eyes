// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var height = 0;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        /*
        dataList 你用来存接口获取的数据
        answer 答案数据Array<string>
        multiple 0为单选  1为多选
        must 为必选
        problem 问题
        sellerQuestionId 题目id
        */
        dataList: [],
        userInfo: "",
        base_url: base_url,
        select: [],
        otherObj: {},
        commitOk: false,
        goods_id: "",
    },
    isSelect() {
        return true
        // return(val)=>{
        //   let flag = true
        //   console.log(hasIndex)
        //   return flag
        // }
    },
    hasIndex(obj) {
        let flag = -1
        this.data.select.some((item, index) => {
            if (item.id == obj.sellerQuestionId) {
                flag = index
                return true
            }
        })
        return flag
    },
    select(e) {
        const item = e.target.dataset.item;
        const item1 = e.target.dataset.answ;
        this.oprate(item, item1)
    },
    radioChange(e) {
        const item = e.target.dataset.item;
        const item1 = e.detail.value;
        let data = this.data.otherObj;
        if (item1 === "其他") {
            data[item.sellerQuestionId] = true
        } else {
            data[item.sellerQuestionId] = false
        }
        this.setData({
            otherObj: data
        })
        this.oprate(item, item1)
    },
    checkboxChange(e) {
        const item = e.target.dataset.item;
        const item1 = e.detail.value;
        this.oprate(item, item1)
    },
    otherInput(e) {
        const item = e.target.dataset.item;
        const item1 = e.detail.value;
        this.oprate(item, item1);
    },
    promoteOneClick(){
        setTimeout(()=>{
            wx.redirectTo({
              url: `/pages/store/goodsDetail/goodsDetail?gid=${this.data.goods_id}&is_buy=1`,
            })
        },500)
    },
    async promoteTwoClick(){
        try {
            const res =  await tools.request(`home/WxApp/reward`, 'post', {
                account: this.data.userInfo.account
            })
            console.log(res)
            wx.showToast({
              title: res.errorInfo,
              icon: "none"
            })
        } catch (error) {
            
        }
    },
    promoteCancle() {
        setTimeout(() => {
            wx.reLaunch({
                url: '/pages/index/index',
            })
        }, 500)
    },
    oprate(item, item1) {
        const nowIndex = this.hasIndex(item);
        let arr = this.data.select
        if (nowIndex != -1) {
            arr[nowIndex].answer = item1
        } else {
            arr.push({
                id: item.sellerQuestionId,
                answer: item1
            })
        }
        this.setData({
            select: arr
        })
    },
    async aplication() {
        let openId = '';
        if (this.data.select.length != this.data.dataList.length) {
            wx.showToast({
                title: '请完成全部题目的勾选！',
                icon: 'none'
            })
            return
        }
        if (this.data.select.find(item => {
                return item.answer == "" || item.answer == "其他"
            })) {
            wx.showToast({
                title: '请填写空余信息',
                icon: 'none'
            })
            return
        }
        if (this.data.userInfo == '') {
            wx.getUserProfile({
                desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                success: (res) => {
                    console.log(res)
                    wx.login({
                        success: (loginData) => {
                            tools.httpClient('home/WxApp/getOpendIdByCode', {
                                jsCode: loginData.code
                            }, (error, data) => {
                                if (data.errorCode == 2) { //无用户只有opendId 跳转页面拉取用户信息
                                    console.log(data.data.openid);
                                    var openId = data.data.openid;
                                    //组装提交数据
                                    let sumitData = {
                                        openId: openId,
                                        nickName: res.userInfo.nickName,
                                        avatarUrl: res.userInfo.avatarUrl,
                                        city: res.userInfo.city,
                                        country: res.userInfo.country,
                                        province: res.userInfo.province,
                                        gender: res.userInfo.gender,
                                    };
                                    //保存用户信息
                                    tools.httpClient('home/WxApp/addUser', sumitData, (error, data) => {
                                        if (data.data != '' && data.data != null) {
                                            this.setData({
                                                userInfo:data.data
                                            })
                                            wx.setStorage({
                                                key: "userInfo",
                                                data: data.data
                                            });
                                            this.submit();
                                        } else {
                                            wx.showToast({
                                                title: '授权失败',
                                                icon: 'none',
                                                duration: 2000
                                            })
                                            return
                                        }
                                    })
                                } else {
                                    wx.showToast({
                                        title: '授权失败',
                                        icon: 'none',
                                        duration: 2000
                                    })
                                    return
                                }
                            })
                        }
                    })
                },
                fail: (err) => {
                    console.log(err)
                }
            })
        } else {
            this.submit();
        }
    },

    async submit() {
        const data = {}
        // 自己用户id
        // data.id = this.data.userInfo.id;
        // 推广人 id
        // data.recommendId = this.data.userInfo.recommendId;
        // 对应题目答案的JSON字符串
        // 数据格式例子：[{1:"18-25"},{2:"深圳，上海"}]
        data.answer = this.data.select.map(item => {
            return {
                [item.id]: Object.prototype.toString.call(item.answer) == '[object Array]' ? item.answer.join(',') : item.answer
            }
        })
        try {
            const res =  await tools.request(`home/WxApp/createQuestionnaire`, 'post', {
                data: JSON.stringify(data),
                account: this.data.userInfo.account
            })
            wx.showToast({
              title: res.errorInfo,
            })
            setTimeout(() => {
                this.setData({
                    commitOk: true
                })
            }, 500);
        } catch (error) {

        }

        // tools.httpClient('home/WxApp/createQuestionnaire',{data:data,account:this.data.userInfo.account},(error,data)=>{
        //     wx.showToast({
        //         title:data.errorInfo,
        //         icon:'none',
        //         duration: 2000
        //     })
        // })
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        var that = this;
        // 此处写 获取自己用户信息 和 推广人id
        //  获取页面填写数据
        tools.httpClient('home/WxApp/questionnaire', {}, (error, data) => {
            that.setData({
                dataList: data.from,
                goods_id:data.goods_id
            })
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
    onShareAppMessage: function () {

    },

})