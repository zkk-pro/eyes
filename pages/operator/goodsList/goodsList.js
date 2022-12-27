// pages/index/index.js
const CONFIG = require('../../../utils/config.js');
const tools = require('../../../utils/tools.js');
//index.js
let app = getApp();
let base_url = CONFIG.API_URL.BASE_URL;
let userInfo = "";
let page = 1;
let pageSize = 10;
let allPages = 0;
let type = 0;//0百货 1秒杀 2抽奖
let pagingGoods = function(that,tag = 0) {
  let url = '';
  tools.httpClient('home/WxApp/pagingGoods',{
    pageIndex: page,
    pageSize: pageSize,
    optometrist_id: that.data.optometristId,
    type:type,
  },(error,data) => {
    let dataArr = data.data;
    let dataList = dataArr.dataList;
    let list = [];
    if(tag == 1){//通过点击来的
      list = [];
    }else{
      list = that.data.list;
    }
    let  bottom_text = '~~上拉加载更多~~';
    allPages = dataArr.pageInfo.all_pages;
    for (let i = 0; i < dataList.length; i++) {
      dataList[i]['is_show_more'] = 0;//是否展开更多数据
      list.push(dataList[i])
    }
    if (allPages <= page) {
      bottom_text = '~~没有更多啦~~';
    }
    that.setData({
      list: list,
      bottom_text:bottom_text
    });
    page++;
  })
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    bottom_text:'加载中',
    operateInfo:[],
    operateName:'',
    operateIndex:-1,
    optometristInfo:[],
    optometristName:'',
    optometristIndex:-1,
    optometristId:0,
    userInfo:userInfo,
    totalSale:0,
    totalFee:0,
    type:type,//切换导航的标识
    startDate:tools.getNowDate(),
    endDate:tools.getNowDate(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.showLoading({
      title:''
    });
    type = options.type ? options.type : 0;
    userInfo = wx.getStorageSync('userInfo');
    that.getOperatorInfo(that);
    that.setData({
      userInfo:userInfo
    })
  },

  /**
   * 切换日期
   */
  bindDateChange(e){
    let that = this;
    let type = e.currentTarget.dataset.type;
    let data = {};
    data[type] = e.detail.value;
    that.setData(data,function (){
      that.setData({
        list: []
      });
      page = 1;
      pagingGoods(that);
    });
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
   * 获取操作员信息
   */
  getOperatorInfo(that){
    tools.httpClient('home/WxApp/getOperatorInfo',{userId:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
        let operatorInfo = data.data;
        that.setData({
          operatorInfo:operatorInfo,
          totalSale:operatorInfo.total_sale,
          totalFee:operatorInfo.total_fee,
        },function (){
          if(operatorInfo.is_use == 0){
            wx.showToast({
              title:'账号已停用',
              icon:'none',
              success(res) {
                setTimeout(function (){
                  wx.redirectTo({
                    url:'../login/login'
                  })
                },1500)
              }
            })
          }
        });
        that.getOptometrist();
      }else{
        //无操作员返回登录页面
        wx.redirectTo({
          url:'../login/login'
        })
      }
    })
  },

  /**
   * 获取业务员信息
   */
  getOperateList(){
    let that = this;
    tools.httpClient('home/WxApp/getOperateList',{},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          operateInfo:data.data,
        })
      }

    })

  },

  /**
   * 根据条件获取店铺名称
   */
  getOptometrist(){
    let that = this;
    let operateId = 0;
    let operatorInfo = that.data.operatorInfo;
    if(operatorInfo.type == 0){
      operateId = operatorInfo.id;
    }
    tools.httpClient('home/WxApp/getOptometrist',{operate_id:operateId},(error,data)=>{
      if(data.errorCode == 0){
        let optometristInfo = data.data;
        that.setData({
          optometristInfo:optometristInfo,
          optometristIndex:0,
          optometristName:optometristInfo[0]['name'],
          optometristId:optometristInfo[0]['id'],
        },function (){
          that.setData({
            list: []
          });
          page = 1;
          pagingGoods(that);
        });

      }
      wx.hideLoading();
    })
  },

  /**
   * 店铺切换
   */
  bindNameChange(e){
    let that = this;
    let data = {};
    let optometristInfo = that.data.optometristInfo;
    data['optometristIndex'] = e.detail.value;
    data['optometristName'] = optometristInfo[e.detail.value]['name'];
    data['optometristId'] = optometristInfo[e.detail.value]['id'];
    that.setData(data,function (){
      that.setData({
        list: []
      });
      page = 1;
      pagingGoods(that);
    });
  },

  /**
   * 点击展开收起
   */
  isShowMore(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    let list = that.data.list;
    if(!list[index]['propertyGroups']){
      return;
    }
    if(list[index]['is_show_more'] == 1){
      list[index]['is_show_more'] = 0;
    }else{
      list[index]['is_show_more'] = 1;
    }
    that.setData({
      list:list
    })
  },


  /**
   * 导航切换
   */
  changeNav(e){
    let that = this;
    type = e.currentTarget.dataset.type;
    that.setData({
      type:type
    },function (){
      that.setData({
        list: []
      });
      page = 1;
      pagingGoods(that,1);
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
    let that = this;
    if (page > allPages) {
      return false;
    } else {
      pagingGoods(that);
    }
  },



})