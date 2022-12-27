// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var userData = "";
var myData = '';
var bTop = 'true'; //是否可以下拉加载
var optionsData = ''; //传递的参数
var exitDown = 1; //是否存在下架商品 1不存在 0存在
var addrInfo = 1; //地址信息是否存在 0不存在 1存在
var sub = false;
var shareId = 0;//邀请人id
//加载页面 获取数据
var loadPage = function(that, options) {
	if (optionsData) {
		myData = options;
		myData.user_id = userInfo.id;
		wx.request({
			url: base_url + 'home/WxService/getConfirmOrderData',
			data: myData,
			method: 'GET',
			success: function(res) {
				var recommendFee = res.data.recommendFee;
				that.setData({
					recommendFee:recommendFee,
					totalPrice: (Number(res.data.sum) - Number(recommendFee) ).toFixed(2),

				});
				//获取商品信息
				var goodsList = res.data.data;
				that.setData({
					base_url: base_url,
					goodsList: res.data.data,
					realPrice: (Number(that.data.totalPrice)).toFixed(2),
				});
				//隐藏loading
				wx.hideLoading()
			}
		})
	}else{
		//隐藏loading
		wx.hideLoading()
	}
};

Page({
	data: {
		index: 0,
		base_url:base_url,
		showImg:0,
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		shareId = options.shareId ? options.shareId : 0;
		userInfo = wx.getStorageSync('userInfo');
		optionsData = options;
		wx.showModal({
			title: '温馨提示',
			content: '此商品为限定商品，购买后不支持退换',
			showCancel: false,
			confirmText: '确定',
			confirmColor: '#FE8A22',
			success: function (res) {
				if (res.confirm) {
				
				}
			}
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		var that = this;
		//打开loading
		wx.showLoading();
		loadPage(that, optionsData);
		userInfo = wx.getStorageSync('userInfo');
		if(userInfo.id){
			that.getUserInfo();
		}
	},


	/**
	 * 获取用户信息
	 */
	getUserInfo(){
		var that = this;
		tools.httpClient('home/WxApp/getUserInfo',{user_id:userInfo.id},(error,data)=>{
			if(data.errorCode == 0){

			}
		})
	},

	/**
	 * 提交订单
	 */
	submitOrder: function(e) {
		var that = this;

		//定义要提交的数据
		var subData = {};
		//用户信息
		subData.user_id = userInfo.id;
		subData.account = userInfo.account;
		subData.nick_name = userInfo.nick_name;
		subData.head_img_url = userInfo.head_img_url;
		//地址
		var addr = that.data.address;
		var goodsList = that.data.goodsList;

		//留言信息
		if (that.data.message) {
			subData.message = that.data.message;
		}
		//gids ,gpids, counts
		var subGids = [];
		var subGpids = [];
		var subCounts = [];
		for (var i = 0; i < that.data.goodsList.length; i++) {
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
		subData.share_id = shareId;
		wx.showLoading({
			title:'',
			mask:true
		})
		wx.request({
			url: base_url + 'home/WxService/addOrder',
			data: subData,
			method: 'GET',
			success: function(res) {
				//console.log(res, 'klj');
				if (res.data.errorCode == 0) {
					if(res.data.data.state == 0){
						var oid = res.data.data.addOrderId;
						tools.httpClient('home/WxService/beforePay',{oid:oid},(error,data)=>{
							if(data.errorCode == 0){
								wx.request({
									url: base_url + '../extend/pay/request/WxServicePay.php?oid=' + oid,
									data: {
										oid: oid
									},
									method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
									success: function(res) {
										wx.requestPayment({
											'timeStamp': res.data.timeStamp,
											'nonceStr': res.data.nonceStr,
											'package': res.data.package,
											'signType': 'MD5',
											'paySign': res.data.paySign,
											'success': function(res) {
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
																url: '/pages/service/serviceOrder/serviceOrder?currentTab=1',
															})
														}
													}
												})
											},
											fail(){
												wx.hideLoading()
											}
										});
						
									},
									fail(){
										wx.hideLoading()
									}
								})
							}else{
								wx.hideLoading()
								wx.showToast({
									title: data.errorInfo,
									icon:'none',
									duration:2000
								})
							}
						})
					}
					else{//已支付
						wx.hideLoading()

						wx.showModal({
							title: '提示',
							content: '支付成功',
							showCancel: false,
							confirmText: '确定',
							confirmColor: '#FE8A22',
							success: function(res) {
								if (res.confirm) {
									wx.redirectTo({
										url: '/pages/service/serviceOrder/serviceOrder?currentTab=1',
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
			fail(){
				wx.hideLoading()
			}
		});

	},

	/**
	 * 监听页面输入
	 */
	listenInput(e){
		var that = this;
		var type = e.currentTarget.dataset.type;
		var data = {};
		data[type] = e.detail.value;
		that.setData(data);
	},



	/**
	 * 获取留言信息
	 */
	messageCont: function(e) {
		this.setData({
			message: e.detail.value
		});
	},


});
