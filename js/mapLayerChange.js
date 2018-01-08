/*--------------------------------------------初始化地图---------------------------------------------*/
var obj = readData('USER_KEY');
var data;
var token = obj.token;
var mobile = obj.mobile;
$("#name").text(obj.name);
var tempLayerAllList = [];
var attr_x;
var attr_y;
window.lists = [];
var page = 1,
    lists_temp = [],
    lists_layers = [],
    pageSize = 5,
    lists;
/*
 * 关于地图图层切换逻辑
 * 现有图层包括摄像头图层、车辆图层、电子地图、影像地图、矢量绘制图层等
 * 各个图层层级大小以addlayer后在图层数组中大小
 * 摄像头车辆图层相关获取数据操作不冲突
 * 图层隐藏显示，以及矢量选择状态激活与不激活
 * */

var list_types = []; // 所有图层类别

// var $list = $('#list_show');
var $ouls = $('.lists_icon');
var $oul = $('.layerContent ul');
var $camList = $("#cam-list");

//获取各个图层中的的数据展现在左侧的导航栏
function show(infos) {
    console.log(infos);
    var $camHeader = $(".cam_header");
    var $btn = $('<button></button>');

    for (var i = 0; i < infos.length; i++) {
        var $li = $('<li></li>');
        var $Li = $("<li></li>");
        var $img = $('<img/>');
        var $input = $('<input/>');
        var $label = $('<label></label>');
        var $span = $('<span></span>');

        $li.attr({"class": 'layerLi'});
        $input.attr({
            type: 'checkbox',
            checked: 'checked',
            onclick: "layerShow(" + infos[i].type_id + ")",
            id: "checked_" + i
        });
        $label.append($input, $("<span></span>"));
        $span.attr("class", "name");
        $span.append("" + infos[i].type_name);

        $li.attr({"id": "layer" + i});
        $li.append($label, $span);
        $oul.append($li);

        //加载图片的
        $img.attr({src: "" + infos[i].img_path, alt: ""});
        $ouls.append($("<li></li>").append($img).attr({
            "class": "lists_content",
            "onclick": "alerted()"
        }));
        $camHeader.append($("<span></span>").append('' + infos[i].type_name));

    }
}

var $oUl = $(".lists_icon");
var $dot = $(".dot_1");
var $dot2 = $(".dot_2");
$dot.click(function () {
    var t = $oUl.scrollTop();
    $oUl.animate({"scrollTop": t - 50}, 200)
});
$dot2.click(function () {
    var distance = $oUl.scrollTop();
    $oUl.animate({"scrollTop": distance + 50}, 200);
});
var showTo = true;
var $pop = $("#cam_list");
function alerted() {
    if (showTo) {
        $pop.css({"display": "block"});
        showTo = false;
    } else {
        $pop.css({"display": "none"});
        showTo = !showTo;
    }
}


//创建图层数组

//摄像头全部图层
function getAllCameraLayers() {
    totalCameraLayers = [];
//    totalCameraLayers = totalCameraLayers.concat(vectorLayers);
    totalCameraLayers = totalCameraLayers.concat(vectorPhotos);
    return totalCameraLayers;
}

/*--------------------------初始化地图对象------------------------------------*/
function init() {
    map = new SuperMap.Map("map", {
        //添加控件
        controls: [
            new SuperMap.Control.MousePosition(),
            new SuperMap.Control.Navigation(),
            new SuperMap.Control.ScaleLine({
                isImperialUnits: false
            }),
            new SuperMap.Control.LayerSwitcher()
        ],
        //地图所有图层都被当做叠加图层来使用。将其设置成true的话，那么就不会出现叠加的问题
        allOverlays: false,
        maxZoom:7
    });

    layerMap = new SuperMap.Layer.TiledDynamicRESTLayer("西城", urlMap, null, {maxResolution: "auto"}, {
        transparent: true,
        cacheEnabled: false   //是否使用服务器的缓存
    });

    layerMap.events.on({"layerInitialized": addLayer});
    //获取摄像头类别
    var cameraTypesArray = getCameraTypes();
    initCameraVectorLayer_Cluster(ret);
    InitAllLayerData();
    InitAllVectorLayersWithData_Cluster();
    // getListsById(undefined, list_types);
    // getAllLists(undefined, lists_temp);


    //获取摄像头信息


    //初始化地图图层
    //参数解释：西城是图层的表示名称，urlMap是图层的服务地址，null这里应该设置的是url上的可选参数,maxResolution是设置的最大分辨率

    /*---------------------------搜索定位-------------------------------*/
    markers = new SuperMap.Layer.Markers("Markers");
    vectorSearch = new SuperMap.Layer.Vector("vectorSearch", {
        styleMap: new SuperMap.StyleMap(
            new SuperMap.Style({
                fillColor: "rgba(20,88,167,.5)",
                strokeColor: "#1458a7",
                strokeWidth: 2,
                graphicZIndex: 1
            })
        )
    });

    /*---------------------------摄像头图层,矢量图层-------------------------------*/
    //构建矢量覆盖物图层。
    vectors = new SuperMap.Layer.Vector("vectors");
    var total = [];
    //创建一个矢量选择要素的控件，在指定图层上单击鼠标选择矢量要素.说白了它就是一个控件。
    all = getAllCameraLayers();
    all = all.concat(AllSelfDefinedLayers);

    selectFeature = new SuperMap.Control.SelectFeature(all,
        {
            callbacks: {
                over: function (e) {
                    console.log(e.layer.features); //这个图层的所有的数目
                    onFeatureHovered(e);
                },
                out: function (e) {
                    closeTabsInfoWin(e);
                },
                click: function (e) {
                    onFeatureSelected(e);
                },
                dblclick: function () {
                    return false;
                }
            },
            hover: false
        }, {allowSelectTheSameFeature: true});


    map.addControls([drawCricle, drawPolygon, drawLine, drawLine1, drawBounds, selectFeature]);

    // //初始化摄像头属性
    getCameraAttr();
    getLayerDataAttr();
    //
    // //初始化警车属性
    // getCarAttr();

    /*---------------------------鼠标滚轴监听事件-------------------------------*/
    if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', mousewheelupdate, false);

    }//W3C
    window.onmousewheel = document.onmousewheel = mousewheelupdate;//IE/Opera/Chrome

}
//标记
// function addData() {
//     // markerLayer.removeMarker(marker);
//     var size = new SuperMap.Size(50,50);
//     var offset = new SuperMap.Pixel(-(size.w/2), -size.h);
//     var icon = new SuperMap.Icon('theme/images/marker.png', size, offset);
//     marker =new SuperMap.Marker(new SuperMap.LonLat(116.3,39.9),icon) ;
//     console.log(marker)
//     markerLayer.addMarker(marker);
// }
/*--------------------------将影像地图添加到底图上------------------------------------*/
function addLayer() {
    //初始化影像图层
    photoMap = new SuperMap.Layer.TiledDynamicRESTLayer("影像", urlPhotoMap, null, {maxResolution: "auto"}, {
        transparent: true,
        cacheEnabled: false
    });
    photoMap.events.on({"layerInitialized": addLayerPhotomap});
    // addLayerPhotomap()
    //设置中心点，指定放缩级别。
    //map.setCenter(new SuperMap.LonLat(500377.96 , 305971.1), jb);
}
function addLayerPhotomap() {
    layerMap.isBaseLayer = true;  //设置基础图层，也就是电子图层
    map.addLayers(getAllCameraLayers());
    // 摄像头以外的图层
    map.addLayers(AllSelfDefinedLayers);
    map.addLayers([layerMap, photoMap, pointLayer, lineLayer, resultLayer, vectorSearch, lineLayer1, vectorLayer1, drowLayer, drawLayer1, drowLayer1, markers]);


    photoMap.setVisibility(false);
    // for (i = 0; i < vectorPhotos.length; i++) {
    //     vectorPhotos[i].setVisibility(true);
    // }
    map.setCenter(new SuperMap.LonLat(500377.96, 305971.1), jb);//jb最大是8最小是0，这个值是用来控制缩放的比例

    getCameraInfo(undefined, ret);

    addFeaturesToSelfDefinedLayers();
    // 初始化地图对象。
    // 初始化警车信息
    // getCarInfo();

    selectFeature.activate();
    // for (var i = 0; i < vectorPhotos.length; i++) {
    //     vectorPhotos[i].setVisibility(true);
    // }
    //
    // for( var i = 0 ; i < AllSelfDefinedLayers.length ; i++ )
    //     AllSelfDefinedLayers[i].setVisibility(true);
}
//切换图层的时候，执行此方法


