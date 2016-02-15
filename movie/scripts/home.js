//嵌入通用定位逻辑
__inline('common/responseCityInfo.js');
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
var cityId = localStorage.cityId || '11',//默认cityId为北京
  cityName = localStorage.cityName || '北京'; 
if (!localStorage._count) { //初始化视图序号,1为列表页、2为大图、3为小图
  localStorage._count = 1;
}
if (!localStorage.currentType) { //默认显示热映
  localStorage.currentType = 'hot';
}
sessionStorage.buyable = 0;
sessionStorage.__referrer__ = '/home.html';
$('.cityName').html( (cityName.length > 3 ? cityName.substring(0,2)+'...' : cityName) || '北京');

function responseCityInfo(cityInfo) { //geolocation global callback
  if (cityId != cityInfo.cityId && !sessionStorage.customLocal) { //城市id不相等&&没有手动选择过城市
    setTimeout(function() {
      if (confirm('是否切换到' + cityInfo.cityName + '？')) {
        updataMovies(cityInfo);
        localStorage.cityId = cityInfo.cityId;
        localStorage.cityName = cityInfo.cityName;
        cityName = cityInfo.cityName;
        $('.cityName').text(cityName.length > 3 ? cityName.substring(0,2)+'...' : cityName );
      }
    }, 5000);
  }
}

function updataMovies(cityInfo) { //检测到城市变化，更新电影列表
  if (localStorage.currentType == 'hot') {
    getHotMovies(cityInfo.cityId);
  } else {
    getUpcomingMovies(cityInfo.cityId, localStorage.currentType);
  }
}

function showTip(msg) {
  if ($('.tip-msg').length === 0) {
    $('body').append('<div class="tip-msg"><span></span></div>');
  }
  $('.tip-msg').addClass('fade').find('span').text(msg);
}

