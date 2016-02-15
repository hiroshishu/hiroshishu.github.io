//嵌入通用定位逻辑
__inline('common/responseCityInfo.js');
//嵌入工具库
__inline('common/util.js');
//显示京东M端通用头
if(!isWeixin()){
  loadHB('选择城市');
}else{
  $('#m_common_header').remove();
}
//加载统计代码
statistics();
(function() {
  
  function init() {
    ajaxForCity();
    bindEvent();
  }

  function ajaxForCity() {
    $.ajax({
      type: 'GET',
      // url: '/mock/positionInterface.json',
      url: '/city/cityList',
      dataType: 'json',
      success: function(json) {
        if (json.code == 200) {
          var formatedData = spliceEmptyData(json.data);
          renderHTML(formatedData);
        }
      },
      error: function() {

      }
    });
  }


  function spliceEmptyData(data){
    for(var i=0; i<data.length; i++){
      if(data[i].items.length == 0){
        data.splice(i,1);
        spliceEmptyData(data);
      }
    }
    return data;
  }

  function renderHTML(arr) {
    var HArr = [],
      letterArr = [];
    letterArr.push('<ul>');
    for (var i = 0, len = arr.length; i < len; i++) {
      var cityLetter = arr[i].letter;
      //城市列表
      HArr.push('<dl class="p_area">');
      HArr.push('<dt id="' + cityLetter + '">' + cityLetter + '</dt>');
      for (var j = 0, len2 = arr[i].items.length; j < len2; j++) {
        HArr.push('<dd class="city-item" cityId="'+arr[i].items[j].cityId+'">' + arr[i].items[j].cityName + '</dd>');
      }
      HArr.push('</dl>');

      //城市索引
      letterArr.push('<li><a href="#' + cityLetter + '">' + cityLetter + '</a></li>');
    }
    letterArr.push('</ul>');
    $('.p_detail').html(HArr.join(''));
    $('.p_index').html(letterArr.join(''));
  }

  function bindEvent() {
    $('#p_detail').delegate('dt', 'tap', function() {
      $(this).siblings().toggle();
    });
    $('body').on('tap','.city-item',function(){
      localStorage.cityId = $(this).attr('cityId');
      localStorage.cityName = $(this).text();
      sessionStorage.customLocal = true;
      location.href = sessionStorage.__referrer__ || '/home.html';
    });
  }

  init();
})();

var cityId = localStorage.cityId || '11'; //默认cityId为北京
function responseCityInfo(cityInfo) { //geolocation global callback
  $('.curCity').html(cityInfo.cityName);
}
// function responseCityInfo(cityInfo) { //geolocation global callback
//   if (cityId != cityInfo.cityId) {
//     setTimeout(function() {
//       if (confirm('是否切换到新城市？')) {
//         $('.curCity').html(cityInfo.cityName);
//         localStorage.cityId = cityInfo.cityId;
//         localStorage.cityName = cityInfo.cityName;
//       }
//     }, 5000);
//   }
// }