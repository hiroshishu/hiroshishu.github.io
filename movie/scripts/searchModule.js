var searchModule;

(function(){
    //嵌入工具库
    __inline('common/util.js');

    var searchList = [],searchListLen = 4;

    var oMask = {
        openMask:function(){
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = 'hidden';
        },
        hideMask : function(){
            document.documentElement.style.overflow = "auto";
            document.body.style.overflow = 'auto';
        }
    }


    function ajaxForData(val) {
        $.ajax({
            // url: 'mock/hotMovieCinema.json',
            url: '/showingCinemaInfoList?cityId=' + (localStorage.cityId || '11') + '&movieId=' + ( getQuery('movieId') || sessionStorage.movieId ) + '&lng=' + (localStorage.lng || '') + '&lat=' + (localStorage.lat || '') + '&regionId=0&sortType=3&keyWord=' + val,
            type: 'GET',
            dataType: 'json',   
            // async: false,
            beforeSend:function(){
                $('.loading-wrap').css('top',350).show();
            },
            success: function(jsonData) {
                $('.loading-wrap').css('top',250).hide();
                if(jsonData.code == 200 && jsonData.data.length > 0){
                    refreshSearchResult(jsonData.data);
                }else{
                    var noR = '<div class="e_con"><div class="e_cartoon"></div><div class="e_msg">抱歉，没有相关影院</div></div>';
                    $('.searchModule_wrap .mid').empty().html(noR);
                    $('.searchModule_wrap .bot').addClass('hide');
                }
            },
            error:function(){
                $('.loading-wrap').css('top',250).hide();
            }
        });
    }

    function refreshSearchResult(arr){
        var H = '<div class="resultContainer"><ul class="ulWrap">';
        $.each(arr, function(i, n){
            if( (+n.planPrice || buyable)  && !+n.temPrice ) n.flag = 1;
            else n.flag = 0;
            var quan = +n.temPrice ? '<span class="icon icon-coupon">券</span>' : '',
                cprice = +n.planPrice || +n.temPrice,
                //新增：19.9或9.9特价票加背景色
                isSale = ( cprice == 19.9 || cprice == 9.9 ) ? ' sale' : '';
                
            H +=  '<li class="rs-content">'
                +   '<div class="rs-name"><span class="name">'+n.cinemaName+'</span><span class="icon icon-seat">座</span>'+quan+'</div>'
                +   '<div class="rs-addr"><span class="addr">'+n.cinemaAddress+'</span><span class="dis">'+n.cinemaDistance+'km</span><span class="price'+isSale+'">￥<i>'+cprice+'</i>起</span></div>'
                +   '<a class="rs-a" data-flag="'+n.flag+'" data-cid="'+n.cinemaId+'" clstag="pageclick|keycount|201510261|9"></a>'
                +  '</li>';
        });
        H += '</ul></div>';
        $('.searchModule_wrap .mid').empty().html(H);
        $('.searchModule_wrap .bot').removeClass('hide');
        initIScroll();
    }

    function initOrshowDom(isFirst) {
        if (isFirst) {

            var tpls = '<section class="searchModule_wrap">';
            tpls += '<div class="top"><div class="search-panel-fields"><input type="text" id="keywords" maxlength=20 placeholder="影院名称关键字" /><i class="iconfont icon-sousuo"></i><i class="iconfont icon-cuowu hide"></i></div><p class="sousuoBtn" id="goSearch">搜索</p></div>'
            tpls += '<div class="mid"></div>';
            tpls += '<div class="bot"><div class="bot-inner"><i class="iconfont icon-lajitong"></i><span>清空历史</span></div></div>';
            tpls += '</section>';
            tpls += '<section class="search_mask"></section>';
            $(document.body).append(tpls);

            // var mask_tpl = '<section class="search_mask"></section>';
            // $(document.body).append(mask_tpl);
            $('.search_mask').width($(document).width());
            // $('.search_mask').height($(document).height());
        } else {
            $('.searchModule_wrap,.search_mask').show();
        }
        oMask.openMask();
        freshHistory();
        $('.searchModule_wrap').css('bottom', 0);
    }

    function freshHistory(){
        if(localStorage.searchList){
            var arr = JSON.parse(localStorage.searchList);
            var txt = '<dl class="search-history"><dt>搜索历史：</dt>';
            for (var i = 0; i < arr.length; i++) {
                txt += '<dd>'+arr[i]+'</dd>';
            }
            txt += '</dl>';
            $('.searchModule_wrap .mid').html(txt);
            // $('.searchModule_wrap .bot').removeClass('hide');
        }else{
            $('.searchModule_wrap .mid').empty();
            // $('.searchModule_wrap .bot').removeClass('hide');
        }
        $('.searchModule_wrap .bot').removeClass('hide');
    }

    function ifHasSameKey(key){
        var rs = false;
        if(localStorage.searchList){
            var arr = JSON.parse(localStorage.searchList);
            if($.inArray(key,arr) >= 0){
                rs = true;
            }else{
                rs = false;
            }
        }else{
            rs = false;
        }
        return rs;
    }

    function initIScroll() {
        searchScroll = new IScroll('.resultContainer', {
            scrollX: false,
            scrollY: true,
            bounceTime: 400,
            scrollbars: true,
            // resizeScrollbars: false,
            click: true
            // eventPassthrough: true,
            // preventDefault: false
        });
    }

    function bindEvents() {
        var $mask = $('.search_mask'),
            $wrap = $('.searchModule_wrap'),
            $keyword = $('#keywords'),
            $cuowo = $('.icon-cuowu');

        var moveEvt;
        if("ontouchstart" in window){
            moveEvt = "touchmove";
        }else{
            moveEvt = "mousemove";
        }
        $mask.on(moveEvt,function(e){
            e.preventDefault();
        });

        $mask.off('tap').on('tap', function(e) {
            e.stopPropagation();
            $(this).hide();
            $wrap.css('bottom', -window.innerHeight*0.58).hide();
            // searchScroll.scrollTo(0, 0, 0);
            oMask.hideMask();
            $keyword.val('');
            $cuowo.addClass('hide');
        });

        $wrap.on('tap','a.rs-a',function(){
            sessionStorage.cinemaId = $(this).data('cid');
            sessionStorage.cinemaFlag = $(this).data('flag');
            location.href = '/cinema_v2.html';
        });

        $keyword.on('keyup',function(){
            if($cuowo.hasClass('hide')){
                $cuowo.removeClass('hide');
            }
            if($(this).val() == ''){
                $cuowo.addClass('hide');
            }
        });

        //删除输入项
        $cuowo.off('tap').on('tap',function(){
            $keyword.val('');
            $(this).addClass('hide');
        });

        //搜索
        $('#goSearch').off('tap').on('tap',function(){

            var val = $.trim($keyword.val());
            if(val != ""){
                ajaxForData(val)
            }else{
                $keyword.val('').focus();
            }

            if(localStorage.searchList){
                searchList = JSON.parse(localStorage.searchList) || [];
            }
            // if(val != '' && searchList.length < searchListLen){
            //     searchList.push(val);
            //     localStorage.searchList = JSON.stringify(searchList);
            // }
            if(val && val != "" && !ifHasSameKey(val)){
                if(searchList.length < searchListLen){
                    searchList.unshift(val);
                }else{
                    searchList.pop(searchList[0]);
                    searchList.unshift(val);
                }
                localStorage.searchList = JSON.stringify(searchList);
            }
        });

        $('.search-history').on('tap','dd',function(){
            $keyword.val($(this).text());
        })

        //删除历史
        $('.bot-inner').off('tap').on('tap',function(){
            searchList = [];
            localStorage.removeItem('searchList');
            $('.search-history').detach();
        });
    }



    searchModule = function () {
        var searchScroll = null;
        if (!$('.searchModule_wrap').length) {
            initOrshowDom(1);
        } else {
            initOrshowDom();
        }
        bindEvents();
    }

})();