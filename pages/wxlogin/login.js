// pages/logins/logins.js
const CONFIG = require('../../utils/config.js');
const tools = require('../../utils/tools.js');
const app = getApp();
const base_url = CONFIG.API_URL.BASE_URL;
let canClick = 1;
let openId = '';
let did = 0;
let actiId = 0;
let inviteCode = '';
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let  that = this;
		openId = options.openId ? options.openId : '';
		did = wx.getStorageSync('did');
		actiId = wx.getStorageSync('actiId');
		inviteCode = wx.getStorageSync('inviteCode');

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		did = wx.getStorageSync("did");
	},

	/**
	 * 获取用户信息
	 * @param e
	 */
	getUserProfile(e) {
		wx.getUserProfile({
			desc: '用于完善您的资料',
			success: (res) => {
				//组装提交数据
				let sumitData = {
					openId:openId,
					did:did ? did : 0,
					actiId:actiId ? actiId : 0,
					inviteCode:inviteCode ? inviteCode : '',
					nickName:res.userInfo.nickName,
					avatarUrl:res.userInfo.avatarUrl,
					city:res.userInfo.city,
					country:res.userInfo.country,
					province:res.userInfo.province,
					gender:res.userInfo.gender,
				};
				//保存用户信息
				tools.httpClient('home/WxApp/addUser',sumitData,(error,data)=>{
					if(data.data != '' && data.data != null){
						wx.setStorage({
							key: "userInfo",
							data:data.data
						});
					}
					wx.navigateBack();
				})
			},
			fail(e) {
				console.log(e);
				wx.showToast({
					title:'授权失败',
					icon:'none',
					duration:2000
				})
			}
		})
	},

	back: function() {
		wx.navigateBack();
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},
})
