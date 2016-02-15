//嵌入工具库
__inline('common/util.js');

var title = location.search ? '影院图片' : '剧照';

//显示京东M端通用头
if(!isWeixin()){
  loadHB( title );
}else{
  $('#m_common_header').remove();
}
//加载统计代码
statistics();

var source = [], pics = [];

pics = location.search == "" ? sessionStorage.stagePic.split(',') : sessionStorage.cinemaPic.split(',');

$.each( pics, function( index, pic ){
	source.push('<li><a href="/stills.html?url=', encodeURIComponent( pic ), '"><figure style="background-image:url(', pic, ')"></figure></a></li>');
});

$('.poster-list').html( source.join('') );