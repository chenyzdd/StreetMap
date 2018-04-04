
var map;
var markers = [];

// 自定义地图样式
const styles = [
    {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
    }
];
// 自定义感兴趣地点
var locations = [
    {title: '腾讯大厦', location: {lat: 22.540362, lng: 113.934363}},
    {title: '科兴大厦', location: {lat: 22.549305, lng: 113.94455}},
    {title: '科技园', location: {lat: 22.543529, lng: 113.947892}},
    {title: '万利达科技大厦', location: {lat: 22.540428, lng: 113.933665}},
    {title: '特发信息港', location: {lat: 22.550255, lng: 113.9509}},
    {title: '深圳大学体育馆', location: {lat: 22.535623, lng: 113.939809}},
    {title: '深圳大学', location: {lat: 22.53306, lng: 113.932813}},
    {title: '荔香公园', location: {lat: 22.536985, lng: 113.929707}},
    {title: '南山图书馆', location: {lat: 22.534904, lng: 113.922141}}
];

var viewModel;
var infowindow;

/***
 * 生成地区详细信息panel
 */
function createMarker(place, infowindow) {
    var address_list = place.formatted_address.split(' ');

    var content = '<div>' + place.name + '</br>地址： '+ address_list[0] +'</br>邮政编码： '+ address_list[2] +'</br>评论： ';
    if(place.reviews){
        content += '<a href="'+ place.url +'" target="_blank">==> 查看评论</a></br>评分： '+ place.rating +'</div>'
    }else{
        content += '目前暂无评论</div>';
    }
    infowindow.setContent(content);
}

/***
 * 点击获取展示地域详细信息
 * @param marker
 * @param infowindow
 */
function getPlacesDetails(marker) {
    infowindow.setContent('');
    markers = markers.map(function (item) {
        if(item === marker){
            if(marker.getAnimation() !== null){
                infowindow.close(map, marker);
                item.setAnimation(null);
            }else{
                item.setAnimation(google.maps.Animation.BOUNCE);
            }
        }else{
            infowindow.close(map, marker);
            item.setAnimation(null);
        }
        return item;
    });

    infowindow.marker = marker;
    infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
    });
    // 获取地点的placeId
    var request = {
        location: map.getCenter(),
        radius: '50',
        query: marker.title
    };
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, getPlaceId);
    function getPlaceId(data, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var place_id = data[0].place_id;
            function getLocationDetails(place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    createMarker(place, infowindow);
                }else{
                    infowindow.setContent('<div>' + marker.title + '</div>');
                }
            }
            // 通过placeId 获取地点详细信息
            var tmpRequest = {
                placeId: place_id
            };
            service.getDetails(tmpRequest, getLocationDetails);
        } else {
            infowindow.setContent('<div>' + marker.title + '</div>');
        }
    }
    infowindow.open(map, marker);
}

/***
 * 清除标记信息
 */
function removeMark() {
    markers.map(function (marker) {
        marker.setMap(null);
    });
    markers = [];
}

/***
 * 设置标记信息
 */
function setMark() {
    infowindow = new google.maps.InfoWindow();
    for (var i = 0; i < viewModel.filterLocation().length; i++) {

        var position = viewModel.filterLocation()[i].location;
        var title = viewModel.filterLocation()[i].title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);

        marker.addListener('click', function() {
            getPlacesDetails(this);
        });
    }
}

/***
 * google api回调函数
 */
function initMap() {
    viewModel = new AppViewModel();
    ko.applyBindings(viewModel);

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 22.544982, lng: 113.939198},
        zoom: 15,
        styles: styles
    });
    removeMark();
    setMark();
}

/***
 * knockout
 * @constructor
 */
function AppViewModel() {
    var self = this;

    self.filterLocation = ko.observableArray(locations);
    self.filter = ko.observable("");
    self.toggle = ko.observable("关闭");
    self.toggle_class = ko.observable(false);
    self.toggle_sidebar = function (data, event) {
        if(event.target.title === "关闭"){
            // 关闭sidebar
            self.toggle_class(true);
            self.toggle("开启");
        }else if (event.target.title === "开启"){
            // 开启sidebar
            self.toggle_class(false);
            self.toggle("关闭");
        }
        return true;
    };
    self.getLocations = function () {
        var len = locations.length;
        var filter = [];
        if(self.filter() === ""){
            self.filterLocation(locations);
        }else{
            for (var i=0; i<len; i++){
                if(locations[i].title.indexOf(self.filter()) >= 0){
                    filter.push(locations[i])
                }
            }
            self.filterLocation(filter);
        }

        removeMark();
        setMark();
    };
    self.keyGetLocations = function (data, event) {
        if(event.keyCode === 13) {
            self.getLocations();
        }
        return true;
    };
    self.clickLocationInfo = function (data, event) {
        var tempMarker = markers.filter(function (marker) {
            if(marker.title === data.title){
                return marker;
            }
        });
        if(tempMarker.length > 0){
            getPlacesDetails(tempMarker[0]);
        }
        return true;
    }
}
