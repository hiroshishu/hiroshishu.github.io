var min_geolocation = (function() {
  var accuracy = 2;
  var isChanged = function() { //经纬度是否改变,true（改变）
    return parseFloat(localStorage.lat).toFixed(accuracy) !== parseFloat(this.lat).toFixed(accuracy) || parseFloat(localStorage.lng).toFixed(accuracy) !== parseFloat(this.lng).toFixed(accuracy);
  };
  var getCityIdByPosition = function() { //根据经纬度获取城市id
    $.ajax({
      type: 'GET',
      url: '/city/position?lat='+this.lat+'&lng='+this.lng,
      // url: '/mock/geolocationInterface.json',
      dataType: 'json',
      context: $('body'),
      success: function(res) {
        if (res.code == 200) {
          responseCityInfo(res.data);
        } else {
          setErrorMsg();
        }
      },
      error: function(xhr, type) {
        setErrorMsg();
      }
    });
  };
  var setPosition = function(position) { //设置经纬度
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    if (localStorage.lat && isChanged()) { //缓存中有经纬度信息并且值有变化
      getCityIdByPosition.apply(this);
    } 
    if(!localStorage.cityId) { //缓存中无城市信息
      localStorage.cityId = '11';
      localStorage.cityName = '北京';
    }
    localStorage.lat = this.lat;
    localStorage.lng = this.lng;
  };
  var setErrorMsg = function() { //获取位置失败
    alert('请开启定位功能！');
  };
  var getGeolocation = function() {
    if(!localStorage.cityId) localStorage.cityId = '11';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setPosition, setErrorMsg);
    } else {
      setErrorMsg();
    }
  };
  getGeolocation();
})();