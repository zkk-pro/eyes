function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


/**
 * 将小程序的API封装成支持Promise的API
 * @params fn {Function} 小程序原始API，如wx.login
 */
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}

//更新当前地理位置
const getMap = ()=> {
	return new Promise(resolve => {
		wx.getLocation({
			type: 'gcj02',
			success: (res) => {
				wx.setStorageSync('userMap', res)
				resolve(res)
			},
			fail: () => {
				resolve('')
			}
		})
	})

}

// 获取权限
const getAuthor=(v)=> {
  return new Promise((r, j) => {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting[v] === false) {
          wx.showModal({
            title: '提示',
            content: '已拒绝过此权限，请手动授权',
            success: (data) => {
              if (data.confirm) {
                wx.openSetting({
                  success: (data) => {
                    if (data.authSetting[
                        v]) {
                      r(true)
                    } else {
                      j('授权失败')
                    }
                  }
                })
              } else {
                j('授权失败')
              }
            }
          })
        } else if (res.authSetting[v]) {
          r(true)
        } else {
          wx.authorize({
            scope: v,
            success: () => {
              r(true)
            },
            fail: () => {
              j('授权失败')
            }
          })
        }
      }
    })
  })

}


module.exports = {
  formatTime: formatTime,
  wxPromisify: wxPromisify,
  getAuthor,
  getMap
}
