// pages/order/confirmOrder/confirmOrder.js
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var page = 1;
var pageSize = 12;
var allPages = 0;
var type = 0;
var userId = 0;
var pagingUser = function(that) {
  wx.request({
    url: base_url + 'home/WxApp/myTeamPerson',
    data: {
      user_id: type == 1 ? userId : (userInfo.id ? userInfo.id : -1),
      pageIndex: page,
      pageSize: pageSize,
      type:type
    },
    method: 'GET',
    success: function(res) {
      var data = res.data.data;
      var dataList = data.dataList;
      var list = that.data.list;
      var bottom_text = '~~上拉加载更多~~';
      allPages = data.pageInfo.all_pages;
      for (var i = 0; i < dataList.length; i++) {
        list.push(dataList[i])
      }
      if (allPages <= page) {
        bottom_text = '~~没有更多啦~~';
      }
      that.setData({
        list: list,
        bottom_text:bottom_text
      });
      // console.log( that.data.list )
      page++;
      setTimeout(function(){
        wx.hideLoading();
      },100)
    },
    fail(res) {
      setTimeout(function(){
        wx.hideLoading();
      },100)
    }
  })
};

Page({
  data: {
    base_url: base_url,
    showModel:0,
    currentIndex:0,//修改的idnex
    currentValue:0,//修改的value
    currentId:0,//当前修改的id
    teamNum:0,
    fenNumInfo:0,
    numInfo:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    type = options.type ? options.type : 0;//0表示下级页面 1表示下下级页面
    userId = options.user_id ? options.user_id : -1;
    that.setData({
      type:type
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
    wx.showLoading();
    setTimeout(function(){
      userInfo = wx.getStorageSync('userInfo');
      if(userInfo.id > 0){
        that.getUserInfo();
        that.getTeamNum();
        that.getTeamNumTwo();
      }
    },100)
    var that = this;
    that.setData({
      list: []
    });
    page = 1;
    pagingUser(that);
  },

  /**
   * 获取团队人数
   */
  getTeamNum(){
    var that = this;
    tools.httpClient('home/WxApp/getTeamNum',{user_id:type == 1 ? userId : (userInfo.id ? userInfo.id : -1)},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          teamNum:data.data
        })
      }
       
    })
  },

  /**
   * 获取团队人数
   */
  getTeamNumTwo(){
    var that = this;
    tools.httpClient('home/WxApp/getTeamNumTwo',{user_id:type == 1 ? userId : (userInfo.id ? userInfo.id : -1)},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          fenNumInfo:data.data.fenNumInfo,
          numInfo:data.data.numInfo,
        })
      }

    })
  },
 


  /**
   * 获取用户信息
   */
  getUserInfo(){
    var that = this;
    tools.httpClient('home/WxApp/getUserInfo',{user_id:type == 1 ? userId : (userInfo.id ? userInfo.id : -1)},(error,data)=>{
      if(data.errorCode == 0){
        userInfo = data.data;
        if(type == 1){
          wx.setNavigationBarTitle({
            title:`${userInfo.nick_name}的团队`
          })
        }
        that.setData({
          userInfo:userInfo
        })
      }else{
        that.setData({
          userInfo:userInfo
        })
      }
    })
  },



  /**
   * 页面跳转
   */
  jumpPage(e){
    var that = this;


  },

  /**
   * 显示修改弹框
   */
  showModel(e){
    var that = this;
    var currentIndex = e.currentTarget.dataset.index;
    var currentValue = e.currentTarget.dataset.value;
    var currentId = e.currentTarget.dataset.id;
    that.setData({
      showModel:1,
      currentIndex:currentIndex,
      currentValue:currentValue,
      currentId:currentId,
    })
  },

  /**
   * 隐藏修改弹框
   */
  hideModel(){
    this.setData({
      showModel:0,
      currentIndex:0,
      currentValue:0,
      currentId:0,
    })
  },

  /**
   * 空事件，阻止冒泡
   */
  emptyEvent(e){

  },

  /**
   * 确认修改
   */
  confirmUpdate(e){
    var that = this;
    var currentIndex = that.data.currentIndex;
    var currentValue = that.data.currentValue;
    var currentId = that.data.currentId;
    var number = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/;
    var list = that.data.list;
    if(!number.test(currentValue)){
      wx.showToast({
        title: '奖金比例应为数字',
        icon:'none',
        duration: 2000
      })
      return false;
    }
    if(currentValue < 0 || currentValue > 1){
      wx.showToast({
        title: '奖金比例应大于0小于1',
        icon:'none',
        duration: 2000
      })
      return false;
    }

    tools.httpClient('home/WxApp/updateUserRate',{
      user_id:currentId,
      commission_rate:currentValue
    },(error,data)=>{
        if(data.errorCode == 0){//修改成功
          wx.showToast({
            title: '修改成功',
            duration:2000,
            success(res) {
              list[currentIndex]['commission_rate'] = currentValue;
              that.setData({
                list:list,
              });
              that.hideModel();
            }
          })
        }else{
          wx.showToast({
            title: data.errorInfo,
            icon:'none',
              duration: 2000
          })
        }
    })

  },

  /**
   * 监听输入
   */
  listenInput(e){
    this.setData({
      currentValue:e.detail.value,
    });
  },

  /**
   * 去二级页面
   */
  goMyTeam(e){
    var user_id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url:'../myTeam/myTeam?type=1&user_id='+user_id
    })
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    type = 0;
    userId = 0;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    type = 0;
    userId = 0;
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
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      pagingUser(that);
    }
  },



});
