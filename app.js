//app.js
var CONFIG = require('utils/config.js');
var base_url = CONFIG.API_URL.BASE_URL;
var type = 0;
App({
	onLaunch: function(options) {
		var that = this;
console.log(options,'启动');

		var userInfo = wx.getStorageSync('userInfo');
	     var inviteCode = wx.getStorageSync('inviteCode');
	     var user_id = options.query.user_id;
	    //  if(!userInfo  && !inviteCode && !user_id && options.path != 'pages/actiDetail/actiDetail' && options.path != 'pages/jumpPage/jumpPage'){//用户信息与邀请码都未填写时进入邀请码页面
	        //  wx.redirectTo({
	          //  url: '/pages/bindUser/bindUser',
	        //  })
	    //  }
		
		const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate,'获取版本信息')
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          confirmColor: '#F0CCAC',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })
      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
        console.log("更新失败");
      })

		//判断手机型号
		wx.getSystemInfo({
			success: function (res) {

				that.globalData.navHeight = res.statusBarHeight + 46;
				that.globalData.windowHeight = res.windowHeight;
				if (res.model.search('iPhone X') != -1) {
					that.globalData.type = 1;
				}else{
					that.globalData.type = 0;
				}
			}
		})
	
	},
	globalData:{
		type:type,
		navHeight:0,
		windowHeight:0
	},
})