function changeMap() {
    if (bt == false) {
        layerMap.setVisibility(false);
        photoMap.setVisibility(true);
        map.setBaseLayer(photoMap);
        $('.photoMap>img').attr('src', './images/map.png');
        $('.camList>img').attr('src', './images/camera-list-photo.png');
        $('.carList>img').attr('src', './images/car-list-photo.png');
        $('.layerList>img').attr('src', './images/layer-list-photo.png');
        bt = true;
        //区分影像地图与普通地图绘制颜色
        drawColor = "white";
    } else if (bt == true) {
        layerMap.setVisibility(true);
        photoMap.setVisibility(false);
        map.setBaseLayer(layerMap);
        $('.h-line').show();
        $('.camList>img').attr('src', './images/camera-list.png');
        $('.carList>img').attr('src', './images/car-list.png');
        $('.layerList>img').attr('src', './images/layer-list.png');
        $('.photoMap>img').attr('src', './images/photoMap.png');
        bt = false;
        //区分影像地图与普通地图绘制颜色
        drawColor = "#3c763d";
    }
}

/*********************5s refresh car layer*****************************/
// window.carRefreshInterval = setInterval(function(){
//     console.log("auto refresh car");
//     console.log("auto refresh car");
//     window.car = [];
//     getCarInfo();
//     layerCarPhoto.redraw();
//     layerCar.redraw();
// },5000);

/*----------------------------------------控制图层显示隐藏-----------------------------------*/
/*
 * 定义全局变量区分图层加载
 * layerFlagNum
 * 0 都不加载    1 摄像头加载  2 车辆加载  3 车辆和摄像头都加载
 */

function layerShow(type) {

    types(type)
    //这里的type就是动态添加进去的type_id
}

/*--------------------------------------切换摄像头、警车列表、图层切换-------------------------------------*/
function changeCameraList() {
    if ($('#cam_list').css('display') == 'none') {

        $('.carList').css({'top': '57%', 'z-index': '2'});
        if ($('#car_list').css('display') == 'block') {
            $('#car_list').css({'top': '61%', 'z-index': '2'})
        }
    } else {
        $('.carList').css({'top': '28%', 'z-index': '2'})
        if ($('#car_list').css('display') == 'block') {
            $('#car_list').css({'top': '32%', 'z-index': '2'})
        }
    }
    $('.message').hide();
    $('#video').hide();
    $('#layer_list').hide();
    $('#cameradetailsWin').hide();
}
function changeCarList() {
    if ($('#cam_list').css('display') == 'none') {
        $('.carList').css({'top': '28%', 'z-index': '2'});
        $('#car_list').css({'top': '30%', 'z-index': '1'})
    } else {
        $('.carList').css({'top': '57%', 'z-index': '2'});
        $('#car_list').css({'top': '60%', 'z-index': '1'})
    }
    $('.message').hide();
    $('#video').hide();
    $('#layer_list').hide();
    $('#cameradetailsWin').hide();
}
function changeLayer() {
    if ($('.layerList>img').attr('src') == './images/layer-list.png') {
        $('.layerList>img').attr('src', './images/layer-list-on.png');
    } else if ($('.layerList>img').attr('src') == './images/layer-list-on.png') {
        $('.layerList>img').attr('src', './images/layer-list.png');
    } else if ($('.layerList>img').attr('src') == './images/layer-list-photo.png') {
        $('.layerList>img').attr('src', './images/layer-list-on-photo.png');
    } else if ($('.layerList>img').attr('src') == './images/layer-list-on-photo.png') {
        $('.layerList>img').attr('src', './images/layer-list-photo.png');
    }
    if ($("#layer_list").css('display') === 'none') {
        $('.carList').css({'top': '28%', 'z-index': '2'})
    }
    $('.message').hide();
    $('#video').hide();
    $('#cam_list').hide();
    $('#car_list').hide();
    $('#cameradetailsWin').hide();
}
/*--------------------------滚轮滑动时纠正弹窗位置------------------------------------*/

