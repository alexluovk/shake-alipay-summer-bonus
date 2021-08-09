auto();
start();

function start() {
  var config = corConfig()
  var ajCOR = new autoJsInCOR(config)

  ajCOR.start();
}

function corConfig() {
  /**
   * start ======== 更改此配置，适配所有项目 ======== 
   */
  return {
    /** 基本信息  */
    app: {
      name: "摇红包",
      scheme: "alipays://platformapi/startapp?appId=68687725",
      activity: "com.alipay.mobile.nebulax.integration.mpaas.activity.NebulaActivity$Main"
    },
    /** 进入主页面任务  */
    start: function () {
    },
    /** 循环执行任务，优先级从上到下  */
    actionLoop: [
      /** “今天已消费一次”按钮  */
      {
        name: '“今天已消费一次”按钮',
        if: function () {
          return className("android.view.View").text("点击开奖").exists()
        },
        run: function () {
          className("android.view.View").text("点击开奖").findOne().click();
        }
      },

      /**“摇满两个”按钮 */
      {
        name: '“摇满两个”按钮',
        if: function () {
          return className("android.widget.Image").text("A*b0veTIhf4WgAAAAAAAAAAAAAARQnAQ").exists()
        },
        run: function () {
          className("android.widget.Image").text("A*b0veTIhf4WgAAAAAAAAAAAAAARQnAQ").findOne().click();
        }
      },

      /**"摇红包"按钮 */
      {
        name: '"摇红包"按钮',
        if: function () {
          return className("android.widget.Image").text("摇红包").exists()
        },
        run: function () {
          className("android.widget.Image").text("摇红包").findOne().click();
        }
      },

      /**"恭喜摇到高温补贴"按钮 */
      {
        name: '"恭喜摇到高温补贴"按钮',
        if: function () {
          return className("android.view.View").text("恭喜摇到高温补贴").exists()
        },
        run: function () {
          className("android.view.View").text("恭喜摇到高温补贴").findOne().click();
        }
      },

      /**"关闭 X "按钮 */
      {
        name: '"关闭 - X -"按钮',
        if: function () {
          return className("android.widget.Button").text("关闭").exists()
        },
        run: function () {
          className("android.widget.Button").text("关闭").findOne().click();
        }
      },
    ],
    /** 退出循环条件 */
    actionEndIf: function () {
      var isEnd = className("android.view.View").text("领取太多红包了").exists()
      var isDualAccount = className("android.view.View").text("你们已有账号摇过了").exists()

      return isEnd || isDualAccount;
    }
  }
  /**
   * end ======== 更改此配置，适配所有项目 ======== 
   */
}

/**
 * 
 * @param {{String:Any}} config corConfig
 */
