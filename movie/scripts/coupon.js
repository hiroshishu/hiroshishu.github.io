//嵌入工具库
__inline('common/util.js');
//显示京东M端通用头
if(!isWeixin()){
  loadHB('使用优惠券');
}else{
  $('#m_common_header').remove();
}
var couponAmount = 0,
  couponIds = [];
//sessionStorage.couponAmount = 0; //优惠金额
//sessionStorage.couponIds = ''; //已使用的优惠券id
if(!sessionStorage.couponURI){
  location.href = '/home.html';
}
function render(data) {
  var _c1 = data.availableDCoupon.length + data.availableJCoupon.length,
    _c2 = data.unavailableDCoupon.length + data.unavailableJCoupon.length;
  $('.tabs .c1').text(_c1);
  $('.tabs .c2').text(_c2);
  if (_c1 > 0) {
    if (data.availableJCoupon.length > 0) {
      $('#available-coupon').append('<dl class="jc"><dt>京券</dt></dl>');
      for (var i = 0; i < data.availableJCoupon.length; i++) {
        $('#available-coupon .jc').append('<dd><label for="couponId_' + data.availableJCoupon[i].couponId + '"><input type="checkbox" id="couponId_' + data.availableJCoupon[i].couponId + '" class="checkbox" value="' + data.availableJCoupon[i].discount + '"/><label for="couponId_' + data.availableJCoupon[i].couponId + '" class="lab"></label><div><div class="coupon-recomm"><span>京券</span></div><strong>立减' + data.availableJCoupon[i].discount + '</strong></div><p>使用范围：' + data.availableJCoupon[i].couponLimitInfo + '</p><p>有效期至：' + data.availableJCoupon[i].endTime + '</p></label></dd>');
      }
    }
    if (data.availableDCoupon.length > 0) {
      $('#available-coupon').append('<dl class="dc"><dt>东券</dt></dl>');
      for (var j = 0; j < data.availableDCoupon.length; j++) {
        $('#available-coupon .dc').append('<dd><label for="couponId_' + data.availableDCoupon[j].couponId + '"><input type="checkbox" id="couponId_' + data.availableDCoupon[j].couponId + '" class="checkbox" value="' + data.availableDCoupon[j].discount + '" quota="'+data.availableDCoupon[j].quota+'" /><label for="couponId_' + data.availableDCoupon[j].couponId + '" class="lab"></label><div><div class="coupon-recomm"><span>东券</span></div><strong>满' + data.availableDCoupon[j].quota + '减' + data.availableDCoupon[j].discount + '</strong></div><p>使用范围：' + data.availableDCoupon[j].couponLimitInfo + '</p><p>有效期至：' + data.availableDCoupon[j].endTime + '</p></label></dd>');
      }
    }
    $('#available-coupon').append('<div class="btn-wrap center"><a class="submit">确定</a></div>');
  } else {
    $('#available-coupon').html('<div class="pic">优惠券</div><h3>很遗憾</h3><p>您暂无可以使用的优惠券</p>').addClass('no-coupon');
  }
  if (_c2 > 0) {
    if (data.unavailableJCoupon.length > 0) {
      $('#unavailable-coupon').append('<dl class="jc"><dt>京券</dt></dl>');
      for (var k = 0; k < data.unavailableJCoupon.length; k++) {
        $('#unavailable-coupon .jc').append('<dd><div><div class="coupon-recomm"><span>京券</span></div><strong>立减' + data.unavailableJCoupon[k].discount + '</strong></div><p>使用范围：' + data.unavailableJCoupon[k].couponLimitInfo + '</p><p>有效期至：' + data.unavailableJCoupon[k].endTime + '</p></dd>');
      }
    }
    if (data.unavailableDCoupon.length > 0) {
      $('#unavailable-coupon').append('<dl class="dc"><dt>东券</dt></dl>');
      for (var l = 0; l < data.unavailableDCoupon.length; l++) {
        $('#unavailable-coupon .dc').append('<dd><div><div class="coupon-recomm"><span>东券</span></div><strong>满' + data.unavailableDCoupon[l].quota + '减' + data.unavailableDCoupon[l].discount + '</strong></div><p>使用范围：' + data.unavailableDCoupon[l].couponLimitInfo + '</p><p>有效期至：' + data.unavailableDCoupon[l].endTime + '</p></dd>');
      }
    }
  } else {
    $('#unavailable-coupon').html('<div class="pic">优惠券</div><h3>很遗憾</h3><p>您暂无可以使用的优惠券</p>').addClass('no-coupon');
  }
  $('dd input[type=checkbox]').on('change', function() {
    if ($('#available-coupon .jc input[type=checkbox]:checked').length > 0 && $('#available-coupon .dc input[type=checkbox]:checked').length > 0) { //京券东券不可同时使用
      showTip('京券东券不可同时使用！');
      $(this).trigger('click');
      hiddenTip();
    } else if ($('#available-coupon .dc input[type=checkbox]:checked').length > 1) { //只可同时使用一张东券
      showTip('只可同时使用一张东券！');
      $(this).trigger('click');
      hiddenTip();
    } else {
      couponAmount = 0;
      couponIds.length = 0;
      $('#available-coupon input[type=checkbox]:checked').each(function(v, i) {
        couponAmount += parseFloat($(i).val());
        couponIds.push($(this).attr('id').split('couponId_')[1]);
      });
      if ($('#available-coupon .jc input[type=checkbox]:checked').length > 0) {
        sessionStorage.__couponType__ = 'jc';
      } else if ($('#available-coupon .dc input[type=checkbox]:checked').length > 0) {
        sessionStorage.__couponType__ = 'dc';
        sessionStorage.quota = $('#available-coupon .dc input[type=checkbox]:checked').attr('quota');
      } else {
        sessionStorage.__couponType__ = '';
      }
    }
  });
  $('.submit').on('tap', function() {
    sessionStorage.couponAmount = couponAmount;
    sessionStorage.couponIds = couponIds.join('|');
    location.href = '/' + sessionStorage.couponURI + '.html';
  });
  if( sessionStorage.couponIds ){//数据回填
    for(var m = 0; m < sessionStorage.couponIds.split('|').length; m++){
      $('#couponId_'+sessionStorage.couponIds.split('|')[m]).prop('checked','true');
    }
  }
}

