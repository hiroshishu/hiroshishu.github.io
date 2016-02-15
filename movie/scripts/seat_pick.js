angular.module('seatPick', ['once'])

.controller('SeatPickCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    
    //sessionStorage状态检测
    if( !window.sessionStorage || !sessionStorage.planId ){
        //location.href = '/home.html';
    }

    //判断是否是微信端
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        $scope.isWeixin = 1;
     } else {
        $scope.isWeixin = 0;
    }


    function showTip(msg) { //错误提示
        $scope.fade = 'fade';
        $scope.msg = msg;
        $timeout(function() {
            $scope.fade = '';
            $scope.msg = '';
        }, 2000);
    }

    function firstClickZoom( el ) {
        var iscroll = $scope.iscroll;
        $timeout(function(){
            if( iscroll.scale < 1 && $scope.firstZoom ) {
                iscroll.scale = 1; 
                iscroll.refresh();
                var left = Math.round( -el.offsetLeft + iscroll.wrapperWidth / 2 ),
                    top = Math.round( -el.offsetTop + iscroll.wrapperHeight / 2 );
                left = Math.min(Math.max(iscroll.maxScrollX, left), 0);
                top = Math.min(Math.max(iscroll.maxScrollY, top), 0);

                iscroll.scrollTo(left, top, 500);
                $scope.firstZoom = false;
            }
        });
    }

    $http.get('/mock/seatPick.json')
    // $http.get('/seat/info?planId=' + sessionStorage.planId)
    .success( function( res ) {
        $('.loading-wrap').hide();
        if( res.code != 200 ){ showTip('抱歉！放映场次不存在，请重试！'); return; }

        var dateStr = function( diff ){
            var t = new Date(), ts = t.getTime(),
                ndate = ts + ( diff || 0 ) * 24 * 60 * 60 * 1000,
                nt = new Date( ndate ),
                y = nt.getFullYear(),
                m = nt.getMonth() + 1,
                d = nt.getDate(); 
            return y + '-' + ( m < 10 ? '0' + m : m ) + '-' + ( d < 10 ? '0' + d : d );
        },

        dateTrans = function( str ){
            if( !str ) return '';
            var today = dateStr(), tomorrow = dateStr(1), dayAfterTo = dateStr(2),
                dateArr = str.split(' '), date = new Date( dateArr[0] ),
                day = date.getDay(), dayStr;

            switch( day ){
                case 1:
                    dayStr = "(周一)";
                    break;
                case 2:
                    dayStr = "(周二)";
                    break;
                case 3:
                    dayStr = "(周三)";
                    break;
                case 4:
                    dayStr = "(周四)";
                    break;
                case 5:
                    dayStr = "(周五)";
                    break;
                case 6:
                    dayStr = "(周六)";
                    break;
                default:
                    dayStr = "(周日)";
                    break;
            }

            var showTime = dateArr[0] + ' ' + dayStr + ' ' + dateArr[1];

            if( !showTime.indexOf( today ) ){
                showTime = showTime.replace(today, '今天');
            } else if( !showTime.indexOf( tomorrow ) ){
                showTime = showTime.replace(tomorrow, '明天');
            } else if( !showTime.indexOf( dayAfterTo ) ){
                showTime = showTime.replace(dayAfterTo, '后天');
            }

            return showTime;
        };

        $scope.data = res.data;
        $scope.data.movieName = sessionStorage.movieName;
        $scope.data.showTime = dateTrans( res.data.showTime );
        sessionStorage.showTime = $scope.data.showTime;
        sessionStorage.hallName = $scope.data.hallName;
        sessionStorage.saleEndTime = $scope.data.saleEndTime;
 
        $scope.price = $scope.data.jdPrice; //电影票单价
        sessionStorage.price = $scope.price;
        $scope.seats = []; $scope.rows = [];
       
        document.title = sessionStorage.cinemaName;
        //微信浏览器hack
        if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
            var $iframe = $('<iframe src="/fav.ico"></iframe>').on('load', function() {
                setTimeout(function() {
                    $iframe.off('load').remove();
                }, 0);
            }).appendTo($('body'));
        }

        //将座位信息重新组织成可生成座位图的数组
        angular.forEach($scope.data.seats, function(val){
            var arr = val.split(';'), 
                cord = arr[0].split(':'),
                seat = arr[1].split(':'),
                label = arr[2], len = this.length, 
                row = cord[0] - 1, col = cord[1] - 1,
                cl = label == 0 ? 'available' : 
                     label == 1 ? 'sold' : 
                     label == 3 || label == 4 ? 'couple' : '';


            //判断是否有空排，若有则插入空数组
            if( cord[0] > len + 1 ) {
                var diff = cord[0] - len - 1;
                for( var i = 0; i < diff; i += 1 ){ this.push([]); }
            }

            if( !this[row] ) this[row] = [];
            this[row][col] = label == 2 ? {label: false} : {row: seat[0], no: seat[1], label: true, cl: cl};
        }, $scope.seats);

        //行数
        angular.forEach($scope.seats, function( row ){
            if( row.length ){
                var l = '';
                for( var i = 0 ; i < row.length; i += 1 ){
                    if( row[i] && row[i].row ){
                        l = row[i].row; break;
                    }
                }
                this.push( l );
            } else {
                this.push(''); 
                return;
            }
        }, $scope.rows); 
        
        function getIndex( c, p ,t ){
            var el = p.getElementsByTagName(t), 
                len = el.length, index = -1;
            for(var i=0; i<len; i+=1){
                if(c === el[i]){ index = i; break; }
            }
            return index;
        }
 

        //选取的座位
        var _seats = sessionStorage.pickedSeats ? sessionStorage.pickedSeats.split(',') : [],
            seats = $scope.pickedSeats = _seats;
        $scope.count = _seats.length;
    
        $timeout(function(){
            angular.forEach(_seats, function( val, index ){
                var st = val.split(':'),
                    elem = angular.element( document.querySelector( '[title='+ st[0] + ':' + st[1] + ']' ) );
   
                if( elem.hasClass('sold') ){ //如果座位已占，不绘制选座图标
                    _seats.splice( index, 1 );
                    sessionStorage.pickedSeats = $scope.pickedSeats;
                } else {
                    elem.addClass('occupied');
                }
            });
        });

        $scope.firstZoom = true;

        // $scope.pickSeat = function( $event ){
        //     'use strict';
        //     var tar = $event.target,
        //         target = angular.element( tar );
        //     if( target.hasClass('sold') ) return;


        //     //首次点击，选座图放大至原大小
        //     firstClickZoom( tar );

        //     var st = target.attr('title'), stArr = st.split(':'),
        //         row = stArr[0], no = stArr[1], seatStr = st,
        //         index = seats.indexOf( seatStr ),
        //         parent = target.parent(), st = parent.find('i'),
        //         _no = getIndex(target[0], parent[0], 'i'),
        //         prev  = _no > 0 ? st.eq( _no - 1 ) : st.eq(10000), 
        //         _prev = _no > 1 ? st.eq( _no - 2 ) : st.eq(10000),
        //         __prev = _no > 2 ? st.eq( _no - 3 ) : st.eq(10000),
        //         next  = st.eq( _no + 1 ), 
        //         _next = st.eq( _no + 2 ),
        //         __next = st.eq( _no + 3 );


        //     //操作情侣座
        //     function coupleSeat( t ){
        //         if( !target.hasClass('couple') ) return;
        //         var cs, next = target.next(), _no = parseInt( no ),
        //             prev = angular.element( target[0].previousElementSibling ),
        //             nextNo = parseInt( next.attr('title').split(':')[1] ),
        //             prevNo = parseInt( prev.attr('title').split(':')[1] ),
        //             coupleNo = _no % 2 ? _no + 1 : _no - 1;

        //         //按照单双号来判断相邻情侣座
        //         if( next && next.hasClass('couple') && nextNo === coupleNo ) cs = next;
        //         else if( prev && prev.hasClass('couple') && prevNo === coupleNo ) cs = prev;

        //         //按照左右来判断相邻情侣座
        //         if( !cs ){
        //             if( next && next.hasClass('couple') ) cs = next;
        //             else if( prev && prev.hasClass('couple') ) cs = prev;
        //         }

        //         if( !cs ) return;
                
        //         var _seatStr = cs.attr('title'),
        //             _index = seats.indexOf( _seatStr );

        //         if( t ){ //选座
        //             cs.addClass('occupied'); seats.push( _seatStr );
        //         } else { //取消座
        //             cs.removeClass('occupied'); seats.splice( _index, 1 );
        //         }
        //     }

        //     //通过判断点击的座位在数组是否存在
        //     if( index < 0 ){ //选取座位
        //         if( seats.length >= 4 || ( seats.length >= 3 && target.hasClass('couple') ) ){
        //             showTip('最多只能选4个座哦！');
        //         } else {
        //             var isCouple = target.hasClass('couple');

        //             //是否隔座
        //             if( ( prev.hasClass('available') && !prev.hasClass('occupied') && _prev.hasClass('occupied') ) ||
        //                 ( next.hasClass('available') && !next.hasClass('occupied') && _next.hasClass('occupied') ) ||
        //                 ( isCouple && _prev.hasClass('available') && !_prev.hasClass('occupied') && __prev.hasClass('occupied') ) ||
        //                 ( isCouple && _next.hasClass('available') && !_next.hasClass('occupied') && __next.hasClass('occupied') )
        //                  ){
        //                 showTip('选座不允许间隔一个座位哦！'); 
        //             } else {
        //                 target.addClass('occupied');
        //                 seats.push( seatStr ); 
        //                 coupleSeat(1);
        //             }
        //         }
        //     } else { //取消座位
        //         //是否隔座
        //         if( prev.hasClass('occupied') && next.hasClass('occupied') && !target.hasClass('couple') ){
        //             showTip('选座不允许间隔一个座位哦！'); 
        //         } else {
        //             target.removeClass('occupied');
        //             seats.splice( index, 1 );
        //             coupleSeat(0);
        //         }
        //     }

        //     $scope.count = seats.length;
        // };
    })
    .error(function(){
        showTip('网络不给力哦，请重试！');
    });
    

    $scope.seatConfirm = function($event){ //确认选座
        var end = new Date( $scope.data.saleEndTime.replace('-', '/') ),
            endTime = end.getTime(),
            now = new Date(), 
            nowTime = now.getTime();

        if( endTime < nowTime ){
            showTip('已超过售票时间哦！');
            return;
        }

        if(!$scope.count){
            showTip('您还没有选座哦！');
            return;
        }

        if( $scope.price * $scope.count > 500 ){
            showTip('总金额不能大于500元哦！');
            return;
        }

        sessionStorage.couponAmount = 0;
        sessionStorage.couponIds = [];
        sessionStorage.__couponType__ = '';
        sessionStorage.pickedSeats = $scope.pickedSeats;
        $($event.target).next().click(); //埋点hack

        //特价票所需参数(新增需求)
        var saleParam = $scope.data.couponId ? '?couponId=' + $scope.data.couponId + '&userId=' + $scope.data.userId + '&actId=' + $scope.data.actId + '&actPrice=' + $scope.data.actPrice + '&buyLimit=' + $scope.data.buyLimit : '';

        setTimeout(function(){
            location.href = '/seat_pick_submit.html' + saleParam;
        }, 200);
        
    };

}])
 
