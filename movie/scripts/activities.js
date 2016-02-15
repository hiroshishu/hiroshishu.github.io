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
function showTip(msg) {
  if ($('.tip-msg').length === 0) {
    $('body').append('<div class="tip-msg"><span></span></div>');
  }
  $('.tip-msg').addClass('fade').find('span').text(msg);
}
/*加载活动*/
$.ajax({
  type: 'GET',
  url: '/activity',
  // url: '/mock/activitiesInterface.json',
  dataType: 'json',
  success: function(json) {
    if (json.code == 200) {
      $('.loading-wrap').hide();
      var _timeTxt = '';
      for(var i = 0;i < json.data.length;i++){
        if( json.data[i].activityStatus == 1 ){
          _timeTxt = '还剩'+json.data[i].num + json.data[i].unit +'结束';
        }else if( json.data[i].activityStatus == 2 ) {
          _timeTxt = json.data[i].num + json.data[i].unit +'后开始';
        }else {
          _timeTxt = '于' + json.data[i].endStr.split('-')[0] + '年' + json.data[i].endStr.split('-')[1] + '月' + json.data[i].endStr.split('-')[2] + '日结束' ;
        }
        $('.activities').append('<div class="item" clstag="pageclick|keycount|2015071513|1" data-type="'+json.data[i].type+'" data-filmid="'+json.data[i].filmId+'" data-piclisturl="'+json.data[i].picListurl+'" data-filmprice="'+json.data[i].filmPrice+'" data-link="'+json.data[i].link+'" data-activitystatus="'+json.data[i].activityStatus+'"><img src="'+json.data[i].picUrl+'"><span class="mask c'+json.data[i].activityStatus+'">'+json.data[i].activityStatusDesc+'</span><p class="desc"><span class="fleft">'+_timeTxt+'</span><span class="fright">'+json.data[i].desc+'</span></p>'+(json.data[i].activityStatus == 3 ? '<div class="i-overlay"></div>' : '')+'</div>');
      }
      $('.item').on('tap',function(){
        if( $(this).data('activitystatus') == 1 ){
          if( $(this).data('type') == 2 ){ //链接
            location.href = $(this).data('link');
          }else { //优惠券聚合
            sessionStorage.filmId = $(this).data('filmid');
            sessionStorage.filmPrice = $(this).data('filmprice');
            sessionStorage.picListurl = $(this).data('piclisturl');
            location.href = '/activities_detail.html?filmid='+$(this).data('filmid')+'&filmprice='+$(this).data('filmprice')+'&piclisturl='+$(this).data('piclisturl');
          }
        }
      });
    }
  },
  error: function(xhr, type) {
    showTip('数据加载失败，请重新尝试！');
  }
});