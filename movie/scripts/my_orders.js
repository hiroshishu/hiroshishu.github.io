angular.module('myOrders', [
  'ngTouch'
]).controller('MyOrdersCtrl',['$scope','$timeout','$http',function($scope, $timeout, $http) {
  //判断是否是微信端
  var ua = navigator.userAgent.toLowerCase();
  if(ua.match(/MicroMessenger/i)=="micromessenger") {
      $scope.isWeixin = 1;
   } else {
      $scope.isWeixin = 0;
  }
  $scope.myOrders = [];
  $scope.currentPage = 1;
  $scope.hasNextPage = false;
  $scope.btnTxt = '在线支付';
  $scope.loadingDisplay = 'show';
  var getOrders = function() {
      $http.get('/order/list/' + $scope.currentPage).success(function(data) {
      // $http.get('/mock/myOrdersInterface' + $scope.currentPage + '.json').success(function(data) {
        if (data.code == 200) {
          $scope.loadingDisplay = 'hide';
          if (data.data.length === 20) {
            $scope.currentPage++;
            $scope.hasNextPage = true;
          } else {
            $scope.hasNextPage = false;
          }
          angular.forEach(data.data, function(val, index) {
            // val.payTimeMinute = parseInt(val.payTimeMinute);
            // val.payTimeSecond = parseInt(val.payTimeSecond);
            if (val.myOrderStatus == 1) { //状态为待付款的才启动倒计时
              var countDown = function() {
                if (val.payHour === 0 && val.payTimeMinute === 0 && val.payTimeSecond === 0) {
                  val.myOrderStatus = 3;
                  val.myOrderStatusTxt = '已取消';
                }
                if (val.payTimeSecond === 0) {
                  val.payTimeSecond = 59;
                  val.payTimeMinute = val.payTimeMinute - 1;
                } else {
                  val.payTimeSecond = val.payTimeSecond - 1;
                }
                if(val.payHour > 0 && val.payTimeMinute === 0){
                  val.payTimeMinute = 59;
                  val.payHour = val.payHour - 1;
                }
              };
              var __interval__ = setInterval(function() {
                $scope.$apply(countDown);
              }, 1000);
              countDown();
            }
          });
          $scope.myOrders = $scope.myOrders.concat(data.data);
        } else if (data.code == 'notLogin') {
          location.href = data.data.loginURL + '&returnurl=' + encodeURIComponent(location.href.split('#')[0], 'utf-8');
        } else {
          $scope.isEmpty = true;
        }
      });
    },
    showTip = function(msg) { //错误提示
      $scope.fade = 'fade';
      $scope.msg = msg;
      $timeout(function() {
        $scope.fade = '';
        $scope.msg = '';
      }, 3000);
    };
  $scope.jumpDetails = function(jdErpId, $event) { //跳转到订单详情页
    $event.stopPropagation();
    sessionStorage.jdErpId = jdErpId;
    location.href = "/order_details.html";
  };
  $scope.toPay = function(jdErpId, onlineMoney, $event) { //付款
    $event.stopPropagation();
    var btn = angular.element($event.target);
    $scope.btnTxt = '处理中...';
    $scope.payLoading = true;
    btn.attr('disabled', true);

    function resetBtn() {
      $scope.btnTxt = '在线支付';
      btn.attr('disabled', false);
      $scope.payLoading = false;
    }
    $http.get('/order/paymentUrl', {
      params: {
        erpOrderid: jdErpId,
        onlineMoney: onlineMoney
      }
    }, {
      responseType: 'json'
    }).success(function(jsonData) {
      if (jsonData.code == 200) {
        location.href = jsonData.data;
      } else {
        showTip('下单失败！');
        resetBtn();
      }
    }).error(function() {
      showTip('网络不给力哦，请重试！');
      resetBtn();
    });
  };

  function getScrollTop() {　　
    var scrollTop = 0,
      bodyScrollTop = 0,
      documentScrollTop = 0;　　
    if (document.body) {　　　　
      bodyScrollTop = document.body.scrollTop;　　
    }　　
    if (document.documentElement) {　　　　
      documentScrollTop = document.documentElement.scrollTop;　　
    }　　
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;　　
    return scrollTop;
  }

  function getScrollHeight() {　　
    var scrollHeight = 0,
      bodyScrollHeight = 0,
      documentScrollHeight = 0;　　
    if (document.body) {　　　　
      bodyScrollHeight = document.body.scrollHeight;　　
    }　　
    if (document.documentElement) {　　　　
      documentScrollHeight = document.documentElement.scrollHeight;　　
    }　　
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;　　
    return scrollHeight;
  }

  function getWindowHeight() {　　
    var windowHeight = 0;　　
    if (document.compatMode == "CSS1Compat") {　　　　
      windowHeight = document.documentElement.clientHeight;　　
    } else {　　　　
      windowHeight = document.body.clientHeight;　　
    }　　
    return windowHeight;
  }
  window.onscroll = function() {
    if (getScrollTop() + getWindowHeight() == getScrollHeight() && $scope.hasNextPage) {　　　　
      getOrders();
    }
  };
  getOrders();
}]);