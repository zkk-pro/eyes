//定义登录方法
var CONFIG = require('./config.js');
var base_url = CONFIG.API_URL.BASE_URL;
var wxLogin = {
	_login: function(did,callback) {
		// 调用接口获取登录凭证（code）进而换取用户登录态信息，包括用户的唯一标识（openid） 及本次登录的 
		// 会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成。
		// 注：调用 login 会引起登录态的刷新，之前的 sessionKey 可能会失效。
		wx.login({
			success: function(res) {
				if (res.code) {
					var code = res.code;
					wx.request({
						url: base_url + 'home/WxApp/wxLogin',
						data: {
							js_code: code
						},
						method: 'GET',
						success: function(res) {
							var data = res.data;
							// console.log(data);
							//后台传回thirdRD_session存入storage,用于后续通信使用
							wx.setStorageSync('thirdRD_session', data);
							// 此前有调用过 wx.login 且登录态尚未过期，此时返回的数据会包含 encryptedData, iv 等敏感信息
							wx.getUserInfo({
								success: function(res) {
									// success
									var encryptedData = res.encryptedData;
									var iv = res.iv; //加密算法的初始向量
									var thridRDSession = wx.getStorageSync('thirdRD_session');
									var sendData = {
										thridRDSession: thridRDSession,
										encryptedData: encryptedData,
										iv: iv,
									};
									if (did) {
										sendData.user_id = did;
									}
									let actiId = wx.getStorageSync("actiId");
									actiId = actiId ? actiId : 0;
									if(actiId > 0){
										sendData.acti_id = actiId;
									}
									//获取邀请码
									var inviteCode = wx.getStorageSync('inviteCode');
									sendData.invite_code = inviteCode ? inviteCode : '';
									wx.request({
										url: base_url + 'home/WxApp/decryptUserInfo',
										data: sendData,
										method: 'GET',
										header: {
											'content-type': 'application/json'
										}, // 设置请求的 header
										success: function(res) {
											if (res.data != "" || res.data != null) {
												var ws = res.data;

												wx.setStorage({
													key: "userInfo",
													data: res.data
												});	
												callback ? callback(res.data) : '';	
											}
										}
									})
								},
							});
						}
					});
				} else {
					console.log('获取用户登录态失败！' + res.errMsg)
				}
			}
		});
	}

};
module.exports = wxLogin;
