angular.module('seatPickSubmit', ['ngTouch'])
 
.controller('SeatPickSubmitCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {

	//sessionStorage状态检测
    if( !window.sessionStorage || !sessionStorage.pickedSeats ){
        location.href = '/home.html';
    }

    function parseStr( str, substr, delim ){
        var start = str.indexOf( substr + '=' );
        if( start === -1 ) return '';
    
        var end = str.indexOf( delim, start );
        if( end === -1 ){
            end = str.length;
        }
    
        var value = str.substring( start + substr.length + 1, end ),
            reg = /select |update |delete |truncate |join |union |exec |insert |drop |count |script|>|</i;   //去除SQL注入和XXS攻击
    
        return decodeURIComponent( reg.test( value ) ? '' : value );
    }
    
    
    //获取url中的query参数
    function getQuery( key ){
        return parseStr( window.location.search, key, '&');
    };



 	//判断是否是微信端
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        $scope.isWeixin = 1;
     } else {
        $scope.isWeixin = 0;
    }

    $scope.data = {
    	showTime: sessionStorage.showTime,
    	hallName: sessionStorage.hallName,
		movieName: sessionStorage.movieName,
		pLanAndType: sessionStorage.pLanAndType,
		cinemaAddr: sessionStorage.cinemaAddr
	};

	$scope.btnTxt = '在线支付';
    $scope.couponAmount = parseFloat(sessionStorage.couponAmount) || 0; //优惠券减免金额
    $scope.jdouUsed = sessionStorage.jdouUsed;
    $scope.jdouNum = 0;
    $scope.jdouAmount = $scope.jdouUsed ? $scope.jdouNum/100 : 0;

    $scope.phoneNum = sessionStorage.phoneNum || '';
    $scope.pickedSeats = sessionStorage.pickedSeats.split(',');
    $scope.price = sessionStorage.price;
    $scope.count = $scope.pickedSeats.length;
    var actPrice = +getQuery('actPrice'), buyLimit = +getQuery('buyLimit');

    //添加有活动特价票的总价计算（新增）
    $scope.totalMoney = getQuery('couponId') ? 
        buyLimit < $scope.count ? actPrice * buyLimit + $scope.price * ($scope.count - buyLimit) : actPrice * $scope.count
        : $scope.price * $scope.count;


    //保留两位小数
    var formatFloat = function(f, digit) { 
        var m = Math.pow(10, digit); 
        return Math.round(f * m) / m; 
    } 

    //获取优惠券数量
    //$http.get('/mock/couponInterface.json?totalFee='+$scope.totalMoney, {
    $http.get('/couponlist?totalFee=' + formatFloat($scope.totalMoney, 2), {
        responseType: 'json'
    }).success(function(jsonData) {
        if (jsonData.code == 200) {
            $scope.couponDisplay = 1;
            jsonData.data = jsonData.data ? jsonData.data : {availableDCoupon:[],availableJCoupon:[]};
            $scope.availableDCouponCount = jsonData.data.availableDCoupon.length;
            $scope.availableJCouponCount = jsonData.data.availableJCoupon.length;
            $scope.quotaArray = [];
            for(var i = 0; i < jsonData.data.availableDCoupon.length; i++){
                $scope.quotaArray.push(jsonData.data.availableDCoupon[i].quota);
                if( $scope.totalMoney < jsonData.data.availableDCoupon[i].quota ){
                    $scope.availableDCouponCount--;
                }
            }
            $scope.couponCount = ($scope.availableDCouponCount + $scope.availableJCouponCount) || 0;
        } 
    });

    //获取京豆数量
    $http.get('/jbean?totalFee=' + formatFloat($scope.totalMoney, 2) + '&perferFee=' + $scope.couponAmount, {
        responseType: 'json'
    }).success(function(jsonData) {
        if (jsonData.code == 200) {
            $scope.jdouDisplay = 1;
            //$scope.jdouNum = 200;
            $scope.jdouNum = jsonData.data;
            $scope.jdouAmount = $scope.jdouUsed ? $scope.jdouNum/100 : 0;
        }
    });


    var isPhone = function(num){  //手机号校验 parameter num or string
        if(!num){
            return false;
        }
        if(typeof(num) == 'number'){
            num = num + '';
        }
        if(num.length == 11){
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
        }, 2000);
    };

    $scope.jumpToCoupon = function() { //跳转到优惠券列表页
        sessionStorage.couponURI = 'seat_pick_submit';
        sessionStorage.totalFee = $scope.totalMoney;
        sessionStorage.phoneNum = $scope.phoneNum;
        location.href = '/coupon.html';
    };
    $scope.useJdou = function() { //使用京豆
        sessionStorage.jdouUsed = sessionStorage.jdouUsed ? '' : 'jdouUsed';
        $scope.jdouUsed = sessionStorage.jdouUsed;
        $scope.jdouAmount = $scope.jdouUsed ? $scope.jdouNum/100 : 0;
        $scope.passwordDisplay = ($scope.jdouAmount || $scope.couponAmount) ? '' : 'none';
    };
    $scope.removePhoneNum = function(){ //删除输入框中的手机号
        $scope.phoneNum = '';
    };
    $scope.removePwd = function() { //清空支付密码输入框中
        $scope.payPassword = '';
    };
    $scope.showExplain = function() { //弹出支付密码说明窗口
        $scope.explainDisplay = 'block';
    };
    $scope.hideExplain = function() { //隐藏支付密码说明窗口
        $scope.explainDisplay = '';
    };
    $scope.showBuytips = function() { //弹出支付密码说明窗口
        $scope.buytipsDisplay = 'block';
    };
    $scope.hideBuytips = function() { //隐藏支付密码说明窗口
        $scope.buytipsDisplay = '';
    };
    $scope.seatReset = function() {
    	sessionStorage.pickedSeats = '';
    	sessionStorage.couponIds = '';
        sessionStorage.__couponType__ = '';
        sessionStorage.couponAmount = 0;
    	location.href = '/seat_pick.html';
    }
   
    function changeBtn(){
        $scope.btnTxt = '处理中...';
        $scope.payLoading = true;
    }

    function resetBtn(fn){
        $scope.btnTxt = '在线支付';
        $scope.payLoading = false;
        fn && fn();
    }

    function clearStorage(){
    	sessionStorage.showTime = '';
        sessionStorage.hallName = '';
        sessionStorage.saleEndTime = '';
        sessionStorage.pickedSeats = '';
        sessionStorage.couponAmount = 0;
        sessionStorage.couponIds = [];
        sessionStorage.jdouUsed = '';
        sessionStorage.phoneNum = '';
        sessionStorage.__couponType__ = '';
    }

    function submitReq(aId, aOId){
        var payType;
        
        if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.couponAmount < $scope.totalMoney){
            payType = 4;//混合支付（京卷+在线）
        }else if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.couponAmount >= $scope.totalMoney ){
            payType = 5;//全额京卷支付
        }else if( $scope.jdouAmount >= $scope.totalMoney ){
            payType = 6;//京豆支付
        }else if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'dc'){
            payType = 7;//混合支付（东卷+在线）
        }else if( $scope.jdouAmount > 0 && !sessionStorage.__couponType__ ){
            payType = 8;//京豆+在线
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'dc' ){
            payType = 9;//京豆+东券+在线支付
        }else if( sessionStorage.__couponType__ === 'dc' && $scope.jdouAmount + $scope.couponAmount >= $scope.totalMoney){
            payType = 10;//京豆+东券; 
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.jdouAmount + $scope.couponAmount < $scope.totalMoney){
            payType = 11;//京豆+京券+在线
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.jdouAmount + $scope.couponAmount >= $scope.totalMoney){
            payType = 12;//京豆+京券
        }else {
            payType = 2;//在线支付
        }
        
        $http.get('/order/submit', {
            params: {
                cinemaId: sessionStorage.cinemaId,
                agentId: aId,
                agentOrderId: aOId,
                cityId: localStorage.cityId,
                mobile: $scope.phoneNum, //手机号
                num: $scope.count, //购买数量
                payPassword: $scope.payPassword || '', //支付密码
                payType: payType, //支付方式，2在线支付; 6京豆支付;4混合支付（京卷+在线）;7混合支付（东卷+在线）;5全额京卷支付;8京豆+在线;9京豆+东券+在线支付;10京豆+东券; 11京豆+京券+在线;12京豆+京券
                planId: sessionStorage.planId, //场次信息
                seatInfo: $scope.pickedSeats.join('|'), //座位信息
                totalFee: formatFloat( $scope.totalMoney, 2 ), //总支付金额
                jdouPrice: $scope.jdouAmount, //京豆优惠金额
                discountMoney: $scope.couponAmount || 0, //优惠金额
                couponIds: sessionStorage.couponIds || '', //优惠券ids
                type: '1'
            }
        }, {
            responseType: 'json'
        }).success(function( jsonData ) {
            if(jsonData.code == 200){
                clearStorage();
                resetBtn(function(){
                    location.href = jsonData.data;
                });
            } else if(jsonData.code == 304){
                resetBtn();
                showTip('未开通支付密码！');
            } else if(jsonData.code == 305){
                resetBtn();
                showTip('支付密码错误，您已输错'+jsonData.data+'次。最多可以输错6次！');
            } else{
                resetBtn();
                showTip('下单失败！');
            }
        }).error(function(){
            resetBtn();
            showTip('网络不给力哦，请重试！');
        });
    }


    function seatLock(){
        $http.get('/seat/lock', {
            params: {
                planId: sessionStorage.planId,
                seat: $scope.pickedSeats.join('|'), 
                mobile: $scope.phoneNum,
                userId: getQuery('userId'),
                couponId: getQuery('couponId') || '',
                actId: getQuery('actId') || '',
                totalMoney: parseInt( $scope.totalMoney * 100 )
            }
        }, {
            responseType: 'json'
        }).success(function( res ){
            if( res.code == 200 ){ 
                submitReq( res.data.agentId, res.data.agentOrderId ); 
            }
            else if( res.code == 500 ) {
                showTip( '锁座失败，请重试！' );
                resetBtn();
            }
            else if( res.code == 501 )  { 
                showTip( '座位已被锁定，请重新选择！' );
                resetBtn();
            }
        })
        .error(function(){
            showTip('网络不给力哦，请重试！');
            resetBtn();
        });
    }

    $scope.toPay = function($event){ //下单
        var end = new Date( sessionStorage.saleEndTime.replace('-', '/') ),
            endTime = end.getTime(),
            now = new Date(), 
            nowTime = now.getTime();

        if( endTime < nowTime ){
            showTip('已超过售票时间，请重新选座。');
            return;
        }

        if( ($scope.couponAmount || $scope.jdouAmount) && !$scope.payPassword ){
            showTip('请填写支付密码！');
            return;
        }

        var _isPhone = isPhone($scope.phoneNum);
        if(!_isPhone){
            showTip('您的手机号填写有误哦，请重新填写！');
            return;
        }

        $($event.target).parent().next().click(); //埋点hack
        changeBtn(); seatLock();
    };

    $scope.confirmPay = function() {
        changeBtn();
        var payType;

        if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.couponAmount < $scope.totalMoney){
            payType = 4;//混合支付（京卷+在线）
        }else if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.couponAmount >= $scope.totalMoney ){
            payType = 5;//全额京卷支付
        }else if( $scope.jdouAmount >= $scope.totalMoney ){
            payType = 6;//京豆支付
        }else if( !$scope.jdouAmount && sessionStorage.__couponType__ === 'dc'){
            payType = 7;//混合支付（东卷+在线）
        }else if( $scope.jdouAmount > 0 && !sessionStorage.__couponType__ ){
            payType = 8;//京豆+在线
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'dc' ){
            payType = 9;//京豆+东券+在线支付
        }else if( sessionStorage.__couponType__ === 'dc' && $scope.jdouAmount + $scope.couponAmount >= $scope.totalMoney){
            payType = 10;//京豆+东券; 
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.jdouAmount + $scope.couponAmount < $scope.totalMoney){
            payType = 11;//京豆+京券+在线
        }else if( $scope.jdouAmount > 0 && sessionStorage.__couponType__ === 'jc' && $scope.couponAmount && $scope.jdouAmount + $scope.couponAmount >= $scope.totalMoney){
            payType = 12;//京豆+京券
        }else {
            payType = 2;//在线支付
        }

        $http.get('/paypassword/validate', {
            params: {
                payPassword: $scope.payPassword || '', //支付密码
                payType: payType
            }
        }, {
            responseType: 'json'
        }).success(function( res ){
            if( res.code == 200 ){ 
                seatLock(); 
            }
            else if(res.code == 304){
                showTip('未开通支付密码！');
                resetBtn();
            } else if(res.code == 305){
                showTip('支付密码错误，您已输错'+res.data+'次。最多可以输错6次！');
                resetBtn();
            } else{
                showTip('操作失败，请重试！');
                resetBtn();
            }
        })
        .error(function(){
            showTip('网络不给力哦，请重试！');
            resetBtn();
        });
    };

 }])

.filter('seatFormat', function(){
    return function( str ){
        return str.replace(':', '排') + '座';
    };
});