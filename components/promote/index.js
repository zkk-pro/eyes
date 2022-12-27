// components/promote/index.js

var CONFIG = require('../../utils/config.js');
var base_url = CONFIG.API_URL.BASE_URL;
Component({

    options: {
        addGlobalClass: true
    },

    /**
     * 组件的属性列表
     */
    properties: {
        flag: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        base_url: base_url
    },

    /**
     * 组件的方法列表
     */
    methods: {
        cancle() {
            this.triggerEvent('cancle');
            this.setData({
                flag: false
            })
        },
        twoBtnClick() {
            this.triggerEvent('twoClick');
            // this.setData({
            //     flag: false
            // })
        },
        oneBtnClick() {
            this.triggerEvent('oneClick');
            this.setData({
                flag: false
            })
        }
    }
})