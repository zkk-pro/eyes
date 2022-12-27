// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';


Page({
	data: {
    base_url: base_url,
    nick_name: '',
    name: '',
    phone: '',
    detail: '',
    address: ['选择地区','',''],
    degreeArray:[],
    astigmiaArray:[],
    axialArray:[],
    pupilArray:[],
    addArray:[],
    degreeLeftName:'',
    degreeRightName:'',
    astigmiaLeftName:'',
    astigmiaRightName:'',
    axialLeftName:'',
    axialRightName:'',
    pupilLeftName:'',
    pupilRightName:'',
    addLeftName:'',
    addRightName:'',
    isDegree:0,//0代表无度数 1代表有度数
    showImg:0,
    picture_frame: '', // 镜框数码
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
        userInfo = wx.getStorageSync('userInfo');
        that.getAllDegree();
        that.getAllAstigmia();
        that.getAllAxial();
        that.getAllPupil();
        // that.getAllAdd();
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
    setTimeout(function(){
      userInfo = wx.getStorageSync('userInfo');
      if(userInfo.id > 0){
        that.getUserInfo();
      }
    },100)
   
    
  },

  /**
   * 获取用户信息
   */
  getUserInfo(){
      var that = this;
      tools.httpClient('home/WxApp/getUserInfo',{user_id:userInfo.id},(error,data)=>{
        if(data.errorCode == 0){
          userInfo = data.data;
          wx.setStorageSync('userInfo', userInfo);
          if(!data.data.optometry_data) {
            data.data.optometry_data = {} 
          }
          that.setData({
            userInfo:userInfo,
            nick_name:userInfo.nick_name ? userInfo.nick_name : '',
            name:userInfo.name ? userInfo.name : '',
            phone:userInfo.phone ? userInfo.phone : '',
            detail:userInfo.phone ? userInfo.detail : '',
            address:userInfo.address ? userInfo.address.split(",") : ['选择地区','',''],
            
            "degreeLeftName": data.data.optometry_data.degreeLeftName,
            "degreeRightName": data.data.optometry_data.degreeRightName,
            "astigmiaLeftName": data.data.optometry_data.astigmiaLeftName,
            "astigmiaRightName": data.data.optometry_data.astigmiaRightName,
            "axialLeftName": data.data.optometry_data.axialLeftName,
            "axialRightName": data.data.optometry_data.axialRightName,
            "pupilLeftName": data.data.optometry_data.pupilLeftName,
            "pupilRightName": data.data.optometry_data.pupilRightName,
            // "addLeftName": data.data.optometry_data.addLeftName,
            // "addRightName": data.data.optometry_data.addRightName,
            "isDegree":data.data.optometry_data.isDegree ? data.data.optometry_data.isDegree : 0,
            "picture_frame":data.data.optometry_data.picture_frame ? data.data.optometry_data.picture_frame : "" // 镜框数码
          })
        }
      })
  },

  /**
   * 获取度数列表
   */
  getAllDegree(){
    var that = this;
    tools.httpClient('home/WxApp/getAllDegree',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          degreeArray:data.data,
        })
      }
    })
  },

  /**
   * 获取散光列表
   */
  getAllAstigmia(){
    var that = this;
    tools.httpClient('home/WxApp/getAllAstigmia',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          astigmiaArray:data.data,
        })
      }
    })
  },

  /**
   * 获取轴位列表
   */
  getAllAxial(){
    var that = this;
    tools.httpClient('home/WxApp/getAllAxial',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          axialArray:data.data,
        })
      }
    })
  },

  /**
   * 获取瞳距列表
   */
  getAllPupil(){
    var that = this;
    tools.httpClient('home/WxApp/getAllPupil',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          pupilArray:data.data,
        })
      }
    })
  },

  /**
   * 获取Add列表
   */
  getAllAdd(){
    var that = this;
    tools.httpClient('home/WxApp/getAllAdd',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          addArray:data.data,
        })
      }
    })
  },

  /**
   * 监听页面输入
   */
  // listenInput(e){
  //   this.setData({
  //     opinoin:e.detail.value
  //   })
  // },
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
	 * 选择度数
	 */
	isDegree(e){
		let isDegree = e.currentTarget.dataset.isDegree;
		this.setData({
			isDegree:isDegree
		})
	},


  /**
   * 提交信息
   */
  editUser(){
    var that = this;
    var user_id = userInfo.id;
    var nick_name =  that.data.nick_name;
    var phone =  that.data.phone;
    var detail =  that.data.detail;
    var name =  that.data.name;
    var address =  that.data.address;
    address = address.join(",");
    console.log(that.data)
    if(nick_name == '' || nick_name == null){
        wx.showToast({
          title: '昵称不能为空',
          icon:'none',
          duration:2000
        })
        return
    }
 
    tools.httpClient('home/WxApp/updateUser',{
      name:name,
      user_id:user_id,
      nick_name:nick_name,
      phone:phone,
      detail:detail,
      address:address,
      optometry_data:JSON.stringify({
        "degreeLeftName": that.data.degreeLeftName,
        "degreeRightName":  that.data.degreeRightName,
        "astigmiaLeftName":  that.data.astigmiaLeftName,
        "astigmiaRightName":  that.data.astigmiaRightName,
        "axialLeftName": that.data.axialLeftName,
        "axialRightName":  that.data.axialRightName,
        "pupilLeftName":  that.data.pupilLeftName,
        "pupilRightName":  that.data.pupilRightName,
        // "addLeftName": that.data.addLeftName,
        // "addRightName":  that.data.addRightName,
        "isDegree" : that.data.isDegree,
        "picture_frame": that.data.picture_frame
      }),

    },(error,data)=>{
        if(data.errorCode == 0){
            wx.showToast({
              title: '操作成功',
              duration:2000,
              success(){
                setTimeout(function(){
                  wx.navigateBack();
                },1000)
              }
            })
        }else{
          wx.showToast({
            title: data.errorInfo,
            icon:'none'
          })
        }
    })
  },

  /**
   * 选择地区
   */
  bindRegionChange(e){
      console.log(e);
      this.setData({
        address:e.detail.value
      })
  },

  /**
   * 监听picker选择
   */
  bindPickerChange(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var data = {};
    var dataList = [];
    if(type == 'astigmiaLeftName' || type == 'astigmiaRightName'){//左右散光
      dataList = that.data.astigmiaArray;
    }else if(type == 'axialLeftName' || type == 'axialRightName'){//左右轴位
      dataList = that.data.axialArray;
    }else if(type == 'pupilLeftName' || type == 'pupilRightName'){//左右瞳距
      dataList = that.data.pupilArray;
    }else if(type == 'addLeftName' || type == 'addRightName'){//左右瞳距
      dataList = that.data.addArray;
    }else{//左右度数
      dataList = that.data.degreeArray;
    }
    data[type] = dataList[e.detail.value]['name'];
    that.setData(data);
  },

  /**
   * 预览图片
   */
  prewImg(e){
      let that = this;
      let currentSrc = e.currentTarget.dataset.src;
      wx.previewImage({
        urls: [currentSrc],
      })
  },

  /**
   * 显示展开图片
   */
  showNoticeImg(e){
     var that = this;
     var showImg = that.data.showImg;
     if(showImg == 1){
      showImg = 0;
     }else{
      showImg = 1;
    }
    that.setData({
      showImg:showImg
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
  
 


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

  }

});
