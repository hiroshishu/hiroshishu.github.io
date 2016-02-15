//嵌入工具库
__inline('common/util.js');
//显示京东M端通用头
if(!isWeixin()){
  loadHB('京东电影');
}else{
  $('#m_common_header').remove();
}
//加载统计代码
statistics();
(function(){ 
    'use strict';
    
    //localStorage状态检测
    if( !window.localStorage || !localStorage.cityId ){
        location.href = '/home.html';
    }

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

    var cinemaList = {}, threshold = 30;
    
    //推荐影院列表
    $.ajax({
        type: 'GET',
        //url: '/mock/freqCinema.json',
        url: 'cinemaInfo/recommand',
        dataType: 'json',
        data: {
            cityId: localStorage.cityId || '11', //城市id
            lng: localStorage.lng || '',
            lat: localStorage.lat || ''
        },

        success: function( res ){
            if( res.code != 200) {
                showError('网络不给力哦，请重试'); return;
            }

            var temp = [], flag;
            $.each(res.data, function(i, val){
                if( parseFloat( val.cinemaDistance ) > 5 || !localStorage.lng ) return;
                val.temPrice = +val.temPrice;
                val.planPrice = +val.planPrice;

                //票卷都为0的影院不显示
                if( !val.planPrice && !val.temPrice ) return;
                //有座有劵的为0
                if( val.planPrice && val.temPrice ) flag = 0;
                //有座没劵的为1
                if( val.planPrice && !val.temPrice ) flag = 1;
                //有劵没座的为2
                if( !val.planPrice && val.temPrice ) flag = 2;

                temp.push(
                    '<li class="', val.temPrice ? 'support-coupon ': '', val.planPrice ? 'support-seat ' : '', 'bbox">',
                    '<p class="cinema-list-name clearfix">',
                        +val.isFreqCinema ? '<span class="tag freq-tag fleft">常去</span>' : '<span class="tag nearby-tag fleft">附近</span>',
                        '<span class="name fleft">', val.cinemaName, '</span>',
                        val.planPrice ? '<span class="icon seat-icon fright">座</span>' : '',
                        val.temPrice ? '<span class="icon coupon-icon fright">劵</span>': '',
                    '</p>',
                    '<p class="cinema-list-addr clearfix">',
                        '<span class="addr fleft">', val.address, '</span>',
                        localStorage.lng && localStorage.lat ? '<span class="dist fleft"><b>' + ( val.cinemaDistance < threshold ? val.cinemaDistance + '</b>km</span>' : '>' + threshold + '</b>km</span>' ) : '',
                        '<span class="price fright">￥<span>', val.planPrice || val.temPrice, '</span>起</span>',
                    '</p>',
                    '<a href="javascript:;" class="goCinema" data-code="', val.cinemaId, '" data-flag="', flag,'" clstag="pageclick|keycount|2015071513|3"></a>',
                    '</li>'
                );
            });

            $('#cinema-recomm-list').html( temp.join('') );
        }
    })

    .then(function(){
        $.ajax({
            type: 'GET',
            //url: '/mock/cinemaRegion.json',
            url: '/region',
            dataType: 'json',
            data: {
                cityId: localStorage.cityId || '11' //城市id
            },

            success: function( res ){
                if( res.code != 200) {
                    showError('网络不给力哦，请重试'); return;
                }

                var temp = [];
                $.each(res.data, function(i, val){
                    temp.push(
                        '<li>',
                        '<div class="bbox grad clearfix region" data-code="', val.regionCode, '">',
                            '<p class="cinema-region-name fleft">', val.regionName, '</p>',
                            '<p class="cinema-region-num fright"><b class="icon-hot_movie-arrow"></b></p>',
                        '</div>',
                        '<dl><p class="no-cinema">没有找到相应的影院</p></dl>',
                        '</li>'
                    );
                });

                $('#cinema-region-list').html( temp.join('') );
            },

            error: function(){
                showError('网络不给力哦，请重试');
            }
        });
    }, function(){
        showError('网络不给力哦，请重试');
    });


    $('#cinema-region-list').on('tap', '.region', function(){
        var self = $(this), cinemaList = self.next(),
            arrow = $('b', self);

        function expand(){
            if( !cinemaList.hasClass('expand') ){
                $('.cinema-region-num b.up').removeClass('up');
                $('.cinema-region dl.expand').removeClass('expand');
            }
            cinemaList.toggleClass('expand');
            arrow.toggleClass('up');

            if( cinemaList.hasClass('expand') ){
                setTimeout( function(){ 
                    $(document.body).scrollTo(self.offset().top, 350);
                }, 300);

                var cat = $('.cat a.active'), noCinema = cinemaList.children('p.no-cinema'),
                    supportSeat = cinemaList.children('.support-seat'), 
                    supportCoupon = cinemaList.children('.support-coupon');

                if( cat.hasClass('showseat') ) {
                    supportCoupon.hide(); 
                    if( supportSeat.length ){
                        noCinema.hide(); supportSeat.show();
                    } else {
                        noCinema.show();
                    } 
                }

                if( cat.hasClass('showcoupon') ){
                    supportSeat.hide(); 
                    if( supportCoupon.length ) {
                        noCinema.hide(); supportCoupon.show();
                    } else {
                        noCinema.show(); 
                    }
                }
            }
        }

        if( cinemaList.children('dd').length ){
            expand();
        } else {
            $.ajax({
                dataType: 'json',
                type: 'GET',
                url: '/cinemaInfo/getByCityIdAndRegionId',
                //url: '/mock/cinemaList.json',
                data: {
                    cityId: localStorage.cityId || '11', //城市id
                    regionId: self.data('code'),
                    sortType: 3,
                    lng: localStorage.lng || '',
                    lat: localStorage.lat || ''
                },
    
                success: function( res ){
                    if( res.code != 200) {
                        showError('网络不给力哦，请重试'); return;
                    }
                    var temp = [], flag;
                    $.each(res.data, function(i, val){
                        val.temPrice = +val.temPrice;
                        val.planPrice = +val.planPrice;
        
                        //票卷都为0的影院不显示
                        if( !val.planPrice && !val.temPrice ) return;
                        //有座有劵的为0
                        if( val.planPrice && val.temPrice ) flag = 0;
                        //有座没劵的为1
                        if( val.planPrice && !val.temPrice ) flag = 1;
                        //有劵没座的为2
                        if( !val.planPrice && val.temPrice ) flag = 2;
                        
                        temp.push(
                            '<dd class="bbox', val.temPrice ? ' support-coupon': '', val.planPrice ? ' support-seat' : '', '">',
                                '<p class="cinema-list-name clearfix">',
                                    '<span class="name fleft">', val.cinemaName, '</span>',
                                    val.planPrice ? '<span class="icon seat-icon fright">座</span>' : '',
                                    val.temPrice ? '<span class="icon coupon-icon fright">劵</span>': '',
                                '</p>',
                                '<p class="cinema-list-addr clearfix">',
                                    '<span class="addr fleft">', val.address, '</span>',
                                    localStorage.lng && localStorage.lat ? '<span class="dist fleft"><b>' + ( val.cinemaDistance < threshold ? val.cinemaDistance + '</b>km</span>' : '>' + threshold + '</b>km</span>' ) : '',
                                    '<span class="price fright">￥<span>', val.planPrice || val.temPrice, '</span>起</span>',
                                '</p>',
                                '<a href="javascript:;" class="goCinema" data-code="', val.cinemaId, '" data-flag="', flag,'" clstag="pageclick|keycount|2015071513|5"></a>',
                            '</dd>'
                        );
                    });
                    cinemaList.append( temp.join('') );
                    expand();
                },
    
                error: function(){
                    showError('网络不给力哦，请重试');
                }
            });
        }        
    });
    
    $(document).on('tap', 'a.goCinema', function(){
        sessionStorage.cinemaId = $(this).data('code');
        sessionStorage.cinemaFlag = $(this).data('flag');
        location.href = '/cinema_v2.html';
    });

    $('.cat a').on('tap', function(){
        var self = $(this);
        if( self.hasClass('active') ) return;
        $('.cat a.active').removeClass('active');
        self.addClass('active');

        var cinemaList = $('#cinema-region-list dl.expand'),
            recommList = $('#cinema-recomm-list');
        if( !cinemaList.length && !recommList.length ) return;

        var noCinema = cinemaList.children('p.no-cinema'),
            supportSeat   = cinemaList.children('.support-seat'), 
            supportCoupon = cinemaList.children('.support-coupon'),
            _supportSeat   = recommList.children('.support-seat'), 
            _supportCoupon = recommList.children('.support-coupon');

        if( self.hasClass('showall') ){
            noCinema.hide(); supportSeat.show(); supportCoupon.show();
            _supportSeat.show(); _supportCoupon.show();
        }

        if( self.hasClass('showseat') ){
            supportCoupon.hide(); _supportCoupon.hide(); 
            if( supportSeat.length ){
                noCinema.hide(); supportSeat.show();
            } else {
                noCinema.show();
            }

            if( _supportSeat.length ) _supportSeat.show();
        }

        if( self.hasClass('showcoupon') ){
            supportSeat.hide(); _supportSeat.hide();
            if( supportCoupon.length ) {
                noCinema.hide(); supportCoupon.show();
            } else {
                noCinema.show(); 
            }

            if( _supportCoupon.length ) _supportCoupon.show();
        }
    });

    var cityName = localStorage.cityName || '北京';
    $('a.location span').html( cityName.length > 3 ? cityName.substring(0,2) + '...' : cityName );

    sessionStorage.__referrer__ = '/cinema_list.html';

})();