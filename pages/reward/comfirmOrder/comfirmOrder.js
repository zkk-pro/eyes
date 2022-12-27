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
var couponInfo = ['选择优惠券'];
var couponIdArray = [0];
var couponValueArray = [0];
//加载页面 获取数据
var loadPage = function(that, options) {
	if (optionsData) {
		myData = options;
		myData.user_id = userInfo.id;
		wx.request({
			url: base_url + 'home/WxReward/getConfirmOrderData',
			data: myData,
			method: 'GET',
			success: function(res) {
				//获取到默认地址
				var addressList = res.data.addressList;
				if (addressList.length > 0) {
					for (var i = 0; i < addressList.length; i++) {
						if (addressList[i].is_default == 1) {
							that.setData({
								address: addressList[i]
							});
							break;
						}
					}
				}
				//获取运费信息
				var orderFee = res.data.orderFee;
				var recommendFee = res.data.recommendFee;
				that.setData({
					orderFee: orderFee,
					recommendFee:recommendFee,
					totalPrice: (Number(res.data.sum) - Number(recommendFee) ).toFixed(2),
				});
				//获取商品信息
				var goodsList = res.data.data;
				couponInfo = ['选择优惠券'];
				couponValueArray = [0];
				couponIdArray = [0];
				let couponList = res.data.couponInfo;//获取优惠券信息
				if(couponList.length > 0){//处理优惠券数组
					for(let j = 0;j < couponList.length;j++){
						couponIdArray.push(couponList[j].id);
						let name = "满"+couponList[j]['condition_value']+"减"+couponList[j]['value'];
						couponInfo.push(name);
						couponValueArray.push(couponList[j]['value']);
					}
				}
				that.setData({
					base_url: base_url,
					goodsList: res.data.data,
					realPrice: (Number(that.data.totalPrice) + Number(orderFee)).toFixed(2),
					couponInfo:couponInfo,
					couponIdArray:couponIdArray,
					couponValueArray:couponValueArray
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
		degreeArray:[],
		astigmiaArray:[],
		axialArray:[],
		pupilArray:[],
		addArray:[],
		degreeLeftName:'',
		degreeRightName:'',
		astigmiaLeftName:'',
		astigmiaRightName:'',
		axialLeftName:'',
		axialRightName:'',
		pupilLeftName:'',
		pupilRightName:'',
		addLeftName:'',
		addRightName:'',
		payArray:['微信支付','余额支付'],
		payIndex:0,
		isDegree:0,//0代表无度数 1代表有度数
		showImg:0,
		couponName:'选择优惠券',
		couponIndex:0,
		couponMin:0
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		userInfo = wx.getStorageSync('userInfo');
		optionsData = options;
		that.getAllDegree();
		that.getAllAstigmia();
		that.getAllAxial();
		that.getAllPupil();
		that.getAllAdd();
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
	 * 获取度数列表
	 */
	getAllDegree(){
		var that = this;
		tools.httpClient('home/WxApp/getAllDegree',{},(error,data)=>{
			if(data.errorCode == 0){
				that.setData({
					degreeArray:data.data,
				})
			}
		})
	},

	/**
	 * 获取散光列表
	 */
	getAllAstigmia(){
		var that = this;
		tools.httpClient('home/WxApp/getAllAstigmia',{},(error,data)=>{
			if(data.errorCode == 0){
				that.setData({
					astigmiaArray:data.data,
				})
			}
		})
	},

	/**
	 * 获取轴位列表
	 */
	getAllAxial(){
		var that = this;
		tools.httpClient('home/WxApp/getAllAxial',{},(error,data)=>{
			if(data.errorCode == 0){
				that.setData({
					axialArray:data.data,
				})
			}
		})
	},

	/**
	 * 获取瞳距列表
	 */
	getAllPupil(){
		var that = this;
		tools.httpClient('home/WxApp/getAllPupil',{},(error,data)=>{
			if(data.errorCode == 0){
				that.setData({
					pupilArray:data.data,
				})
			}
		})
	},

	/**
	 * 获取Add列表
	 */
	getAllAdd(){
		var that = this;
		tools.httpClient('home/WxApp/getAllAdd',{},(error,data)=>{
			if(data.errorCode == 0){
				that.setData({
					addArray:data.data,
				})
			}
		})
	},

	/**
	 * 获取用户信息
	 */
	getUserInfo(){
		var that = this;
		tools.httpClient('home/WxApp/getUserInfo',{user_id:userInfo.id},(error,data)=>{
			if(data.errorCode == 0){
				that.setData({
					"degreeLeftName": data.data.optometry_data.degreeLeftName ? data.data.optometry_data.degreeLeftName : '',
					"degreeRightName": data.data.optometry_data.degreeRightName ?  data.data.optometry_data.degreeRightName : '',
					"astigmiaLeftName": data.data.optometry_data.astigmiaLeftName ? data.data.optometry_data.astigmiaLeftName : '',
					"astigmiaRightName": data.data.optometry_data.astigmiaRightName ? data.data.optometry_data.astigmiaRightName : '',
					"axialLeftName": data.data.optometry_data.axialLeftName ? data.data.optometry_data.axialLeftName : '',
					"axialRightName": data.data.optometry_data.axialRightName ? data.data.optometry_data.axialRightName : '',
					"pupilLeftName": data.data.optometry_data.pupilLeftName ? data.data.optometry_data.pupilLeftName : '',
					"pupilRightName": data.data.optometry_data.pupilRightName ? data.data.optometry_data.pupilRightName : '',
					// "addLeftName": data.data.optometry_data.addLeftName,
					// "addRightName": data.data.optometry_data.addRightName,
					"isDegree":data.data.optometry_data.isDegree && data.data.optometry_data.isDegree != 3 ? data.data.optometry_data.isDegree : 0,
					"rechargeMoney":data.data.recharge_money
				})
			}
		})
	},

	/**
	 * 选择度数
	 */
	isDegree(e){
		let isDegree = e.currentTarget.dataset.isDegree;
		this.setData({
			isDegree:isDegree
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
		subData.pay_method = that.data.payIndex;
		//地址
		var addr = that.data.address;
		var goodsList = that.data.goodsList;
		if(goodsList[0]['is_normal'] != 1   || goodsList[0].is_data == 1) {
			if (typeof (addr) != 'undefined') {
				var address = that.data.address;
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
		}else{
			subData.address_text = '';
			subData.address = '';
		}
		//获取验光数据
		if(goodsList[0]['is_normal'] == 1){
			var degreeLeftName = that.data.degreeLeftName;
			var degreeRightName = that.data.degreeRightName;
			var astigmiaLeftName = that.data.astigmiaLeftName;
			var astigmiaRightName = that.data.astigmiaRightName;
			var axialLeftName = that.data.axialLeftName;
			var axialRightName = that.data.axialRightName;
			var pupilLeftName = that.data.pupilLeftName;
			var pupilRightName = that.data.pupilRightName;
			// var addLeftName = that.data.addLeftName;
			// var addRightName = that.data.addRightName;
			if(goodsList[0].is_data == 1){//需要填写验光数据
				if(that.data.isDegree == 1){//有度数!pupilLeftName |||| !addLeftName || !addRightName 
					if(!degreeLeftName || !degreeRightName || !astigmiaLeftName || !astigmiaRightName || !axialLeftName || !axialRightName ||  !pupilRightName){
						wx.showToast({
							title: '请完善验光数据',
							icon: 'none',
							duration: 1000
						});
						return false;
					}
				}else{//无度数
					if(!degreeLeftName || !degreeRightName  ||  !pupilRightName){
						wx.showToast({
							title: '请完善验光数据',
							icon: 'none',
							duration: 1000
						});
						return false;
					}
				}

			}
			subData.optometry_data = JSON.stringify({
				"degreeLeftName": degreeLeftName,
				"degreeRightName": degreeRightName,
				"astigmiaLeftName": astigmiaLeftName,
				"astigmiaRightName": astigmiaRightName,
				"axialLeftName": axialLeftName,
				"axialRightName": axialRightName,
				"pupilLeftName": pupilLeftName,
				"pupilRightName": pupilRightName,
				// "addLeftName": addLeftName,
				// "addRightName": addRightName,
				"isDegree" : goodsList[0].is_data == 0 ? 3 : that.data.isDegree
			});
		}else{
			subData.optometry_data = '';
		}
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
		//优惠券信息
		let couponIndex = that.data.couponIndex;
		subData.user_coupon_id = couponIdArray[couponIndex];
		wx.showLoading({
			title:'',
			mask:true
		})
		wx.request({
			url: base_url + 'home/WxReward/addOrder',
			data: subData,
			method: 'GET',
			success: function(res) {
				//console.log(res, 'klj');
				if (res.data.errorCode == 0) {
					if(res.data.data.state == 0){
						var oid = res.data.data.addOrderId;
						tools.httpClient('home/WxReward/beforePay',{oid:oid},(error,data)=>{
							if(data.errorCode == 0){
								wx.request({
									url: base_url + '../extend/pay/request/WxRewardPay.php?oid=' + oid,
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
												wx.hideLoading()
												wx.showToast({
													title: '支付成功',
													icon: 'success',
													duration: 3000,
													success(e){
														setTimeout(function(){
															wx.redirectTo({
																url: '/pages/reward/rewardOrder/rewardOrder',
															})
														
														},2000)
													}
												});
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
						wx.redirectTo({
							url: '/pages/reward/rewardOrder/rewardOrder',
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
	 * 选择优惠券
	 */
	bindChoiceCoupon(e){
		let that = this;
		let index = e.detail.value;
		that.setData({
			couponName:couponInfo[index],
			couponIndex:index,
			couponMin:Number(couponValueArray[index])
		})
	},

	/**
	 * 选择支付方式
	 */
	bindPayChange(e){
		this.setData({
			payIndex:e.detail.value
		});
	},
/**
   * 显示展开图片
   */
  showNoticeImg(e){
		var that = this;
		var showImg = that.data.showImg;
		if(showImg == 1){
		 showImg = 0;
		}else{
		 showImg = 1;
	 }
	 that.setData({
		 showImg:showImg
	 })
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
	 * 监听picker选择
	 */
	bindPickerChange(e){
		var that = this;
		var type = e.currentTarget.dataset.type;
		var data = {};
		var dataList = [];
		if(type == 'astigmiaLeftName' || type == 'astigmiaRightName'){//左右散光
			dataList = that.data.astigmiaArray;
		}else if(type == 'axialLeftName' || type == 'axialRightName'){//左右轴位
			dataList = that.data.axialArray;
		}else if(type == 'pupilLeftName' || type == 'pupilRightName'){//左右瞳距
			dataList = that.data.pupilArray;
		}else if(type == 'addLeftName' || type == 'addRightName'){//左右瞳距
			dataList = that.data.addArray;
		}else{//左右度数
			dataList = that.data.degreeArray;
		}
		data[type] = dataList[e.detail.value]['name'];
		that.setData(data);
	},

	/**
	 * 选择地址
	 */
	selectAddress: function() {
		wx.navigateTo({
			url: '/pages/address/addressList/addressList'
		})
	},

	/**
   * 预览图片
   */
  prewImg(e){
		let that = this;
		let currentSrc = e.currentTarget.dataset.src;
		wx.previewImage({
			urls: [currentSrc],
		})
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