function render(data, el) { //渲染视图
  var tmp1 = '',
    tmp2 = '',
    tmp3 = '',
    tmp2_inner = '',
    tmp3_inner = '',
    bpstr1 = ' clstag="pageclick|keycount|201505261|', //第一次埋点
    bpstr2 = ' clstag="pageclick|keycount|201507158|', //第二次埋点
    bptype1 = bpstr2 + 2 + '"', //列表模式列表埋点
    bptype2 = bpstr1 + (el == 'hot' ? 1 : 4) + '"', //大图模式列表埋点
    bptype3 = bpstr2 + 5 + '"', //小图模式列表埋点
    tmplateType = '';

  for (var i = 0; i < data.length; i++) {

    //选座和立即预定按钮埋点
    var bpoint1, bpoint2; //大图/列表模式
    if( el == 'hot' ){
        bpoint1 = data[i].buyable == 1 ? bpstr2 + 4 + '"' : bpstr2 + 3 + '"';
        bpoint2 = data[i].buyable == 1 ? bpstr1 + 3 + '"' : bpstr1 + 2 + '"';
    } else {
        bpoint1 = data[i].buyable == 1 ? bpstr2 + 4 + '"' : '';
        bpoint2 = data[i].buyable == 1 ? bpstr1 + 3 + '"' : '';
    }

    if(data[i].tmplateType == 1){
      tmplateType = '2D';
    }else if(data[i].tmplateType == 2){
      tmplateType = '3D';
    }else if(data[i].tmplateType == 4){
      tmplateType = 'IMAX';
    }else{
      tmplateType = '3D';
    }

    /*列表拼装视图1*/
    tmp1 += '<div buyable="'+data[i].buyable+'" class="row jumpToDetail" movieName="' + data[i].movieName + '" movieId="' + data[i].movieId + '"' + bptype1 + '><img class="hidden" src="' + data[i].jdPicAddr + '"><div class="img-loading"' + (data[i].jdPicAddr != '' ? '' : ' style="z-index:0;"') + '></div><h4>' + data[i].movieName +(data[i].actPrice ? '<span class="m-ap">促</span>' : '') + '<span class="m-type">'+tmplateType+'</span></h4><p>导演：' + data[i].director + '</p><p>主演：' + (data[i].actors.length > 16 ? data[i].actors.substring(0, 15) + '...' : data[i].actors) + '</p><p class="info">' + (data[i].releaseDateDes ? data[i].releaseDateDes+'上映' :'今天共有' + data[i].cinemaCount + '家影院放映' + data[i].planCount + '场') + '</p>' +  (data[i].grade && data[i].grade != "0.0" ? '<span class="f-score">' + data[i].grade + '分</span>' : '') + '<div class="flag"></div><a class="jumpToCinema btn" buyable="'+data[i].buyable+'" movieId="' + data[i].movieId + '"' + bpoint1 + '>' + (el == 'hot' ? (data[i].buyable == 1 ? '立即预订' : '选座购票' ) : (data[i].buyable == 1 ? '立即预订' : '查看详情' )) + '</a></div>';

    /*大图拼装视图2*/
    tmp2_inner = '<div buyable="'+data[i].buyable+'" class="col jumpToDetail" movieName="' + data[i].movieName + '" movieId="' + data[i].movieId + '"' + bptype2 + '><img class="hidden" src="' + data[i].jdPicAddr + '"><div class="img-loading"' + (data[i].jdPicAddr != '' ? '' : ' style="z-index:0;"') + '></div><div class="mask"><div class="inner">'+(data[i].actPrice ? '<span class="m-ap">促</span>' : '<span class="m-type">'+tmplateType+'</span>') + (data[i].grade && data[i].grade != "0.0" ? '<span class="m-score">' + data[i].grade + '分</span>' : '') + '</div></div><p class="movie-name-wrap"><span>' + (data[i].movieName.length > 7 ? data[i].movieName.substring(0, 7) + '...' : data[i].movieName) + '</span></p><div class="col-overlay"></div><div class="seat-charts-btn-wrap"><a class="jumpToCinema seat-charts-btn" buyable="'+data[i].buyable+'" movieId="' + data[i].movieId + '"' + bpoint2 + '>' + (el == 'hot' ? (data[i].buyable == 1 ? '立即预订' : '选座购票' ) : (data[i].buyable == 1 ? '立即预订' : '查看详情' )) + '</a></div></div>';
    if (i % 2 === 0) {
      tmp2 += '<div class="col2">' + tmp2_inner;
    } else {
      tmp2 += tmp2_inner + '</div>';
    }

    /*小图拼装视图3*/
    tmp3_inner = '<div><div buyable="'+data[i].buyable+'" class="col jumpToDetail" movieName="' + data[i].movieName + '" movieId="' + data[i].movieId + '"' + bptype3 + '><img class="hidden" src="' + data[i].jdPicAddr + '"><div class="img-loading"' + (data[i].jdPicAddr != '' ? '' : ' style="z-index:0;"') + '></div><div class="mask"><div class="inner">'+(data[i].actPrice ? '<span class="m-ap">促</span>' : '<span class="m-type">'+tmplateType+'</span>') + (data[i].grade && data[i].grade != "0.0" ? '<span class="m-score">' + data[i].grade + '分</span>' : '') + '</div></div><div class="seat-charts-btn-wrap"></div></div><div>' + data[i].movieName + '</div></div>';
    if (i % 3 === 0) {
      tmp3 += '<div class="col3">' + tmp3_inner;
    } else if (i % 3 === 2) {
      tmp3 += tmp3_inner + '</div>';
    } else {
      tmp3 += tmp3_inner;
    }
  }
  if(tmp1 == ''){
    $('#' + el + '-view-col1').html('<div class="emptyM row">该城市暂无'+(el == 'hot' ? '热映' : '即将上映')+'影片</div>');
    $('#' + el + '-view-col2').html('<div class="emptyM row">该城市暂无'+(el == 'hot' ? '热映' : '即将上映')+'影片</div>');
    $('#' + el + '-view-col3').html('<div class="emptyM row">该城市暂无'+(el == 'hot' ? '热映' : '即将上映')+'影片</div>');
  }else{
     $('#' + el + '-view-col1').html(tmp1);
     $('#' + el + '-view-col2').html(tmp2);
     $('#' + el + '-view-col3').html(tmp3);
  }
  $('.tab-' + el).addClass('current');
  if (localStorage._count == 1) {
    $('.change-view-btn i').html('&#xe61d;');
  } else if (localStorage._count == 2) {
    $('.change-view-btn i').html('&#xe61f;');
  } else {
    $('.change-view-btn i').html('&#xe61e;');
  }
  $('.dropdown li').removeClass('current');
  $('.vi' + localStorage._count).addClass('current');
  $('#' + el + '-view-col' + localStorage._count).addClass('show');

  /*图片加载优化*/
  $('.movies img').on('load', function() {
    $(this).next('.img-loading').remove();
    $(this).removeClass('hidden');
  });
  $('body').on('tap', '.jumpToDetail', function(e) { //跳转到影片详情
    e.stopPropagation();
    sessionStorage.movieId = $(this).attr('movieId');
    sessionStorage.movieName = $(this).attr('movieName');
    // location.href = "/" + localStorage.currentType + '_movie.html';
    if($(this).attr('buyable') == 1){
      sessionStorage.buyable = 1;
    }
    if($(this).attr('buyable') == 0){
      location.href = '/upcoming_movie.html?movieId='+sessionStorage.movieId;
    }else {
      location.href = '/hot_movie_v2.html?movieId='+sessionStorage.movieId+'&movieName='+encodeURIComponent(sessionStorage.movieName);
    }
  });
  // $('body').on('tap', '.jumpToCinema', function(e) { //跳转到影院详情
  //   e.stopPropagation();
  //   sessionStorage.movieId = $(this).attr('movieId');
  //   location.href = "/cinema_list.html";
  // });
}