function mousewheelupdate(e) {  //0<jb<8
    // console.log(e.wheelDelta);  //e.wheelDelta>0向上滚：向下滚
    if (e.wheelDelta > 0) {
        if (jb == map.getNumZoomLevels() - 1) {
            fla = true
        }
        if (jb < map.getNumZoomLevels() - 1) {
            jb++;
            var fla = false
        }

    } else {
        if (jb > 0) {
            jb--;
            fla = false;
        }
        if (jb == -1) {
            fla = true
        }

    }
    if (jb == map.getZoom() && fla == false) { //map.getZoom获取当前缩放比例的级别
        updatePop();
    }
    if (jb == 0) {

    }
    if (jb != map.getZoom()) {
        jb = map.getZoom();
    }
}
function updatePop() {
    $('#menuInfo').css({
        'left': parseInt($('#menuInfo').css('left')) + 36 + "px",
        'top': parseInt($('#menuInfo').css('top')) - 36 + "px",
        'width': '105px',
        'height': '185px',
        'border': '1px solid #999',
        'box-shadow': '2px 2px 12px rgba(0,0,0,.3)',
        'background': 'rgba(255,255,255,.9)',
        'cursor': ' pointer'
    });
    $('#tabsInfo1').css({
        'left': parseInt($('#tabsInfo1').css('left')) + 36 + "px",
        'top': parseInt($('#tabsInfo1').css('top')) - 36 + "px",
        'width': '280px',
        'border': '1px solid #999',
        'box-shadow': '2px 2px 12px #999',
        'background': 'rgba(255,255,255,.9)',
    });
    $('#tabsInfo').css({
        'left': parseInt($('#tabsInfo').css('left')) + 36 + "px",
        'top': parseInt($('#tabsInfo').css('top')) - 36 + "px",
        'width': '280px',
        'border': '1px solid #999',
        'box-shadow': '2px 2px 12px #999',
        'background': 'rgba(255,255,255,.9)',
    });
    $('#tabsInfoCar1').css({
        'left': parseInt($('#tabsInfoCar1').css('left')) + 36 + "px",
        'top': parseInt($('#tabsInfoCar1').css('top')) - 36 + "px",
        'width': '280px',
        'border': '1px solid #999',
        'box-shadow': '2px 2px 12px #999',
        'background': 'rgba(255,255,255,.9)',
    });
    $('#tabsInfoCar').css({
        'left': parseInt($('#tabsInfoCar').css('left')) + 36 + "px",
        'top': parseInt($('#tabsInfoCar').css('top')) - 36 + "px",
        'width': '280px',
        'border': '1px solid #999',
        'box-shadow': '2px 2px 12px #999',
        'background': 'rgba(255,255,255,.9)',
    });
    $('#featureShadow').css({
        'left': parseInt($('#featureShadow').css('left')) - 25 + "px",
        'top': parseInt($('#featureShadow').css('top')) - 25 + "px",
        'box-shadow': '2px 2px 12px #AFEEEE',
        'width': '50px',
        'height': '50px',
        'border-radius': '50%',
        'background': '#1458a7',
        'opacity': '.2',
        'z-index': '3329'
    });
    $('#featureShadow1').css({
        'left': parseInt($('#featureShadow1').css('left')) - 25 + "px",
        'top': parseInt($('#featureShadow1').css('top')) - 25 + "px",
        'width': '50px',
        'height': '50px',
        'border-radius': '50%',
        'background': '#1458a7',
        'opacity': '.2',
        'z-index': '3329'
    });
    $('#featureShadowCar').css({
        'left': parseInt($('#featureShadowCar').css('left')) - 25 + "px",
        'top': parseInt($('#featureShadowCar').css('top')) - 25 + "px",
        'box-shadow': '2px 2px 12px #AFEEEE',
        'width': '50px',
        'height': '50px',
        'border-radius': '50%',
        'background': 'rgba(20,88,167,.3)',
        'opacity': '.2',
        'z-index': '3329'
    });
    $('#featureShadowCar1').css({
        'left': parseInt($('#featureShadowCar1').css('left')) - 25 + "px",
        'top': parseInt($('#featureShadowCar1').css('top')) - 25 + "px",
        'width': '50px',
        'height': '50px',
        'border-radius': '50%',
        'background': 'rgba(20,88,167,.3)',
        'opacity': '.2',
        'z-index': '3329'
    });
    $('#cameraSelected').css({
        'left': parseInt($('#cameraSelected').css('left')) - 15 + "px",
        'top': parseInt($('#cameraSelected').css('top')) - 15 + "px",
        'width': '30px',
        'height': '30px',
        'border-radius': '50%',
        'background': '#ff0000',
        'opacity': '.4',
        'z-index': '3329'
    });
    $('#carSelected').css({
        'left': parseInt($('#carSelected').css('left')) - 15 + "px",
        'top': parseInt($('#carSelected').css('top')) - 15 + "px",
        'width': '30px',
        'height': '30px',
        'border-radius': '50%',
        'background': '#ff0000',
        'opacity': '.4',
        'z-index': '3329'
    });
    for (var i = 0; i < cam_selectId.length; i++) {
        $("#" + cam_selectId[i]).css({
            'left': parseInt($("#" + cam_selectId[i]).css('left')) - 15 + "px",
            'top': parseInt($("#" + cam_selectId[i]).css('top')) - 15 + "px",
            'width': '30px',
            'height': '30px',
            'border-radius': '50%',
            'background': 'rgba(20,88,167,.3)',
            'opacity': '.4',
            'z-index': '3329'
        });
    }
    for (var i = 0; i < car_selectId.length; i++) {
        //console.log(cam_selectId)
        $("#" + car_selectId[i]).css({
            'left': parseInt($("#" + car_selectId[i]).css('left')) - 15 + "px",
            'top': parseInt($("#" + car_selectId[i]).css('top')) - 15 + "px",
            'width': '30px',
            'height': '30px',
            'border-radius': '50%',
            'background': 'rgba(20,88,167,.3)',
            'opacity': '.4',
            'z-index': '3329'
        });
    }
}

