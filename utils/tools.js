var CONFIG = require('./config.js');
var base_url = CONFIG.API_URL.BASE_URL;
var tools = {
	fetchHttpCilent: function(params) {
		var _this = this;
		return new Promise((resolve, reject) => {
			wx.request({
				url: params.API_URL,
				data: Object.assign({}, params.data),
				header: {
					'Content-Type': 'application/json'
				},
				success: resolve,
				fail: reject
			});
		});
	},
	result: function(params) {
		var _this = this;
		return _this.fetchHttpCilent(params).then(res => res);
	},
	//返回顶部
	backTop: function() {
		wx.pageScrollTo({
			scrollTop: 0
		})
	},
	//一键拨号
	makePhoneCall: function(phoneNumber) {
		wx.makePhoneCall({
			phoneNumber: phoneNumber
		})
	},
	//操作成功提示
	showSuccessToast: function(title = "恭喜操作成功！") {
		wx.showToast({
				title: title,
				icon: 'success',
				duration: 1500
			}),
			setTimeout(function() {
				wx.hideToast();
			}, 2000)
	},
	//操作失败提示
	showFailToast: function(title = "对不起操作失败！") {
		wx.showToast({
				title: title,
				image: '../../static/images/common/fails.png',
				duration: 1500
			}),
			setTimeout(function() {
				wx.hideToast();
			}, 2000)
	},
	/* 2021-10-21 */
	request(url, method, data, dateType = "application/json;"){
		return new Promise((resolve, reject) => {
			wx.request({
				url:  base_url + url,
				method: method,
				data: data,
				header: {
				  'Content-Type': dateType,
				  'token': wx.getStorageSync("token")
				},
				success(request){
					const {
						data,
					  } = request.data;
					  resolve(request.data);
				},
				fail(){
					reject("网络繁忙！");
				}
			})
		})
	},
	/**
	 * request请求
	 */
	httpClient(url, data, callback) {
		wx.request({
			url: base_url + url,
			data: data,
			header: {
				"Content-Type": "application/json"
			},
			method: "GET",
			dataType: 'json',
			success: function(res) {
				callback(null, res.data)
			},
			fail: function(error) {
				callback(error)
			}
		})
	},

	/**
	 * 判断是否授权
	 */
	isWxLogin(callback) {
		let userInfo = wx.getStorageSync("userInfo");
		if (userInfo.id) {
			callback(true); //已授权
		} else {
			wx.login({
				success: function(res) {
					if (res.code) {
						let code = res.code;
						wx.showLoading({
							title:''
						})
						tools.httpClient('home/WxApp/getOpendIdByCode',{jsCode:code},(error,data)=>{
							if(data.errorCode == 0){//获取成功

								let thirdRD_session = data.data.thirdRD_session;
								//后台传回thirdRD_session存入storage,用于后续通信使用
								wx.setStorageSync('thirdRD_session', thirdRD_session );
								wx.setStorage({
									key: "userInfo",
									data: data.data.userInfo
								});
								callback(true);
							}else if(data.errorCode == 2){//无用户只有opendId 跳转页面拉取用户信息
								let openId = data.data.openid;
								let thirdRD_session = data.data.thirdRD_session;
								//后台传回thirdRD_session存入storage,用于后续通信使用
								wx.setStorageSync('thirdRD_session', thirdRD_session );
								wx.showModal({
									title: '提示',
									content: '继续使用小程序需要您授权头像昵称等信息',
									showCancel: true,
									confirmText: '去授权',
									confirmColor: '#FE8A22',
									success: function(res) {
										if (res.confirm) {
											wx.navigateTo({
												url: `/pages/wxlogin/login?openId=${openId}`,
											})
										}
									}
								})
								callback(false); //未授权
							}
							wx.hideLoading();
						})
					} else {
						callback(false); //未授权
						console.log('获取用户登录态失败！' + res.errMsg)
					}
				}
			});

		}
	},

	/**
	 * 上传图片
	 * @param string url 上传地址
	 * @param function callback 回调函数
	 * @param int num 图片数量
	 * @param array imgList 储存图片地址的数组
	 */
	uploadImg(url, num, imgList, callback) {
		wx.chooseImage({
			count: num,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success(res) {
				const tempFilePaths = res.tempFilePaths;

				for (var i = 0; i < tempFilePaths.length; i++) {
					//上传图片到服务器
					wx.uploadFile({
						url: base_url + url,
						filePath: tempFilePaths[i],
						name: 'file',
						formData: null,
						success: function(res) {
							//获取到的结果为字符串形式，转化为对象
							var data = JSON.parse(res.data);
							var img_url = data.data;
							imgList.push({
								'img_url': img_url
							});
							callback(imgList);
						}
					});
				}
			}
		})
	},

	/**
	 * 获取坐标
	 */
	getLocation(call) {
		wx.getLocation({
			type: 'gcj02',
			success: function(data) {
				call(null,data);
			},
			fail: function(error) {
				call(error,null);
			},
		})
	},
	//富文本图片替换
	richReplaceImg:function(content){
		var reg = new RegExp('<img ', "g")
		return content.replace(reg, '<img style="max-width:100%;height:auto;display:block;"');
	},
	/**
	 * 获取当天
	 */
	getNowDate(){
		let now = new Date();
		return now.getFullYear() + "-" + (now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" + now.getDate() : now.getDate());
	},

	/**
	 * 上传单张图片
	 * @param url
	 * @param upladFile string 上传到服务器的路径
	 * @param callback
	 */
	uploadSingleImg(url, upladFile,callback) {
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success(res) {
				const tempFilePaths = res.tempFilePaths;
				//上传图片到服务器
				wx.uploadFile({
					url: base_url + url,
					filePath: tempFilePaths[0],
					name: 'file',
					formData: {upladFile:upladFile},
					success: function(res) {
						console.log(res.data);
						//获取到的结果为字符串形式，转化为对象
						let data = JSON.parse(res.data);
						let img_url = data.data;
						callback(img_url);
					}
				});
			}
		})
	},

	/**
	 * 获取明天
	 */
	getTomorrowDate() {//获取当前时间后一天
		let nowdate = new Date();
		nowdate.setDate(nowdate.getDate() + 1);
		let y = nowdate.getFullYear();
		let m = nowdate.getMonth() + 1 < 10 ? "0" + (nowdate.getMonth() + 1) : nowdate.getMonth() + 1;
		let d = nowdate.getDate() < 10 ? "0" + nowdate.getDate() : nowdate.getDate();
		let formatwdate = y + '-' + m + '-' + d;
		return formatwdate;
	},
	/**
	 * 获取日期差
	 */
	getDaysBetween(dateString1,dateString2){
		let  startDate = Date.parse(dateString1);
		let  endDate = Date.parse(dateString2);
		let  days=(endDate - startDate)/(1*24*60*60*1000);
		// alert(days);
		return  days + 1;
	}
}
module.exports = tools;
