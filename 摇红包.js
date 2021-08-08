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
  var successLabel = className("android.view.View").text("恭喜摇到高温补贴")
  var endLabel = className("android.view.View").text("领取太多红包了")
  var dualAccountLabel = className("android.view.View").text("你们已有账号摇过了")

  ABwaitFor(function () {
    tMsg('等待"摇红包"按钮出现')
    return startBtn.exists()
  }, 1000, 300)

  tMsg('尝试关闭弹窗')
  closeBtn.click()

  ABwaitFor(function () {
    tMsg('再次等待"摇红包"按钮出现')
    return startBtn.exists()
  }, 5000, 300)

  for (var i = 0; i < 1000; i++) {
    sleep(randNum(500, 1000));

    var isSuccess = false;

    ABwaitFor(function () {
      // 若出现成功标语则成功
      isSuccess = successLabel.exists()

      // 等待出现了关闭按钮或者出现成功标语，则执行下一步
      return closeBtn.exists() || isSuccess
    }, 5000, 300)

    className("android.widget.Image").text("摇红包").findOne().click()

    if (isSuccess) {
      // 如果成功
      className("android.widget.Button").findOne().click();
      sleep(randNum(500, 1000));
    } else {
      // 如果失败
      closeBtn.waitFor();

      if (endLabel.exists() || dualAccountLabel.exists()) {
        tMsg('今日摇红包次数已用完，明天再来')
        break;
      } else {
        sleep(randNum(500, 1000));
        closeBtn.click()
      }
    }
  }

  tMsg('程序5秒后退出');

  setTimeout(() => {
    console.hide();
    exit();
  }, 5000)
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
function ABwaitFor(isTrueFunc, timeout, period) {
  if (typeof isTrueFunc !== 'function') {
    return tMsg('isTrueFunc需要是一个返回true/false的函数');
  }

  period = period || 200;
  var time = new Date().getTime();

  while (isTrueFunc()) {
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