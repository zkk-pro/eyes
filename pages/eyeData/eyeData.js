// pages/eyeData/eyeData.js
var tools = require('../../utils/tools.js');
var userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    astigmiaArr: ['是', '否'],
    astigmiaIndex: 0,
    isEdit: false,
    listData: [],
    showModal: false,
    currentData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    userInfo = wx.getStorageSync('userInfo');
    console.log('userInfo:', userInfo)
    this.getList(this)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  inputHandler(e) {
    const key = e.currentTarget.dataset.key
    const val = e.detail.value
    const currentData = Object.assign({}, this.data.currentData)
    currentData[key] = val
    this.setData({
      currentData
    })
  },
  bindPickerChange(e) {
    this.setData({
      astigmiaIndex: e.detail.value
    })
  },
  onCancel() {
    this.setData({
      showModal: false
    })
  },
  onConfirm() {
    const currentData = this.data.currentData
    console.log('currentData:', currentData)
    // if(currentData.degree_left === '') return wx.showToast({title: '请输入完整数据'})
    if (this.data.isEdit) {
      this.udpateItemData()
    } else {
      this.createData()
    }
  },
  addData() {
    this.setData({
      showModal: true,
      isEdit: false,
      currentData: {
        "uid": userInfo.id, //用户id
        "astigmia_left": "", //散光/柱镜/CYL左
        "astigmia_right": "", //散光/柱镜/CYL右
        "degree_left": "", //度数/球镜/SPH左
        "degree_right": "", //度数/球镜/SPH右
        "axial_left": "", //轴位/AXIS左
        "axial_right": "", //轴位/AXIS右
        "pd": "", //瞳距
      }
    })
  },
  editHandler(ev) {
    console.log('ev:', ev.currentTarget.dataset)
    const {
      add_time,
      update_time,
      ...currentData
    } = ev.currentTarget.dataset.item
    this.setData({
      showModal: !this.data.showModal,
      currentData,
      isEdit: true
    })
  },
  getList(that) {
    tools.httpClient('home/WxApp/getDegree', {}, (error, data) => {
      if (data.errorCode == 0) {
        this.setData({
          listData: data.data.dataList
        })
      }
    })
  },
  udpateItemData(item) {
    tools.httpClient('home/WxApp/updateDegree', this.data.currentData, (error, data) => {
      if (data.errorCode == 0) {
        wx.showToast({
          title: '编辑成功！',
        })
        this.setData({
          showModal: false
        })
        this.getList()
      }
    })
  },
  createData() {
    tools.httpClient('home/WxApp/setDegree', this.data.currentData, (error, data) => {
      if (data.errorCode == 0) {
        wx.showToast({
          title: '添加成功！',
        })
        this.setData({
          showModal: false
        })
        this.getList()
      }
    })
  }

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh() {

  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom() {

  // },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage() {

  // }
})