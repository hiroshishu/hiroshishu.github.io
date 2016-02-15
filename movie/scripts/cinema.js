'use strict';

/**
 * @ngdoc function
 * @name cinema.controller:AboutCtrl
 * @description
 * # DetailCtrl
 * Controller of the cinema
 */
angular.module('cinema', [
  'ngTouch'
]).factory('moviePlan',['$q','$http',function($q,$http){
    var mp = new Object();
    mp.getData = function(url){
        var deferred = $q.defer();
        $http.get(url,{responseType:'json'}).success(function(json){
            deferred.resolve(json);
        }).error(function(){
            deferred.reject();
        });
        return deferred.promise;
    }
    return mp;
}]).controller('CinemaCtrl',['$scope','$http','$timeout','moviePlan',function($s,$h,$t,moviePlan) {
    //判断是否是微信端
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        $s.isWeixin = 1;
     } else {
        $s.isWeixin = 0;
    }

    $s.vm = {};
    $s.isDomComplete = false;
    $s.isNavComplete = false;
    $s.iScrollComplete = false;
    $s.cinemaFlag = sessionStorage.cinemaFlag; //判断是否有放映计划或者电子票 ==1：无电子票 ==2：无影片
    $s.planArr = [];
    $s.showNoPlan = false;
    var oUl = document.getElementById('c_ul');
    var movieWidth = 116;
    var uniqueObj = {};
    var liIndex = 0;
    window.innerWidth = window.innerWidth > 640 ? 640 : window.innerWidth;
    var len = Math.ceil((window.innerWidth ) / 3);

    //清除上一次选座记录
    sessionStorage.pickedSeats = '';
    sessionStorage.phoneNum = '';
    sessionStorage.couponAmount = 0;
    sessionStorage.__couponType__ = '';
    sessionStorage.__count__ = '';
    sessionStorage.couponIds = [];
    sessionStorage.jdouUsed = '';

    if(sessionStorage.cinemaId == undefined){
        window.location.href="/home.html";
        return;
    }

    //加载影院信息
    moviePlan.getData('/mock/cinemaMsgInterface.json').then(function(json){
    // moviePlan.getData('/cinema/cinemaById/'+sessionStorage.cinemaId).then(function(json){
        $s.vm.cinemaName = json['data']['cinemaName'];
        $s.vm.address = json['data']['address'];
        sessionStorage.cinemaName = json['data']['cinemaName'];
        sessionStorage.cinemaAddr = json['data']['address'];
    });

    //如果支持选座
    if($s.cinemaFlag != '2'){
        $s.showLoading = true;
        //加载影片信息 
        moviePlan.getData('/mock/cinemaMovieInterface.json').then(function(json){
        // moviePlan.getData('/cinema/movie/'+sessionStorage.cinemaId).then(function(json){
            $s.list = json['data'];
            if($s.list.length == 0){
                $s.showNoPlan = true;
                $s.showLoading = false;
                return;
            }
            $s.showNoPlan = false;
            var navTotalWidth = (movieWidth+2) * $s.list.length;
            oUl.style.width = navTotalWidth + 'px';
            $s.isDomComplete = true;
            $s.showLoading = false;
            sessionStorage.movieId = sessionStorage.movieId || $s.list[0].movieId;
            // sessionStorage.movieName = sessionStorage.movieName || $s.list[0].movieName;
            $s.curMovie =  getIndexByMovieId($s.list,sessionStorage.movieId);
            sessionStorage.movieName = $s.list[parseInt($s.curMovie)].movieName;
            $s.currentMovieId = sessionStorage.movieId;
            $s.$watch('iScrollComplete',function(newValue,oldValue,scope){
                if(newValue){
                    var choosedShift = parseInt( (window.innerWidth-movieWidth) / 2 - movieWidth*parseInt($s.curMovie) );
                    $s.iscroll.scrollTo(formatDistance(choosedShift,navTotalWidth),0,200);
                }
            });

            angular.forEach($s.list,function(v,k){
                this['__'+v.movieId+'__'] = true;
            },uniqueObj);

            $s.chooseMovie = function(movieIdx,movieId,movieName,$event){
                $event.stopPropagation();
                $event.preventDefault();
                $s.isClickMovie = true;
                $s.curMovie = movieIdx;
                $s.currentMovieId = movieId;
                sessionStorage.movieId = movieId;
                sessionStorage.movieName = movieName;
                $s.transShift = (window.innerWidth-movieWidth) / 2 - movieWidth*movieIdx;
                //图片位置变化
                $s.iscroll.scrollTo(formatDistance($s.transShift,navTotalWidth),0,100);
                //日期位置变化
                $s.navIscroll.scrollTo(0,0,100);
                //如果支持选座
                if($s.cinemaFlag != '2'){
                    if(uniqueObj['__'+movieId+'__']){
                        ajaxForPlan(movieId);
                    }else{
                        $s.vm.currentMenu = 'm0';
                        judgeBounds(0);
                        $t(function(){
                            $s.navIscroll.refresh();
                        },100);
                    }
                }
            };
            ajaxForPlan(sessionStorage.movieId);
        },function(){
            showTip('网络不给力哦，请重试！');
        });
    }
    
    //如果支持电子票
    if($s.cinemaFlag != '1'){
        //加载优惠券信息
        // moviePlan.getData('/mock/cinemaCouponInterface.json').then(function(json){
        moviePlan.getData('/cinema/coupon/'+sessionStorage.cinemaId).then(function(json){
            $s.vm.coupons = json['data'];
            $s.onCouponClick = function(coupon){
                coupon = JSON.parse(coupon);
                sessionStorage.orderType = 0; //0 电子票
                sessionStorage.orderCinemaId = sessionStorage.cinemaId; //影院id
                sessionStorage.orderAgentId = coupon.agentId; //供应商ID
                sessionStorage.couponType = coupon.tmpType; //电子票类型 2D 3D
                sessionStorage.couponPrice = coupon.jdPrice; //京东价格
                sessionStorage.orderTempId = coupon.tempId; //电子票类型id
                sessionStorage.couponDate = coupon.invalidateDate; //0 有效日期
                window.location.href="/order.html";
            }
        },function(){
            showTip('网络不给力哦，请重试！');
        });
    }

    $s.gotoMovieDetail = function(){
        window.location.href="/hot_movie.html";
    }

    $s.chooseDate = function(idx,$event){
        // $event.stopPropagation();
        $s.vm.currentMenu = idx;
        judgeBounds(parseInt(idx.slice(1)));
    }

    $s.leftMove = function(){
        var tmpIndex = parseInt($s.vm.currentMenu.slice(1));
        tmpIndex--;
        tmpIndex = tmpIndex < 0 ? 0 : tmpIndex;
        $s.vm.currentMenu = 'm'+tmpIndex;
        console.log(tmpIndex)
        judgeBounds(tmpIndex);
    }
    $s.rightMove = function(){
        var tmpIndex = parseInt($s.vm.currentMenu.slice(1));
        tmpIndex++;
        tmpIndex = tmpIndex > getPlanByMovieId().length-1 ? getPlanByMovieId().length-1 : tmpIndex;
        $s.vm.currentMenu = 'm' + tmpIndex;
        console.log(tmpIndex)
        judgeBounds(tmpIndex);
    }

    $s.buyTicket = function(pId,pLanAndType){
        sessionStorage.planId = pId;
        sessionStorage.pLanAndType = pLanAndType;
        window.location.href="/seat_pick.html";
    }

    $s.iScrollClick = function(){
        if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) return false;
        if (/Chrome/i.test(navigator.userAgent)) return (/Android/i.test(navigator.userAgent));
        if (/Silk/i.test(navigator.userAgent)) return false;
        if (/Android/i.test(navigator.userAgent)) {
           var s=navigator.userAgent.substr(navigator.userAgent.indexOf('Android')+8,3);
           return parseFloat(s[0]+s[3]) < 44 ? false : true
        }
    }

    //请求影片放映计划
    function ajaxForPlan(mID){
        $s.vm.currentMenu = 'm0';
        $s.showLoadingBottom = true;
        $h.get('/mock/cinemaInterface.json').success(function(jsonData){
        // $h.get('/plan?cinemaId='+sessionStorage.cinemaId+'&movieId='+mID+'&issueType=0',{responseType:'json'}).success(function(jsonData){
            uniqueObj['__'+mID+'__'] = false;
            $s.planArr.push({
                'userMovieId':mID,
                'plan':jsonData['data']
            });
            // $s.arrowCanMoveLeft = jsonData['data'].length > 3 && curMovie ? true : false;
            $s.showLoadingBottom = false;
            $t(function(){
                document.getElementById('ul_'+mID).style.width = calculateWidth(jsonData['data'].length)+'px';
                // $s.isNavComplete = true;
                // $s.navIscroll.refresh();
                $s.navIscroll = new IScroll('.navWrap', {
                    scrollX: true,
                    scrollY: false,
                    bounceTime: 400,
                    eventPassthrough : true,
                    preventDefault: false,
                    click:$s.iScrollClick() //调用判断函数
                });
                judgeBounds(parseInt($s.vm.currentMenu.slice(1)));
            });
        });
    }

    //错误提示
    function showTip(msg){
        $s.fade = 'fade';
        $s.msg = msg;
        $t(function() {
            $s.fade = '';
            $s.msg = '';
        }, 2000);
    }

    //左右影片偏移控制
    function formatDistance(dis,navTotalWidth){
        dis = dis>0?0:dis;
        dis = dis < (window.innerWidth-navTotalWidth) ? (window.innerWidth-navTotalWidth):dis;
        return dis;
    }

    //通过影片id获取index
    function getIndexByMovieId(obj,id){
        var rs = 0;
        angular.forEach(obj,function(v,k){
            if(v.movieId == id){
                rs = k;
            }
        });
        return rs;
    }

    function getPlanByMovieId(){
        var rs = null;
        angular.forEach($s.planArr,function(v,k){
            if(v.userMovieId == $s.currentMovieId){
                rs = v.plan;
            }
        });
        return rs;
    }

    function judgeBounds(tmpIndex){
        var myLength = getPlanByMovieId().length;
        $s.arrowCanMoveLeft = myLength > 1 && tmpIndex>0 ? true : false;
        $s.arrowCanMoveright = myLength > 1 && tmpIndex<myLength-1 ? true : false;
        if(myLength <= 3){
            return;
        }
        var moveDis = (calculateWidth(myLength)-window.innerWidth + 0.22*window.innerWidth) / (myLength-3)
        if(tmpIndex > 0){
            if(tmpIndex != myLength-1){
                $s.navIscroll.scrollTo(-moveDis*(tmpIndex-1),0,200);
            }else{
                $s.navIscroll.scrollTo(-moveDis*(tmpIndex-2),0,200);
            }
        }
    }

    //计算时间日期宽度
    function calculateWidth(len){
        var winWidth = window.innerWidth,
            tmpDis = 0.11*window.innerWidth*2;
            
        if(len == 0){
            return 0;
        }else if(len == 1){
            return (winWidth - 70) / 2;
        }else if(len == 2){
            return (winWidth - 70 -64 -((winWidth - 70-64*3))/2 );
        }else{
            return ((winWidth - tmpDis) * len / 3 );
        } //0.11  35/320
    }

}]).directive('myScroll',function(){
    return{
        
        link:function(scope, ele, attr){
            scope.$watch('isDomComplete',function(newValue,oldValue,sp){
                if(newValue){
                    scope.iscroll = new IScroll(ele[0], {
                        scrollX: true,
                        scrollY: false,
                        bounceTime: 400,
                        eventPassthrough : true,
                        preventDefault: false,
                        click:scope.iScrollClick() //调用判断函数
                    });
                    scope.iScrollComplete = true;
                }
            });
        }
    }
})
