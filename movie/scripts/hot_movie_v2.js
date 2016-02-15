//嵌入工具库
__inline('common/util.js');
__inline('./searchModule.js');


//显示京东M端通用头
if(!isWeixin()){
    var mname = getQuery('movieName') || sessionStorage.movieName;
  loadHB(mname.substring(0,10));
}else{
  $('#m_common_header').remove();
}



var cinemaList = {}, freqCinemas = [], nearbyCinemas = [], threshold = 30, sideMenu;

//清除上一次选座/优惠券记录
sessionStorage.pickedSeats = '';
sessionStorage.couponAmount = 0;
sessionStorage.couponIds = [];
sessionStorage.__couponType__ = '';
sessionStorage.__count__ = '';
sessionStorage.phoneNum = '';
sessionStorage.jdouUsed = '';

//判断影片是否为立即预定
var buyable = sessionStorage.buyable == '1';

function getCouponMsg(){
    $.ajax({
        type: 'GET',
        // url:'mock/test.json',
        url: '/api/cmsCoupon?filmId='+( getQuery('movieId') || sessionStorage.movieId ),
        dataType: 'json',
        success: function( res ){
            if(res.code == 200){
                $('.toUseCoupon').height(30).html('<span class="couponIcon">优惠券</span><span class="couponMsg">点击领取优惠券，看电影超便宜！</span><span class="couponGoto fright"></span><a class="togo" href="'+res.data.linkUrl+'"></a>');
            }
        }
    });
}

function getCinemaList(){
    $.ajax({
        type: 'GET',
        url: '/showingCinemaInfoList?cityId=' + (localStorage.cityId || '11') + '&movieId=' + ( getQuery('movieId') || sessionStorage.movieId ) + '&lng=' + (localStorage.lng || '') + '&lat=' + (localStorage.lat || '') + '&regionId=0&sortType=3&keyWord=',
        // url: '/mock/hotMovieCinema.json',
        dataType: 'json',
        success: function( res ){
            if(res.code == 200) {
                $('.loading-wrap').hide();
                getCinemaSuc( res.data );
            } else {
                showError('网络不给力哦，请重试');
            }
        },
        error: function(xhr, type) {
            showError('网络不给力哦，请重试');
        }
    });
}

