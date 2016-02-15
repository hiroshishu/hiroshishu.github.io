
function parseStr( str, substr, delim ){
    var start = str.indexOf( substr + '=' );
    if( start === -1 ) return '';

    var end = str.indexOf( delim, start );
    if( end === -1 ){
        end = str.length;
    }

    var value = str.substring( start + substr.length + 1, end ),
        reg = /select |update |delete |truncate |join |union |exec |insert |drop |count |script|>|</i; //去除SQL注入和XXS攻击

    return decodeURIComponent( reg.test( value ) ? '' : value );
}


//获取url中的query参数
function getQuery( key ){
    return parseStr( window.location.search, key, '&');
};


//获得url参数
function getUrlParam(name, url) {
  url = url || location.href;
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
  if (!results) {
    return '';
  }
  return decodeURIComponent(results[1]) || '';
}

//拼接url参数字符串
function setUrlParam(obj) {
  var str = '?';
  for (var k in obj) {
    str += k + '=' + encodeURIComponent(obj[k]) + '&';
  }
  return str.replace(/&$/, '');
}

//设置url参数值，ref参数名,value新的参数值
function changeURLPar(url, ref, value) {
  url = url || location.href;
  var str = "";
  if (url.indexOf('?') != -1)
    str = url.substr(url.indexOf('?') + 1);
  else
    return url + "?" + ref + "=" + value;
  var returnurl = "";
  var setparam = "";
  var arr;
  var modify = "0";
  if (str.indexOf('&') != -1) {
    arr = str.split('&');
    for (i in arr) {
      if (arr[i].split('=')[0] == ref) {
        setparam = value;
        modify = "1";
      } else {
        setparam = arr[i].split('=')[1];
      }
      returnurl = returnurl + arr[i].split('=')[0] + "=" + setparam + "&";
    }
    returnurl = returnurl.substr(0, returnurl.length - 1);
    if (modify == "0")
      if (returnurl == str)
        returnurl = returnurl + "&" + ref + "=" + value;
  } else {
    if (str.indexOf('=') != -1) {
      arr = str.split('=');
      if (arr[0] == ref) {
        setparam = value;
        modify = "1";
      } else {
        setparam = arr[1];
      }
      returnurl = arr[0] + "=" + setparam;
      if (modify == "0")
        if (returnurl == str)
          returnurl = returnurl + "&" + ref + "=" + value;
    } else
      returnurl = ref + "=" + value;
  }
  return url.substr(0, url.indexOf('?')) + "?" + returnurl;
}

//删除参数值
function delQueStr(url, ref) {
  url = url || location.href;
  var str = "";
  if (url.indexOf('?') != -1) {
    str = url.substr(url.indexOf('?') + 1);
  } else {
    return url;
  }
  var arr = "";
  var returnurl = "";
  var setparam = "";
  if (str.indexOf('&') != -1) {
    arr = str.split('&');
    for (i in arr) {
      if (arr[i].split('=')[0] != ref) {
        returnurl = returnurl + arr[i].split('=')[0] + "=" + arr[i].split('=')[1] + "&";
      }
    }
    return url.substr(0, url.indexOf('?')) + "?" + returnurl.substr(0, returnurl.length - 1);
  } else {
    arr = str.split('=');
    if (arr[0] == ref) {
      return url.substr(0, url.indexOf('?'));
    } else {
      return url;
    }
  }
}
//判断是否是微信端
function isWeixin() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    return true;
  } else {
    return false;
  }
}
//京东M端通用头开关
function loadHB(title) {
  var sid = '';
  var mchb = new MCommonHeaderBottom();
  var headerArg = {
    hrederId: 'm_common_header',
    title: title,
    sid: sid,
    isShowShortCut: false,
    selectedShortCut: '4'
  };
  mchb.header(headerArg);
}
//统计代码
function statistics(){
  window.jQuery = window.zepto;
  var jaq = jaq || [];
  jaq.push(['account', '']);
  jaq.push(['domain', 'm.movie.jd.com']);
  jaq.push(['erp_account', '']);
  (function () {
      var ja = document.createElement('script');
      ja.type = 'text/javascript';
      ja.async = true;
      ja.src = ('https:' == document.location.protocol ? 'https://cscssl' : 'http://csc') + '.jd.com/joya.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(ja, s);
  })();
}
