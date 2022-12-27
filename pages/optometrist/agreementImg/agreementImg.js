// pages/grantStipend/grantStipend.js
const CONFIG = require('../../../utils/config.js');
const tools = require('../../../utils/tools.js');
const app = getApp();
const base_url = CONFIG.API_URL.BASE_URL;
let userInfo = '';
let name = '';
let phone = '';
let address = '';
let license = '';
let bg = '';
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
    let that = this;
    userInfo = wx.getStorageSync('userInfo');
    name = options.name ? options.name : '暂无';
    phone = options.phone ? options.phone : '暂无';
    address = options.address ? options.address : '暂无';
    license = options.license ? options.license : '';
    if(license){
      wx.getImageInfo({
        src: base_url + license,
        success(e){
          license = e.path;
          that.beforeDrawImg(that,e.width,e.height);
        }
      })
    }else{
      that.beforeDrawImg(that);
    }

    // that.getShareCode(that);

  },



  /**
   * 画图前准备
   */
  beforeDrawImg(that,licenseWdith = 0,licenseheight = 0){
    wx.getImageInfo({
      src: base_url + 'bg/b-text.png?r=' + Math.random(),
      success(e){
        bg = e.path;
        that.drawImg(licenseWdith,licenseheight);
      }
    })
  },

  /**
   * 开始画图
   */
  drawImg(licenseWdith,licenseheight) {
    wx.showLoading({
      title: '协议生成中',
    })
    let that = this;
    let width = 750;
    let height = 1343;
    if(license){
      licenseheight = Number(licenseheight) * ( 700 / Number(licenseWdith));
      licenseWdith = 700;
      height = licenseheight + height + 30;
    }
    that.setData({
      canvasHidden:false,
      width:width,
      height:height
    },function (){
      let context = wx.createCanvasContext('share')  //这里的“share”是“canvas-id”
      context.setFillStyle('#fff')    //这里是绘制白底，让图片有白色的背景
      context.fillRect(0, 0, width, height)
      context.drawImage(bg, -100, -50, 950, 1343) //绘制背景图
      that.fillText(context,18, '#333',  name,115,205);
      that.fillText(context,18, '#333',  phone,105,235);
      if(address.length > 42){
        that.fillText(context,16, '#333',  address.substr(0,42),85,260);
      }else{
        that.fillText(context,16, '#333',  address,85,260);
      }

      if(license){
        context.drawImage(license, 25, 1283, licenseWdith, licenseheight) //绘制营业执照
      }
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

  }
})
