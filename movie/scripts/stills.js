//嵌入工具库
__inline('common/util.js');
//显示京东M端通用头
if(!isWeixin()){
  loadHB('图片详情');
}else{
  $('#m_common_header').remove();
}
//加载统计代码
statistics();

var url = getQuery( 'url' );

$('#wrapper img').attr('src', url);