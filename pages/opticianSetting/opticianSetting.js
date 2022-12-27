// pages/index/index.js
var wx_login = require('../../utils/wxLogin.js');
var CONFIG = require('../../utils/config.js');
var tools = require('../../utils/tools.js');
//index.js
var app = getApp();
var base_url = CONFIG.API_URL.BASE_URL;
var userInfo = "";
var  brandId = 0,//选中品牌id
     functionId = 0,//选中的功能id
     refractionId = 0,//选中的折射率id
     materialId = 0,//材质id
     priceAreaId = 0;//价格区间id
     var height = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_url:base_url,
    priceAreaInfo:[],//价格区间
    positionInfo:[],//定位选择
    circleInfo:[],//圈型
    frameInfo:[],//框型
    materialInfo:[],//材质
    colorInfo:[],//颜色
    positionIndex:0,//定位index
    brandInfo:[],//品牌
    functionInfo:[],//功能
    refractionInfo:[],//折射率
    opticianInfo:[],//价格组合数据
    sizeInfo:[],//尺码列表
    sex:1,//性别 1男 2女
    choiceTitle:'',//选择弹框标题
    isShowModal:0,
    modalData:[],//弹框数据
    brandName:'请选择',
    functionName:'请选择',
    refractionName:'请选择',
    positionName:'请选择',
    materialName:'请选择',
    sizeName:'请选择',
    price:0.00,
    message:'',
    show_top:0,
    img_url:'',
    simple_desc:'',
    isUseOther:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var that = this;
   
    brandId = 0;//选中品牌id
     functionId = 0;//选中的功能id
     refractionId = 0;//选中的折射率id
     materialId = 0;//材质id
     priceAreaId = 0;//价格区间id
    if(app.globalData.type==1){
      height = 34;
    }
    let nav_active = {
      index:'',
      cart: '',
      reserve:'',
      setting: 'active',
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
      height:height,
      price:0.00,
    })
    wx.showLoading();
    that.getAllDataBySetting();//获取配镜部分信息
    that.getAllBrandInfo();//获取品牌信息
    that.getAllSize();//获取尺码信息
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
    that.setData({
      price:0.00,
    })
    setTimeout(function (){
      userInfo = wx.getStorageSync('userInfo');
      that.getOptometristByUserId(that);
    },100)
    that.getOtherConfig();//获取其他配置
    that.getShowBusinessConfig();
  },

  /**
   * 获取商家信息
   */
  getOptometristByUserId(that){
    tools.httpClient('home/WxApp/getOptometristByUserId',{user_id:userInfo.id ? userInfo.id : -1},(error,data)=>{
      if(data.errorCode == 0){
        let nav_active = that.data.nav_active;
        nav_active['isBusiness'] = 1;
        that.setData({
          nav_active: nav_active
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

  /**
   * 获取配镜部分信息
   */
  getAllDataBySetting(){
    var that = this;
    tools.httpClient('home/WxApp/getAllDataBySetting',{},(error,data)=>{
      if(data.errorCode == 0){
        var priceAreaInfo = data.data.priceAreaInfo;
        for (var i = 0; i < priceAreaInfo.length; i++){
          priceAreaInfo[i]['selected'] = 0;//选中标识  1选中 默认0

        }
        var positionInfo = data.data.positionInfo;
        for (var i = 0; i < positionInfo.length; i++){
          positionInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }
        var circleInfo = data.data.circleInfo;
        for (var i = 0; i < circleInfo.length; i++){
          circleInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }
        var frameInfo = data.data.frameInfo;
        for (var i = 0; i < frameInfo.length; i++){
          frameInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }
        var colorInfo = data.data.colorInfo;
        for (var i = 0; i < colorInfo.length; i++){
          colorInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }

        that.setData({
          priceAreaInfo:priceAreaInfo,
          positionInfo:positionInfo,
          circleInfo:circleInfo,
          frameInfo:frameInfo,
          colorInfo:colorInfo,
        })
      }
    })
  },

  /**
   * 获取品牌信息
   */
  getAllBrandInfo(){
    var that = this;
    tools.httpClient('home/WxApp/getAllBrandInfo',{},(error,data)=>{
      if(data.errorCode == 0){
        var brandInfo = data.data;
        for (var i = 0; i < brandInfo.length; i++){
          brandInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }
        that.setData({
          brandInfo:brandInfo
        },function (){
          that.getAllFunctionInfo();//获取功能信息
        })
      }
    })
  },

  /**
   * 获取品牌信息
   */
  getAllSize(){
    var that = this;
    tools.httpClient('home/WxApp/getAllSize',{},(error,data)=>{
      if(data.errorCode == 0){
        var sizeInfo = data.data;
        for (var i = 0; i < sizeInfo.length; i++){
          sizeInfo[i]['selected'] = 0;//选中标识  1选中 默认0
          sizeInfo[i]['is_can_choice'] = 1;
        }
        that.setData({
          sizeInfo:sizeInfo
        })
      }
    })
  },

  /**
   * 获取功能信息
   */
  getAllFunctionInfo(){
    var that = this;
    tools.httpClient('home/WxApp/getAllFunctionInfo',{},(error,data)=>{
      if(data.errorCode == 0){
        var functionInfo = data.data;
        for (var i = 0; i < functionInfo.length; i++){
          functionInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }
        that.setData({
          functionInfo:functionInfo
        },function (){
          that.getAllRefractionInfo();//获取所有折射率信息
        })

      }
    })
  },

  /**
   * 获取折射率
   */
  getAllRefractionInfo(){
    var that = this;
    tools.httpClient('home/WxApp/getAllRefractionInfo',{},(error,data)=>{
      if(data.errorCode == 0){
        var refractionInfo = data.data;
        for (var i = 0; i < refractionInfo.length; i++){
          refractionInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }
        that.setData({
          refractionInfo:refractionInfo
        },function (){
          that.getAllMaterialInfo();
        })

      }
    })
  },

  /**
   * 获取材质
   */
  getAllMaterialInfo(){
    var that = this;
    tools.httpClient('home/WxApp/getAllMaterial',{},(error,data)=>{
      if(data.errorCode == 0){
        var materialInfo = data.data;
        for (var i = 0; i < materialInfo.length; i++){
          materialInfo[i]['selected'] = 0;//选中标识  1选中 默认0
        }
        that.setData({
          materialInfo:materialInfo,
        },function (){
          that.setPropertyData(that);//处理是否可选
        })

      }
    })
  },

  /**
   * 处理价格属性数据
   */
  setPropertyData(that){
    tools.httpClient('home/WxApp/setPropertyData',{
      brandId : brandId,
      functionId : functionId,
      refractionId : refractionId,
      materialId : materialId,
      priceAreaId : priceAreaId
    },(error,data)=>{
      if(data.errorCode == 0){
          var brandIdArray = data.data.brandIdArray;
          var functionIdArray =  data.data.functionIdArray;
          var refractionIdArray = data.data.refractionIdArray;
          var materialIdArray = data.data.materialIdArray;
          if(priceAreaId == 0 && brandId > 0 && functionId == 0 && refractionId == 0 && materialId == 0){
            brandIdArray = [];
          }
          if(priceAreaId == 0 && brandId == 0 && functionId > 0 && refractionId == 0 && materialId == 0){
            functionIdArray = [];
          }
          if(priceAreaId == 0 && brandId == 0 && functionId == 0 && refractionId > 0 && materialId == 0){
            refractionIdArray = [];
          }
          if(priceAreaId == 0 && brandId == 0 && functionId == 0 && refractionId == 0 && materialId > 0){
            materialIdArray = [];
          }
          var brandInfo = that.data.brandInfo;
          var refractionInfo = that.data.refractionInfo;
          var functionInfo = that.data.functionInfo;
          var materialInfo = that.data.materialInfo;

          for(let i in brandInfo){
            if(brandIdArray.length > 0){
              if(brandIdArray.indexOf(brandInfo[i]['id']) >= 0){
                brandInfo[i]['is_can_choice'] = 1;
              }else{
                brandInfo[i]['is_can_choice'] = 0;
              }
            }else{
              if(priceAreaId > 0){
                brandInfo[i]['is_can_choice'] = 0;
              }else{
                brandInfo[i]['is_can_choice'] = 1;
              }
            }
          }

        for(let i in refractionInfo){
          if(refractionIdArray.length > 0){
            if(refractionIdArray.indexOf(refractionInfo[i]['id']) >= 0){
              refractionInfo[i]['is_can_choice'] = 1;
            }else{
              refractionInfo[i]['is_can_choice'] = 0;
            }
          }else{
            if(priceAreaId > 0){
              refractionInfo[i]['is_can_choice'] = 0;
            }else{
              refractionInfo[i]['is_can_choice'] = 1;
            }
          }
        }

        for(let i in functionInfo){
          if(functionIdArray.length > 0){
            if(functionIdArray.indexOf(functionInfo[i]['id']) >= 0){
              functionInfo[i]['is_can_choice'] = 1;
            }else{
              functionInfo[i]['is_can_choice'] = 0;
            }
          }else{
            if(priceAreaId > 0){
              functionInfo[i]['is_can_choice'] = 0;
            }else{
              functionInfo[i]['is_can_choice'] = 1;
            }
          }
        }

        for(let i in materialInfo){
          if(materialIdArray.length > 0){
            if(materialIdArray.indexOf(materialInfo[i]['id']) >= 0){
              materialInfo[i]['is_can_choice'] = 1;
            }else{
              materialInfo[i]['is_can_choice'] = 0;
            }
          }else{
            if(priceAreaId > 0){
              materialInfo[i]['is_can_choice'] = 0;
            }else{
              materialInfo[i]['is_can_choice'] = 1;
            }
          }
        }

        that.setData({
          brandInfo:brandInfo,
          functionInfo:functionInfo,
          refractionInfo:refractionInfo,
          materialInfo:materialInfo
        });
        if(brandId > 0 && functionId > 0 && refractionId > 0 && materialId > 0 ){
          that.getPriceByChoice();
        }else{
          that.setData({
            price:0.00
          })
        }
      }
      wx.hideLoading();
    })
  },

  /**
   * 获取已选中的价格数据
   */
  getPriceByChoice(){
    var that = this;
    tools.httpClient('home/WxApp/getPriceByChoice',{
      brandId : brandId,
      functionId : functionId,
      refractionId : refractionId,
      materialId : materialId
    },(error,data)=>{
      if(data.errorCode == 0){
         that.setData({
           price:data.data.price
         })
      }else{
        wx.showToast({
          title:'找不到当前的价格信息，请重试',
          icon:'none',
            duration: 2000
        })
        that.setData({
          price:0.00
        })
      }
    })
  },

  /**
   * 页面输入
   */
  message(e){
    this.setData({
      message:e.detail.value
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
   * 选择性别
   */
  choiceSex(e){
    var that  = this;
    var sex = e.currentTarget.dataset.sex;
    that.setData({
      sex:sex
    })
  },

  /**
   * 多选处理
   */
  choiceGroup(e){
    var that = this;
    var type = e.currentTarget.dataset.type;//获取当前选择的对象
    var dataList = that.data[type];//获取对象的列表
    var index = e.currentTarget.dataset.index;//获取当前点击的index
    if(dataList[index]['selected'] == 1){//判断选中状态
      dataList[index]['selected'] = 0;
    }else{
      dataList[index]['selected'] = 1;
    }
    var data = {};
    data[type] = dataList;
    that.setData(data);
  },

  /**
   * 显示
   */
  longTap(e){
    var that = this;
    var type = e.currentTarget.dataset.type;//获取当前选择的对象
    var dataList = that.data[type];//获取对象的列表

    var index = e.currentTarget.dataset.index;//获取当前点击的index

    var simple_desc = dataList[index]['simple_desc'];
    var img_url = dataList[index]['img_url'];
    if(!simple_desc && !img_url){
        return
    }
    that.setData({
      show_top:1,
      img_url:img_url,
      simple_desc:simple_desc
    });

    setTimeout(function (){
      that.setData({
        show_top:0,
        img_url:'',
        simple_desc:''
      });
    },3000)
  },

  /**
   * 隐藏
   */
  hideTop(){
    this.setData({
      show_top:0,
      img_url:'',
      simple_desc:''
    });
  },

  /**
   * 空事件
   */
  emptyEvent(){

  },


  /**
   * 单选处理
   */
  choiceSingle(e){
    var that = this;
    var priceAreaInfo = that.data.priceAreaInfo;
    var index = e.currentTarget.dataset.index;
    if(priceAreaInfo[index]['selected'] == 0){//置为选中
      for (var i = 0; i < priceAreaInfo.length; i++){
        priceAreaInfo[i]['selected'] = 0;//取消所有的选中状态
      }
      priceAreaInfo[index]['selected'] = 1;
      priceAreaId = priceAreaInfo[index]['id'];
    }else{//取消选中
      priceAreaInfo[index]['selected'] = 0;
      priceAreaId = 0;
    }
    brandId = 0,//选中品牌id
    functionId = 0,//选中的功能id
    refractionId = 0,//选中的折射率id
    materialId = 0;//材质id
    var  brandInfo = that.data.brandInfo;
    var  functionInfo = that.data.functionInfo;
    var  refractionInfo = that.data.refractionInfo;
    var  materialInfo = that.data.materialInfo;
    for(var i = 0;i < brandInfo.length;i++){
      brandInfo[i]['selected'] = 0;
    }
    for(var i = 0;i < functionInfo.length;i++){
      functionInfo[i]['selected'] = 0;
    }
    for(var i = 0;i < refractionInfo.length;i++){
      refractionInfo[i]['selected'] = 0;
    }

    for(var i = 0;i < materialInfo.length;i++){
      materialInfo[i]['selected'] = 0;
    }
    that.setData({
      brandInfo:brandInfo,
      functionInfo:functionInfo,
      refractionInfo:refractionInfo,
      materialInfo:materialInfo,

      priceAreaInfo:priceAreaInfo,
      brandName:'请选择',
      functionName:'请选择',
      refractionName:'请选择',
      materialName:'请选择',
      price:0.00
    },function (){
      that.setPropertyData(that);//处理是否可选
    })
  },

  /**
   * 显示选择框
   */
  showModal(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    if(priceAreaId == 0 && type != 'sizeInfo'){
      wx.showToast({
        title:'请先选择价格区间',
        icon:'none',
          duration: 2000
      })
      return;
    }

    var choiceTitle = '';
    if(type == 'brandInfo'){
      choiceTitle = '品牌选择';
    }else if(type == 'refractionInfo'){
      choiceTitle = '折射率选择';
    }else if(type == 'functionInfo'){
      choiceTitle = '功能选择';
    }else if(type == 'materialInfo'){
      choiceTitle = '材质选择';
    }else if(type == 'sizeInfo'){
      choiceTitle = '尺码选择';
    }
    that.setData({
      choiceTitle:choiceTitle,
      type:type,
      isShowModal:1,
    })
  },

  /**
   * 隐藏选择框
   */
  hideModal(e){
    var that = this;
    that.setData({
      isShowModal:0
    })
  },

  /**
   * 阻止冒泡
   */
  emptyEvent(e){

  },

  /**
   * 选择价格属性
   */
  property(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    if(priceAreaId == 0 && type != 'sizeInfo'){
      wx.showToast({
        title:'请先选择价格区间',
        icon:'none',
          duration: 2000
      })
      return;
    }
   
    var modalData = that.data[type];//获取当前处理的数据
    var data = {};

    if(modalData[index]['is_can_choice'] == 0){
      return false;
    }
    if(modalData[index]['selected'] == 0){//置为选中状态
      for (var i = 0; i < modalData.length; i++){
        modalData[i]['selected'] = 0;//取消所有的选中状态
      }
      modalData[index]['selected'] = 1;
      if(type == 'brandInfo'){
        brandId = modalData[index]['id'];
        data['brandName'] = modalData[index]['name'];
      }else if(type == 'functionInfo'){
        functionId = modalData[index]['id'];
        data['functionName'] = modalData[index]['name'];
      }else if(type == 'refractionInfo'){
        refractionId = modalData[index]['id'];
        data['refractionName'] = modalData[index]['name'];
      }else if(type == 'sizeInfo'){
        data['sizeName'] = modalData[index]['name'];
      }else{
        materialId = modalData[index]['id'];
        data['materialName'] = modalData[index]['name'];
      }
    }else{//取消选中状态
      modalData[index]['selected'] = 0;
      if(type == 'brandInfo'){
        brandId = 0;
        data['brandName'] = '请选择';
      }else if(type == 'functionInfo'){
        functionId = 0;
        data['functionName'] = '请选择';
      }else if(type == 'refractionInfo'){
        refractionId = 0;
        data['refractionName'] = '请选择';
      }else if(type == 'sizeInfo'){
        data['sizeName'] = '请选择';
      }else{
        materialId = 0;
        data['materialName'] = '请选择';
      }
    }

    data[type] = modalData;
    that.setData(data,function (){
      that.setPropertyData(that);//处理是否可选
    })
  },

  /**
   * 定位选择
   */
  bindPickerChange(e){
    this.setData({
      positionIndex:e.detail.value,
      positionName:this.data.positionInfo[e.detail.value]['name']
    });
  },

  /**
   * 点击下一步
   */
  nextStep(){
    var that = this;
    tools.isWxLogin(function(res){
      if(res){
          var  priceAreaInfo = that.data.priceAreaInfo;
          var  brandInfo = that.data.brandInfo;
          var  functionInfo = that.data.functionInfo;
          var  refractionInfo = that.data.refractionInfo;
          var  positionInfo = that.data.positionInfo;
          var  frameInfo = that.data.frameInfo;
          var  circleInfo = that.data.circleInfo;
          var  materialInfo = that.data.materialInfo;
          var  colorInfo = that.data.colorInfo;
          var  sizeInfo = that.data.sizeInfo;
          var priceAreaId = 0;
          var brandId = 0;
          var functionId = 0;
          var refractionId = 0;
          var  positionId = 0;
          var sizeId = 0;
          var frameIds = [];
          var circleIds = [];
          var materialIds = [];
          var colorIds = [];
          var sex = that.data.sex;
          var message = that.data.message;
          var price = that.data.price;
          for(var i = 0;i < priceAreaInfo.length;i++){
            if(priceAreaInfo[i]['selected'] == 1){
              priceAreaId = priceAreaInfo[i]['id'];
              break;
            }
          }
          
          for(var i = 0;i < sizeInfo.length;i++){
            if(sizeInfo[i]['selected'] == 1){
              sizeId = sizeInfo[i]['id'];
              break;
            }
          }

          for(var i = 0;i < brandInfo.length;i++){
            if(brandInfo[i]['selected'] == 1){
              brandId = brandInfo[i]['id'];
              break;
            }
          }
          for(var i = 0;i < functionInfo.length;i++){
            if(functionInfo[i]['selected'] == 1){
              functionId = functionInfo[i]['id'];
              break;
            }
          }
          for(var i = 0;i < refractionInfo.length;i++){
            if(refractionInfo[i]['selected'] == 1){
              refractionId = refractionInfo[i]['id'];
              break;
            }
          }

          for(var i = 0;i < materialInfo.length;i++){
            if(materialInfo[i]['selected'] == 1){
              materialIds = materialInfo[i]['id'];
            }
          }
          if(that.data.positionName != '请选择'){
            positionId = positionInfo[that.data.positionIndex]['id'];
          }
          for(var i = 0;i < frameInfo.length;i++){
            if(frameInfo[i]['selected'] == 1){
              frameIds.push(frameInfo[i]['id']);
            }
          }
          for(var i = 0;i < circleInfo.length;i++){
            if(circleInfo[i]['selected'] == 1){
              circleIds.push(circleInfo[i]['id']);
            }
          }
         
          for(var i = 0;i < colorInfo.length;i++){
            if(colorInfo[i]['selected'] == 1){
              colorIds.push(colorInfo[i]['id']);
            }
          }
          if(priceAreaId <= 0){
            wx.showToast({
              title:'请选择价格区间',
              icon:'none',
                duration: 2000
            })
            return
          }
        
          if(frameIds.length <= 0){
            wx.showToast({
              title:'请选择框型',
              icon:'none',
                duration: 2000
            })
            return
          }
          if(circleIds.length <= 0){
            wx.showToast({
              title:'请选择圈型',
              icon:'none',
                duration: 2000
            })
            return
          }
          
          if(colorIds.length <= 0){
            wx.showToast({
              title:'请选择颜色',
              icon:'none',
                duration: 2000
            })
            return
          }
          if(sizeId <= 0){
            wx.showToast({
              title:'请选择尺码',
              icon:'none',
                duration: 2000
            })
            return
          }

          if(materialId <= 0){
            wx.showToast({
              title:'请选择材质',
              icon:'none'
            })
            return
          }


          if(brandId <= 0){
            wx.showToast({
              title:'请选择品牌',
              icon:'none'
            })
            return
          }
          if(functionId <= 0){
            wx.showToast({
              title:'请选择功能',
              icon:'none'
            })
            return
          }
          if(refractionId <= 0){
            wx.showToast({
              title:'请选择折射率',
              icon:'none'
            })
            return
          }

          wx.setStorageSync('settingInfo',{
            priceAreaId : priceAreaId,
            brandId : brandId,
            functionId : functionId,
            refractionId : refractionId,
            positionId : positionId,
            sizeId:sizeId,
            frameIds : frameIds.join(","),
            circleIds  : circleIds.join(","),
            materialIds : materialIds,
            colorIds : colorIds.join(","),
            sex : sex,
            message : message,
            price : price,
          })
          wx.navigateTo({
            url: '/pages/nextStep/nextStep',
          })


      }
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