function getHotMovies(cityId) {
  $('.loading-wrap').show();
  $.ajax({
    type: 'GET',
    // url: '/mock/hotMoviesInterface' + cityId + '.json',
    url: '/movie/' + cityId + '/1',
    dataType: 'json',
    success: function(data) {
      if (data.code == 200) {
        $('.loading-wrap').hide();
        render(data.data, 'hot');
      } else {
        showTip('数据加载失败，请重新尝试！');
      }
    },
    error: function(xhr, type) {
      $('.loading-wrap').remove();
      showTip('数据加载失败，请重新尝试！');
    }
  });
}

function getUpcomingMovies(cityId) {
  $('.loading-wrap').show();
  $.ajax({
    type: 'GET',
    // url: '/mock/preMoviesInterface'+cityId+'.json',
    url: '/movie/' + cityId + '/2',
    dataType: 'json',
    success: function(data) {
      if (data.code == 200) {
        $('.loading-wrap').hide();
        render(data.data, 'upcoming');
      } else {
        $('.loading-wrap').hide();
        showTip('数据加载失败，请重新尝试！');
      }
    },
    error: function(xhr, type) {
      showTip('数据加载失败，请重新尝试！');
    }
  });
}
if (localStorage.currentType == 'hot') {
  getHotMovies(cityId);
} else {
  getUpcomingMovies(cityId);
}
$('.change-view-btn').on('tap', function() { //切换视图
  if ($('.nav-bar .dropdown').hasClass('none')) {
    $('.nav-bar .dropdown').removeClass('none');
  } else {
    $('.nav-bar .dropdown').addClass('none');
  }
});
$('.dropdown li').on('tap', function() { //切换视图
  localStorage._count = $(this).attr('tar');
  $('.nav-bar .dropdown').addClass('none');
  $('.movies').removeClass('show');
  if (localStorage._count == 1) {
    $('.change-view-btn i').html('&#xe61d;');
  } else if (localStorage._count == 2) {
    $('.change-view-btn i').html('&#xe61f;');
  } else {
    $('.change-view-btn i').html('&#xe61e;');
  }
  $(this).addClass('current').siblings('li').removeClass('current');
  if ($('.tab-hot').hasClass('current')) {
    $('#hot-view-col' + localStorage._count).addClass('show');
  } else {
    $('#upcoming-view-col' + localStorage._count).addClass('show');
  }
});
$('.tabs span').on('tap', function() {
  $(this).addClass('current').siblings('span').removeClass('current');
  $('.movies').removeClass('show');
  var __el__ = $(this).attr('tar');
  localStorage.currentType = __el__;
  if ($('#upcoming-view-col1 .row').length === 0) {
    getUpcomingMovies(cityId);
  }
  if ($('#hot-view-col1 .row').length === 0) {
    getHotMovies(cityId);
  }
  $('#' + __el__ + '-view-col' + localStorage._count).addClass('show');
});
/*loading banner*/
$.ajax({
  type: 'GET',
  url: '/api/cmsBanner',
  // url: '/mock/banner.json',
  dataType: 'json',
  success: function(json) {
    if (json.code == 200) { 
      /*if(json.data[0]){
        $('.banner').html('<a href="' + json.data[0].url + '"><img src="' + json.data[0].imgurl + '"></a>');
        $('.banner img').on('load', function() {
          $('.banner').show();
        });
      }*/

      if(json.data.length){
        var H = "";
        H += '<div class="swiper-container"><div class="swiper-wrapper">';
        for (var i = 0; i < json.data.length; i++) {
            H += '<div class="swiper-slide"><a href="' + json.data[i].linkUrl + '"><img src="http://storage.jd.com/' + json.data[i].imgUrl + '"></a></div>';
        };
        H += '</div><div class="swiper-pagination"></div></div>';
        $('.banner').html(H);

        $('.banner img').on('load', function() {
          $('.banner').show();
        });

        var mySwiper = new Swiper ('.swiper-container', {
            direction: 'horizontal',
            // loop : true, 
            autoplay : 2000,
            observer:true,
            observeParents:true,
            autoplayDisableOnInteraction : false,
            // 如果需要分页器
            pagination: '.swiper-pagination'
        });
      }

    }
  },
  error: function(xhr, type) {
    showTip('数据加载失败，请重新尝试！');
  }
});