function numSelect(num) {
    resultLayer.removeAllFeatures();
    $('#searchSelect').val(num)
    buffer_length = num;
    if ($("#search").val() != "" && typeof $("#search").val() == 'string') {
        searchLocation();
    }
    name = num;
    hcQuery();
}
var name3Id = [];
//地名地址模糊查询
$("#search").typeahead({

    source: function (query, process) {
        return $.ajax({
            type: "GET",
            url: "http://11.5.0.39:8090/buffer/myBuffer?url=http://11.5.0.39:8080/dfc/services/geocoding/matching/fuzzy?address=" + $('#search').val() + "&top=20",
            success: function (result) {
                var name2Id = [];
                $(result).find("MatchAddress").each(function (index) {
                    var name = {};
                    name.id = $(this).children("Id").text();
                    name.X = $(this).children("X").text();
                    name.Y = $(this).children('Y').text();
                    name.Name = $(this).children("Name").text();
                    name2Id.push(name.Name);
                    name3Id.push(name)
                });
                return process(name2Id);
            }
        });
    },
    items: 8,
    afterSelect: function (item) {
        for (var i = 0; i < name3Id.length; i++) {
            if (item == name3Id[i].Name) {
                attr_x = name3Id[i].X;
                attr_y = name3Id[i].Y;
            }
        }


    },
    delay: 500
});
function searchLocation() {
    cleans();
    if ($("#search").val() == "") {
        hcQuery();
    } else {
        if (isNaN($('#searchSelect').val())) {
            $('#searchSelect').val('请输入数字')
        } else if ($('#searchSelect').val() == '') {
            searchCircle(attr_x, attr_y, 100)
        } else {
            searchCircle(attr_x, attr_y, $('#searchSelect').val())
        }
    }
}
/*----------------------------定位-----------------------------*/
function searchCircle(x, y, radius) {
    cleans();

    //确定搜索位置的位置信息，用西城规划局代替
    //SuperMap.Size 用来描绘一对高宽值的实例
    var size = new SuperMap.Size(30, 40);
    //依据size创建屏幕坐标
    //SuperMap.Pixel 此类用x, y坐标描绘屏幕坐标
    var offset = new SuperMap.Pixel(-(size.w / 2), -size.h);
    //SuperMap.Icon 创建图标，在网页中表现为div标签中的image标签
    var icon = new SuperMap.Icon('images/markerP.png', size, offset);
    //依据位置和大小初始化标记覆盖物
    imgMarker = new SuperMap.Marker(new SuperMap.LonLat(x, y), icon);
    map.setCenter(new SuperMap.LonLat(x, y), map.getZoom());
    //添加 标记覆盖物 到 标记图层
    markers.addMarker(imgMarker);

    var centerPoint = new SuperMap.Geometry.Point(x, y);
    var circleP = createCircle(centerPoint, radius, 256, 360, 360);
    var circleVector = new SuperMap.Feature.Vector(circleP);
    vectorSearch.addFeatures([circleVector]);

    //从服务端拉取选中的数据
    cameraSelectCircle(x, y, radius, function (cameras) {
        if (layerFlagNum == 2) {
            return
        }
        if (cameras.length > 0) {
            openCameraPanel(cameras);
            saveData('camerasList', cameras);
        } else {
            console.log("no camera selected");
        }
    });
    //汽车查询
    carSelectCircle(x, y, radius, function (cars) {
        if (layerFlagNum == 1) {
            return
        }
        if (cars.length > 0) {
            openCarPanel(cars);
        } else {
            console.log("no car selected");
        }
    });
}
/*----------------------------圆-----------------------------*/
function createCircle(origin, radius, sides, r, angel) {
    var rR = r * Math.PI / (180 * sides);
    var rotatedAngle, x, y;
    var points = [];
    for (var i = 0; i < sides; ++i) {
        rotatedAngle = rR * i;
        x = origin.x + (radius * Math.cos(rotatedAngle));
        y = origin.y + (radius * Math.sin(rotatedAngle));
        points.push(new SuperMap.Geometry.Point(x, y));
    }
    rotatedAngle = r * Math.PI / 180;
    x = origin.x + (radius * Math.cos(rotatedAngle));
    y = origin.y + (radius * Math.sin(rotatedAngle));
    points.push(new SuperMap.Geometry.Point(x, y));

    var ring = new SuperMap.Geometry.LinearRing(points);
    ring.rotate(parseFloat(angel), origin);
    var geo = new SuperMap.Geometry.Collection([ring]);
    geo.origin = origin;
    geo.radius = radius;
    geo.r = r;
    geo.angel = angel;
    geo.sides = sides;
    geo.polygonType = "Curve";
    return geo;
}

//初始化地图
init();
console.log(lists_temp);

// ret[i].photoMap_url
//摄像头底部列表逻辑
function initCameraList(ret) {
    var $camBox = $('.cam_box');
    var $li = $("<li></li>");
    for (var i = 0; i < ret.length; i++) {
        var $img = $('<img />');
        var $span = $('<span></span>');
        $img.attr({"src": "" + ret[i].photoMap_url, "alt": ""});
        $span.append('' + ret[i].name);
        $li.append($img);
        $li.append($span).css({"display": "block"});
    }
    $camBox.append($li);
    $('.camType').css({'display': 'block'})

}
initCameraList(ret);

function initOtherList() {
    var $camBox = $('.cam_box');
    for (var i = 0; i < list_types.length; i++) {
        var $li = $("<li></li>");
        var layers = HM_LayersVector.Get(list_types[i].type_id);
        for (var k = 0; k < layers.length; k++) {
            var $img = $('<img/>');
            var $span = $('<span></span>');
            $img.attr({"src": "" + layers[k].img_path, "alt": ""});
            $span.append('' + layers[k].layer_name);
            $li.append($img);
            $li.append($span).css({"display": "none"});
        }
        $camBox.append($li);
    }
}
initOtherList();
//根据id获取类别列表

function getImageTypes(callbacks) {
// function getLayertypelist(callbacks) {
    var settings = {
        "url": window.urlName + "/layer/layertypelist",
        "method": "POST",
        async: false,
        "data": {
            "mobile": mobile,
            "token": token,
            "page": 1,
            "pageSize": 30
        }
    };
    console.log(settings);
    $.ajax(settings).done(function (res) {
        list_types = res.data.rows;
        console.log(list_types);

        callbacks(list_types)
    })
}