function getCinemaSuc( data ){
    var allCinema = [];

    $.each(data, function(i, val){
        val.temPrice = +val.temPrice;
        val.earliestPlanPrice = +val.earliestPlanPrice;
        val.cheapestPlanPrice = +val.cheapestPlanPrice;
        val.planPrice = +val.planPrice;

        //票卷都为0的影院不显示
        //if( (!val.cheapestPlanPrice && !buyable) && !val.temPrice ) return;
        //有座有券的为0
        //if( (val.cheapestPlanPrice || buyable)  && val.temPrice ) val.flag = 0;
        //有座没券的为1
        if( (val.planPrice || buyable)  && !val.temPrice ) val.flag = 1;
        else val.flag = 0;
        //有劵没座的为2
        //if( (!val.cheapestPlanPrice && !buyable) && val.temPrice ) val.flag = 2;

        if( !cinemaList[ val.regionId ] ){
            cinemaList[ val.regionId ] = {
                name: val.regionName,
                list: []
            }
        }

        if( val.label == 2 ){
            val.fq = 1; //深夜无场次 需要判断常去是否有最早或最优惠的场次
            if( val.cheapestShowTime || val.earliestShowTime ) freqCinemas.push( val );
            else nearbyCinemas.push( val );
        }
        val.label == 1 && nearbyCinemas.push( val );
        cinemaList[ val.regionId ]['list'].push( val );



        var cprice = val.planPrice || val.temPrice,
            //新增：19.9或9.9特价票加背景色
            isSale = ( cprice == 19.9 || cprice == 9.9 ) ? ' sale' : '';

        if( +val.label  ) return;
        allCinema.push(
            '<li class="bbox">',
                '<p class="cinema-list-name clearfix">',
                    '<span class="name fleft">', val.cinemaName, '</span>',
                    '<span class="icon seat-icon fright">座</span>',
                    val.temPrice ? '<span class="icon coupon-icon fright">劵</span>' : '',
                '</p>',
                '<p class="cinema-list-addr clearfix">',
                    '<span class="addr fleft">', val.cinemaAddress, '</span>',
                    localStorage.lng && localStorage.lat ? '<span class="dist fleft"><b>' + ( val.cinemaDistance < threshold ? val.cinemaDistance + '</b>km</span>' : '>' + threshold + '</b>km</span>' ) : '',
                    cprice ? '<span class="price' + isSale + ' fright">￥<span>' + cprice + '</span>起</span>' : '',
                '</p>',
                '<a href="javascript:;" class="goCinema" data-code="', val.cinemaId, '" data-flag="', val.flag,'" clstag="pageclick|keycount|2015071511|4"></a>',
            '</li>'
        );
    });
    $('#cinema-all-list').html( allCinema.join('') );


    function filterTime( time ){
        var t = time.split(' '), _t = t[1].split(':');
        return _t[0] + ':' + _t[1];
    }

    // 没有常去的取附近的影院
    if( !freqCinemas.length && nearbyCinemas.length && nearbyCinemas[0].earliestShowTime ) {
        freqCinemas[0] = nearbyCinemas.shift();
    }

    // 放映场次排重
    if( freqCinemas[0] && freqCinemas[0].earliestShowTime) {
        freqCinemas[0].only = freqCinemas[0].cheapestShowTime === freqCinemas[0].earliestShowTime;
        freqCinemas[0].cheapestMovieLang = freqCinemas[0].cheapestMovieLang.replace(/\/.*/, '');
        freqCinemas[0].cheapestMovieType = freqCinemas[0].cheapestMovieType.replace(/.*\-/, '');
        freqCinemas[0].earliestMovieLang = freqCinemas[0].earliestMovieLang.replace(/\/.*/, '');
        freqCinemas[0].earliestMovieType = freqCinemas[0].earliestMovieType.replace(/.*\-/, '');
    }
    
    var freq = [];
    $.each(freqCinemas, function(i, val){
        var cprice = val.planPrice || val.temPrice,
            //新增：19.9或9.9特价票加背景色
            isSale = ( cprice == 19.9 || cprice == 9.9 ) ? ' sale' : '';

        freq.push(
            '<li>',
                '<div class="bbox info">',
                    '<p class="cinema-list-name clearfix">',
                        val.fq ? '<span class="tag freq-tag fleft">常去</span>' : '<span class="tag nearby-tag fleft">附近</span>',
                        '<span class="name fleft">', val.cinemaName, '</span>',
                        '<span class="icon seat-icon fright">座</span>',
                        val.temPrice ? '<span class="icon coupon-icon fright">劵</span>' : '',
                    '</p>',
                    '<p class="cinema-list-addr clearfix">',
                        '<span class="addr fleft">', val.cinemaAddress, '</span>',
                        localStorage.lng && localStorage.lat ? '<span class="dist fleft"><b>' + ( val.cinemaDistance < threshold ? val.cinemaDistance + '</b>km</span>' : '>' + threshold + '</b>km</span>' ) : '',
                        cprice ? '<span class="price' + isSale + ' fright">￥<span>' + cprice + '</span>起</span>' : '',
                    '</p>',
                    '<a href="javascript:;" class="goCinema" data-code="', val.cinemaId, '" data-flag="', val.flag,'" clstag="pageclick|keycount|201505262|1"></a>',
                '</div>',

                '<div class="bbox ticket"', val.cheapestShowTime ? '' : ' style="display:none"', '>',
                    '<div class="ticket-recomm">',
                        '<div class="ticket-recomm-info lowest">',
                            '<p class="time">', filterTime( val.cheapestShowTime || '' ), '</p>',
                            '<p class="langprice clearfix">',
                                '<span class="lang fleft">',
                                    '<b>', val.cheapestMovieLang, '</b>/<b>', val.cheapestMovieType, '</b>',
                                '</span>',
                                '<span class="price fright">￥<b>', val.cheapestPlanPrice, '</b></span>',
                            '</p>',
                        '</div>',
                        '<a href="javascript:;" class="buyTicket" data-langtype="', val.cheapestMovieLang, ' | ', val.cheapestMovieType, '" data-planid="', val.cheapestPlanId, '" data-cinemaid="', val.cinemaId, '" clstag="pageclick|keycount|201507158|6"></a>',
                    '</div>',
                    '<div class="ticket-recomm', val.only ? ' none' : '' , '">',
                        '<div class="ticket-recomm-info earliest">',
                            '<p class="time">', filterTime( val.earliestShowTime || '' ), '</p>',
                            '<p class="langprice clearfix">',
                                '<span class="lang fleft">',
                                    '<b>', val.earliestMovieLang, '</b>/<b>', val.earliestMovieType , '</b>',
                                '</span>',
                                '<span class="price fright">￥<b>', val.earliestPlanPrice, '</b></span>',
                            '</p>',
                        '</div>',
                        '<a href="javascript:;" class="buyTicket" data-langtype="', val.earliestMovieLang, ' | ', val.earliestMovieType, '" data-planid="', val.earliestPlanId, '" data-cinemaid="', val.cinemaId,  '" clstag="pageclick|keycount|201507158|7"></a>',
                    '</div>',
                '</div>',
            '</li>'
        );
    });
    $('#cinema-freq-list').html( freq.join('') );


    var nearby = [];
    $.each(nearbyCinemas, function(i, val){
        var cprice = val.planPrice || val.temPrice,
            //新增：19.9或9.9特价票加背景色
            isSale = ( cprice == 19.9 || cprice == 9.9 ) ? ' sale' : '';

        nearby.push(
            '<li class="bbox">',
                '<p class="cinema-list-name clearfix">',
                    val.fq ? '<span class="tag freq-tag fleft">常去</span>' : '<span class="tag nearby-tag fleft">附近</span>',
                    '<span class="name fleft">', val.cinemaName, '</span>',
                    '<span class="icon seat-icon fright">座</span>',
                    val.temPrice ? '<span class="icon coupon-icon fright">劵</span>' : '',
                '</p>',
                '<p class="cinema-list-addr clearfix">',
                    '<span class="addr fleft">', val.cinemaAddress, '</span>',
                    localStorage.lng && localStorage.lat ? '<span class="dist fleft"><b>' + ( val.cinemaDistance < threshold ? val.cinemaDistance + '</b>km</span>' : '>' + threshold + '</b>km</span>' ) : '',
                    cprice ? '<span class="price' + isSale + ' fright">￥<span>' + cprice + '</span>起</span>' : '',
                '</p>',
                '<a href="javascript:;" class="goCinema" data-code="', val.cinemaId, '" data-flag="', val.flag,'" clstag="pageclick|keycount|201505262|2"></a>',
            '</li>'
        );
    });
    $('#cinema-nearby-list').html( nearby.join('') );

    __inline('./sideMenu.js');

}

