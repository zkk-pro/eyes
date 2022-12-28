// pages/buyEyeData/buyEyeData.js
var tools = require('/utils/tools.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // home/WxApp/getDegreePackage
    console.log('000000')
    this.getList()
  },
  getList() {
    console.log('9999')
    tools.httpClient("home/WxApp/getDegreePackage", {
      pageIndex: 1,
      pageSize: 100,
      type: 0
    }).then(res => {
      console.log('res:', res)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('999999999999999999999')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh() {

  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})