//getImageTypes(show);

function addLayerDataVector() {

}


function addLayerData(data, id) {
    addLayerDataVector(ret, window.cameras);
//  openCameraPanelAll(ret, window.cameras);
}

function getLayerlistbytypeid(id, page) {
    settings = {
        "url": window.urlName + "/layer/layerlistbytypeid",
        "method": "POST",
        async: false,
        "data": {
            mobile: mobile,
            token: token,
            layerTypeId: id,
            page: page,
            pageSize: pageSize
        }
    };
    $.ajax(settings).done(function (data) {
        if (data.code == 200) {
            // 接口有问题,调试用
            // if( Layerlists.length == data.data.rows.length )
            //     return Layerlists;
            if (data.data.rows.length == 0) {
                // return templayerList;
                ;
            } else {
                templayerList = data.data.rows;
                tempLayerAllList.concat(templayerList);
                getLayerlistbytypeid(id, ++page);
            }
        }
        else {
            return;
        }
    });
    return templayerList;

}


function getLayerdatalistbyid(layerid, page) {
    settings = {
        "url": window.urlName + "/layer/layerdatalistbyid",
        "method": "POST",
        async: false,
        "data": {
            mobile: mobile,
            token: token,
            layerId: layerid,
            page: page,
            pageSize: pageSize
        }
    };
    $.ajax(settings).done(function (data) {
        if (data.code == 200) {

            if (data.data.rows.length == 0) {
                //return lists;
                ;
            } else {
                lists = data.data.rows;
                getLayerdatalistbyid(layerid, ++page);
            }
        }
        else {
            console.log("111");
        }
    });
    return lists;

}


//通过type_id获取单个类别的图层列表  这里是获取的所有的类型
function getListsById(page, ids) {
    if (!page) {
        page = 1;
    }
    for (var i = 0; i < ids.length; i++) {
        getLayerInfoByLayerType(ids[i].type_id, page);
        page = 1;
    }

}
console.log(lists_temp);
//获取的是所有图层类型

function InitAllLayerData() {
    // 获取图层类别
    getImageTypes(show);
    console.log(list_types);
    createFrame(list_types);
    // 按类别获取每个图层
    var AllLayers = [];
    for (var i = 0; i < list_types.length; i++) {
        templayerList = getLayerlistbytypeid(list_types[i].type_id, 1);
        HM_LayersVector.Set(list_types[i].type_id, templayerList);
    }
    // 获取每个图层数据


    for (var i = 0; i < list_types.length; i++) {
        templayerList = HM_LayersVector.Get(list_types[i].type_id);
        var HM_tempLayersData = {
            Set: function (key, value) {
                this[key] = value
            },
            Get: function (key) {
                return this[key]
            },
            Contains: function (key) {
                return this.Get(key) == null ? false : true
            },
            Remove: function (key) {
                delete this[key]
            }
        };
        for (var j = 0; j < templayerList.length; j++) {
            var data = getLayerdatalistbyid(templayerList[j].layer_id, 1);
            HM_tempLayersData.Set(templayerList[j].layer_id, data)
        }
        HM_TypeID_LayersData.Set(list_types[i].type_id, HM_tempLayersData);

    }
    console.log(HM_TypeID_LayersData);
    console.log(list_types, HM_LayersVector, HM_TypeID_LayersData);
    openAllPanel(list_types, HM_LayersVector, HM_TypeID_LayersData);
}


function InitAllVectorLayersWithData_Cluster() {
    for (var i = 0; i < list_types.length; i++) {
        var typeStr = list_types[i].type_name;
        var vl = new SuperMap.Layer.ClusterLayer(typeStr);
        AllSelfDefinedLayers.push(vl);
    }
}

function InitAllVectorLayersWithData() {
    for (var i = 0; i < list_types.length; i++) {
        var typeStr = list_types[i].type_name;
        var vl = new SuperMap.Layer.Vector(typeStr);
        AllSelfDefinedLayers.push(vl);
    }
}


function addFeaturesToSelfDefinedLayers() {

    var point_featurePhoto_total = [];

    for (var i = 0; i < list_types.length; i++) {
        var point_featurePhoto = [];
        point_featurePhoto_total[i] = point_featurePhoto;
    }

    for (i = 0; i < list_types.length; i++) {
        var layers = HM_TypeID_LayersData.Get(list_types[i].type_id);
        var layersArray = HM_LayersVector[list_types[i].type_id];
        for (var j = 0; j < layersArray.length; j++) {
            var data = layers.Get(layersArray[j].layer_id);
            for (var k = 0; k < data.length; k++) {
                var pointPhoto = new SuperMap.Geometry.Point(data[k].loc_lan, data[k].loc_lon);
                var featurePhoto = new SuperMap.Feature.Vector(pointPhoto);
                var urlPhoto = layersArray[j].img_path;
                featurePhoto.style = {
                    backgroundGraphic: urlPhoto,
                    fillColor: "transparent",
                    strokeColor: "transparent",
                    pointRadius: 11,
                    graphicOpacity: 1,
                    graphicZIndex: data[i].id
                };
                point_featurePhoto_total[i].push(featurePhoto);
            }
        }
    }


    for (i = 0; i < AllSelfDefinedLayers.length; i++) {
        AllSelfDefinedLayers[i].addFeatures(point_featurePhoto_total[i]);
    }

}


// function assortment(list_types, lists_temp) {
//     for (var i = 0; i < list_types.length; i++) {
//         var LayerId = list_types[i].type_id;
//         for (var j = 0; j < lists_temp.length; j++) {
//             var TypeId = lists_temp[i].type_id;
//             if (LayerId == TypeId) {
//
//             }
//
//         }
//     }
// }
//
//


//根据图层列表的layer_id获取该图层上的所有数据
function getLayerAttrlistbyid(layerID) {
    var dataRet;
    getData = {
        "mobile": mobile,
        "token": token,
        "layerId": layerID,
    };
    $.ajax({
        "url": window.urlName + "/layer/attrlistbyid",
        type: 'POST',
        "data": getData,
        async: false,
        success: function (data) {
            if (data.code == 200) {
                dataRet = data.data.rows;

            }
            else {

            }
        }
    });
}