function showError( msg ){
    var error = $('#error');
    $('#error p').text( msg );
    error.removeClass('fade').show();
    setTimeout(function(){
        error.addClass('fade');
        setTimeout(function(){
            error.hide();
        },1000);
    },2000);
}


function getMovieDetail() {
    $.ajax({
        type: 'GET',
        url: '/movieSeInfo/' + ( getQuery('movieId') || sessionStorage.movieId ),
        // url: '/mock/movieDetail.json',
        dataType: 'json',
        success: function( res ){
            if(res.code == 200) {
                getMovieDetailSuc( res.data );
            } else {
                showError('网络不给力哦，请重试');
            }
        },
        error: function(xhr, type) {
            showError('网络不给力哦，请重试');
        }
    });
}

function getMovieDetailSuc(data) {
    var actors = data.movieActorList, actorsSrc = [],
        pics = data.stagePic.split(','), picSrc = [],
        songs = data.movieSongList, songSrc = [];

    sessionStorage.movieActorList = JSON.stringify( actors );
    sessionStorage.stagePic = pics;

    if( data.stagePic ) {
        $.each(pics, function(index, pic){
            if( index === 3 ) return false;
            picSrc.push('<li><a href="/stills.html?url=', encodeURIComponent( pic ), '"><figure style="background-image:url(', pic , ')" clstag="pageclick|keycount|201510261|3"></figure></a></li>');
        });
    
        $('.movie-poster-list').html( picSrc.join('') );
    } else {
        $('.movie-poster').hide();
    }
    

    if( actors && actors.length ) {
        $.each(actors, function(index, actor){
            if( index === 4 ) return false;
            actorsSrc.push('<li><figure style="background-image:url(', actor.jdPhoto , ')"><a href="/actor_info.html?actid=', actor.actId, '" clstag="pageclick|keycount|201510261|5"></a></figure></li>');
        });
    
        $('.movie-actor-list').html( actorsSrc.join('') );

        if( actors.length < 5 ) $('.movie-actor h4 a').hide();
    } else {
        $('.movie-actor').hide();
    }


    if( songs && songs.length ) {
        $.each(songs, function(index, song){
            var songPic = pics[index] ? 'style="background-image:url(' + pics[index] + ');background-size:cover"' : '';

            if( /\.(mp3|wav|ogg|m4a)$/.test( song.songAddr ) ) {
                songSrc.push(
                    '<li class="clearfix">',
                        '<div class="fleft movie-song-logo"', songPic,'></div>',
                        '<div class="fleft movie-song-title">',
                            '<p class="movie-song-name">《', song.songName, '》</p>',
                            '<p class="movie-song-singer">歌手：', song.singer, '</p>',
                        '</div>',
                        '<div class="fright movie-song-player ui360" clstag="pageclick|keycount|201510261|7">',
                            '<a href="', song.songAddr, '"></a>',
                        '</div>',
                    '</li>');
            }
        });
    
        $('.movie-song-list').html( songSrc.join('') );
    } else {
        $('.movie-song').hide();
    }

    //360player播放器初始化
    threeSixtyPlayer = new ThreeSixtyPlayer();
    // hook into SM2 init
    soundManager.onready(threeSixtyPlayer.init);
}

