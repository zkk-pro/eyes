// 购物车页面
var CONFIG = require('../../../utils/config.js');
var tools = require('../../../utils/tools.js');
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var isCanClick = true;
var height = 0;
var isShowCommission = 0;
//获取从购物车删除商品下标
var test=function(t,arr){
      var f = 0;
      for (var j = 0; j < arr.length; j++){
            if(t == arr[j]){
              f = 1;
              break;
            }
      }
      return f;
}
let movedistance = 0;
Page({
  data: {
    base_url: base_url,
    con: true,
    selectAll: true,
    editEnd:1,
    editEndText:'编辑',
    btnTexts: 1,
    alterantNum:{},
    isUseOther:0,//是否显示其他配置项
    currentIndex: '', // 列表操作项的index
    isOperaShow:[],
    showCommission: 0,
    total_cash_money:0,
  },
  // 手指触摸动作开始
  touchstartX(e) {
    this.setData({
      currentIndex: e.currentTarget.dataset.index
    });
    // 获取触摸X坐标
    this.recordX = e.touches[0].clientX;
  },
  // 点击操作
  resetX() {
    this.slideAnimation(0, 500);
  },
  // 手指触摸后移动
  touchmoveX(e) {
    let currentX = e.touches[0].clientX;
    movedistance = this.data.isOperaShow.includes(this.data.currentIndex)?currentX - this.recordX-75:(currentX - this.recordX)>0?0:(currentX - this.recordX); // 获取移动距离

    this.slideAnimation(movedistance<-225?-225:movedistance, 500);
  },
  // 手指触摸动作结束
  touchendX() {
    let recordX;
    let arr = this.data.isOperaShow;
    let i = this.data.isOperaShow.indexOf(this.data.currentIndex)
    if (movedistance <= -85) { // 移动达到距离就动画显示全部操作项
      recordX = -75;
      if(i==-1){
        arr.push(this.data.currentIndex)
        this.setData({
          isOperaShow:arr
        })
      }
    } else if (movedistance >= -75) { // 移动未达到距离即还原
      recordX = 0;
      if(i!=-1){
        arr.splice(i,1)
        this.setData({
          isOperaShow:arr
        })
      }
    }
    this.slideAnimation(recordX, 500);
  },
  // 滑动动画
  slideAnimation(recordX, time) {
    let animation = wx.createAnimation({
      duration: time,
      timingFunction: 'ease'
    });
    animation.translate(recordX + 'px', 0).step()
    this.setData({
      animation: animation.export()
    })
  },
  onLoad:function (options) {
    var that = this;
    
    if(app.globalData.type==1){
        height = 34;
    }
    let nav_active = {
      index:'',
      cart: 'active',
      reserve:'',
      setting: '',
      optometrist: '',
      center: '',
      base_url:base_url,
      height:height,
      isUseOther:0,
      isBusiness:0,
      isShowBusiness:0,
    };
    that.setData({
      nav_active: nav_active,
      height:height
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function ( ) {
    var that = this;

    var showCommission = that.data.showCommission;
    userInfo = wx.getStorageSync('userInfo');
    that.getOtherConfig();//获取显示配置

    wx.request({
      url: base_url + 'home/WxStore/cartList',
      data: { account: userInfo.account },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (res) {
        var dataList = res.data.data.dataList;
        var sum = 0; //购物车总价 不包含下架商品
        var total_num = 0;//购物车总数
        var total_cash_money = res.data.data.total_cash_money;
        if (dataList.length) {
          for (var i = 0; i < dataList.length; i++) { //计算总价 判断上下架
            dataList[i].updown = dataList[i].updown == 1 ? true : false;
            dataList[i].checked = dataList[i].updown ? true : false;
            sum += dataList[i].updown ? parseFloat(dataList[i].price * dataList[i].goods_count) : 0;
            
            
            total_num += (dataList[i].updown == 1 ? parseInt(dataList[i].goods_count) : 0);
            //截取商品名前20位
            dataList[i].goods_name = dataList[i].goods_name.length > 20 ? dataList[i].goods_name.substr(0, 25) + '...' : dataList[i].goods_name;
            //拼接属性值
            if (dataList[i].property) {
              dataList[i].property_text = '';
              for (var m = 0; m < dataList[i].property.length; m++) {
                dataList[i].property_text = dataList[i].property_text + dataList[i].property[m].name + ':' + dataList[i].property[m].value + ' ';
              }
            }
          }
          var con = true;
        } else {
          var con = false;
        }

        sum = parseFloat(sum).toFixed(2);
        // console.log(sum,'sum');
        that.setData({
          dataList: dataList,
          sum: sum,
          con: con,
          total_num: total_num,
          total_cash_money:total_cash_money
        });
        // console.log(that.data.sum)
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
    that.getOptometristByUserId(that);
    that.getShowBusinessConfig();
  },


  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
        isShowCommission = 1;
        let nav_active = that.data.nav_active;
        nav_active['isBusiness'] = 1;
        that.setData({
          nav_active: nav_active,
          showCommission:1
        })
      }
    })
  },

/**
   * 获取其他配置
   */
  getOtherConfig(){
    var that = this;
    tools.httpClient('home/WxApp/getOtherConfig',{},(error,data)=>{
      if(data.errorCode == 0){
        let nav_active = that.data.nav_active;
        nav_active['isUseOther'] = data.data;
        that.setData({
          isUseOther:data.data,
          nav_active: nav_active
        })
      }
    })
  },

  /**
   * 获取其他配置
   */
  getShowBusinessConfig(){
    var that = this;
    tools.httpClient('home/WxApp/getShowBusinessConfig',{},(error,data)=>{
      if(data.errorCode == 0){
        let nav_active = that.data.nav_active;
        nav_active['isShowBusiness'] = data.data;
        that.setData({
          nav_active: nav_active
        })
      }
    })
  },


  /**
   * 核销
   */
  scanCode(){
    wx.scanCode({
      success (res) {
          console.log(res)
       wx.navigateTo({
           url:res.path
       })

      }
    })
  },

  //页面隐藏
  onHide: function(options){
       
  },

  //页面卸载
  onUnload: function(options){
      console.log('页面卸载了');
  },

  //删除按钮
  deleteCartGoods: function (data) {
    var that = this;
    var dataList = that.data.dataList;
    var ids = '';
    var arr = [];
    var dataNew = [];
    for (var i = 0; i < dataList.length; i++) {
      ids += dataList[i].checked ? dataList[i].id + ',' : '';
      if (dataList[i].checked){
        arr.push(i);
      }
    }
    for (var i = 0; i < dataList.length; i++) {
      if(test(i,arr) == 0){
        dataNew.push(dataList[i]);
      }
    }
    if (!ids) return false;
    ids = ids.substring(0, ids.length - 1);
    //提示框
    wx.showModal({
      title: '确认删除？',
      content: '',
      confirmColor:"#FE8A22",
      success: function(res){
        
        if(res.confirm){
          wx.request({
            url: base_url + 'home/WxStore/deleteCartGoods',
            data: {
              ids: ids,
              account: userInfo.account
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: function (res) {
              that.setData({
                dataList: dataNew,
              });
              that.getTotalPrice()
            },
            fail: function () {
              // fail
            },
            complete: function () {
              // complete
            }
          })
        }else{
          return false;
        }
        
      }
    })
    
  },
    //删除按钮
    deleteCart: function (data) {
      var ids = data.currentTarget.dataset.id;
      var that = this;
      //提示框
      wx.showModal({
        title: '确认删除？',
        content: '',
        confirmColor:"#FE8A22",
        success: function(res){
          if(res.confirm){
            wx.request({
              url: base_url + 'home/WxStore/deleteCartGoods',
              data: {
                ids: ids,
                account: userInfo.account
              },
              method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
              success: function (res) {
                that.onShow()
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              }
            })
          }else{
            return false;
          }
          
        }
      })
      
    },
  //下单
  confirmOrder: function (data) {
    var that= this;
    tools.isWxLogin(function(res) {
			if(res){
        var gids = '';//商品id
        var gpids = '';//多规格id
        var counts = '';//商品数量
        var cgids = ''; //购物车商品id
        var dataList = that.data.dataList;
    
        for (var i = 0; i < dataList.length; i++) {
            if(dataList[i].updown == 1){
              gids += dataList[i].checked ? dataList[i].gid + ',' : '';
              cgids += dataList[i].checked ? dataList[i].id + ',' : '';
              counts += dataList[i].checked ? dataList[i].goods_count + ',' : '';
              gpids += dataList[i].checked ? (dataList[i].gpid ? dataList[i].gpid + ',' : '0' + ',' ) : '';
            }
        }
        if (!gids){
          wx.showModal({
            title: '提示',
            content: '请选择商品',
            confirmColor:"#FE8A22",
            showCancel: false,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
          return false;
        } 
        gids = gids.substring(0, gids.length - 1);
        cgids = cgids.substring(0, cgids.length - 1);
        gpids = gpids.substring(0, gpids.length - 1);
        counts = counts.substring(0, counts.length - 1);
        wx.navigateTo({ url: '../comfirmOrder/comfirmOrder?gids=' + gids + '&gpids=' + gpids + '&counts=' + counts + '&cgids=' + cgids + '&is_buy=1'});
      }
		});//判断用户是否登录
   
  },

  //全选Moonlight
  selectAll: function (e,data) {
    var that = this;
    var selectAll = that.data.selectAll;//获取当前的全选状态
    // console.log(selectAll);
    //改变状态
    if ( selectAll == true ) {
      that.setData({ selectAll: false })
    }else {
      that.setData({ selectAll: true })
    }
    var dataList = that.data.dataList;//获取购物车列表

    for (var i = 0; i < dataList.length;i++){
      dataList[i].checked = that.data.selectAll;    
    }
    that.setData({ dataList: dataList }) ;
    that.getTotalPrice()
  },

  //选择Moonlight
  check: function (e,data) {
    var that = this;
    var index = e.currentTarget.dataset.index;//获取当前index
    var dataList = that.data.dataList;//获取购物车列表
    var selected = dataList[index].checked;  //获取当前选中状态
    // 改变状态
    if (selected == true){
      dataList[index].checked = false;
    }else{
      dataList[index].checked = true;
    }
    
    that.setData({ dataList: dataList });//重新设置购物车列表
    that.getTotalPrice()
    //判断是否被全选或者全为空
    for(var m = 0; m < dataList.length; m++) {
      if (dataList[m].checked == true){
        that.setData({ selectAll: true});
      } else {
        that.setData({ selectAll: false });
        return false;
      }
    }
    
    
  },

  //加购物车
  add: function (e,data) {
    if(isCanClick == false){
      return
    }else{
      isCanClick = false
    }
   
    var that = this;
    var index = e.currentTarget.dataset.num;
    var id = e.currentTarget.dataset.id;
    var gid = e.currentTarget.dataset.gid;
    var gpid = e.currentTarget.dataset.gpid;
    var account = userInfo.account;
    var count = parseInt(e.currentTarget.dataset.count) + 1;
    tools.httpClient('home/WxStore/insertCartGoods',{
      gid: gid,
      account: account,
      goods_count: 1,
      gpid: gpid
    },(error,data)=>{
        if(data.errorCode == 0){
            //数据存储
            that.data.alterantNum[id] = count;
            var dataList = that.data.dataList;
            dataList[index].goods_count = count;
            that.setData({ dataList: dataList });
            that.getTotalPrice()
        }else{
          wx.showToast({
            title: data.errorInfo,
            icon:'none'
          })
        }
    })
    setTimeout(function(){
      isCanClick = true
    },500)
     
  },

  //减购物车
  reduce: function(e,data) {
    if(isCanClick == false){
      return
    }else{
      isCanClick = false
    }
    
    var that = this;
    var index = e.currentTarget.dataset.num;
    var id = e.currentTarget.dataset.id;
    var dataList = that.data.dataList;
    var gid = e.currentTarget.dataset.gid;
    var gpid = e.currentTarget.dataset.gpid;
    var account = userInfo.account;
    var count = parseInt(e.currentTarget.dataset.count) - 1;
    //存入对象
    that.data.alterantNum[id] = count;
    if (count > 0){
      dataList[index].goods_count = count;
    }else{//购物车只有1个，删除此条数据
      count = 1;
    }
    if (dataList.length){  //是否有商品了
      var con = true;
    } else {
      var con = false;
    }
    tools.httpClient('home/WxStore/insertCartGoods',{
      gid: gid,
      account: account,
      goods_count: -1,
      gpid: gpid
    },(error,data)=>{
        if(data.errorCode == 0){
          that.setData({ dataList: dataList, con: con, });
          that.getTotalPrice()
        }else{
          wx.showToast({
            title: data.errorInfo,
            icon:'none'
          })
        }
    }) 
    setTimeout(function(){
      isCanClick = true
    },500)
   
  },

  //计算总价
  getTotalPrice: function (e,data) {
    var that = this;
    var dataList = that.data.dataList;
    var total = 0;
    var total_num = 0;
    for (var n = 0; n < dataList.length; n++) {
      if (dataList[n].checked && dataList[n].updown == 1) {
        total += dataList[n].goods_count * dataList[n].price;
        total_num += parseInt(dataList[n].goods_count);
      }
    }
    that.setData({
      sum: total.toFixed(2),
      total_num: total_num
      // dataList: dataList
    })
  },

//编辑 完成 切换
  changeTab:function(e){
    var ee = e.currentTarget.dataset.editend;
    if(ee == 0){
      this.setData({
        editEnd:1,
        editEndText:'编辑',
        btnTexts: 1
      });
    }else if(ee == 1){
      this.setData({
        editEnd: 0,
        editEndText: '完成',
        btnTexts: 0
      });
    }
  },
})