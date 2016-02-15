//嵌入工具库
__inline('common/util.js');

//显示京东M端通用头
if(!isWeixin()){
  loadHB('演员介绍');
}else{
  $('#m_common_header').remove();
}
//加载统计代码
statistics();


function ellipsis( input, limit ) {
    return input.length > limit ? input.substring( 0, limit ) + '...' : input;
}

var workSource = [], actid = getQuery( 'actid' ),
	actors = JSON.parse( sessionStorage.movieActorList );

$.each( actors, function( index, actor ){
	if( actor.actId == actid ){
		$('.actor-info-item figure').css('background-image', 'url(' + actor.jdPhoto + ')');
		$('.actor-info-item .name').text( actor.name );
		$('.actor-info-item .birthday span').text( actor.birthday || '暂无' );
		$('.actor-info-item .astro span').text( actor.constellation || '暂无' );

		if( actor.introduction.length > 100 ) {
			var brief = ellipsis( actor.introduction, 100 );
			$('.actor-brief-content').text( actor.introduction );
			$('.actor-brief-ellipsis').text( brief );
			$('.actor-brief').on('tap', function(){
        	    $('.actor-brief-dropdown b').toggleClass('up');
        	    $('.actor-brief-ellipsis').toggleClass('show');
        	    $('.actor-brief-content').toggleClass('show');
        	});
		} else {
			$('.actor-brief-ellipsis').text( actor.introduction );
			$('.actor-brief-dropdown').hide();
		}

		if( actor.actMovies.length ) {
			$.each( actor.actMovies, function( index, movie ){
				workSource.push('<li><figure style="background-image:url(', movie.jdResourceUrl, ')"></	figure><p>', movie.resourceName, '</p></li>');
			});
		} else {
			$('.actor-work').hide();
		}

		return false;
	} else {
		return;
	}
});

$('.actor-work ul').html( workSource.join('') );