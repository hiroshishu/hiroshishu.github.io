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
    $s.vm = {},$s.sp = {};
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
    // window.innerWidth = window.innerWidth > 640 ? 640 : window.innerWidth;
    // window.innerWidth = window.innerWidth || document.documentElement.clientWidth;
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
    // moviePlan.getData('/mock/cinemaMsgInterface.json').then(function(json){
    moviePlan.getData('/cinema/cinemaById/'+sessionStorage.cinemaId).then(function(json){
        $s.vm.cinemaName = json['data']['cinemaName'];
        $s.vm.address = json['data']['address'];
        $s.vm.conactTel = json['data']['conactTel'];
        // $s.vm.lng = json['data']['lng'];
        // $s.vm.lat = json['data']['lat'];
        $s.vm.intro = json['data']['introduction'];
        if($s.vm.intro){
            $s.vm.introEllip = ellipsis( $s.vm.intro, 72 );
            if($s.vm.intro.length <= 72){
                $s.vm.isLimited = 0;
                $s.vm.showArrow = false;
            }else{
                $s.vm.isLimited = 1;
                $s.vm.showArrow = true;
            }
        }
        sessionStorage.cinemaName = json['data']['cinemaName'];
        sessionStorage.cinemaAddr = json['data']['address'];
        sessionStorage.lng = json['data']['lng'];
        sessionStorage.lat = json['data']['lat'];
    });

    //如果支持选座
    if($s.cinemaFlag != '2'){
        $s.showLoading = true;
        //加载影片信息 
        // moviePlan.getData('/mock/cinemaMovieInterface.json').then(function(json){
        moviePlan.getData('/cinema/movie/'+sessionStorage.cinemaId).then(function(json){
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
        window.location.href = "/hot_movie_v2.html";
    }

    $s.toQQmap = function(){
        window.location.href = "/qqmap.html";
    }

    $s.toMorePic = function(){
        window.location.href = "/poster_list.html?from=2";
    }

    $s.toggleMsg = function(fg){
        if($s.vm.showArrow){
            $s.vm.isLimited = !$s.vm.isLimited;
        }
    }

    $s.tabToDetail = function(){
        $s.tabMenu = 2;
        if(!$s.sp.hasResult){
            // moviePlan.getData('/mock/test.json').then(function(json){
            moviePlan.getData('/cinema/message/'+sessionStorage.cinemaId).then(function(json){
                $s.sp.hasResult = true;

                $s.sp.glassesInfo = json['data'].glassesInfo;
                $s.sp.parkingFee = json['data'].parkingFee;
                $s.sp.bus = json['data'].bus;
                $s.sp.subway = json['data'].subway;
                $s.sp.popcornCoke = json['data'].popcornCoke;
                $s.sp.eatAround = json['data'].eatAround;
                $s.sp.shopBrand = json['data'].shopBrand;
                $s.sp.businessHours = json['data'].businessHours;
                $s.sp.childrenInfo = json['data'].childrenInfo;
                $s.sp.vipInfo = json['data'].vipInfo;
                $s.sp.restRoomInfo = json['data'].restRoomInfo;
                $s.sp.wifi = json['data'].wifi;

                if(!$s.sp.glassesInfo && !$s.sp.parkingFee && !$s.sp.bus && !$s.sp.subway && !$s.sp.popcornCoke && !$s.sp.eatAround && !$s.sp.shopBrand && !$s.sp.businessHours && !$s.sp.childrenInfo && !$s.sp.vipInfo && !$s.sp.restRoomInfo && !$s.sp.wifi){

                    $s.sp.hideSpecial = true;
                }

                $s.sp.cinemaImages = json['data'].cinemaImages;
                if($s.sp.cinemaImages){
                    json['data'].cinemaImages.split(',').length>3 ? $s.showMore = true : $s.showMore = false;
                    $s.sp.cinemaImages = json['data'].cinemaImages.split(',').slice(0,3);
                    sessionStorage.cinemaPic = json['data'].cinemaImages.split(',');
                }

                // $s.sp.glassesInfo = '3D眼镜免押金';
                // $s.sp.parkingFee = '凭1张影票免费停车3小时，可累计适用两张影票';
                // $s.sp.bus = '乘车线路有112路，115路，411路，419路，488路，595路，605路，615路，635路，639路，648路，731路，731路区间，95路，快速公交2线，快速公交2线区间）慈云寺站下车，步行383米到未来汇二层';
                // $s.sp.subway = '地铁信息';
                // $s.sp.popcornCoke = '爆米花可乐信息';
                // $s.sp.eatAround = '周围吃的';
                // $s.sp.shopBrand = '前台购物可刷卡付款';
                // $s.sp.businessHours = '9:00-22:00';
                // $s.sp.childrenInfo = '1.3米以下儿童在成人陪同下可免费观看2D电影，无座位，且每位成人限带1名儿童，如儿童观看3D片或巨幕片需按照原价票的半价票进场，有座位，有眼镜';
                // $s.sp.vipInfo = undefined;
                // $s.sp.restRoomInfo = '休息区信息';
                // $s.sp.wifi = 'wifi情况';
                // $s.sp.cinemaImages = ['images/float-bar-bg.png','images/float-bar-bg.png','images/float-bar-bg.png','images/float-bar-bg.png'];
                // $s.sp.cinemaImages.length>3 ? $s.showMore = true : $s.showMore = false;
                // sessionStorage.cinemaPic = ['images/float-bar-bg.png','images/float-bar-bg.png','images/float-bar-bg.png','images/float-bar-bg.png'];
            });
        }
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
        judgeBounds(tmpIndex);
    }
    $s.rightMove = function(){
        var tmpIndex = parseInt($s.vm.currentMenu.slice(1));
        tmpIndex++;
        tmpIndex = tmpIndex > getPlanByMovieId().length-1 ? getPlanByMovieId().length-1 : tmpIndex;
        $s.vm.currentMenu = 'm' + tmpIndex;
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
        // $h.get('/mock/cinemaInterface.json').success(function(jsonData){
        $h.get('/plan?cinemaId='+sessionStorage.cinemaId+'&movieId='+mID+'&issueType=0',{responseType:'json'}).success(function(jsonData){
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

    function ellipsis( input, limit ) {
        return limit ? input.substring( 0, limit ) + '...' : input;
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
