/**
 * 商品详情页js
 * @author micheal
 * @since 2017-01-23
 */
var CONFIG = require('../../../utils/config.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
var tools = require('../../../utils/tools.js');
let oid = 0;
Page({
  data: {
    base_url: base_url,
    userInfo: [],//用户数据
    list:[],
    isShowMore:0
  },
  onLoad: function (options) {
    console.log(options,'---------');
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    oid = options.id ? options.id : 0;//订单id
    var writeOff = options.writeoff ? options.writeoff : 0;//核销
    that.setData({
      writeOff:writeOff
    });
    userInfo = wx.getStorageSync('userInfo');
    wx.showLoading({
      title: '',
    })

    setTimeout(function(){
      //获取商品信息
      wx.request({
        url: base_url + 'home/WxService/getUserGoods',
        data: {id: oid},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function (result) {
          var goodsInfo = result.data.data;
          goodsInfo['price'] = Number(goodsInfo['price']);
          that.setData(
              {
                goodsInfo: goodsInfo
              },
              function (){
                  that.findAllUserRecord();
              }
          );
          wx.hideLoading()
        },
        fail(){
          wx.hideLoading()
        }
      });
    },100)

    
    
  },

  onShow: function () {

  },


  /**
   * 获取当前订单的参与者
   */
  findAllUserRecord(){
    var that = this;
    tools.httpClient('home/WxService/findAllUserRecord',{user_goods_id:that.data.goodsInfo.id,user_id:userInfo.id},(error,data)=>{
      if(data.errorCode == 0){
        that.setData({
          list:data.data
        });
      }
    })
  },

  /**
   * 查看更多
   */
  showMore(){
    this.setData({
      isShowMore:1
    });
  },



  /**
   * 核销操作
   */
  operator(){
    let that = this;
    tools.isWxLogin(function (res){
      if(res){
        let oid = that.data.goodsInfo.id;
        let userInfo = wx.getStorageSync('userInfo');
        tools.httpClient('home/WxService/writeOffRecord',{id:oid,user_id:userInfo.id},(error,data)=>{
          if(data.errorCode == 0){
            wx.showToast({
              title:'核销成功',
              duration:2000,
              success(res) {
                setTimeout(function (){
                  wx.navigateBack()
                },1500)
              }
            })
          }else{
            wx.showToast({
              title:data.errorInfo,
              icon:'none'
            })
          }
        })
      }

    })

  },


});