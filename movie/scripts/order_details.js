angular.module('orderDetails', [
    'ngTouch'
]).controller('OrderDetailsCtrl',['$scope','$timeout','$http', function($scope, $timeout, $http) {
    //判断是否是微信端
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        $scope.isWeixin = 1;
     } else {
        $scope.isWeixin = 0;
    }
    // console.log(sessionStorage.jdErpId);
    $http.get('order/detail/' + sessionStorage.jdErpId).success(function(data) {
        //$http.get('/mock/orderDetailsInterface.json').success(function(data) {
        if (data.code == 200) {
            $scope.orderDetails = data.data;
        } else if (data.code == 'notLogin') {
            location.href = data.data.loginURL + '&returnurl=' + encodeURIComponent(location.href.split('#')[0], 'utf-8');
        } else {
            
        }
        // $scope.orderDetails.payTimeMinute = parseInt($scope.orderDetails.payTimeMinute);
        // $scope.orderDetails.payTimeSecond = parseInt($scope.orderDetails.payTimeSecond);
        // if ($scope.orderDetails.myOrderStatus == 1) { //状态为待付款的才启动倒计时
        //   var countDown = function() {
        //     if ($scope.orderDetails.payTimeMinute === 0 && $scope.orderDetails.payTimeSecond === 0) {
        //       $scope.orderDetails.myOrderStatus = '3';
        //       $scope.orderDetails.myOrderStatusTxt = '已取消';
        //     }
        //     if ($scope.orderDetails.payTimeSecond === 0) {
        //       $scope.orderDetails.payTimeSecond = 59;
        //       $scope.orderDetails.payTimeMinute = $scope.orderDetails.payTimeMinute - 1;
        //     } else {
        //       $scope.orderDetails.payTimeSecond = $scope.orderDetails.payTimeSecond - 1;
        //     }
        //   };
        //   setInterval(function() {
        //     $scope.$apply(countDown);
        //   }, 1000);
        //   countDown();
        // }
    });
}]);