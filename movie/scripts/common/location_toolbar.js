$(document).ready(function() {
	var accuracy = 3;
	var isChanged = function() { //经纬度是否改变,true（改变）
		return localStorage.lat !== this.lat || localStorage.lng !== this.lng;
	};

	function render() {
		if ($('.location-toolbar').length === 0) {
			$('body').append('<div class="location-toolbar"><b class="loc-icon"></b><span class="loc-txt">' + localStorage.cityName + '</span><b class="refresh-btn"></b></div>');
		}
		$('.location-toolbar .refresh-btn').on('tap', getLocation);
	}

	function getLocation() {
		$('.location-toolbar .refresh-btn').off('tap', getLocation);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		} else {
			$('.location-toolbar .refresh-btn').removeClass('rotating');
			$('.location-toolbar .loc-txt').text('定位失败！');
			$('.location-toolbar .refresh-btn').on('tap', getLocation);
		}
		$('.location-toolbar .loc-txt').text('定位中...');
		$('.location-toolbar .refresh-btn').addClass('rotating');
	}

	function showPosition(position) {
		this.lat = parseFloat(position.coords.latitude).toFixed(accuracy);
		this.lng = parseFloat(position.coords.longitude).toFixed(accuracy);
		if (isChanged()) { //经纬度是否变化
			updateLocation();
			localStorage.lat = position.coords.latitude;
			localStorage.lng = position.coords.longitude;
		}
		$('.location-toolbar .refresh-btn').removeClass('rotating');
		$('.location-toolbar .loc-txt').text(localStorage.cityName);
		$('.location-toolbar .refresh-btn').on('tap', getLocation);
	}

	function showError(error) {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				$('.location-toolbar .loc-txt').text('请开启您设备的定位功能');
				break;
			case error.POSITION_UNAVAILABLE:
				$('.location-toolbar .loc-txt').text('定位失败！');
				break;
			case error.TIMEOUT:
				$('.location-toolbar .loc-txt').text('定位超时，请重试！');
				break;
			case error.UNKNOWN_ERROR:
				$('.location-toolbar .loc-txt').text('定位失败！');
				break;
		}
		$('.location-toolbar .refresh-btn').removeClass('rotating');
		$('.location-toolbar .refresh-btn').on('tap', getLocation);
	}
	render();
});