function getCoupons() {
  $.ajax({
    type: 'GET',
    // url: '/mock/couponInterface.json',
    url: '/couponlist?totalFee='+sessionStorage.totalFee,
    dataType: 'json',
    success: function(data) {
      if (data.code == 200) {
        $('.loading-wrap').remove();
        var cdata = data.data ? data.data : {availableDCoupon:[],availableJCoupon:[],unavailableDCoupon:[],unavailableJCoupon:[]};
        render(cdata);
      } else {
        showTip('数据加载失败，请重新尝试！');
      }
    },
    error: function(xhr, type) {
      $('.loading-wrap').remove();
      showTip('数据加载失败，请重新尝试！');
    }
  });
}
getCoupons();

function showTip(msg) {
  if ($('.tip-msg').length === 0) {
    $('body').append('<div class="tip-msg none"><span></span></div>');
  }
  $('.tip-msg').removeClass('none').find('span').text(msg);
}

function hiddenTip() {
  clearTimeout(_time);
  var _time = setTimeout(function() {
    $('.tip-msg').addClass('none');
  }, 3000);
}
$('.tabs li').on('tap', function() {
  $(this).addClass('current').siblings('li').removeClass('current');
  $('.coupon-panel').removeClass('current');
  $('#' + $(this).attr('tar') + '-coupon').addClass('current');
});
$('.rule-explain').on('tap', function() {
  $('.popup-overlay').addClass('block');
  $('.popup-wrap').addClass('block');
});
$('.popup-wrap .btn').on('tap', function() {
  $('.popup-overlay').removeClass('block');
  $('.popup-wrap').removeClass('block');
});