function getLayerIdLists(id, page) {
    settings = {
        "url": window.urlName + "/layer/layerdatalistbyid",
        "method": "POST",
        async: false,
        "data": {
            mobile: mobile,
            token: token,
            layerId: id,
            page: page,
            pageSize: pageSize
        }
    };
    $.ajax(settings).done(function (data) {
        if (data.code == 200) {
            var lists = data.data.rows;
            if (lists.length == 0) {
                return;
            } else {
                window.lists = window.lists.concat(lists);
                lists_layers = lists_layers.concat(lists);
                console.log(lists_layers);
                getLayerIdLists(id, ++page);
            }
        }

    });
}


function getAllLists(page, ids) {
    if (localStorage.getItem("carExpireTime") &&
        localStorage.getItem("listsExpireTime") >= new Date().getTime() &&
        localStorage.getItem("lists")) {
        window.lists = JSON.parse(localStorage.getItem("lists"));
        addMulVectorLists(JSON.parse(localStorage.getItem("lists")));
        // openCarPanelAll(JSON.parse(localStorage.getItem("lists")));
        return;
    }
    if (!page) {
        page = 1;
    }

    for (var i = 0; i < ids.length; i++) {
        getLayerIdLists(ids[i].layer_id, page);
        page = 1;
    }
    createLayers(list_types, window.lists);
    // openCameraPanelAll(, window.lists);
    localStorage.setItem("lists", JSON.stringify(window.lists));
    localStorage.setItem("listsExpireTime", new Date().getTime() + window.listsCacheTime);
}

//创建矢量图层
var vectorLayers;
function createLayers(ret, lists) {
    for (var i = 0; i < lists.length; i++) {
        vectorLayers[i] = new SuperMap.Layer.Vector(lists[i].layer_name);
    }
}


//搜索框默认逻辑

$('#box').html("" + defaultBufferDistance + 'm');
var $dropDown_add = $(".dropDown_add");
var $searchSelect = $("#searchSelect");
var $drop_lists = $("#dropDown_a");
var $drop_a = $("#dropDown_a a");
var $drop_toggle = $(".dropdown_self");

// for (var i = 0; i < $drop_a.length; i++) {
//     arry.push(parseFloat($drop_a[i].innerHTML));
// }

var bl = 0;
var $drop_lists = $("#dropDown_a");
var $drop_lis = $("#dropDown_a li");
var ls = true
$dropDown_add.click(function () {
    // if ($searchSelect.val() && !isNaN($searchSelect.val())) {
    // if (arry.indexOf(parseFloat($searchSelect.val())) == -1) {
    //     $searchSelect.attr("placeholder", "查询范围" + $searchSelect.val() + "m");
    //     $searchSelect.attr("placeholder", "查询范围" + $searchSelect.val() + "m");
    if (ls) {
        $drop_lists.css({"display": "block"})
        ls = false;
    } else {
        $drop_lists.css({"display": "none"})
        ls = !ls;
    }

    if ($searchSelect.val()) {
        $("#box").html("" + parseFloat($searchSelect.val()));
        $searchSelect.attr("placeholder", "查询范围" + parseFloat($searchSelect.val()) + 'm')
        $("#box").attr("onclick", "numSelect(" + parseFloat($searchSelect.val()) + ")");
    } else {
        return;
    }

    if (localStorage.getItem("distance")) {
        window.distance = JSON.parse(localStorage.getItem("distance"));
        window.distance = parseFloat($searchSelect.val());
        localStorage.setItem("distance", JSON.stringify(window.distance));
        // arry.push(parseFloat($searchSelect.val()));
        defaultBufferDistance = parseFloat($searchSelect.val());
        $('#box').html("" + defaultBufferDistance + 'm');
        $("#box").attr("onclick", "numSelect(" + defaultBufferDistance + ")");
        $searchSelect.val("");
        $searchSelect.attr("placeholder", "查询范围" + defaultBufferDistance + 'm')

    } else {
        window.distance = 0;
        window.distance = parseFloat($searchSelect.val());
        localStorage.setItem("distance", JSON.stringify(window.distance));
        //arry.push(parseFloat($searchSelect.val()));
        defaultBufferDistance = parseFloat($searchSelect.val());
        $("#box").attr("onclick", "numSelect(" + defaultBufferDistance + ")");
        $('#box').html("" + defaultBufferDistance + 'm');
        $searchSelect.val("");
    }

    // }
    // }
    bl = 0;
});

if (localStorage.getItem("distance")) {
    window.distance = JSON.parse(localStorage.getItem("distance"));
    defaultBufferDistance = window.distance;
    // for (var i = 0; i < window.distance.length; i++) {
    //     //arry.push(window.distance[i]);
    // }
    $('#box').html(defaultBufferDistance + 'm');
    $("#box").attr("onclick", "numSelect(" + defaultBufferDistance + ")");
}
//重复代码
if (window.distance) {
    // var dis = arry[arry.length - 1];
    var dis = defaultBufferDistance;
    $searchSelect.attr("placeholder", "查询范围" + dis + "m");
    $("#box").attr("onclick", "numSelect(" + dis + ")");
} else {
    var dis = defaultBufferDistance;
    $searchSelect.attr("placeholder", "查询范围" + dis + "m");
}

$drop_toggle.click(function () {
    if (ls) {
        $drop_lists.css({"display": "block"})
        ls = false;
    } else {
        $drop_lists.css({"display": "none"})
        ls = !ls;
    }

    // if (bl == 0) {
    //     $drop_lists.empty();
    //     console.log(arry);
    //     for (var i = 0; i < arry.length; i++) {
    //         var $li = $("<li></li>");
    //         var $a = $("<a></a>");
    //         $a.append("" + arry[i] + "m").attr("onclick", "numSelect(" + arry[i] + ")")
    //         $li.append($a)
    //         // .append($("<span></span>").addClass('glyphicon glyphicon-cog').css({"margin-left": "20px"})).css({
    //         //     "margin-left": "10px",
    //         //     "display": "inline-block"
    //         // });
    //         $drop_lists.append($li);
    //     }
    // }
    // bl = 1;


    // var str = $("#box").html();
    // str =  str.replace(/[^0-9]+/g, '');
    // $('#box').html("" + defaultBufferDistance + 'm');
    // defaultBufferDistance = $("#box").html();
});

