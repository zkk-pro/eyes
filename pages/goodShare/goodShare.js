// pages/grantStipend/grantStipend.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var codeImg = '';
var bg = '';
var imgList = [];
var chocieImg = [];//选中的图片
var goodsName = '';
var price = 0.00;
var type = 0;
var gid = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    canvasHidden:true,
    imgList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    type = options.type ? options.type : 0;
    gid = options.gid ? options.gid : 0;
    wx.showLoading();
    userInfo = wx.getStorageSync('userInfo');
   
    that.getGoodsDetail();
  },

  /**
   * 获取商品信息
   */
  getGoodsDetail(){
    var that = this;
    var url = 'home/WxStore/getGoodsDetail';
    if(type == 1){
      url = 'home/WxRob/getGoodsDetail';
    }else if(type == 2){
      url = 'home/WxReward/getGoodsDetail';
    }else if(type == 9){
      url = 'home/WxService/getGoodsDetail';
    }
    tools.httpClient(url,{gid: gid,user_id:userInfo.id},(error,data)=>{
      if(data.errorCode == 0){
        var goodsInfo = data.data;
        var image = [goodsInfo.img_url];
        imgList = [];
        chocieImg = [];
        goodsName = goodsInfo.name;
        price =  goodsInfo.price;
        if(goodsInfo.image_list.length > 0){
            for(let i = 0; i < goodsInfo.image_list.length; i++){
              image.push(goodsInfo.image_list[i]['img_url']);
            }
        }
        for(let i = 0; i < image.length; i++){
            wx.getImageInfo({
              src: base_url + image[i],
              success(e){
                imgList.push(e.path);
                if(imgList.length == image.length){
                  chocieImg.push(imgList[0]);
                    that.setData({
                      imgList:imgList, 
                      chocieImg:chocieImg
                    },function (){
                      setTimeout(function(){
                        wx.hideLoading();
                    },1000)
                      that.getShareCode(that);
                     
                    })
                }
              }
            })
        }
      

      }
    })
  },

 



  /**
   * 获取二维码
   */
  getShareCode(that){
    tools.httpClient('home/WxApp/getCode',{user_id:userInfo.id,gid:gid,type:type},(error,data)=>{
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
      src: base_url + 'bg/goodShare.png?r='+Math.random(),
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
   
    var width = 630;
    var height = 950;
    if(chocieImg.length == 2){
      height = 1540;
    }else if(chocieImg.length == 3){
      height = 1245;
    }else if(chocieImg.length == 4){
      height = 1147;
    }
    that.setData({
      width:width,
      height:height
    })
    context.setFillStyle('#fff')    //这里是绘制白底，让图片有白色的背景
    context.fillRect(0, 0, width, height);

    context.drawImage(bg, 0,  height - 220, 630,225) //绘制底部图
    context.drawImage(codeImg, 430,height - 180,160, 160) //绘制二维码
   
    if(chocieImg.length == 2){
      context.drawImage(chocieImg[0], 20,20,590, 590) //绘制商品主图
      context.drawImage(chocieImg[1], 20,610,590, 590) //绘制商品主图 辅图1张
    }else if(chocieImg.length == 3){
      context.drawImage(chocieImg[0], 20,20,590, 590) //绘制商品主图
      context.drawImage(chocieImg[1], 20,610,295, 295) //绘制商品主图 辅图2张
      context.drawImage(chocieImg[2], 315,610,295, 295) //绘制商品主图 辅图2张
    }else if(chocieImg.length == 4){
      context.drawImage(chocieImg[0], 20,20,590, 590) //绘制商品主图
      context.drawImage(chocieImg[1], 20,610,197, 197) //绘制商品主图 辅图3张
      context.drawImage(chocieImg[2], 217,610,197, 197) //绘制商品主图 辅图3张
      context.drawImage(chocieImg[3], 414,610,197, 197) //绘制商品主图 辅图3张
    }else{
      context.drawImage(chocieImg[0], 20,20,590, 590) //绘制商品主图
    }

    //  goodsName = '眼镜商1品眼镜1商品眼镜1商品眼镜1商品眼1镜商品眼镜商品眼镜';
    if(goodsName.length > 12 ){
      that.fillText(context,35, '#333',  goodsName.substring(0,12),20,height - 260);
      if(goodsName.length > 24){
        that.fillText(context,35, '#333',  goodsName.substring(12,23) + "...",20,height - 220);
      }else{
        that.fillText(context,35, '#333',  goodsName.substring(12) ,20,height - 220);
      }
      that.fillText(context,25, '#FE5910', "￥",480,height - 235);
      that.fillText(context,40, '#FE5910', Number(price),510,height - 235);
    }else{
      that.fillText(context,35, '#5A5A5A', goodsName,20,height - 240);
      that.fillText(context,25, '#FE5910', "￥",480,height - 240);
      that.fillText(context,40, '#FE5910', Number(price),510,height - 240);
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
   * 切换图片
   */
  choiceImg(e){
    var that = this;
    var img = e.currentTarget.dataset.img;
    var index = chocieImg.indexOf(img);
    if(index != -1){
      if(chocieImg.length <= 1){
        wx.showToast({
          title: '请至少选择一张图片',
          icon:'none',
            duration: 2000
        });
        return;
      }
      chocieImg.splice(index,1);
    }else{
      chocieImg.push(img);
    }
    that.setData({
      chocieImg:chocieImg
    })
    that.drawImg();
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var user_id = userInfo.id ? userInfo.id : 0;
    return {
      title: '首页',
      path: '/pages/index/index?user_id=' +user_id,
    }
  }
})
