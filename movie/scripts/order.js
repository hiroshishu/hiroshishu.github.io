angular.module('order', [
    'ngTouch'
]).controller('OrderCtrl',['$scope','$timeout','$http',function($scope, $timeout, $http) {
    //判断是否是微信端
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        $scope.isWeixin = 1;
     } else {
        $scope.isWeixin = 0;
    }

    //用户如果进入支付界面 点击后退 则刷新页面 针对新浏览器
    if( localStorage.submitSuc && localStorage.submitSuc == 1 ){
        localStorage.submitSuc = '';
        !$scope.isWeixin && window.location.reload();
    }

    //sessionStorage状态检测
    if(!sessionStorage.couponPrice || !sessionStorage.cinemaName || !sessionStorage.cinemaAddr || !sessionStorage.movieId || !sessionStorage.couponType || !localStorage.cityId){
        location.href = '/home.html';
    }
    var isPhone = function(num) { //手机号校验 parameter num or string
            if (!num) {
                return false;
            }
            if (typeof(num) == 'number') {
                num = num + '';
            }
            if (num.length == 11) {
                return /1[3-8]+\d{9}/.test(num);
            } else {
                return false;
            }
        },
        showTip = function(msg) { //错误提示
            $scope.fade = 'fade';
            $scope.msg = msg;
            $timeout(function() {
                $scope.fade = '';
                $scope.msg = '';
            }, 3000);
        };

    

    $scope.count = parseInt(sessionStorage.__count__ || 1); //购票数量
    $scope.cinemaName = sessionStorage.cinemaName;
    $scope.cinemaAddr = sessionStorage.cinemaAddr;
    $scope.movieId = sessionStorage.movieId;
    $scope.couponType = sessionStorage.couponType;
    $scope.couponPrice = parseFloat(sessionStorage.couponPrice); //电影票单价
    $scope.couponDate = sessionStorage.couponDate;
    $scope.couponAmount = parseFloat(sessionStorage.couponAmount) || 0; //优惠券减免金额

    $scope.jdouUsed = sessionStorage.jdouUsed;
    $scope.jdouNum = 0;
    $scope.jdouAmount = $scope.jdouUsed ? $scope.jdouNum/100 : 0;

    $scope.phoneNum = sessionStorage.phoneNum || '';
    $scope.btnTxt = '在线支付';
    $scope.add = function() { //增加购票数量
        $scope.count = $scope.count + 1;
        getjdBean();
    };
    $scope.decrement = function() { //减少购票数量
        if ($scope.count > 1) {
            $scope.count = $scope.count - 1;
            getjdBean();
        }
    };
    $scope.removePwd = function() { //清空支付密码输入框中
        $scope.payPassword = '';
    };
    $scope.removePhoneNum = function() { //删除输入框中的手机号
        $scope.phoneNum = '';
    };
    $scope.toPay = function($event) { //下单
        $event.stopPropagation();
        var _isPhone = isPhone($scope.phoneNum),
            payType;

        if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.couponAmount < $scope.couponPrice * $scope.count){
            payType = 4;//混合支付（京卷+在线）
        }else if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.couponAmount >= $scope.couponPrice * $scope.count ){
            payType = 5;//全额京卷支付
        }else if( $scope.jdouAmount >= $scope.couponPrice * $scope.count ){
            payType = 6;//京豆支付
        }else if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'dc'){
            payType = 7;//混合支付（东卷+在线）
        }else if( $scope.jdouAmount > 0 && !sessionStorage.__couponType__ ){
            payType = 8;//京豆+在线
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'dc' ){
            payType = 9;//京豆+东券+在线支付
        }else if( sessionStorage.__couponType__ === 'dc' && $scope.jdouAmount + $scope.couponAmount >= $scope.couponPrice * $scope.count){
            payType = 10;//京豆+东券; 
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.jdouAmount + $scope.couponAmount < $scope.couponPrice * $scope.count){
            payType = 11;//京豆+京券+在线
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.jdouAmount + $scope.couponAmount >= $scope.couponPrice * $scope.count){
            payType = 12;//京豆+京券
        }else {
            payType = 2;//在线支付
        }

        if (!_isPhone) {
            showTip('您的手机号填写有误哦，请重新填写！');
        } else if ($scope.couponAmount > 0 && !$scope.payPassword) {
            showTip('请填写支付密码！');
        } else {
            var btn = angular.element($event.target),
                _tempType;
            $scope.btnTxt = '处理中...';
            $scope.payLoading = true;
            btn.attr('disabled', true);

            function resetBtn() {
                $scope.btnTxt = '在线支付';
                btn.attr('disabled', false);
                $scope.payLoading = false;
            }
            if (sessionStorage.couponType == '2D') {
                _tempType = 1;
            } else if (sessionStorage.couponType == '3D') {
                _tempType = 2;
            } else {
                _tempType = 3;
            }
            $http.get('/order/submit', {
                params: {
                    cinemaId: sessionStorage.orderCinemaId,
                    agentId: sessionStorage.orderAgentId,
                    agentOrderId: '',
                    cityId: localStorage.cityId,
                    mobile: $scope.phoneNum, //手机号
                    num: $scope.count, //购买数量
                    payPassword: $scope.payPassword || '', //支付密码
                    payType: payType, //支付方式，2在线支付; 6京豆支付;4混合支付（京卷+在线）;7混合支付（东卷+在线）;5全额京卷支付
                    planId: '', //场次信息
                    seatInfo: '', //座位信息
                    tempType: _tempType,
                    totalFee: formatFloat( $scope.couponPrice * $scope.count, 2 ), //总支付金额
                    jdouPrice: $scope.jdouAmount, //京豆优惠金额
                    discountMoney: $scope.couponAmount || 0, //优惠金额
                    tempId: sessionStorage.orderTempId,
                    couponIds: sessionStorage.couponIds || '', //优惠券ids
                    type: sessionStorage.orderType
                }
            }, {
                responseType: 'json'
            }).success(function(jsonData) {
                if (jsonData.code == 200) {
                    //清除上一次选座记录
                    sessionStorage.couponAmount = 0;
                    sessionStorage.couponIds = [];
                    sessionStorage.phoneNum = '';
                    sessionStorage.__couponType__ = '';

                    //用户如果进入支付界面 点击后退 则刷新页面 针对老浏览器
                    // setInterval(function(){
                    //     if( localStorage.submitSuc == 1 ) {
                    //         localStorage.submitSuc = '';
                    //         window.location.reload();
                    //     }
                    // }, 500);
                    localStorage.submitSuc = 1;
                    location.href = jsonData.data;
                } else if (jsonData.code == 304) {
                    showTip('未开通支付密码！');
                    resetBtn();
                } else if (jsonData.code == 305) {
                    showTip('支付密码错误，您已输错' + jsonData.data + '次。最多可以输错6次！');
                    resetBtn();
                } else if (jsonData.code == 5) {
                    showTip(jsonData.data);
                    resetBtn();
                } else {
                    showTip('下单失败！');
                    resetBtn();
                }
            }).error(function() {
                showTip('网络不给力哦，请重试！');
                resetBtn();
            });
        }
    };
    $scope.jumpToCoupon = function() { //跳转到优惠券列表页
        sessionStorage.couponURI = 'order';
        sessionStorage.totalFee = $scope.couponPrice * $scope.count;
        sessionStorage.phoneNum = $scope.phoneNum;
        location.href = '/coupon.html';
    };
    $scope.useJdou = function() { //使用京豆
        sessionStorage.jdouUsed = sessionStorage.jdouUsed ? '' : 'jdouUsed';
        $scope.jdouUsed = sessionStorage.jdouUsed;
        $scope.jdouAmount = $scope.jdouUsed ? $scope.jdouNum/100 : 0;
        $scope.passwordDisplay = ($scope.jdouAmount || $scope.couponAmount) ? '' : 'none';
    };
    $scope.showExplain = function() { //弹出支付密码说明窗口
        $scope.explainDisplay = 'block';
    };
    $scope.hideExplain = function() { //隐藏支付密码说明窗口
        $scope.explainDisplay = '';
    };
    $scope.$watch('count', function($newVal, $oldVal, $scope) { //监控电影票数量
        if ($newVal >= 1) {
            $scope.count = $newVal;
            sessionStorage.__count__ = $newVal;
            $scope.isDisabled = '';
        }
        if ($newVal <= 1) {
            $scope.count = 1;
            $scope.isDisabled = 'disabled';
        }
        if ($newVal < $oldVal) { //购买数量减少时重新选择优惠券
            if (sessionStorage.__couponType__ == 'dc' && $scope.couponPrice * $scope.count < sessionStorage.quota) { //订单金额小于东券满减额
                sessionStorage.couponIds = '';
                sessionStorage.__couponType__ = '';
                sessionStorage.couponAmount = 0;
                $scope.couponAmount = sessionStorage.couponAmount;
            }
        }
        $scope.availableDCouponCount = 0;
        if ($scope.quotaArray) { //重新计算可用优惠券数量
            for (var i = 0; i < $scope.quotaArray.length; i++) {
                if (($scope.couponPrice * $scope.count) >= $scope.quotaArray[i]) {
                    $scope.availableDCouponCount++;
                }
            }
        }
        $scope.couponCount = ($scope.availableDCouponCount + $scope.availableJCouponCount) || 0;
    });

    var formatFloat = function(f, digit) { 
        var m = Math.pow(10, digit); 
        return Math.round(f * m) / m;
    } 

    //获取京豆数量
    function getjdBean(){
        $http.get('/jbean?totalFee=' + formatFloat($scope.couponPrice * $scope.count, 2) + '&perferFee=' + $scope.couponAmount, {
            responseType: 'json'
        }).success(function(jsonData) {
            if (jsonData.code == 200) {
                $scope.jdouDisplay = 1;
                $scope.jdouNum = jsonData.data;
                $scope.jdouAmount = $scope.jdouUsed ? $scope.jdouNum/100 : 0;
            }
        });
    }
    
    (function() {
        // $http.get('/mock/couponInterface.json', {
        $http.get('/couponlist?totalFee=0', {
            responseType: 'json'
        }).success(function(jsonData) {
            if (jsonData.code == 200) {
                $scope.couponDisplay = 1;
                jsonData.data = jsonData.data ? jsonData.data : {
                    availableDCoupon: [],
                    availableJCoupon: []
                };
                $scope.availableDCouponCount = jsonData.data.availableDCoupon.length;
                $scope.availableJCouponCount = jsonData.data.availableJCoupon.length;
                $scope.quotaArray = [];
                for (var i = 0; i < jsonData.data.availableDCoupon.length; i++) {
                    $scope.quotaArray.push(jsonData.data.availableDCoupon[i].quota);
                    if (($scope.couponPrice * $scope.count) < jsonData.data.availableDCoupon[i].quota) {
                        $scope.availableDCouponCount--;
                    }
                }
                $scope.couponCount = ($scope.availableDCouponCount + $scope.availableJCouponCount) || 0;
            }
        });

        //获取京豆数量
        getjdBean();
    }());
}]);