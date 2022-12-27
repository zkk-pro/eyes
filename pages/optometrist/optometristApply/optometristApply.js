// pages/index/index.js
const wx_login = require('../../../utils/wxLogin.js');
const CONFIG = require('../../../utils/config.js');
const tools = require('../../../utils/tools.js');
//index.js
const app = getApp();
let base_url = CONFIG.API_URL.BASE_URL;
let userInfo = "";
let isClick = true;
let latitude = '';//经度
let longitude = '';//纬度
let parentUserId = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    head_img:'',
    detail:'',
    license:'',
    address:'',
    is_agree:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    parentUserId = options.user_id ? options.user_id : 0;
    userInfo = wx.getStorageSync('userInfo');
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
    let that = this;
    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
    },100)


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
   * 监听页面输入
   */
  listenInput(e){
    let that = this;
    let type = e.currentTarget.dataset.type;
    let data = {};
    data[type] = e.detail.value;
    that.setData(data);
  },

  /**
   * 选择区域
   */
  choiceArea(){
    let that = this;
    tools.getLocation((error,data)=>{
      wx.chooseLocation({
        latitude:data.latitude,
        longitude:data.longitude,
        success(res){
          latitude = res.latitude;
          longitude = res.longitude;
          console.log(res);
          let detail = res.address + res.name;
            that.setData({
              address:detail,
            })
        }
      })
    });
  },




  /**
   * 上传图片
   */
  uploadImg(e){
    let that = this;
    let type = e.currentTarget.dataset.type;
    let data = {};
    tools.uploadSingleImg('home/WxApp/uploadImgFile','upload/image/' + type,function (res){
      let  img_url = res;
      data[type] = img_url;
      that.setData(data);
    })
  },

  /**
   * 删除图片e
   */
  delImage(e){
    let that = this;
    let type = e.currentTarget.dataset.type;
    let img_url = that.data[type];
    let data = {};
    tools.httpClient('home/WxApp/deleteImgFile',{img_url:img_url},(error,data)=>{
      data[type] = '';
      that.setData(data);
    });
  },

  /**
   * 同意取消协议
   */
  agreeRule(){
    let isAgree = this.data.is_agree;
    if(isAgree == 1){
      isAgree = 0;
    }else{
      isAgree = 1;
    }
    this.setData({
      is_agree:isAgree
    })
  },


  /**
   * 跳转用户协议
   */
  jumpRule(){
    wx.navigateTo({
      url:'/pages/optometrist/richText/richText'
    })
  },



  /**
   * 用户注册
   */
  addApply(){
    let that = this;
    tools.isWxLogin(function (res){
      if(!res){
        return false;
      }
      let name = that.data.name;
      let phone = that.data.phone;
      let license = that.data.license;
      let head_img = that.data.head_img;
      let address = that.data.address;
      let isAgree = that.data.is_agree;
      if(isAgree != 1){
        wx.showToast({
          title:'请先同意商家入驻协议',
          icon:'none',
            duration: 2000
        })
        return false;
      }
      if(!name){
        wx.showToast({
          title:'姓名不能为空',
          icon:'none',
            duration: 2000
        })
        return false;
      }
      if(!phone){
        wx.showToast({
          title: '手机号不能为空',
          icon:'none',
            duration: 2000
        })
        return false;
      }
      let preg = /^[0-9]{11}$/;
      if (!preg.test(phone)) {
        wx.showToast({
          title: '手机号格式不正确',
          icon: 'none',
            duration: 2000
        })
        return false;
      }
      if(!address){
        wx.showToast({
          title: '请选择地址',
          icon:'none',
            duration: 2000
        })
        return false;
      }
      if(!head_img){
        wx.showToast({
          title:'请上传商家头像',
          icon:'none',
            duration: 2000
        })
        return false;
      }
      if(!license){
        wx.showToast({
          title:'请上传营业执照',
          icon:'none',
            duration: 2000
        })
        return false;
      }
      if(isClick == false){
        return  false;
      }else{
        isClick = false;
      }
      wx.showLoading({
        title:''
      });
      tools.httpClient('home/WxApp/addOptometristApply',{
        name:name,
        phone:phone,
        address:address,
        license:license,
        latitude:latitude,
        longitude:longitude,
        user_id:userInfo.id,
        head_img:head_img,
        parent_user_id:parentUserId
      },(error,data)=>{
        isClick = true
        wx.hideLoading();
        if(data.errorCode == 0){
              wx.showToast({
                title:'提交成功，请耐心等待后台审核',
                icon:'none',
                  duration: 2000,
                success(res) {
                  setTimeout(function (){
                      wx.reLaunch({
                        url: '/pages/userCenter/userCenter',
                      })
                  },1500)
                }
              })
          }else{
          wx.showToast({
            title:data.errorInfo ? data.errorInfo : '提交失败，请重试',
            icon:'none',
              duration: 2000
          })
        }
      })
    })
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