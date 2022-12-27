var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = '';
//页面初始化数据
var page = 1;
var pageSize = 6;
var allPages = 0;
// var get_info = "正在加载中..";//加载提示 正在加载中 下拉加载更多 没有更多了
var state = ''; //订单状态
var tem_id; //待处理订单的id
var optionData = '';
// 获取数据
var GetList = function(that,tag = 0) {

  wx.request({
    url: base_url + 'home/WxApp/pagingSettingOrder',
    data: {
      pageIndex: page,
      pageSize: pageSize,
      state: state,
      account: userInfo.account,

    },
    success: function(res) {
      //   console.log(res, 'res');
      var dataList = res.data.data.dataList;
      //   console.log(dataList, 'order_state');
      allPages = res.data.data.pageInfo.all_pages;
      if(tag == 1){
        var	list = [];
      }else{
        var list = that.data.list;
      }
      var bottom_text = '~~上拉加载更多~~';
      for (var i = 0; i < dataList.length; i++) {
        // if (dataList[i].add_time){
        //   dataList[i].add_time = dataList[i].add_time.substring(0, 10);
        // }
        dataList[i]['frame_json_data'] = JSON.parse(dataList[i]['frame_json_data']);
        dataList[i]['optic_json_data'] = JSON.parse(dataList[i]['optic_json_data']);
        list.push(dataList[i]);
      }
      if (allPages <= page) {
        bottom_text = '~~暂无更多数据~~';
      }
      that.setData({
        list: list,
        bottom_text: bottom_text
      });
      page++;
    }
  });
}

Page({
  data: {
    headerBgOpacity: 0,
    base_url: base_url,
    list: [],
    currentTab: 99,
    bottom_text:'加载中'
  },

  onLoad: function(options) {
    var that = this;
    userInfo = wx.getStorageSync('userInfo');
    optionData = options;
    state = optionData.currentTab ? optionData.currentTab : 99;
    that.setData({
      currentTab: state
    });
    state = state == 99 ? '' : state;

  },
  //重置分页
  onUnload: function(data) {
    page = 1;
    pageSize = 6;
    allPages = 0;
    this.setData({
      list: [],
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    tools.isWxLogin(function(res) {

    });//判断用户是否登录
    page = 1;
    allPages = 0;
    that.setData({
      list: []
    });
    that.getUserInfo();
    GetList(that);
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
   * 触底加载
   */
  onReachBottom: function(options) {
    var that = this;
    if (page > allPages) {
      return false;
    } else {
      GetList(that);
    }
  },


  //点击导航
  swichNav: function(e, options) {
    var that = this;
    state = e.currentTarget.dataset.current;
    //设置页面显示样式 分页数据初始化
    that.setData({
      currentTab: state,
      list: []
    });
    state = state == 99 ? '' : state;
    page = 1;
    GetList(that,1);
  },
  /**
   * 取消订单
   */
  cancelOrder(event){
    var that = this;
    var oid = event.currentTarget.dataset.id; //待处理订单id
    wx.showModal({
      title: '提示',
      content: '确认取消吗?',
      confirmColor:"#FFA300",
      success: function(res) {
        if (res.confirm) {
          that.setOrderState(that, 3, oid);
        }else{
          
        }
      }
    });
  },

  /**
   * 删除订单
   */
  deleteOrder(event){
    var oid = event.currentTarget.dataset.id; //待处理订单id
    var index = event.currentTarget.dataset.index; //待处理订单id
    var dataList = this.data.list;
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除吗?',
      confirmColor:"#FFA300",
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: base_url + 'home/WxApp/deleteOrder',
            data: {
              id: oid
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              dataList.splice(index, 1);
              if (dataList.length == 0) {
                that.setData({
                  list: []
                });
              } else {
                that.setData({
                  list: dataList
                });
              }
            },
            fail: function() {
              // fail
            },
            complete: function() {
              // complete
            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 申请退款
   */
  refundOrder(event){
    var that = this;
    var oid = event.currentTarget.dataset.id; //待处理订单id
    wx.showModal({
      title: '提示',
      content: '确认申请退款吗?',
      confirmColor:"#FFA300",
      success: function(res) {
        if (res.confirm) {
          that.setOrderState(that, 4, oid);
        }else{
          
        }
      }
    });
   
  },

  //产品制作中
  showTips(){
    wx.showToast({
      title:'您的产品正在制作中',
      icon:'none',
        duration: 2000
    })
  },

  /**
   * 修改订单状态
   */
  setOrderState(that, status, oid) {
    wx.request({
      url: base_url + 'home/WxApp/setOrderState',
      data: {
        id: oid,
        state: status
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res) {
        page = 1;
        allPages = 0;
        that.setData({
          list: []
        });
        GetList(that);
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },




  /**
   * 支付
   */
  payOrder(event){
    var that = this;
    var oid = event.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['微信支付',  `余额支付(￥${userInfo.recharge_money})`],
      success (res) {
        if(res.tapIndex == 1) {//余额支付
          tools.httpClient('home/WxApp/payOrderByBalance',{oid:oid,type:0},(error,data)=>{
            if(data.errorCode == 0){
              wx.showModal({
                title: '提示',
                content: '支付成功,定制产品下单后5分钟内可以退款，超时不退',
                showCancel: false,
                confirmText: '确定',
                confirmColor: '#FE8A22',
                success: function(res) {
                  if (res.confirm) {

                  }
                }
              })
              GetList(that);
            }else if(data.errorCode == 5){//余额不足采用微信支付
              wx.request({
                url: base_url + '../extend/pay/request/WxSettingPay.php?oid=' + oid,
                data: {
                  oid: oid
                },
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                success: function(res) {
                  wx.requestPayment({
                    'timeStamp': res.data.timeStamp,
                    'nonceStr': res.data.nonceStr,
                    'package': res.data.package,
                    'signType': 'MD5',
                    'paySign': res.data.paySign,
                    'success': function(res) {
                      wx.showModal({
                        title: '提示',
                        content: '支付成功,定制产品下单后5分钟内可以退款，超时不退',
                        showCancel: false,
                        confirmText: '确定',
                        confirmColor: '#FE8A22',
                        success: function(res) {
                          if (res.confirm) {
                          }
                        }
                      })
                      GetList(that);
                    }
                  });
    
                }
              })
            }else{
              wx.showToast({
                title: data.errorInfo,
                icon:'none',
                duration:2000
              })
            }
          })
        }else{
          wx.request({
            url: base_url + '../extend/pay/request/WxSettingPay.php?oid=' + oid,
            data: {
              oid: oid
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: function(res) {
              wx.requestPayment({
                'timeStamp': res.data.timeStamp,
                'nonceStr': res.data.nonceStr,
                'package': res.data.package,
                'signType': 'MD5',
                'paySign': res.data.paySign,
                'success': function(res) {
                  wx.showModal({
                    title: '提示',
                    content: '支付成功,定制产品下单后5分钟内可以退款，超时不退',
                    showCancel: false,
                    confirmText: '确定',
                    confirmColor: '#FE8A22',
                    success: function(res) {
                      if (res.confirm) {
                      }
                    }
                  })
                  GetList(that);
                }
              });

            }
          })
        }
        console.log(res.tapIndex)
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },
  /**
   * 核销 
   */
  writeOff(e){
      var oid = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/writeOffCode/writeOffCode?oid=${oid}&type=0`,
      })
  },



  // 跳转到订单详情页
  detail: function (e) {
    var oid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/consumeDetail/consumeDetail?id=' + oid
    });
  }
})

