/**
 * 时间转化组件
 *
 * @author Grey
 */
var timer = {
    /**
     * 时间戳转化成时间
     * @param stamp
     * @returns {string}
     */
    stamp2time: function (stamp) {
        var d = new Date(stamp * 1000);    //根据时间戳生成的时间对象
        var date = (d.getFullYear()) + "-" +
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes()) + ":" +
            (d.getSeconds());
        return date;
    },

    /**
     * 时间转化成时间戳
     * @param stamp
     * @returns {number}
     */
    time2stamp: function (time) {
        time = time.substring(0, 19);
        time = time.replace(/-/g, '/');
        return Math.round(new Date(time).getTime() / 1000);
    },

    /**
     * 秒转化成时分秒的形式
     * @param second
     * @param type 返回的时间类型
     */
    second2hour: function (value, type = 0) {
        var secondTime = parseInt(value);
        var minuteTime = 0;
        var hourTime = 0;
        if (secondTime > 0) {
          hourTime = Math.floor(secondTime / (60 * 60));
          minuteTime = Math.floor(secondTime / 60) - (hourTime * 60);
          secondTime = Math.floor(secondTime) - (hourTime * 60 * 60) - (minuteTime * 60);
        }

        if (hourTime < 10) {
            hourTime = `0${hourTime}`
        }
        if (minuteTime < 10) {
            minuteTime = `0${minuteTime}`
        }
        if (secondTime < 10) {
            secondTime = `0${secondTime}`
        }
        if (type == 0) {
           var result = `${hourTime}:${minuteTime}:${secondTime}`;
            return result;
        } else {
            return {
                hour: hourTime,
                minute: minuteTime,
                second:secondTime
            };
        }
    },

    /**
     * 获取当前时间
     * @param time
     */
    get_now_time: function(time = null) {
        if (time == null) {
            return Math.round(new Date().getTime() / 1000);
        } else {
            return this.time2stamp(time);
        }
    },

    /**
     * 时间和当前时间的差值
     * @param time 时间
     * @param now 基准时间
     */
    down: function (time, now = null, type = 0) {
        var now = this.get_now_time(now);
        time = this.time2stamp(time);
        time = time - now;
        if (time <= 0) {
            time = 0;
        }
        return this.second2hour(time, type);
    },
};
module.exports = timer;