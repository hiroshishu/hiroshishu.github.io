
(function(){
    
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
 
    // function ajaxForData() {
    //     $.ajax({
    //         url: '/mock/hotMovieTest.json',
    //         data: {},
    //         type: 'GET',
    //         dataType: 'json',
    //         async: false,
    //         success: function(jsonData) {
    //             initOrshowDom(jsonData);
    //         }
    //     });
    // }

    //initOrshowDom();

    function initOrshowDom(jsonData, length) {
        if (jsonData) {

            var tpls = '<section class="sm_wrap"><div class="sm_cancelBtn">取消</div><div class="leftBar"><ul>';

            // for (var i = 0, len = jsonData.length; i < len; i++) {
            //     var tmpObj = jsonData[i];
                //tpls += '<li class="sm_li" data-nav="dest' + i + '">' + tmpObj.label + '</li>';
            // }
            tpls += '<li class="sm_li" data-nav="dest0">地区</li>';

            tpls += '</ul></div><div class="rightBar"><div class="rWrap">';
            // for (var j = 0, uLen = jsonData.length; j < len; j++) {
            //     var uObj = jsonData[j];
            //     tpls += '<ul class="rUl" data-ul="dest' + j + '">';
            //     for (var k = 0; k < uObj.detail.length; k++) {
            //         tpls += '<li>' + uObj.detail[k].detailMsg + '&nbsp;(&nbsp;' + uObj.detail[k].detailMum + '家&nbsp;)</li>';
            //     }
            //     tpls += '</ul>';
            // }

            tpls += '<ul class="rUl"><li class="show-all-list">全部&nbsp;(&nbsp;' + length + '家&nbsp;)</li>';
            for (var region in cinemaList) {
                tpls += "<li data-name='" + cinemaList[region].name + "' data-list='" + JSON.stringify( cinemaList[region].list ) + "'>" + cinemaList[region].name + "&nbsp;(&nbsp;" + cinemaList[region].list.length + "家&nbsp;)</li>";
            }

            tpls += '</ul></div></div></section>';
            $(document.body).append(tpls);
            $('.sm_li').eq(0).addClass('cur');
            $('.show-all-list').addClass('cur');

            var mask_tpl = '<section class="sm_mask"></section>';
            $(document.body).append(mask_tpl);
            $('.sm_mask').width($(document).width());
            $('.sm_mask').height($(document).height());
        } else {
            $('.sm_wrap,.sm_mask').show();
        }
        oMask.openMask();
        $('.sm_wrap').css('bottom', 0);
    }

    function initIScroll() {
        sideScroll = new IScroll('.rightBar', {
            scrollX: false,
            scrollY: true,
            bounceTime: 400,
            click: true
            // eventPassthrough: true,
            // preventDefault: false
        });
    }

    function bindEvents() {
        var $mask = $('.sm_mask'),
            $wrap = $('.sm_wrap');

        var moveEvt;
        if("ontouchstart" in window){
            moveEvt = "touchmove";
        }else{
            moveEvt = "mousemove";
        }
        $mask.on(moveEvt,function(e){
            e.preventDefault();
        });

        $mask.on('tap', function(e) {
            e.stopPropagation();
            $(this).hide();
            $wrap.css('bottom', -window.innerHeight*0.54).hide();
            sideScroll.scrollTo(0, 0, 0);
            oMask.hideMask();
        });

        // $wrap.on('tap', '.sm_li', function(e) {
        //     e.stopPropagation();
        //     $(this).addClass('cur').siblings().removeClass('cur');
        //     $('.rUl[data-ul="' + $(this).attr('data-nav') + '"]').show().siblings().hide();
        //     sideScroll.refresh();
        //     sideScroll.scrollTo(0, 0, 0);
        // });

        $wrap.on('tap', '.rUl li', function(e) {
            $(this).addClass('cur').siblings().removeClass('cur');

            if( $(this).attr('class').match('show-all-list') ){
                $('#cinema-all-list, #cinema-freq-list, #cinema-nearby-list').show();
                $('#cinema-result-list').hide();
                $('.cinema-list-action h4').text('全部影院');
            } else {
                $('#cinema-all-list, #cinema-freq-list, #cinema-nearby-list').hide(); 
                $('#cinema-result-list').show();
                $('.cinema-list-action h4').text( $(this).data('name') + '影院' );
                
                var result = [];
                $.each($(this).data('list'), function(i, val){
                    var cprice = +val.planPrice || +val.temPrice,
                        //新增：19.9或9.9特价票加背景色
                        isSale = ( cprice == 19.9 || cprice == 9.9 ) ? ' sale' : '';
                    
                    result.push(
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
                            '<a href="javascript:;" class="goCinema" data-code="', val.cinemaId, '" data-flag="', val.flag,'" clstag="pageclick|keycount|201510261|8"></a>',
                        '</li>'
                    );
                });
                $('#cinema-result-list').html( result.join('') );
            }

            $mask.hide();
            $wrap.css('bottom', -window.innerHeight*0.54).hide();
            sideScroll.scrollTo(0, 0, 0);
            oMask.hideMask();
        });

        $('.sm_cancelBtn').on('tap',function(){
            $mask.trigger('tap');
        });
    }

    sideMenu = function () {
        var sideScroll = null;
        if (!$('.sm_wrap').length) {
            initOrshowDom( cinemaList, data.length );
            initIScroll();
        } else {
            initOrshowDom();
        }
        bindEvents();
    }

})();