var sum = $("#searchSelect").attr("placeholder").replace(/[^0-9]+/g, '');
name = sum;


// $('.dropdown-menu .glyphicon').each(function(){
//
//     $this = $(this);
//     $this.click(function(){
//         alert('22')
//     })
//
// })
//     // .click(function () {
//     alert('2')
//   $this = $(this);
//     var con = val.replace(/[^0-9]+/g, '');
//     $('#searchSelect').attr("placeholder","查询范围"+con+"m");
// });


//增加弹出列表
var $camType2 = $(".camType2");
var $box = $(".box");
var flagment = true;
var mini = 0;
var $camTypeList = $(".camTypeList");
$camType2.click(function () {

    if (mini == 0) {
        for (var i = 0; i < list_types.length; i++) {
            var $span = $("<span></span>");
            $span.append("" + list_types[i].type_name).attr({'class': 'list'});
            $box.append($span);
        }
    }
    mini = 1;

    if (flagment) {
        $box.css({"display": "block"});
        var $Spans = $('.box span');
        var $lis = $('.cam_box li');
        $Spans.click(function () {
            $this = $(this);
            var index = $Spans.index($this);
            $this.addClass("drop").siblings().removeClass("drop");
            $lis.eq(index).css({"display": "block"}).siblings().css({"display": "none"});

        });

        flagment = false;
    } else {
        $box.css({"display": "none"});
        flagment = !flagment
    }

});


//左侧导航栏的切换
var $lis = $('.lists_icon li');
var $oSpans = $(".cam_header span");
var $lists = $(".cam_footer .list_1");
console.log($lists);
console.log($lis, $oSpans);
$lis.click(function () {
    var $this = $(this);
    var index = $lis.index($this);
    $this.addClass('list_style').siblings().removeClass('list_style');
    $('.cam_header span').eq(index).addClass('list_style').siblings().removeClass('list_style');
    $lists.eq(index).addClass('list_show').removeClass('list_hide').siblings().removeClass('list_show').addClass('list_hide')
});
$oSpans.click(function () {
    var $this = $(this);
    var index = $oSpans.index($this);
    $this.addClass('list_style').siblings().removeClass('list_style');
    $lis.eq(index).addClass('list_style').siblings().removeClass('list_style');
    $lists.eq(index).addClass('list_show').siblings().removeClass('list_show')
    $lists.eq(index).addClass('list_show').removeClass('list_hide').siblings().removeClass('list_show').addClass('list_hide')
});


var $inputs = $('.layerContent input');
var $LayerAll = $("#all-layer");
var $LayerDefault = $("#layer");
$inputs.splice(0, 2);

function typesName(type, name) {
}

function types(type) {
    var islayerChecked = false;
    if (type == 0) {
        isShow = false;
        var checked = "";
        if ($LayerAll.prop("checked")) {
            isShow = true;
            checked = "checked";
            layerFlagNum = 0;
        }

        for (var i = 0; i < vectorPhotos.length; i++) {
            vectorPhotos[i].setVisibility(isShow);
        }

        for (var i = 0; i < AllSelfDefinedLayers.length; i++) {
            AllSelfDefinedLayers[i].setVisibility(isShow);
        }

        $inputs.each(function () {
            $this = $(this);
            $LayerAll.prop("checked", checked);
            $LayerDefault.prop("checked", checked);
            $this.prop("checked", checked)
        })

    } else if (type == 1) {
        isShow = false;
        checked = "";
        if ($LayerDefault.prop("checked")) {
            isShow = true;
            checked = "checked";
            layerFlagNum = 1;
        }


        $LayerDefault.prop("checked", checked);
        for (var i = 0; i < vectorPhotos.length; i++) {
            vectorPhotos[i].setVisibility(isShow);
        }


    }
    else {
        for (var i = 0; i < $inputs.length; i++) {
            if ($inputs[i].checked == true) {
                AllSelfDefinedLayers[i].setVisibility(true)
            }
            else {
                AllSelfDefinedLayers[i].setVisibility(false);
            }
        }
    }

    var sum = 0;
    for (var i = 0; i < $inputs.length; i++) {
        if ($inputs[i].checked == true)
            sum++;
    }

    if (sum == $inputs.length) {
        islayerChecked = true;
        layerFlagNum = type;
    }

    if ($LayerDefault.prop("checked") && islayerChecked) {
        $LayerAll.prop("checked", "checked");
    }
    else {
        $LayerAll.prop("checked", "");
    }
}
//动态生成左侧点击弹出框


function createFrame(list_types) {
    console.log(list_types);
    var $cam_footer = $(".cam_footer");
    for (var i = 0; i < list_types.length; i++) {
        var $div = $("<div></div>");
        $div.addClass('list_1 list_hide');
        //导出
        $div.append($("<div></div>").append($("<span></span>").attr("margin-left", "22px").addClass('Exele').attr("onclick", "excle(" + list_types[i].type_name + ")").css({
            "cursor": "pointer",
            "margin-left": "4px"
        })).append($("<img>").attr("src", "images/Exele-out.png").css({"background-color": "rgb(20,88,167)"})).append($("<span></span>").append('导出')));
        //下拉框
        var $search = $("<div></div>");
        $search.addClass("searchCam");
        var $ul = $("<ul></ul>");
        $ul.addClass("nav navbar-nav navbar-nav3").append($("<li></li>").addClass("dropdown").css({
            "text-align": "center",
            "height": "30px",
            "background": "white",
            "border-radius": "5px 0 0 5px",
            "border": "1px solid #1458a7"
        }).append($("<a></a>").css({
            "padding": "0 10px",
            "display": "inline-block"
        }).attr({
            "onclick": "openCamSettings()",
            "data-toggle": "dropdown"
        }).addClass("dropdown-toggle").append($("<strong></strong>").addClass("caret"))).append($("<input>").attr({
            "id": "searchCamSelect",
            "type": "text",
            "placeholder": "请选择" + list_types[i].type_name + "属性",
            "value": ""
        }).append($("<ul></ul>").addClass("dropdown-menu").attr("id", "menuCamSearch"))));
        $search.append($ul);

        //搜索框
        $search.append($("<span></span>").addClass("input-group-btn").attr("aria-hidden", "true").append($("<button></button>").attr({
            "type": "button",
            "onclick": "camSearchSettings()",
            "aria-label": "Left Align"
        }).addClass("btn btn-default btn-search").append($("<span></span>").addClass("glyphicon glyphicon-search").attr("aria-hidden", "true"))));

        $div.append($search);

        //添加jquery属性插件
        $div.append($("<div></div>").attr("id", "treeview" + i).css({
            "overflow-y": "scroll",
            "margin-left": "12px",
            "height": "62%",
            "width": "90%",
            "border": "2px solid #1458a7"
        }));
        $cam_footer.append($div);

    }
}

