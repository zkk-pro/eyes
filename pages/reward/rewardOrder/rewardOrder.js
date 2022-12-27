var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
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
    url: base_url + 'home/WxReward/pagingOrder',
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
        if (dataList[i].add_time){
          dataList[i].add_time = dataList[i].add_time.substring(0, 10);
        }
        var order_state = dataList[i].state;
        let optometry_data = '';
        if(dataList[i].optometry_data){
          optometry_data = JSON.parse(dataList[i].optometry_data);
        }
        switch (order_state) { //得到不同订单状对应的 操作和 状态文字
          case '0':
            dataList[i]['state_text'] = "待付款";
            dataList[i]['option'] = 'cancel_order';
            dataList[i]['options'] = 'pay_order';
            dataList[i]['btn_hidden'] = true;
            dataList[i]['btn_hiddens'] = true;
            dataList[i]['option_texts'] = '立即付款';
            dataList[i]['option_text'] = '取消订单';
            break;
          case '1':
            dataList[i]['btn_hiddens'] = true;
            dataList[i]['state_text'] = "未开奖";
            // dataList[i]['option'] = 'refund_order';
            // dataList[i]['option_text'] = '申请退款';
            break;
          case '2':
            dataList[i]['state_text'] = "已中奖";
            if(dataList[i]['optometry_data'] != '' && dataList[i]['optometry_data'] != null && optometry_data.isDegree == 3){
              dataList[i]['btn_hiddens'] = true;
              dataList[i]['option'] = 'write_off';
              dataList[i]['option_text'] = '核销';
            }
            break;
          case '3':
            dataList[i]['btn_hiddens'] = false;
            dataList[i]['state_text'] = "未中奖";
            dataList[i]['option'] = 'delete_order';
            dataList[i]['option_text'] = '删除订单';
            break;
          case '4':
            dataList[i]['btn_hiddens'] = true;

            dataList[i]['state_text'] = "已取消";
            dataList[i]['option'] = 'delete_order';
            dataList[i]['option_text'] = '删除订单';
            break;
          case '5':
            dataList[i]['btn_hiddens'] = false;
            dataList[i]['btn_hidden'] = false;
            dataList[i]['state_text'] = "已核销";
            break;
          case '6':
            dataList[i]['btn_hiddens'] = false;
            dataList[i]['state_text'] = "退款中";
            break;
          case '7':
            dataList[i]['btn_hiddens'] = true;
            dataList[i]['state_text'] = "退款完成";
            dataList[i]['option'] = 'delete_order';
            dataList[i]['option_text'] = '删除订单';
            break;
          case '8':
            dataList[i]['btn_hiddens'] = true;
            dataList[i]['state_text'] = "已评价";
            dataList[i]['option'] = 'delete_order';
            dataList[i]['option_text'] = '删除订单';
            break;
          default:
            dataList[i]['btn_hiddens'] = true;
            dataList[i]['state_text'] = "异常订单";
            dataList[i]['option'] = 'delete_order';
            dataList[i]['option_text'] = '删除订单';
        }
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

  //删除订单
  delete_order: function(event) {
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
            url: base_url + 'home/WxReward/deleteOrder',
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

  //取消订单
  cancel_order: function(event) {
    var that = this;
    tem_id = event.currentTarget.dataset.id; //待处理订单id
    setOrderState(that, 4);
  },
  //立即支付
  pay_order: function(event) {
    var that = this;
    var oid = event.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['微信支付',  `余额支付(￥${userInfo.recharge_money})`],
      success (res) {
        if(res.tapIndex == 1){//余额支付
          tools.httpClient('home/WxReward/beforePay',{oid:oid},(error,data)=>{
            if(data.errorCode == 0){
              tools.httpClient('home/WxApp/payOrderByBalance',{oid:oid,type:3},(error,data)=>{
                if(data.errorCode == 0){
                  wx.showToast({
                    title: '支付成功',
                    duration: 3000,
                    success(){
                      page = 1;
                      allPages = 0;
                      that.setData({
                        list: []
                      });
                      GetList(that);
                    }
                  });
                }else if(data.errorCode == 5){//余额不足采用微信支付
                  wx.request({
                    url: base_url + '../extend/pay/request/WxRewardPay.php?oid=' + oid,
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
                          wx.showToast({
                            title: '支付成功',
                            icon: 'success',
                            duration: 3000
                          });
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
              wx.showToast({
                title: data.errorInfo,
                icon:'none',
                duration:2000
              })
             
            }
          })
        }else{
          tools.httpClient('home/WxReward/beforePay',{oid:oid},(error,data)=>{
            if(data.errorCode == 0){
              wx.request({
                url: base_url + '../extend/pay/request/WxRewardPay.php?oid=' + oid,
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
                      wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 3000
                      });
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
        }
        console.log(res.tapIndex)
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })

  },
  //申请退款
  refund_order: function(event) {
    var that = this;
    tem_id = event.currentTarget.dataset.id; //待处理订单id
    setOrderState(that, 6);
  },
  //确认收货
  confirm_order: function(event) {
    var that = this;
    tem_id = event.currentTarget.dataset.id; //待处理订单id
    setOrderState(that, 3);
  },
  //交易完成
  success_order: function(event) {
    var that = this;
    tem_id = event.currentTarget.dataset.id; //待处理订单id
    setOrderState(that, 5);
  },

  //立即评价
  send_comment: function(event) {
    var oid = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../orderComment/orderComment?oid=" + oid
    });
  },
  /**
   * 跳转快递100
   */
  express(e){
    var code = e.currentTarget.dataset.number;
    wx.navigateToMiniProgram({
      appId: 'wx6885acbedba59c14',
      path: 'pages/index/index?source=third_gzh',
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  },

  /**
   * 复制单号
   */
  copy(e){
    var code = e.currentTarget.dataset.number;
    wx.setClipboardData({
      data: code,
      success (res) {
        wx.getClipboardData({
          success (res) {
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },
  /**
   * 跳转核销页面
   */
  write_off(event){
    var oid = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/writeOffCode/writeOffCode?oid=${oid}&type=3`
    });
  },

  // 跳转到订单详情页
  orderDetail: function (e) {
    var oid = e.currentTarget.dataset.oid;
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?type=2&id=' + oid
    });
  }
})

/**
 * 修改订单状态
 */
function setOrderState(that, status, options) {
  wx.request({
    url: base_url + 'home/WxReward/setOrderState',
    data: {
      id: tem_id,
      state: status
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    success: function(res) {
      page = 1;
      that.setData({
        list: [],
        tem_id: tem_id,
        status: status,
        res: res
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
}