.directive('ngIscroll', ['$timeout',  function($timeout){
    return function(scope, elem, attr){

scope.pickSeat=function($event){
    var tar = $event.target,
    target = angular.element( tar );
    target.toggleClass('occupied');
}

        scope.$watch('rows', function(newVal){
            if( !newVal ) return; //不设置会实例化两次iscroll

            $timeout(function(){
                var jdBannerH = scope.isWeixin ? 0 : 45;

                //必须先设置好高度，再实例化iscroll，否则获取不到底部边界
                elem.css('height', window.innerHeight - 138 - jdBannerH + 'px');

                if( !scope.iscroll ) {
                    scope.iscroll = new IScroll(elem[0], {
                        scrollX: true,
                        scrollY: true,
                        freeScroll: true,
                        click: true,
                        tap: true,
                        zoom: true,
                        zoomMin: .75,
                        zoomMax: 1.5,
                        startZoom: .75,
                        mouseWheel: true,
                        wheelAction: "zoom",
                        sidebar: elem.children()[1]
                    });

                    var wrapperW = elem[0].offsetWidth,
                        innerW = elem.children()[0].offsetWidth * .75;

                    if( innerW > wrapperW ) {
                        var s_x = ( innerW - wrapperW ) * -.5;
                        scope.iscroll.scrollTo( s_x, 0, 1e3 );
                    } else {
                        var ratio = wrapperW / innerW * .5;
                        scope.iscroll.zoom(ratio, 0, 0, 1e3); 
                    }
                }

            }); 

        });

    };
}])

.filter('seatFormat', function(){
    return function( str ){
        return str.replace(':', '排') + '座';
    };
}); 