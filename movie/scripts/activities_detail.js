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

  function showError( msg ){
      var error = $('#error');
      $('#error p').text( msg );
      error.removeClass('fade').show();
      setTimeout(function(){
          error.addClass('fade');
          setTimeout(function(){
              error.hide();
          }, 1000);
      }, 2000);
  }

  function parseStr( str, substr, delim ){
      var start = str.indexOf( substr + '=' );
      if( start === -1 ) return '';
  
      var end = str.indexOf( delim, start );
      if( end === -1 ){
          end = str.length;
      }
  
      var value = str.substring( start + substr.length + 1, end ),
          reg = /select |update |delete |truncate |join |union |exec |insert |drop |count |script|>|</i; // 去除SQL注入和XXS攻击
  
      return decodeURIComponent( reg.test( value ) ? '' : value );
  }
  
  //获取url中的query参数
  function getQuery( key ){
      return parseStr( window.location.search, key, '&');
  }

  var movieId = getQuery('filmid') || sessionStorage.filmid,
      price   = getQuery('filmprice') || sessionStorage.filmprice,
      picUrl  = getQuery('piclisturl') || sessionStorage.piclisturl;

  sessionStorage.movieId = movieId;
  $('#activity-img').css('backgroundImage', 'url(' + picUrl + ')');

  var setPosition = function(position) { //设置经纬度
    localStorage.lat = position.coords.latitude;
    localStorage.lng = position.coords.longitude;

    $.ajax({
      type: 'GET',
      url: '/city/position?lat='+localStorage.lat+'&lng='+localStorage.lng,
      // url: '/mock/geolocationInterface.json',
      dataType: 'json',
      context: $('body'),
      success: function(res) {
        if (res.code == 200) {
          localStorage.cityId = res.data.cityId;
          localStorage.cityName = res.data.cityName;
          getCinemas();
        } else {
          setErrorMsg();
        }
      },
      error: function(xhr, type) {
        setErrorMsg();
      }
    });
  };

  var setErrorMsg = function() { //获取位置失败
    if( !localStorage.cityId ) localStorage.cityId = '11';
    if( !localStorage.cityName ) localStorage.cityName = '北京';
    getCinemas();
    alert('请开启定位功能！');
  };

 
  function getCinemas(){
    $.ajax({
      type: 'GET',
      url: '/activityCinemaInfoList?cityId=' + localStorage.cityId + '&movieId=' + movieId + '&price=' + price,
      //url: '/mock/activities_detail.json',
      dataType: 'json',
      success: function(json) {
        $('.loading-wrap').hide();
  
        if (json.code == 200 || json.code == 201) {
          if( !json.data.length ){
            $('.no-cinema').show();
            $('#cinema-list').hide();
            return;
          }
          
          var source = [];
          $.each(json.data, function(i, data){
            data.temPrice = +data.temPrice;
            var flag = data.temPrice ? 0 : 1,
                btn = json.code == 200 ? '<b data-flag="' + flag + '" data-code="' + data.cinemaId + '"   clstag="pageclick|keycount|2015071513|2">购票</b>' : '<span>已售完</span>';
  
            source.push(
              '<li class="clearfix">',
                '<div class="movie-ticket fright">',
                  '<p class="price">￥ <span>', price, '</span></p>',
                  '<p class="buy-btn">', btn, '</p>',
                '</div>',
          
                '<div class="cinema-info">',
                  '<p class="name"><b>', data.cinemaName,'</b></p>',
                  '<p class="addr">', data.cinemaAddress,'</p>',
                '</div>',
              '</li>'
            );
          });
  
          $('#cinema-list').html( source.join('') );
        } else {
          $('.no-cinema').show();
          $('#cinema-list').hide();
        }
      },
  
      error: function(xhr, type) {
        showError('数据加载失败，请重新尝试！');
      }
    });
  }
  
 if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(setPosition, setErrorMsg);
 } else {
   setErrorMsg();
 }

  $(document).on('tap', '.buy-btn b', function(){
      sessionStorage.cinemaId = $(this).data('code');
      sessionStorage.cinemaFlag = $(this).data('flag');
      location.href = '/cinema_v2.html';
  });

})();