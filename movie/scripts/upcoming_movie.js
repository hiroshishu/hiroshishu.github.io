//嵌入工具库
__inline('common/util.js');
//显示京东M端通用头
if(!isWeixin()){
  loadHB(sessionStorage.movieName.substring(0,10));
}else{
  $('#m_common_header').remove();
}
//加载统计代码
statistics();
(function(){
    'use strict';

    function parseStr( str, substr, delim ){
        var start = str.indexOf( substr + '=' );
        if( start === -1 ) return '';
    
        var end = str.indexOf( delim, start );
        if( end === -1 ){
            end = str.length;
        }
    
        var value = str.substring( start + substr.length + 1, end ),
            reg = /select |update |delete |truncate |join |union |exec |insert |drop |count |script|>|</i; //去除SQL注入和XXS攻击
    
        return decodeURIComponent( reg.test( value ) ? '' : value );
    }
    
    
    //获取url中的query参数
    function getQuery( key ){
        return parseStr( window.location.search, key, '&');
    };

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

    //影片信息
    $.ajax({
        type: 'GET',
        url: '/movieInfo/' + ( getQuery('movieId') || sessionStorage.movieId ) + '/2',
        //url: '/mock/upcomingMovie.json',
        dataType: 'json',
        success: function( res ){
            if( res.code == 200 ){
                var data = res.data, temp = [];

                document.title = data.movieName;
                //微信浏览器hack
                if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
                    var $iframe = $('<iframe src="/fav.ico"></iframe>').on('load', function() {
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
                            '<p><span class="icon icon-', stype, ' fleft">', mtype, '</span></p>',
                        '</div>',
                    '</div>'
                );
                $('#movie-info').html( temp.join('') );

                $('.movie-desc-content').html( '剧情简介：' + data.movieInfo );

            } else {
                showError('网络不给力哦，请重试');
            }
        },
        error: function(){
            showError('网络不给力哦，请重试');
        }
    });
 
})();