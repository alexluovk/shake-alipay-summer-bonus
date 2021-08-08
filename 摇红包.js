auto();
console.show()

start();
function start() {

  tMsg("打开摇红包界面");
  app.startActivity({
    action: "VIEW",
    data: "alipays://platformapi/startapp?appId=68687725"
  });
  waitForActivity("com.alipay.mobile.nebulax.integration.mpaas.activity.NebulaActivity$Main");
  tMsg("进入摇红包成功");

  var startBtn = className("android.widget.Image").text("摇红包")
  var closeBtn = className("android.widget.Button").text("关闭")
  var gotLabel = className("android.view.View").text("再摇一个")
  var successLabel = className("android.view.View").text("恭喜摇到高温补贴")
  var endLabel = className("android.view.View").text("领取太多红包了")
  var dualAccountLabel = className("android.view.View").text("你们已有账号摇过了")

  tMsg('等待"摇红包"按钮出现')
  AwaitFor(function () {
    return startBtn.exists();
  }, 2000, 300)

  if (!startBtn.exists()) {
    tMsg('尝试关闭弹窗')
    if (closeBtn.exists()) {
      closeBtn.click()
    }

    tMsg('再次等待"摇红包"按钮出现')
    AwaitFor(function () {
      return startBtn.exists()
    }, 10000, 300)

    if (!startBtn.exists()) {
      tMsg('无法找到”摇红包“按钮，程序退出')
      consoleExit()
    }
  }

  tMsg('@@ 开始摇红包')
  for (var i = 0; i < 1000; i++) {
    var isSuccess = false;

    sleep(randNum(500, 1000));
    className("android.widget.Image").text("摇红包").findOne().click()

    AwaitFor(function () {
      // 若出现成功标语则成功
      isSuccess = successLabel.exists()

      // 等待出现了关闭按钮或者出现成功标语，则执行下一步
      return closeBtn.exists() || isSuccess
    }, 5000, 300)


    if (isSuccess) {
      // 如果成功
      className("android.widget.Button").findOne().click();
      sleep(randNum(500, 1000));

      AwaitFor(function () {
        // 若出现“再摇一个”，则点击
        return gotLabel.exists()
      }, 5000, 300)
      gotLabel.findOne().click();

      // === 摇满两个打开红包 ===
      var btn2Fans = className("android.widget.Image").text("A*b0veTIhf4WgAAAAAAAAAAAAAARQnAQ")

      AwaitFor(function () {
        // 若出现“摇满两个”，则点击
        return btn2Fans.exists()
      }, 5000, 300)
      btn2Fans.findOne().click();

      AwaitFor(function () {
        return className("android.view.View").text("恭喜获得红包").exists();
      }, 5000, 300)
      className("android.widget.Button").findOne().click();

      AwaitFor(function () {
        // 若出现“再摇一个”，则点击
        return gotLabel.exists()
      }, 5000, 300)
      gotLabel.findOne().click();

    } else {
      // 如果失败
      closeBtn.waitFor();

      if (endLabel.exists() || dualAccountLabel.exists()) {
        tMsg('今日摇红包次数已用完，明天再来', true)
        break;
      } else {
        sleep(randNum(500, 1000));
        closeBtn.click()
      }
    }
  }

  consoleExit()
}

/**
 * @description 关闭console并退出
 * @returns {void}
 */
function consoleExit(time) {
  time = time || 5000;

  tMsg('程序5秒后退出');
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
function randNum(minNum, maxNum) {
  return maxNum ? parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10) : minNum ? parseInt(Math.random() * minNum + 1, 10) : 0;
}

/**
 * 
 * @param {Function} isTrueFunc 
 * @param {Number} timeout 
 * @param {Number} period 
 * @returns {void}
 */
function AwaitFor(isTrueFunc, timeout, period) {
  if (typeof isTrueFunc !== 'function') {
    return tMsg('isTrueFunc需要是一个返回true/false的函数');
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
function tMsg(msg, tshow) {
  console.log(msg);
  if (tshow) toast(msg);
}