function LayerDataSelected(data, layer) {
    if (!layerFlagNum) {
        return;
    }
    console.log(data);
    state = true;
    // data = JSON.parse(data);
    //清除弹窗
    map.removeAllPopup();
    $('#Polygon1').remove();
    $('#cejuPopup').remove();
    $('#huzhiPopup').remove();
    $('#Polygon').remove();
    $('#circlePopup1').remove();
    $('#box').remove();
    // cleanLayers();
    $('#cameraSelected').remove();
    cameraHighlight('cameraSelected', data.loc_lan, data.loc_lon, map);
    // cam_info = camera;
    var feature = {};
    feature.style = {};
    // added by riham 1226
    feature.layer = {};
    feature.layer.name = layer.layer_name;
    feature.style.backgroundGraphic = layer.img_path;
    feature.geometry = {};
    feature.geometry.x = data.loc_lan;
    feature.geometry.y = data.loc_lon;
    onFeatureHovered(feature);
    map.setCenter(new SuperMap.LonLat(data.loc_lan, data.loc_lon), map.getZoom());
}

//初始化除了摄像头以外的列表
var $spanes = ($('.cam_header span'));
function openAllPanel(list_types, HM_LayersVector, HM_TypeID_LayersData) {
    var $spanes = ($('.cam_header span'));
    for (var i = 1; i < $spanes.length; i++) {
        var val = $spanes[i].innerHTML;
        for (var f = 0; f < list_types.length; f++) {
            if (val == list_types[f].type_name) {
                var total = [];
                var totalIndex = 1;
                var allDatas = [];
                var layers = HM_TypeID_LayersData.Get(list_types[f].type_id);
                var layersArray = HM_LayersVector[list_types[f].type_id];

                var all = {
                    text: '全部',
                    href: 'javascript:;',
                    tags: allDatas.length,
                    state: {expanded: true},
                    selectable: true,
                    nodes: Array()
                };
                total[0] = all;

                for (var j = 0; j < layersArray.length; j++) {
                    var data = layers.Get(layersArray[j].layer_id);
                    var config = Array();
                    var item = {
                        text: layersArray[j].layer_name,
                        data1: layersArray[j].layer_id,
                        href: 'javascript:;',
                        tags: data.length,
                        state: {expanded: false},
                        selectable: true,
                        nodes: Array()
                    };
                    total[totalIndex] = item;


                    for (var k = 0; k < data.length; k++) {
                        var temp = {};
                        temp.text = "名称:" + data[k].loc_lan;
                        var data11 = HM_TypeID_LayersData.Get(list_types[f].type_id).Get(layersArray[j].layer_id)[k];

                        temp.href = "javascript:LayerDataSelected(" + JSON.stringify(HM_TypeID_LayersData.Get(list_types[f].type_id).Get(layersArray[j].layer_id)[k]) + "," + JSON.stringify(HM_LayersVector[list_types[f].type_id][j]) + ");";
                        total[totalIndex].nodes.push(temp);
                        total[0].nodes.push(temp);
                    }
                    allDatas = allDatas.concat(data);
                    totalIndex++;
                }


                config = total;

                $('#treeview' + f).treeview({
                    color: "#428bca",
                    expandIcon: 'glyphicon glyphicon-chevron-right',
                    collapseIcon: 'glyphicon glyphicon-chevron-down',
                    data: config,
                    enableLinks: true,
                    highlightSelected: true
                });

            }
        }
    }
}

//进行查询时，进行列表替换
function openAllListPanel(list_types, HM_LayersVector, HM_TypeID_LayersData) {

}


//导出


















function openCameraPanel(ret, cameras) {
//  map.removeAllPopup()
    saveData('camerasList', cameras);
    var config = Array();
    var total = {
        text: '全部',
        href: 'javascript:;',
        tags: cameras.length,
        state: {expanded: true},
        selectable: true,
        nodes: Array()
    };//全部

    var every = [];
    every.push(total);
    for (var i = 0; i < ret.length; i++) {
        var item = {
            text: ret[i].name,
            href: 'javascript:;',
            tags: cameras.length,
            selectable: true,
            nodes: Array()
        };
        every.push(item);

    }
    ;
    cam_selectId = [];
    for (var i = 0; i < cameras.length; i++) {
        var temp = {};
        temp.text = "名称:" + cameras[i].cam_name; //名称：camera_60
        temp.href = "javascript:cameraSelected('" + JSON.stringify(cameras[i]) + "');";
        addPopUpCircle('cam' + cameras[i].cam_id,
            cameras[i].cam_BJ_X,
            cameras[i].cam_BJ_Y, map, 'rgba(20,88,167,.3)', '30', '30', 15, 15);
        total.nodes.push(temp);
        cam_selectId.push('cam' + cameras[i].cam_id);
        for (var j = 0; j < every.length; j++) {
            if (every[j].text == cameras[i].cam_category) {
                every[j].nodes.push(temp)
            }

        }
    }
    config = every;
    $('.list_all').css({"display": "block"});
    if ($('#cam_list').css('display') == 'none') {
        $('.carList').css({'top': '28%', 'z-index': '2'})
        $('#car_list').css({'top': '30%', 'z-index': '1'})
    } else {
        $('.carList').css({'top': '57%', 'z-index': '2'})
        $('#car_list').css({'top': '60%', 'z-index': '1'})
    }
    //$('#treeviewCam').empty();
    // $("#treeviewCam ").hide();
    $('#treeviewCam').treeview({
        color: "#428bca",
        expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
        data: config,
        enableLinks: true,
        highlightSelected: true
    });

}