function autoJsInCOR(config) {
  this.config = config;

  /**
   * @description 启动函数
   */
  this.start = function () {
    // 1.打开调试台
    console.show();

    // 2.打开目标界面
    this.gotoActivity();

    // 3.进入主页面任务
    this.getRun('start');

    // 4.执行循环任务, 满足条件后结束任务
    this.actionRun();
  }

  /**
   * 
   */
  this.actionRun = function () {
    var vm = this;
    var isForceEnd = false;
    var isLoop = function () {
      // 是否强制停止循环
      if (isForceEnd) return false;

      var runRes = vm.getRun('actionEndIf');
      // 若执行报错，不停止循环执行
      return runRes === "error: getRun" ? true : !runRes
    }

    // 获取 actionLoop
    var actionLoop = this.getActionLoop()

    while (isLoop()) {
      var curRun;

      vm.awaitFor(function () {
        curRun = vm.getCurUIRun(actionLoop)
        return !!curRun;
      }, 10000, 300)

      console.log(curRun.toString())

      if (typeof curRun === 'function') {
        // 模拟人类反应
        sleep(vm.randNum(500, 1500));

        console.log("@@ - curRun -")

        // todo: 不知为何会阻塞，跑不下去
        try {
          curRun()
        } catch (error) {
          console.log(error.toString())
        }

        console.log("@@ - curRun - End -")
      } else {
        console.log(typeof curRun)
      }
    }

    this.tMsg('满足退出条件，程序退出')
    this.consoleExit()
  }

  /**
   * @returns {String} 根据当前界面状态，返回对应执行程序
   */
  this.getCurUIRun = function (actLoop) {
    for (var i = 0; i < actLoop.length; i++) {
      var cur = actLoop[i];
      var isExists = false;
      try {
        var curRunRes = cur['if']()
        isExists = !!curRunRes
      } catch (e) {
        console.log(e)
      }
      // 看看遍历状态

      var name = cur['name'] || (i + 1)
      console.log((i + 1) + '.' + name + ': ' + isExists)
      if (isExists) {
        this.tMsg('符合' + name + '条件')
        return cur['run'];
      }
      // else if (i === keys.length - 1) {
      //   // 若是最后一个
      //   return false;
      // }
    }

    return false;
  }

  /**
   * @description 前往凉爽红包节
   */
  this.gotoActivity = function () {
    var vm = this;
    var appName = this.getCfg("app.name") || "任务"
    var scheme = this.getCfg("app.scheme") || (function () {
      vm.tMsg('请输入APP的跳转地址，程序5秒后退出', true)
      vm.consoleExit()
      return false;
    })()
    var _activity = this.getCfg("app.activity")

    this.tMsg("打开" + appName + "界面");

    app.startActivity({
      action: "VIEW",
      data: scheme
    });

    if (_activity) {
      this.awaitFor(function () {
        var tar = _activity
        var cur = global.currentActivity()
        return tar === cur
      }, 10000, 300)

      this.tMsg("进入" + appName + "成功");
    }
  }

  /**
   * @description 关闭console并退出
   * @returns {void}
   */
  this.consoleExit = function (time) {
    time = time || 5000;

    var timeStr = Math.round(time / 1000)
    this.tMsg('程序' + timeStr + '秒后退出');

    setTimeout(() => {
      console.hide();
      exit();
    }, time)
  }

  /**
   * @description 根据范围生成随机数
   * @param {Number} minNum 
   * @param {Number} maxNum 
   * @returns {Number}
   */
  this.randNum = function (minNum, maxNum) {
    return maxNum ? parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10) : minNum ? parseInt(Math.random() * minNum + 1, 10) : 0;
  }

  /**
   * 
   * @param {Function} isTrueFunc 
   * @param {Number} timeout 
   * @param {Number} period 
   * @returns {Boolean} 返回false是超时
   */
  this.awaitFor = function (isTrueFunc, timeout, period) {
    if (typeof isTrueFunc !== 'function') {
      return this.tMsg('isTrueFunc需要是一个返回true/false的函数');
    }

    period = period || 200;
    var time = new Date().getTime();

    // 当程序不为真
    while (!isTrueFunc()) {
      if (timeout && new Date().getTime() - time >= timeout) {
        return false;
      };
      sleep(period);
    };
    return true;
  };

  /**
   * 
   * @param {String} msg 
   * @param {Boolean} tshow 
   * @returns {void}
   */
  this.tMsg = function (msg, tshow) {
    console.log(msg);
    if (tshow) toast(msg);
  }

  /**
   * 
   * @param {{String: Any}} from 
   * @param {String} path 
   * @returns {Any}
   */
  this.get = function (from, path) {
    if (typeof from !== 'object') return from;
    return path
      .replace(/\[([^\[\]]*)\]/g, '.$1.')
      .split('.')
      .filter(t => t !== '')
      .reduce((prev, cur) => prev && prev[cur], from);
  }

  /**
   * @param {String} path 
   * @returns {Any}
   */
  this.getCfg = function (path) {
    return this.get(this.config, path)
  }

  /**
   * @param {String} path 
   * @returns {Any} 
   */
  this.getRun = function (path) {
    try {
      return this.get(this.config, path)();
    } catch (err) {
      this.tMsg(err.toString())
      return 'error: getRun';
    }
  }

  /**
   * @returns {Array} ActionLoop
   */
  this.getActionLoop = function () {
    var vm = this;
    var rawActArr = this.getCfg('actionLoop')
    var isCfg0Fun = function (path) {
      return (typeof vm.get(rawActArr, '0.' + path) !== 'function');
    }
    if (isCfg0Fun('if') || isCfg0Fun('run')) {
      vm.tMsg('请填写正确的 if/run 执行程序')
      exit();
      return false;
    }

    var actionLoop = []
    rawActArr.forEach(function (item, i) {
      var ifFun = vm.get(item, 'if');
      var runFun = vm.get(item, 'run');
      var runName = vm.get(item, 'name') || "";

      var isValid = typeof ifFun === 'function' && typeof ifFun === 'function'

      if (isValid) {
        actionLoop.push({
          name: runName,
          if: ifFun,
          run: runFun,
        })
      } else {
        vm.tMsg('第' + (i + 1) + '个actionLoop录入失败，该条件略过，请检查格式')
      }
    })

    return actionLoop
  }

}
