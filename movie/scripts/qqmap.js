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
$('iframe').height($(window).height() - 90 + 'px');
// sessionStorage.cinemaName = '京东商城总部';
// sessionStorage.cinemaAddr = '科创十一街';
// sessionStorage.lng = 39.786519;
// sessionStorage.lat = 116.562978; 
$('iframe').attr('src',unescape('http://apis.map.qq.com/tools/poimarker?marker=coord:'+sessionStorage.lat+','+sessionStorage.lng+';title:'+sessionStorage.cinemaName+';addr:'+sessionStorage.cinemaAddr+'&referer=jingdong&key=BB3BZ-65UH4-MWOUO-XJVFQ-F2Y76-DTF7R'));
