//嵌入工具库
__inline('common/util.js');
//显示京东M端通用头
if(!isWeixin()){
  loadHB('订单支付成功');
}else{
  document.querySelector('#m_common_header').remove();
}
//获得url参数
function getUrlParam(name, url){
    url = url || location.href;
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) { 
        return null; 
    }
    return results[1] || '';
}
function log(url){
    var date = new Date();
    var n = "log__" + date.getTime();
    var c = window[n] = new Image();
    c.onload = (c.onerror = function () {
        window[n] = null;
    });
    c.src = 'http://m.movie.jd.com/images/tj.95f5a4b2.gif'+url;
    c = null;
}
document.querySelector('#payAmount').innerHTML = getUrlParam('amount');
log('?erpid='+getUrlParam('erpid'));
localStorage.submitSuc = '';