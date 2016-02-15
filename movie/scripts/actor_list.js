//嵌入工具库
__inline('common/util.js');

//显示京东M端通用头
if(!isWeixin()){
  loadHB('演员列表');
}else{
  $('#m_common_header').remove();
}
//加载统计代码
statistics();

var source = [], actors = JSON.parse( sessionStorage.movieActorList );

$.each( actors, function( index, actor ){
	source.push('<li class="clearfix"><a href="/actor_info.html?actid=', actor.actId, '"><figure style="background-image:url(', actor.jdPhoto , ')"></figure><span>', actor.name, '</span></a></li>')
});

$('.actor_list').html( source.join('') );