// pages/grantStipend/grantStipend.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var codeImg = '';
var bg = '';
var acti_id = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    canvasHidden:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    acti_id = options.acti_id ? options.acti_id : 0;
    userInfo = wx.getStorageSync('userInfo');
    that.getShareCode(that);
  },


  /**
   * 获取二维码
   */
  getShareCode(that){
    tools.httpClient('home/WxApp/getCode',{user_id:userInfo.id,type:8,acti_id:acti_id},(error,data)=>{
      if(data.errorCode == 0){
        var code = data.data + '?r=' + Math.random();
        wx.getImageInfo({
          src: base_url + code,
          success(e){
            codeImg = e.path;
            that.beforeDrawImg(that);
          }
        })
      }
    })
  },

  /**
   * 画图前准备
   */
  beforeDrawImg(that){
    wx.getImageInfo({
      src: base_url + 'bg/acti_bg.png?r=' + Math.random(),
      success(e){
        bg = e.path;
        that.drawImg();
      }
    })
  },

  /**
   * 开始画图
   */
  drawImg() {
    wx.showLoading({
      title: '二维码生成中',
    })
    var that = this;
    that.setData({
      canvasHidden:false
    })
    let context = wx.createCanvasContext('share')  //这里的“share”是“canvas-id”

    var width = 750;
    var height = 1489;
    context.setFillStyle('#fff')    //这里是绘制白底，让图片有白色的背景
    context.fillRect(0, 0, width, height)

    context.drawImage(bg, 0, 0, width, height) //绘制背景图
    context.drawImage(codeImg, 200, 780,350, 350) //绘制二维码
    //把画板内容绘制成图片，并回调画板图片路径
    context.draw(false, function () {
      setTimeout(()=>{
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: width,
          height: height,
          destWidth: width,
          destHeight: height,
          canvasId: 'share',
          success: a => {
            console.log(a.tempFilePath);
            var imgPath = a.tempFilePath;
            that.setData({
              imgPath: imgPath,
              canvasHidden:true
            });             //更改data的值

            wx.hideLoading()  //图片已经绘制出来，隐藏提示框
          },
          fail: e => { console.log(e) }
        })
      },200)

    })
  },
  /**
   * 裁剪并绘制圆形图片
   * x num 圆在画布的x坐标
   * y num 圆在画布的y坐标
   * r num 圆的半径
   * w num 图片在画布的x坐标
   * h num  图片在画布的y坐标
   * c num 图片的宽高
   * img string 图片路径
   * context 初始化画布
   * */
  clip: function (context, img, x, y, r, w, h, c) {
    context.save();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.setFillStyle('#FE760A')
    context.stroke();
    // 从画布上裁剪出这个圆形
    context.clip();
    context.drawImage(img, w, h, c, c);
    context.restore()
  },
  /**
   * 绘制文字
   * textSize 字体大小
   * textColor 文字颜色
   * text 文字
   * x 在画布的x坐标
   * y 在画布的y坐标
   */
  fillText: function (context, textSize, textColor, text, x, y) {
    context.setFontSize(textSize)
    context.setFillStyle(textColor)
    context.fillText(text, x, y)  //绘制文字
  },
  /**
   * 显示图片
   */
  showImg(e){
    var that = this;
    var imgPath = that.data.imgPath;
    wx.previewImage({     //将图片预览出来
      urls: [imgPath]
    })
  },
  /**
   * 保存二维码
   */
  save(){
    var that = this;
    var first = wx.getStorageSync('first') || 0;
    if(first == 1){//用户拒绝授权，打开设置
      wx.openSetting({
        success: (res) => {
          wx.setStorageSync('first', 0);
        },
        fail:(res)=>{
        }
      })
    }
    var that = this;
    var imgPath = that.data.imgPath;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.saveImg(imgPath)
            },
            fail(e) {//拒绝将first置为1
              wx.setStorageSync('first', 1);
            }
          });
        } else {
          that.saveImg(imgPath)
        }
      }
    });

  },
  /**
   *保存图片
   */
  saveImg(path){
    wx.saveImageToPhotosAlbum({
      filePath:path,
      success(res) {
        wx.showToast({
          title: '保存成功',
        })
      }
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


})