(function(){
    'use strict';
    
    var cityId = localStorage.cityId || '11'; //默认cityId为北京

    if( getQuery('movieId') ) sessionStorage.movieId = getQuery('movieId');
    if( getQuery('movieName') ) sessionStorage.movieName = decodeURIComponent( getQuery('movieName') );
    
    $.fn.scrollTo = function( scrollTo, duration ){
        var elem = this,
            scrollFrom = elem.scrollTop(),
            delta = scrollTo - scrollFrom,
            startTime = Date.now();

        function scroll() {
            var fraction = Math.min(1, (Date.now() - startTime) / duration);
            elem.scrollTop( delta * fraction + scrollFrom );
            if(fraction < 1) requestAFrame(scroll);
        }
        scroll();
    };

    var requestAFrame = (function () {
        return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||
            function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
    })();

    function ellipsis( input, limit ) {
        return input.length > limit ? input.substring( 0, limit ) + '...' : input;
    }

    var mType = localStorage.currentType == 'hot' ? 1 : localStorage.currentType == 'upcoming' ? 2 : 0;

    //影片信息
    $.ajax({
        type: 'GET',
        url: '/movieInfo/' + ( getQuery('movieId') || sessionStorage.movieId ) + '/' + mType,
        // url: '/mock/movieInfo.json',
        dataType: 'json',
        success: function( res ){
            if( res.code == 200 ){
                var data = res.data, temp = [];

                document.title = data.movieName;
                //微信浏览器hack
                if( /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent) && isWeixin() ){
                    var $iframe = $('<iframe style="display:none" src="/fav.ico"></iframe>').on('load', function() {
                        setTimeout(function() {
                            $iframe.off('load').remove();
                        }, 0);
                    }).appendTo($('body'));
                }

                var stype, mtype;
                switch( +data.tmplateType ) {
                    case 1:
                        stype = '2d'; mtype = '2D';
                        break;
                    case 2:
                        stype = '3d'; mtype = '3D';
                        break; 
                    case 4:
                        stype = '3d'; mtype = 'IMAX';
                        break;
                    default:
                        break;   
                }

                temp.push(
                    '<div class="movie-info-bg">',
                        '<img src="', data.jdPicAddr.split(',')[0], '">',
                    '</div>',
                    '<div class="movie-info-wrap">',
                        '<div class="movie-info-thumb">',
                            '<img src="', data.jdPicAddr.split(',')[0], '">',
                        '</div>',
                        '<div class="movie-info-detail">',
                            '<p>导演：', data.director, '</p>',
                            '<p>主演：', data.actors, '</p>',
                            '<p>类型：', data.movieType, '</p>',
                            '<p>地区：', data.area, '</p>',
                            '<p>时长：', data.movieLength ? data.movieLength + "分钟" : "暂未提供", '</p>',
                            '<p>上映日期：', data.releaseDate.split(' ')[0], '</p>',
                            '<p><span class="icon icon-', stype, ' fleft">', mtype, '</span>', +data.grade ? '<span class="icon icon-rate fleft">' + data.grade + '分</span>' : '', '</p>',
                        '</div>',
                    '</div>'
                    //+data.grade ? '<p class="movie-info-rate">' + data.grade + '分</p>' : ''
                );
                $('#movie-info').html( temp.join('') );

                if( data.movieInfo ){
                    var brief = ellipsis( data.movieInfo, 72 );
                    $('.movie-desc-ellipsis').html( brief );
                    $('.movie-desc-content').html( data.movieInfo );
        
                    $('.movie-desc').on('tap', function(){
                        $('.movie-desc-dropdown b').toggleClass('up');
                        $('.movie-desc-ellipsis').toggleClass('show');
                        $('.movie-desc-content').toggleClass('show');
                    });

                } else {
                    $('.movie-desc').hide();
                }
            } else {
                showError('网络不给力哦，请重试');
            }
        },
        
    })

    //剧照+演员列表
    .then( function(){
        getMovieDetail();
    }, function(){
        showError('网络不给力哦，请重试');
    })
    
    //影院列表
    .then( function(){
        getCinemaList();
    }, function(){
        showError('网络不给力哦，请重试');
    })

    //优惠券
    .then( function(){
        getCouponMsg();
    }, function(){
        showError('网络不给力哦，请重试');
    });

    $(document).on('tap', 'a.goCinema', function(){
        sessionStorage.cinemaId = $(this).data('code');
        sessionStorage.cinemaFlag = $(this).data('flag');
        location.href = '/cinema_v2.html';
    });

    $(document).on('tap', 'a.buyTicket', function(){
         sessionStorage.cinemaName = freqCinemas[0].cinemaName;
         sessionStorage.cinemaAddr = freqCinemas[0].cinemaAddress;
         sessionStorage.pLanAndType = $(this).data('langtype');
         sessionStorage.planId = $(this).data('planid');
         sessionStorage.cinemaId = $(this).data('cinemaid');
         location.href = '/seat_pick.html';
    });

    //置顶按钮
    var topBtn = $('#top');
    $( document ).on('scroll', function() {
      var isShowed = ( topBtn.css('display') === 'block' );
      if( $( document.body ).scrollTop() < $(window).height() ) {
          if( isShowed ) topBtn.css('display', 'none');
          else return;
      }
      else {
          if( isShowed ) return;
          else topBtn.css('display', 'block');
      }
    });

    topBtn.on('tap', function(){
        $(document.body).scrollTo(0, 350);
    });

    $('.cinema-list-action .search').on('tap', function() {
        searchModule();
    });
    $('.cinema-list-action .filter').on('tap', function() {
        sideMenu();
    });

    $('.tabUl li.buy_ticket').on('tap', function() {
        $('.tabUl li.cur').removeClass('cur');
        $(this).addClass('cur');
        $('#movie-info-section').hide();
        $('#cinema-list').show();
    });

    $('.tabUl li.movie_info').on('tap', function() {
        $('.tabUl li.cur').removeClass('cur');
        $(this).addClass('cur');
        $('#movie-info-section').show();
        $('#cinema-list').hide();
    });

    
//加载统计代码
statistics();

})();
