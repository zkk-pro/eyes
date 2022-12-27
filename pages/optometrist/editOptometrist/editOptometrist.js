// pages/index/index.js
var wx_login = require('../../../utils/wxLogin.js');
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var img_url = '';//记录上传的图片地址
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    optometristInfo:'',
    head_img:'',
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    that.getOptometristByUserId(that);
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;

    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
      // if(userInfo.id){

      // }
    },100)
  },

  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          optometristInfo: data.data,
          head_img:data.data.head_img,
          name: data.data.name
        });

      }
    })
  },

  /**
   * 重新上传图片
   */
  changeHeadImg(){
    var that = this;
    wx.chooseImage({
      count:1,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: base_url + 'home/WxApp/uploadImgFile',
          filePath: tempFilePaths[0],
          name: 'file',
          success: function (res) {
            var data = JSON.parse(res.data);

            if(data.errorCode == 0){
              img_url = data.data;
              console.log(img_url);
              that.setData({
                head_img: img_url,
              });
            }else{
              wx.showToast({
                title:data.errorInfo,
                icon:'none'
              })
            }

          }
        })
      }
    })
  },

  /**
   * 提交修改信息
   */
  editOptometrist(){
    var that = this;
    var head_img = that.data.head_img;
    var name = that.data.name;
    if(!name){
      wx.showToast({
        title:'姓名不能为空',
        duration:2000,
        icon:'none'
      })
      return false;
    }

    tools.httpClient('home/WxApp/editOptometrist',{user_id:userInfo.id ? userInfo.id : -1,head_img:head_img,name:name},(error,data)=>{
      if(data.errorCode == 0){
          wx.showToast({
            title:'修改成功',
            duration:2000,
            success(res) {
              setTimeout(function (){
                wx.navigateBack();
              },1500)
            }
          })
      }else{
        wx.showToast({
          title:'修改成功',
          duration:2000,
          icon:'none'
        })
      }
    })
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
    //删除未提交服务器的图片
      if(img_url){
          tools.httpClient('home/WxApp/deleteImgFile',{},(error,data)=>{

          });
      }
  },






  /**
   * 页面滚动时触发
   */
  onPageScroll: function (e){

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



})