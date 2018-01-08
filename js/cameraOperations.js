/*----------------------------获取摄像头数据信息-----------------------------*/
window.cameras = [];
vectorLayers = [];
vectorPhotos = [];
point_featurePhoto_total = [];
point_features_total = [];
var isSelfLayerItem = false;
var layerDataAttr = ["id", "addtime", "loc_lan", "loc_lon", "uptime", "user_id"];

function getLayerDataAttr() {
    return layerDataAttr;
}

function initCameraVectorLayer(cameraTypes) {
    for (var i = 0; i < cameraTypes.length; i++) {
        var typeStr = cameraTypes[i].name;
        // var vectorLayer = new SuperMap.Layer.Vector( typeStr );
        var vectorPhoto = new SuperMap.Layer.Vector(typeStr);
//        vectorLayers = vectorLayers.concat(vectorLayer);
        vectorPhotos = vectorPhotos.concat(vectorPhoto);
    }
}

function initCameraVectorLayer_Cluster(cameraTypes) {
    for (var i = 0; i < cameraTypes.length; i++) {
        var typeStr = cameraTypes[i].name;
//        var vectorLayer = new SuperMap.Layer.ClusterLayer( typeStr );
        var vectorPhoto = new SuperMap.Layer.ClusterLayer(typeStr);
//        vectorLayers = vectorLayers.concat(vectorLayer);
        vectorPhotos = vectorPhotos.concat(vectorPhoto);
    }
    console.log(cameraTypes);
}

// 获取摄像头类别
function getCameraTypes() {
    var settings = {
        "url": window.urlName + "/camera/getCameraTypes",
        "method": "POST",
        async: false,
        "data": {
            "mobile": mobile,
            "token": token
        }
    };

    $.ajax(settings).done(function (response) {
        ret = response.data.rows;

    });

}
// '球机','半球', '固定枪机', '遥控枪机', '卡口枪机','未知'
var getDate;
var page = 1;
cameras_temp = [];

function getCameraInfoByCameraType(camType, page) {

    getData = {
        "mobile": mobile,
        "token": token,
        "attrName": "cam_category",
        "attrValue": camType,
        "page": page,
        "pageSize": pageSize
    };
    $.ajax({
        "url": window.urlName + "/camera/pclistbyattr",
        type: 'POST',
        "data": getData,
        async: false,
        success: function (data) {
            if (data.code == 200) {
                data = data.data.rows;
                if (data.length == 0) {
                    return;
                }
                else if (data.length > pageSize) {
                    //Error
                }
                else {
                    window.cameras = window.cameras.concat(data);
                    cameras_temp = cameras_temp.concat(data);
                    getCameraInfoByCameraType(camType, ++page);
                }
            }
        }
    });
}

var pageSize = 100;

function getCameraInfo(page, ret) {  //只是获取了一个类型的摄像头

    if (localStorage.getItem("cameraExpireTime") &&
        localStorage.getItem("cameraExpireTime") >= new Date().getTime() &&
        localStorage.getItem("cameras")) {
        window.cameras = JSON.parse(localStorage.getItem("cameras"));
        addMulVector(JSON.parse(localStorage.getItem("cameras")));
        openCameraPanelAll(ret, JSON.parse(localStorage.getItem("cameras")));
        return;
    }

    if (!page) {
        page = 1;
    }

    for (var i = 0; i < ret.length; i++) {
        getCameraInfoByCameraType(ret[i].name, page);
        page = 1;
        cameras_temp = [];
    }
    // console.log(11111111);
    // console.log(window.cameras.length);
    // var tempCameras = makeClusterCameraArray(window.cameras);
    // console.log(11111111);
    // console.log(tempCameras);
    // console.log(11111111);
    // window.cameras = tempCameras;
    console.log(window.cameras)
    addMulVector(ret, window.cameras);
    openCameraPanelAll(ret, window.cameras);
    localStorage.setItem("camerasAllList", JSON.stringify(window.cameras));
    localStorage.setItem("cameraExpireTime", new Date().getTime() + window.cameraCacheTime);

}
/*--------------------------根据摄像头id返回摄像头信息------------------------*/
function selectCamInfoByID(id, callback) {

    for (var i = 0; i < window.cameras.length; i++) {
        if (window.cameras[i].cam_id == id) {
            cam_info = window.cameras[i];
            callback(window.cameras[i]);
            return;
        }
    }
    var getIdData = {
        "mobile": mobile,
        "token": token,
        "cam_id": id
    };
    $.ajax({
        url: window.urlName + "/camera/info",
        type: 'POST',
        data: getIdData,
        async: true,
        success: function (data) {
            if (data.code == 200) {
                cam_info = data.data.rows[0];
                callback(cam_info);
            } else {
                console.log(data.data.error);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest, textStatus, errorThrown);
        }
    });
}


/*------------------------------获取摄像头属性-------------------------------*/
function getCameraAttr() {
    //    初始化属性
    var settings = {
        "url": window.urlName + "/camera/getCameraAttrs",
        "method": "POST",
        "data": {
            mobile: mobile,
            token: token,
            type: -1
        }
    }
    $.ajax(settings).done(function (response) {
        if (response.code == 200) {
            console.log(response);
            camera_setting = response.data.rows;
            // console.log(camera_setting, 'camera_setting的值    ')
            // console.log(camera_setting[1].attr_desc)
        } else {
            console.log(response.data.error);
        }

    });
}

/* -------------------------------------添加摄像头矢量图层-------------------------------------------*/
function addMulVector(ret, data) {
    var point_features_total = [];
    var point_featurePhoto_total = [];
    console.log(ret);

    for (var i = 0; i < ret.length; i++) {
        // var point_features = [];
        var point_featurePhoto = [];
        // point_features_total[i] = point_features;
        point_featurePhoto_total[i] = point_featurePhoto;
    }

    for (i = 0; i < data.length; i++) {
        var point = new SuperMap.Geometry.Point(data[i].cam_BJ_X, data[i].cam_BJ_Y);
        var pointPhoto = new SuperMap.Geometry.Point(data[i].cam_BJ_X, data[i].cam_BJ_Y);
        // var feature = new SuperMap.Feature.Vector(point);
        var featurePhoto = new SuperMap.Feature.Vector(pointPhoto);
        var camTypeStr = data[i].cam_category;

        // var url ;
        var urlPhoto;
        for (var k = 0; k < ret.length; k++) {
            if (ret[k].name == data[i].cam_category) {
                // url = ret[k].url;
                urlPhoto = ret[k].photoMap_url;
            }

        }

        // feature.style = {
        //     backgroundGraphic: url,
        //     fillColor: "transparent",//内填充
        //     strokeColor: "transparent",//外边线
        //     pointRadius: 11,//不同图层半径不同按参数r传递
        //     graphicZIndex: data[i].cam_id,
        //     dataName: data[i].cam_name,
        //     dataAddr: data[i].cam_addr,
        //     graphicOpacity: 1
        // };

        featurePhoto.style = {
            backgroundGraphic: urlPhoto,
            fillColor: "transparent",//内填充
            strokeColor: "transparent",//外边线
            pointRadius: 11,//不同图层半径不同按参数r传递
            graphicZIndex: data[i].cam_id,
            dataName: data[i].cam_name,
            dataAddr: data[i].cam_addr,
            graphicOpacity: 1
        };
        //添加点特征到点特征数组
        for (j = 0; j < vectorPhotos.length; j++) {
            if (vectorPhotos[j].name == camTypeStr) {
//                    point_features_total[j].push(feature);
                point_featurePhoto_total[j].push(featurePhoto);
            }
        }
    }


    for (i = 0; i < vectorPhotos.length; i++) {
//        vectorLayers[i].addFeatures(point_features_total[i]);
        vectorPhotos[i].addFeatures(point_featurePhoto_total[i]);
    }

}

/*-----------左键菜单弹框----------*/
/*-----点击矢量要素覆盖物，调用此函数------*/
var bit = 0;
function onFeatureSelected(feature) {
    // if (feature.style.backgroundGraphic.indexOf("car") != -1) {
    //     onFeatureSelectedCar(feature);
    //     return;
    // }

    map.removeAllPopup();
    // for( var i = 0 ; i < AllSelfDefinedLayers.length ; i++ ) {
    //     if ( feature.layer.name == AllSelfDefinedLayers[i].name )
    //     {
    //         isSelfLayerItem = true;
    //     }
    // }
    // map.addPopup(popup);

    if (feature.children) {
        bit = 0;
        for (var i = 0; i < AllSelfDefinedLayers.length; i++) {
            if (feature.layer.name == AllSelfDefinedLayers[i].name) {
                isSelfLayerItem = true;
            }
        }


        if (isSelfLayerItem) {
            var layerDatatCopy = layerDataAttr.slice(2, 3);
            var content = "";
            content += "<div class='php' style='padding:10px 0'>";
            for (i = 0; i < feature.children.length; i++) {
                var sum = feature.children[i];

                for (var l = 0; l < list_types.length; l++) {
                    var category = HM_TypeID_LayersData.Get(list_types[l].type_id);
                    var layersArray = HM_LayersVector[list_types[l].type_id];
                    for (var j = 0; j < layersArray.length; j++) {
                        var datas = category.Get(layersArray[j].layer_id);
                        for (var k = 0; k < datas.length; k++) {
                            var nn = datas[k].loc_lan;
                            var nv = datas[k].loc_lon;
                            var num = datas[k];
                            if (sum.geometry.x == nn && sum.geometry.y == nv) {
                                for (var f = 0; f < layerDatatCopy.length; f++) {
                                    content += "<li id=" + 'gz' + f + " style='line-height: 13px;color: #333333;font-size: 12px;padding:0;display:flex;justify-content: center;border-bottom:1px solid #1458a7'>" +
                                        "<span  style='display: inline-block;width: 45%;vertical-align: top;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-right:10px;line-height:20px;text-align:right;border:1px solid #1458a7;border-bottom:transparent'>" + layerDatatCopy[f] + "</span>" +
                                        "<span style='display: inline-block;width: 55%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-left:10px;border-left:1px solid #1458a7;line-height:20px;text-align:left;border-top:1px solid #1458a7;border-right:1px solid #1458a7'>" + num[layerDatatCopy[f]] + "</span></li>"
                                }

                            }
                        }
                    }
                }

            }
            content += "</div>";
            var popupLayer = new SuperMap.Popup(
                "player",
                new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
                new SuperMap.Size(295, 100),
                content,
                null,
                false
            );
            popupLayer.autoSize = true;
            layerWins = popupLayer;
            //添加弹窗map图层
            map.addPopup(popupLayer);
            if (feature.children.length > 10) {
                $('#player').css({
                    'left': parseInt($('#player').css('left')) + 20 + "px",
                    'top': parseInt($('#player').css('top')) - 36 + "px",
                    'width': '280px',
                    'height': '240px',
                    'overflow-y': 'auto',
                    'border': '2px solid #1458a7',
                    'box-shadow': '2px 2px 12px #999',
                    'background': 'rgba(255,255,255,.9)',
                    'padding': '0'
                });
            } else {
                $('#player').css({
                    'left': parseInt($('#player').css('left')) + 20 + "px",
                    'top': parseInt($('#player').css('top')) - 36 + "px",
                    'width': '250px',
                    'overflow-y': 'auto',
                    'border': '2px solid #1458a7',
                    'box-shadow': '2px 2px 12px #999',
                    'background': 'rgba(255,255,255,.9)',
                    'padding': '0'
                });
            }
            $("#player_contentDiv").css({"width": "100%", "height": "100%"});
            $(".php li").eq(0).css({"background": "#1458a7"});
            $(".php li").click(function(){
                $this = $(this);
                var index = $('.php li').index($this);
                $this.css({"background": "#1458a7"}).siblings().css({"background": "#fff"});
                if (bit == 0) {
                    var content = "";
                    for (var i = 0; i < feature.children.length; i++) {
                        var num1 = feature.children[i];
                        content += "<div class='pub' style='padding:10px 0;>";
                        for (var l = 0; l < list_types.length; l++) {
                            var category = HM_TypeID_LayersData.Get(list_types[l].type_id);
                            var layersArray = HM_LayersVector[list_types[l].type_id];
                            for (var j = 0; j < layersArray.length; j++) {
                                var datas = category.Get(layersArray[j].layer_id);
                                for (var k = 0; k < datas.length; k++) {
                                    var nn = datas[k].loc_lan;
                                    var nv = datas[k].loc_lon;
                                    var num = datas[k];
                                    if (num1.geometry.x == nn && num1.geometry.y == nv) {
                                        for (var f = 1; f < layerDataAttr.length; f++) {
                                            content += "<li id=" + 'gz' + f + " style='line-height: 13px;color: #333333;font-size: 12px;padding:0;display:flex;justify-content: center;border-bottom:1px solid #1458a7'>" +
                                                "<span  style='display: inline-block;width: 45%;vertical-align: top;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-right:10px;line-height:20px;text-align:right;border:1px solid #1458a7;border-bottom:transparent'>" + layerDataAttr[f] + "</span>" +
                                                "<span style='display: inline-block;width: 55%;white-space: nowrap;padding-left:10px;border-left:1px solid #1458a7;line-height:20px;text-align:left;border-top:1px solid #1458a7;border-right:1px solid #1458a7'>" + num[layerDataAttr[f]] + "</span></li>"
                                        }

                                    }
                                }
                            }
                        }
                        content += "</div>"

                    }
                    var popupLayer1 = new SuperMap.Popup(
                        "player1",
                        new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
                        new SuperMap.Size(295, 100),
                        content,
                        null,
                        false
                    );
                    popupLayer1.autoSize = true;
                    layerWins1 = popupLayer1;
                    //添加弹窗map图层
                    map.addPopup(popupLayer1);
                    $('#player1').css({
                        'left': parseInt($('#player1').css('left')) + 270 + "px",
                        'top': parseInt($('#player1').css('top')) - 36 + "px",
                        'width': '350px',
                        'height': '280px',
                        'overflow-y': 'auto',
                        'border': '2px solid #1458a7',
                        'box-shadow': '2px 2px 12px #999',
                        'background': 'rgba(255,255,255,.9)',
                        'padding': '0'
                    });

                    $('#player1_contentDiv').css({
                        'width': '100%',
                        'height': '100%'
                    });

                }
                $("#player1_contentDiv .pub").eq(index).css({"display": "block"}).siblings().css({"display": "none"});
                bit = 1;


        })
        } else {
            var cameras = camera_setting.slice(1, 2);
            var comment = "";
            comment += "<div class='pop' style='padding:10px 0;'>";
            for (var i = 0; i < feature.children.length; i++) {
                var num = feature.children[i];
                selectCamInfoByID(num.style.graphicZIndex, function (cam_info) {
                    for (var i = 0; i < cameras.length; i++) {
                        if (cameras[i].attr_show_1) {
                            comment += "<li id=" + 'gz' + i + " style='line-height: 13px;color: #333333;font-size: 12px;padding:0;display:flex;justify-content: center;border-bottom:1px solid #1458a7'>" +
                                "<span   style='display: inline-block;width: 45%;vertical-align: top;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-right:10px;line-height:20px;text-align:right;border:1px solid #1458a7;border-bottom:transparent'>" + cameras[i].attr_desc + "</span>" +
                                "<span style='display: inline-block;width: 55%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-left:10px;border-left:1px solid #1458a7;line-height:20px;text-align:left;border-top:1px solid #1458a7;border-right:1px solid #1458a7'>" + cam_info[cameras[i].attr_name] + "</span></li>"
                        }
                    }

                })
            }
            comment += "</div>";
            var popup3 = new SuperMap.Popup(
                "common",
                new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
                new SuperMap.Size(295, 100),
                comment,
                null,
                false
            );
            popup3.autoSize = true;
            wins = popup3;
            //添加弹窗map图层
            map.addPopup(popup3);
            if (feature.children.length > 10) {
                $('#common').css({
                    'left': parseInt($('#common').css('left')) + 20 + "px",
                    'top': parseInt($('#common').css('top')) - 36 + "px",
                    'width': '280px',
                    'height': '240px',
                    'overflow-y': 'auto',
                    'border': '2px solid #1458a7',
                    'box-shadow': '2px 2px 12px #999',
                    'background': 'rgba(255,255,255,.9)',
                    'padding': '0'
                });
            } else {
                $('#common').css({
                    'left': parseInt($('#common').css('left')) + 20 + "px",
                    'top': parseInt($('#common').css('top')) - 36 + "px",
                    'width': '250px',
                    'overflow-y': 'auto',
                    'border': '2px solid #1458a7',
                    'box-shadow': '2px 2px 12px #999',
                    'background': 'rgba(255,255,255,.9)',
                    'padding': '0'
                });
            }
            $("#common_contentDiv").css({"width": "100%", "height": "100%"});
            $(".pop li").eq(0).css({"background": "#1458a7"});
            $(".pop li").click(function () {
                $this = $(this);
                var index = $('.pop li').index($this);
                $this.css({"background": "#1458a7"}).siblings().css({"background": "#fff"});
                if (bit == 0) {
                    var comment = "";
                    for (var i = 0; i < feature.children.length; i++) {
                        var num1 = feature.children[i];
                        selectCamInfoByID(num1.style.graphicZIndex, function (cam_info) {
                            comment += "<div class='poo' style='padding:10px 0;>";
                            for (var i = 1; i < camera_setting.length; i++) {
                                if (camera_setting[i].attr_show_2) {
                                    comment += "<li id=" + 'gz' + i + " style='line-height: 13px;color: #333333;font-size: 12px;padding:0;display:flex;justify-content: center;border-bottom:1px solid #1458a7'>" +
                                        "<span  style='display: inline-block;width: 45%;vertical-align: top;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-right:10px;line-height:20px;text-align:right;border:1px solid #1458a7;border-bottom:transparent'>" + camera_setting[i].attr_desc + "</span>" +
                                        "<span style='display: inline-block;width: 55%;white-space: nowrap;padding-left:10px;border-left:1px solid #1458a7;line-height:20px;text-align:left;border-top:1px solid #1458a7;border-right:1px solid #1458a7'>" + cam_info[camera_setting[i].attr_name] + "</span></li>"
                                }
                            }
                            comment += "</div>";

                        });
                    }
                    var popup4 = new SuperMap.Popup(
                        "common1",
                        new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
                        new SuperMap.Size(295, 100),
                        comment,
                        null,
                        false
                    );
                    popup4.autoSize = true;
                    wins2 = popup4;
                    //添加弹窗map图层
                    map.addPopup(popup4);
                    $('#common1').css({
                        'left': parseInt($('#common1').css('left')) + 270 + "px",
                        'top': parseInt($('#common1').css('top')) - 36 + "px",
                        'width': '350px',
                        'height': '280px',
                        'overflow-y': 'auto',
                        'border': '2px solid #1458a7',
                        'box-shadow': '2px 2px 12px #999',
                        'background': 'rgba(255,255,255,.9)',
                        'padding': '0'
                    });

                    $('#common1_contentDiv').css({
                        'width': '100%',
                        'height': '100%'
                    });

                }
                $("#common1_contentDiv .poo").eq(index).css({"display": "block"}).siblings().css({"display": "none"});
                bit = 1;

            })

        }


    }
    else if (isSelfLayerItem) {
        var contentLayer1 = "";
        contentLayer1 += "<div style='width:20px;height: 20px;background: rgba(255,255,255,.9);position: relative;top: 20px;left:-15px;transform: rotate(45deg);border-bottom: 1px solid #999;border-left: 1px solid #999'></div>";

        for (i = 0; i < list_types.length; i++) {
            var category = HM_TypeID_LayersData.Get(list_types[i].type_id);  //得到类别的值
            var layersArray = HM_LayersVector[list_types[i].type_id];
            for (var j = 0; j < layersArray.length; j++) {
                var datas = category.Get(layersArray[j].layer_id);
                console.log(datas);
                for (var k = 0; k < datas.length; k++) {
                    if (feature.geometry.x == datas[k].loc_lan && feature.geometry.y == datas[k].loc_lon) {
                        var num = datas[k];
                        for (var f = 0; f < layerDataAttr.length; f++) {
                            contentLayer1 += "<li id=" + 'gz' + i + " style='line-height: 13px;color: #333333;font-size: 12px;padding:0;display:flex;justify-content: center;border-bottom:1px solid #1458a7'>" +
                                "<span   style='display: inline-block;width: 45%;vertical-align: top;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-right:10px;line-height:20px;text-align:right;border:1px solid #1458a7;border-bottom:transparent'>" + layerDataAttr[f] + "</span>" +
                                "<span style='display: inline-block;width: 55%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-left:10px;border-left:1px solid #1458a7;line-height:20px;text-align:left;border-top:1px solid #1458a7;border-right:1px solid #1458a7'>" + num[layerDataAttr[f]] + "</span></li>"
                        }


                    }

                }
            }
        }

        var popupVector1 = new SuperMap.Popup(
            "featureInfo1",
            new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
            new SuperMap.Size(295, 100),
            contentLayer1,
            null,
            false);
        popupVector1.autoSize = true;
        featureInfoWin1 = popupVector1;
        //添加弹窗map图层
        map.addPopup(popupVector1);
        $('#featureInfo1').css({
            'left': parseInt($('#featureInfo1').css('left')) + 36 + "px",
            'top': parseInt($('#featureInfo1').css('top')) - 36 + "px",
            'width': '280px',
            'box-shadow': '2px 2px 12px #999',
            'background': 'rgba(255,255,255,.9)',
            'padding': '0'
        });
        $('#featureInfo1_contentDiv').css({
            'width': '100%',
            'height': '100%',
            'padding': '0 5px'
        });
        $('#gz0').css({
            // 'display': 'none'
        });


    } else {
        console.log(flag);
        if (flag == true) {
            return false;
        }
        flag = true;
        var cam_id = feature.style.graphicZIndex;
        var cam_name = feature.style.dataName;
        var cam_addr = feature.style.dataAddr;
        var popup = new SuperMap.Popup(
            "menuInfo",
            new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
            new SuperMap.Size(125, 140),
            "<div style='width: 20px;height: 20px;background: rgba(255,255,255,.9);margin-top: 20px;" +
            "margin-left: -30px;transform: rotate(45deg);border-bottom: 1px solid#999;border-left: 1px " +
            "solid #999'></div>" +
            "<div style='position: relative;top:-35px'><li id='zjs' onclick='picture(" + feature.style
                .graphicZIndex + ");'  style='color: #333333;font-size: 14px;margin:10px 5px 10px 5px;border-bottom:" +
            "1px solid #bbb;'><p style='display: inline-block; '>图片查看</p></li>" +
            "<li id='videoplay' onclick='videoPlayClick()' style='color: #333333;font-size: 14px;margin:10px" +
            " 5px 10px 5px;border-bottom:1px solid #bbb;'><p style='display: inline-block; '>视频查看</p></li>" +
            "<li id='detailinfo' style='color: #333333;font-size: 14px;margin:10px 5px 10px 5px;border-bottom:1" +
            "px solid #bbb;'><p style='display: inline-block; '>详细信息</p></li>" +
            "<li id='scs' onclick='manage("
            + cam_id +
            ",\"" + cam_name + "\",\"" + cam_addr + "\")' style='color: #333333;font-size: 14px;margin:10px " +
            "5px 10px 5px;'></li></div>",
            null,
            true);
        // map.setCenter(new SuperMap.LonLat(feature.geometry.x, feature.geometry.y), map.getZoom());
        //添加弹窗到map图层
        //popup.autoSize = true;
        map.addPopup(popup);
        //修改菜单样式注意必须等popup实例化后
        $('#menuInfo').css({
            'display': 'block',
            'left': parseInt($('#menuInfo').css('left')) + 36 + "px",
            'top': parseInt($('#menuInfo').css('top')) - 36 + "px",
            'width': '105px',
            'border': '1px solid #999',
            'box-shadow': '2px 2px 12px rgba(0,0,0,.3)',
            'background': 'rgba(255,255,255,.9)',
            'cursor': ' pointer'
        });
        $('#menuInfo_contentDiv').css({
            'width': '100%',
            'height': '100%'
        });
        menuInfoWin = popup;
        pointClick();
        //根据摄像头ID后台获取摄像头信息
        //selectCamInfoByID(feature.style.graphicZIndex);
        //摄像头详细信息点击事件
        // selectFeature.deactivate();
        if (menuInfoWin) {
            flag = false;
        }
        $('#detailinfo').click(function () {
            $('#cameradetailsWin').css({'display': 'block'});
            closeMenuInfoWin();//关闭左键选中
            $('#cam-list').hide();
            $('#car-list').hide();
            $('#layer-list').hide();
            // $('#cardetailsWin').hide();
            //添加特定摄像头详细信息
            var contentHtml = "";
            for (var i = 0; i < camera_setting.length; i++) {
                if (camera_setting[i].attr_show_2) {
                    contentHtml += "<li id=" + 'gz' + i + " style='line-height: 15px;color: #333333;font-size: 14px;padding:10px 5px 5px;border:1px solid #1458a7'>" +
                        "<span style='display: inline-block;width: 45%;vertical-align: top;text-align:right'>" + camera_setting[i].attr_desc + "：" + "</span>" +
                        "<span style='display: inline-block;width: 55%;text-align:right'>" + cam_info[camera_setting[i].attr_name] + "</span></li>"

                }
            }
            $('#detailscontent').html(contentHtml);
            $('#gz0').css({display: "none"})

        });

    }

}

/*-----------详细信息可拖动-----------*/
$(function () {
    //创建小方块的jquery对象
    var $cameradetailsWin = $("#cameradetailsWin");
    //创建小方块的鼠标点按下事件
    $cameradetailsWin.mousedown(function (event) {
        //获取鼠标按下的时候左侧偏移量和上侧偏移量
        var old_left = event.pageX;//左侧偏移量
        var old_top = event.pageY;//竖直偏移量

        //获取鼠标的位置
        var old_position_left = $(this).position().left;
        var old_position_top = $(this).position().top;

        //鼠标移动
        $(document).mousemove(function (event) {
            var new_left = event.pageX;//新的鼠标左侧偏移量
            var new_top = event.pageY;//新的鼠标竖直方向上的偏移量

            //计算发生改变的偏移量是多少
            var chang_x = new_left - old_left;
            var change_y = new_top - old_top;

            //计算出现在的位置是多少

            var new_position_left = old_position_left + chang_x;
            var new_position_top = old_position_top + change_y;
            //加上边界限制
            if (new_position_top < 0) {//当上边的偏移量小于0的时候，就是上边的临界点，就让新的位置为0
                new_position_top = 0;
            }
            //如果向下的偏移量大于文档对象的高度减去自身的高度，就让它等于这个高度
            if (new_position_top > $(document).height() - $cameradetailsWin.height()) {
                new_position_top = $(document).height() - $cameradetailsWin.height();
            }
            //右限制
            if (new_position_left > $(document).width() - $cameradetailsWin.width()) {
                new_position_left = $(document).width() - $cameradetailsWin.width();
            }
            if (new_position_left < 0) {//左边的偏移量小于0的时候设置 左边的位置为0
                new_position_left = 0;
            }

            $cameradetailsWin.css({
                left: new_position_left + 'px',
                top: new_position_top + 'px'
            })
        });
        $cameradetailsWin.mouseup(function () {
            $(document).off("mousemove");
        })
    });
});
/*----摄像头点选高亮事件----*/
var pointPops = [];
var popNum = [];
function pointClick(feature) {
    var pointSha;
    var pointShaId;
    if (flag == false) {
        //判断0显示1消除
        if (feature.style.graphicOpacity == 0) {
            pointSha = parseInt(feature.style.graphicZIndex);
            popNum.push(pointSha);
            pointShaId = "#" + pointSha;
            pointPops[pointSha] = new SuperMap.Popup(
                pointSha,
                new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
                new SuperMap.Size(15, 15),
                null,
                null,
                true);
            pointPops[pointSha].autoSize = true;
            map.addPopup(pointPops[pointSha]);
            $(pointShaId).css({
                'left': parseInt($(pointShaId).css('left')) - 20 + "px",
                'top': parseInt($(pointShaId).css('top')) - 20 + "px",
                'box-shadow': '2px 2px 12px #AFEEEE',
                'width': '50px',
                'height': '50px',
                'border-radius': '50%',
                'background': '#fff',
                'opacity': '.2',
                'z-index': '340'
            });
            feature.style.graphicOpacity = 1;
        }
        else {
            feature.style.graphicOpacity = 0;
            pointPops[feature.style.graphicZIndex].hide();
            pointPops[feature.style.graphicZIndex].destroy();
        }
    }
}
/*----定义关闭Menu点击事件-----*/
function closeMenuInfoWin() {
    if (flag) {
        menuInfoWin.hide();
        menuInfoWin.destroy();
        featureShadow.hide();
        featureShadow.destroy();
        flag = false;
    }
}

/*----------------鼠标悬停弹出Tabs popup，调用此函数。------------------*/
function onFeatureHovered(feature) {
    console.log(feature);

    // if (feature.style.backgroundGraphic.indexOf("car") != -1) {
    //     onFeatureHoveredCar(feature);
    //     return;
    // }
    map.removeAllPopup();

    if (feature.hasOwnProperty("isCluster")) {
        return;
    }


    for (var i = 0; i < AllSelfDefinedLayers.length; i++) {
        if( feature.hasOwnProperty("layer") )
        {
            if (feature.layer.name == AllSelfDefinedLayers[i].name) {
                isSelfLayerItem = true;
            }
        }
    }


    if (isSelfLayerItem) {
        var contentLayer = "";
        contentLayer += "<div style='width:20px;height: 20px;background: rgba(255,255,255,.9);position: relative;top: 20px;left:-15px;transform: rotate(45deg);border-bottom: 1px solid #999;border-left: 1px solid #999'></div>";

        for (i = 0; i < list_types.length; i++) {
            var category = HM_TypeID_LayersData.Get(list_types[i].type_id);  //得到类别的值
            var layersArray = HM_LayersVector[list_types[i].type_id];
            for (var j = 0; j < layersArray.length; j++) {
                var datas = category.Get(layersArray[j].layer_id);
                for (var k = 0; k < datas.length; k++) {
                    if (feature.geometry.x == datas[k].loc_lan && feature.geometry.y == datas[k].loc_lon) {
                        var num = datas[k];
                        for (var f = 0; f < layerDataAttr.length; f++) {
                            contentLayer += "<li id=" + 'gz' + i + " style='line-height: 13px;color: #333333;font-size: 12px;padding:0;display:flex;justify-content: center;border-bottom:1px solid #1458a7'>" +
                                "<span   style='display: inline-block;width: 45%;vertical-align: top;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-right:10px;line-height:20px;text-align:right;border:1px solid #1458a7;border-bottom:transparent'>" + layerDataAttr[f] + "</span>" +
                                "<span style='display: inline-block;width: 55%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-left:10px;border-left:1px solid #1458a7;line-height:20px;text-align:left;border-top:1px solid #1458a7;border-right:1px solid #1458a7'>" + num[layerDataAttr[f]] + "</span></li>"
                        }

                    }

                }
            }
        }

        var popupVector = new SuperMap.Popup(
            "featureInfo",
            new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
            new SuperMap.Size(295, 100),
            contentLayer,
            null,
            false);
        popupVector.autoSize = true;
        featureInfoWin = popupVector;
        //添加弹窗map图层
        map.addPopup(popupVector);
        $('#featureInfo').css({
            'left': parseInt($('#featureInfo').css('left')) + 36 + "px",
            'top': parseInt($('#featureInfo').css('top')) - 36 + "px",
            'width': '280px',
            'box-shadow': '2px 2px 12px #999',
            'background': 'rgba(255,255,255,.9)',
            'padding': '0'
        });
        $('#featureInfo_contentDiv').css({
            'width': '100%',
            'height': '100%',
            'padding': '0 5px'
        });
        $('#gz0').css({
            // 'display': 'none'
        });
        // if (flag == true) {
        //     featureInfoWin.hide();
        // } else {
        addPopUpCircle('featureShadow', feature.geometry.x, feature.geometry.y, map, 'rgba(20,88,167,.3)', '50', '50', 25, 25);
        // }

    }
    else {
        selectCamInfoByID(feature.style.graphicZIndex, function (cam_info) {
            var contentHtml = "";
            contentHtml += "<div style='width:20px;height: 20px;background: rgba(255,255,255,.9);position: relative;top: 20px;left:-15px;transform: rotate(45deg);border-bottom: 1px solid #999;border-left: 1px solid #999'></div>";
            for (var i = 0; i < camera_setting.length; i++) {
                if (camera_setting[i].attr_show_1) {
                    contentHtml += "<li id=" + 'gz' + i + " style='line-height: 13px;color: #333333;font-size: 12px;padding:0;display:flex;justify-content: center;border-bottom:1px solid #1458a7'>" +
                        "<span   style='display: inline-block;width: 45%;vertical-align: top;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-right:10px;line-height:20px;text-align:right;border:1px solid #1458a7;border-bottom:transparent'>" + camera_setting[i].attr_desc + "</span>" +
                        "<span style='display: inline-block;width: 55%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;padding-left:10px;border-left:1px solid #1458a7;line-height:20px;text-align:left;border-top:1px solid #1458a7;border-right:1px solid #1458a7'>" + cam_info[camera_setting[i].attr_name] + "</span></li>"
                }
            }
            var popup1 = new SuperMap.Popup(
                "tabsInfo",
                new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
                new SuperMap.Size(295, 100),
                contentHtml,
                null,
                false);
            popup1.autoSize = true;
            tabsInfoWin = popup1;
            //添加弹窗map图层
            map.addPopup(popup1);
            $('#tabsInfo').css({
                'left': parseInt($('#tabsInfo').css('left')) + 36 + "px",
                'top': parseInt($('#tabsInfo').css('top')) - 36 + "px",
                'width': '280px',
                // 'border': '1px solid #999',
                'box-shadow': '2px 2px 12px #999',
                'background': 'rgba(255,255,255,.9)',
                'padding': '0'
            });
            $('#tabsInfo_contentDiv').css({
                'width': '100%',
                'height': '100%',
                'padding': '0 5px'
            });
            $('#gz0').css({
                'display': 'none'
            })
            if (flag == true) {
                tabsInfoWin.hide();
            } else {
                addPopUpCircle('featureShadow', feature.geometry.x, feature.geometry.y, map, 'rgba(20,88,167,.3)', '50', '50', 25, 25);
            }
        });
    }

}
/*----------------点击摄像头列表Tabs popup，调用此函数。------------------*/
function onFeatureHovered1(feature) {
    //根据摄像头ID后台获取摄像头信息
    var contentHtml = "";
    selectCamInfoByID(feature.style.graphicZIndex, function (cam_info) {

        contentHtml += "<div style='width: 20px;height: 20px;background: rgba(255,255,255,.9);position: relative;top: 20px;left:-30px;transform: rotate(45deg);border-bottom: 1px solid#999;border-left: 1px solid #999'></div>";
        for (var i = 0; i < camera_setting.length; i++) {
            if (camera_setting[i].attr_show_1) {
                contentHtml += "<li id='gz' style='line-height: 13px;color: #333333;font-size: 12px;padding:5px;border: 1px solid #1458a7;'>" +
                    "<span style='display: inline-block;width: 30%;vertical-align: top'>" + camera_setting[i].attr_desc + "：" + "</span>" +
                    "<span style='display: inline-block;width: 70%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap'>" + cam_info[camera_setting[i].attr_name] + "</span></li>"
            }
        }
    });
    var popup1 = new SuperMap.Popup(
        "tabsInfo1",
        new SuperMap.LonLat(feature.geometry.x, feature.geometry.y),
        new SuperMap.Size(295, 140),
        contentHtml,
        null,
        true);
    popup1.autoSize = true;
    tabsInfoWin = popup1;
    //添加弹窗map图层
    map.addPopup(popup1);
    $('#tabsInfo1').css({
        'left': parseInt($('#tabsInfo1').css('left')) + 36 + "px",
        'top': parseInt($('#tabsInfo1').css('top')) - 36 + "px",
        'width': '280px',
        'border': '1px solid #1458a7',
        'box-shadow': '2px 2px 12px #999',
        'background': 'rgba(255,255,255,.9)'
    });
    $('#tabsInfo1_contentDiv').css({
        'width': '100%',
        'height': '100%'
    });
    if (flag == true) {
        tabsInfoWin.hide();
    } else {
        addPopUpCircle('featureShadow1', feature.geometry.x, feature.geometry.y, map, 'rgba(20,88,167,.3)', '50', '50', 25, 25);
    }
}
/*---------------------------------定义悬浮框关闭事件--------------------------------*/
function closeTabsInfoWin(feature) {
    // if (feature.style.backgroundGraphic.indexOf("car") != -1) {
    //     closeTabsInfoWinCar(feature);
    //     return;
    // }
    // isSelfLayerItem = false;
    for (var i = 0; i < AllSelfDefinedLayers.length; i++) {
        if (feature.layer.name == AllSelfDefinedLayers[i].name) {
            isSelfLayerItem = true;
        }
    }


    // if ( featureInfoWin && isSelfLayerItem ) {
    //     // featureInfoWin.hide();
    //     // featureInfoWin.destroy();
    //     // featureShadow.hide();
    //     // featureShadow.destroy();
    //     map.removePopup(featureInfoWin);
    //     map.removePopup(featureShadow);
    //     isSelfLayerItem = false;
    // }
    //
    // if (tabsInfoWin) {
    //     // tabsInfoWin.hide();
    //     // tabsInfoWin.destroy();
    //     map.removePopup(tabsInfoWin);
    //     map.removePopup(featureShadow);
    //
    // }
    if (isSelfLayerItem) {
        // featureInfoWin.hide();
        // featureInfoWin.destroy();
        // featureShadow.hide();
        // featureShadow.destroy();
        if (featureInfoWin) {
            map.removePopup(featureInfoWin);
            // map.removePopup(layerWins);
            isSelfLayerItem = false;
        }
        if (featureShadow) {
            map.removePopup(featureShadow);
        }
    }
    else {
        // tabsInfoWin.hide();
        // tabsInfoWin.destroy();
        if (tabsInfoWin) {
            map.removePopup(tabsInfoWin);
        }

        if (featureShadow) {
            map.removePopup(featureShadow);
        }

    }

    // if (flag == false) {
    //     if (featureShadow) {
    //         featureShadow.hide();
    //         featureShadow.destroy();
    //     }
    //
    // }


}
console.log(list_types, HM_LayersVector, HM_TypeID_LayersData);
/*-------这个是当进行查询的时候重置的列表框-----------*/
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

// $(".cam_footer").append($("#treeviewCam"));

}


//固定数据展示
// function openCameraPanel(cameras) {
//     saveData('camerasList', cameras);
//     var config = Array();
//     var total = {
//         text: '全部',
//         href: 'javascript:;',
//         tags: cameras.length,
//         state: {expanded: true},
//         selectable: true,
//         nodes: Array()
//     };//全部
//     var ball = {
//         text: '球机',
//         href: 'javascript:;',
//         tags: cameras.length,
//         state: {expanded: false},
//         selectable: true,
//         nodes: Array()
//     };//球机
//     var hemisphere = {
//         text: '半球',
//         href: 'javascript:;',
//         tags: cameras.length,
//         state: {expanded: false},
//         selectable: true,
//         nodes: Array()
//     };//半球
//     var fixed = {
//         text: '固定枪机',
//         href: 'javascript:;',
//         tags: cameras.length,
//         state: {expanded: false},
//         selectable: true,
//         nodes: Array()
//     };//固定枪机
//     var remote = {
//         text: '遥控枪机',
//         href: 'javascript:;',
//         tags: cameras.length,
//         state: {expanded: false},
//         selectable: true,
//         nodes: Array()
//     };//遥控枪机
//     var snap = {
//         text: '卡扣枪机',
//         href: 'javascript:;',
//         tags: cameras.length,
//         state: {expanded: false},
//         selectable: true,
//         nodes: Array()
//     };//卡扣枪机
//     var unKnow = {
//         text: '未知',
//         href: 'javascript:;',
//         tags: cameras.length,
//         state: {expanded: false},
//         selectable: true,
//         nodes: Array()
//     };//未知
//     cam_selectId = [];
//     for (var i = 0; i < cameras.length; i++) {
//         var temp = {};
//         temp.text = "名称:" + cameras[i].cam_name;
//         temp.href = "javascript:cameraSelected('" + JSON.stringify(cameras[i]) + "');";
//         // temp.tags = JSON.stringify(cameras[i]);
//         addPopUpCircle('cam' + cameras[i].cam_id,
//             cameras[i].cam_loc_lan,
//             cameras[i].cam_loc_lon, map, 'rgba(20,88,167,.3)', '30', '30', 15, 15);
//         total.nodes.push(temp);
//         cam_selectId.push('cam' + cameras[i].cam_id);
//         if (cameras[i].cam_sta == 1) {
//             ball.nodes.push(temp);
//         } else if (cameras[i].cam_sta == 2) {
//             hemisphere.nodes.push(temp);
//         } else if (cameras[i].cam_sta == 3) {
//             fixed.nodes.push(temp);
//         } else if (cameras[i].cam_sta == 4) {
//             remote.nodes.push(temp);
//         } else if (cameras[i].cam_sta == 5) {
//             snap.nodes.push(temp);
//         } else if (cameras[i].cam_sta == 0) {
//             unKnow.nodes.push(temp);
//         }
//     }
//     config.push(total);
//     config.push(ball);
//     config.push(hemisphere);
//     config.push(fixed);
//     config.push(remote);
//     config.push(snap);
//     config.push(unKnow);
//
//     $('#cam_list').show();
//     if ($('#cam_list').css('display') == 'none') {
//         $('.carList').css({'top': '28%', 'z-index': '2'})
//         $('#car_list').css({'top': '30%', 'z-index': '1'})
//     } else {
//         $('.carList').css({'top': '57%', 'z-index': '2'})
//         $('#car_list').css({'top': '60%', 'z-index': '1'})
//     }
//     $('#treeviewCam').treeview({
//         color: "#428bca",
//         expandIcon: 'glyphicon glyphicon-chevron-right',
//         collapseIcon: 'glyphicon glyphicon-chevron-down',
//         data: config,
//         enableLinks: true,
//         highlightSelected: true,
//     });
// }
/*-------------------------------------通过属性搜索选中摄像头列表-------------------------------------*/

function openCameraPanelSelect(cameras) {
    console.log(layerFlagNum);
    if(layerFlagNum!=0||layerFlagNum!=1){
        return;
    }
    map.removeAllPopup();
    saveData('camerasList', cameras);
    var config = Array();
    var total = {
        text: '查询结果',
        href: 'javascript:;',
        tags: cameras.length,
        state: {expanded: true},
        selectable: true,
        nodes: Array()
    };
    cam_selectId = [];
    for (var i = 0; i < cameras.length; i++) {
        var temp = {};
        temp.text = "名称:" + cameras[i].cam_name;
        temp.href = "javascript:cameraSelected('" + JSON.stringify(cameras[i]) + "');";
        // temp.tags = JSON.stringify(cameras[i]);
        addPopUpCircle('cam' + cameras[i].cam_id,
            cameras[i].cam_BJ_X,
            cameras[i].cam_BJ_Y, map, 'rgba(20,88,167,.3)', '30', '30', 15, 15);
        total.nodes.push(temp);
        cam_selectId.push('cam' + cameras[i].cam_id);
    }
    config.push(total);

    $('#cam_list').show();
    if ($('#cam_list').css('display') == 'none') {
        $('.carList').css({'top': '28%', 'z-index': '2'})
        $('#car_list').css({'top': '30%', 'z-index': '1'})
    } else {
        $('.carList').css({'top': '57%', 'z-index': '2'})
        $('#car_list').css({'top': '60%', 'z-index': '1'})
    }
    $('#treeviewCam').treeview({
        color: "#428bca",
        expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
        data: config,
        enableLinks: true,
        highlightSelected: true
    });
}
/*-------------------------------------初始化摄像头列表-----------------------------------*/
function openCameraPanelAll(types, cameras) {  //这里用到了一个treeview
    console.log(types);
    saveData('camerasAllList', cameras);
    var config = Array();
    var all = {
        text: '全部',
        href: 'javascript:;',
        tags: cameras.length,
        state: {expanded: true},
        selectable: true,
        nodes: Array()
    }

    var total = [];
    total.push(all);
    for (var i = 1; i < types.length; i++) {
        var item = {
            text: types[i].name,
            href: 'javascript:;',
            tags: cameras.length,
            state: {expanded: false},
            selectable: true,
            nodes: Array()
        };
        total.push(item);
    }

    for (var i = 0; i < cameras.length; i++) {
        var temp = {};
        temp.text = "名称:" + cameras[i].cam_name;
        temp.href = "javascript:cameraSelected('" + JSON.stringify(cameras[i]) + "');";
        all.nodes.push(temp);

        for (var j = 0; j < total.length; j++) {
            if (cameras[i].cam_category == total[j].text) {
                total[j].nodes.push(temp);
            }
        }

    }
    config = total;

    if ($('#cam_list').css('display') == 'none') {
        $('.carList').css({'top': '28%', 'z-index': '2'})
        $('#car_list').css({'top': '30%', 'z-index': '1'})
    } else {
        $('.carList').css({'top': '57%', 'z-index': '2'})
        $('#car_list').css({'top': '60%', 'z-index': '1'})
    }
    $('#treeviewCam').treeview({
        color: "#428bca",
        expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
        data: config,
        enableLinks: true,
        highlightSelected: true
    });
    //$('#cam_list').show();
    //openCameraPanel(cameras);
}
/*-------------------------------------关闭摄像头列表-----------------------------------*/
function closeCameraPanel() {
    return;
}
/*-------------------------------------添加圆的弹窗---------------------------------------*/
function addPopUpCircle(name, x, y, map, backgroundColor, width, height, left, top) {
    var popup2 = new SuperMap.Popup(
        name,
        new SuperMap.LonLat(x, y),
        new SuperMap.Size(15, 15),
        null,
        null,
        true);
    popup2.autoSize = false;
    featureShadow = popup2;
    map.addPopup(popup2);
    //这是弹窗中的列表框
    $('#' + name).css({
        'left': parseInt($('#' + name).css('left')) - left + "px",
        'top': parseInt($('#' + name).css('top')) - top + "px",
        'box-shadow': '2px 2px 12px #fff',
        'width': width + 'px',
        'height': height + 'px',
        'border-radius': '50%',
        'background': backgroundColor,
        'z-index': '340'
    });
}
/*-------------------------------------添加圆的弹窗这个似乎没什么用---------------------------------------*/

/*-------------------------------------摄像头高亮----------------------------------------*/
function cameraHighlight(name, x, y, map) {
    if (tabsInfoWin && tabsInfoWin.hide) {
        tabsInfoWin.hide();
        try {
            if (typeof(tabsInfoWin.destroy) == "function") {
                tabsInfoWin.destroy();
            }
        } catch (e) {
            console.log("destroy is not a function");
        }

    }
    if (featureShadow && featureShadow.hide) {
        featureShadow.hide();
        try {
            if (typeof(featureShadow.destroy) == "function") {
                featureShadow.destroy();
            }
        } catch (e) {
            console.log("destroy is not a function");
        }
    }
    popup2 = new SuperMap.Popup(
        name,
        new SuperMap.LonLat(x, y),
        new SuperMap.Size(15, 15),
        null,
        null,
        true);
    featureShadow = popup2;
    map.addPopup(popup2);
    $('#' + name).css({
        'left': parseInt($('#' + name).css('left')) - 15 + "px",
        'top': parseInt($('#' + name).css('top')) - 15 + "px",
        'width': '30px',
        'height': '30px',
        'border-radius': '50%',
        'background': '#ff0000',
        'opacity': '.4',
        'z-index': '340'
    });

}
/*------------------------------------摄像头选择事件-------------------------------------*/
function cameraSelected(camera) {
    console.log("00000")
    state = true;
    camera = JSON.parse(camera);
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
    cameraHighlight('cameraSelected', camera.cam_BJ_X, camera.cam_BJ_Y, map);
    cam_info = camera;
    var feature = {};
    feature.style = {};
    // added by riham 1226
    feature.style.backgroundGraphic = "camcamcam";
    feature.style.graphicZIndex = camera.cam_id;
    feature.style.dataName = camera.cam_name;
    feature.style.dataAddr = camera.cam_addr;
    feature.geometry = {};
    feature.geometry.x = camera.cam_BJ_X;
    feature.geometry.y = camera.cam_BJ_Y;
    onFeatureHovered(feature);
    map.setCenter(new SuperMap.LonLat(camera.cam_BJ_X, camera.cam_BJ_Y), map.getZoom());
}
/*--------------------------------------定义摄像头设置属性---------------------------------*/
//passionZhang  icon下来图标触发此事件
function openCamSettings() {
    console.log(camera_setting);
    var contentHtml = '';
    for (var i = 0; i < camera_setting.length; i++) {
        if (camera_setting[i].attr_show_2) {
            contentHtml += "<li><a href='javascript:;' onclick='searchSelect(" +
                "\"" + camera_setting[i].attr_desc + "\"" +
                ",\"" + camera_setting[i].attr_name + "\")'>" + camera_setting[i].attr_desc + "</a></li>"
        }
    }
    $('#menuCamSearch').html(contentHtml);
}
/*------------------------------------------------搜索摄像头属性---------------------------------------*/
function searchSelect(name, val) {
    $("#searchCamSelect").attr('placeholder', name);
    $("#searchCamSelect").val('');
    $("#searchCamSelect").attr('name', val)

}
function camSearchSettings() {
    deleteData('camerasList');
    if ($("#searchCamSelect").val() == "") {
        win.alert('提示', '搜索内容不能为空');
        return
    }
    if (typeof $("#searchCamSelect").attr('name') == 'undefined') {
        win.alert('提示', '请先选择摄像头属性');
        $('#searchCamSelect').val('');
        return
    }

    var attrName = $("#searchCamSelect").attr('name');
    var attrValue = $("#searchCamSelect").val();
    var settings = {
        "url": urlName + "/camera/pclistbyattr",
        "method": "POST",
        "data": {
            mobile: mobile,
            token: token,
            attrName: attrName,
            attrValue: attrValue,
            page: -1,
            pageSize: 10
        }
    };
    $.ajax(settings).done(function (response) {
        if (response.code == 200) {
            openCameraPanelSelect(response.data.rows)
        } else if (response.code === 401) {
            console.log(response.data.error);
        } else if (response.code === 501) {
            console.log(response.data.error);
        } else if (response.code === 500) {
            console.log(response.data.error);
        }
    });
}
/*---------------------------------------------导出摄像头--------------------------------------------*/
//打开摄像头导出列表
function excel() {
    $('.cam_td').remove();
    selectExcel();
    $('#excelDiv').show();
}
//点击关闭摄像头导出列表
function excelOff() {
    $('#excelDiv').hide();
}
//点击导出列表显示内容
function excelOut() {
    $('#excelDiv').hide();
    $("#sxtlb_tab").table2excel({
        exclude: ".noExl",
        filename: "camList.xls",
        name: "camList.xls",
        exclude_img: true,
        exclude_links: true,
        exclude_inputs: true
    });
    $('.cam_td').remove();
}
//查询出的结果，重构表格
function selectExcel() {
    var Data = {};
    var html = '<tr id="sxt_tr"></tr>';
    Data.mobile = readData('USER_KEY').mobile;
    Data.token = readData('USER_KEY').token;
    Data.type = -1;
    $.ajax({
        url: window.urlName + '/camera/getCameraAttrs',
        type: 'POST',
        data: Data,
        async: false,
        success: function (data) {
            var date1 = data.data.rows;
            //add By KingDragon
            window.camera_attrs = date1;
            for (var i = 1; i < date1.length; i++) {
                html += "<th class='cam_td'>" + date1[i].attr_desc + "</th>"
            }
            $('#sxtHead').html(html)
            var html = '';
            var html1 = '';
            var cameraList;
            //进行判断是否是全部列表
            if (readData('camerasList').length > 0) {
                cameraList = readData('camerasList');
            } else {
                cameraList = readData('camerasAllList');
            }
            for (var j = 0; j < cameraList.length; j++) {
                html1 += "<tr class='cam_td'>"
                var attrname = cameraList[j]
                for (key in attrname) {
                    for (var i = 1; i < date1.length; i++) {
                        html1 += "<td>" + attrname[date1[i].attr_name] + "</td>"
                    }
                    break
                }
                html1 += "</tr>"
            }
            $('#sxtlb_tab').append(html + html1)
        },
        error: function (data) {
            console.log(data);
        }
    });
}
// test case
// cameras = [{cam_id:1, cam_name:"KingDragon1", cam_BJ_Y:1, cam_BJ_X:1},
// 			{cam_id:2, cam_name:"KingDragon2", cam_BJ_Y:2, cam_BJ_X:2},
// 			{cam_id:3, cam_name:"KingDragon3", cam_BJ_Y:3, cam_BJ_X:3},
// 			{cam_id:4, cam_name:"KingDragon4", cam_BJ_Y:4, cam_BJ_X:4},
// 			{cam_id:5, cam_name:"KingDragon5", cam_BJ_Y:5, cam_BJ_X:5},
// 			{cam_id:6, cam_name:"KingDragon6", cam_BJ_Y:6, cam_BJ_X:6},
// 			{cam_id:7, cam_name:"KingDragon7", cam_BJ_Y:7, cam_BJ_X:7},
// 			{cam_id:8, cam_name:"KingDragon8", cam_BJ_Y:8, cam_BJ_X:8},
// 			{cam_id:9, cam_name:"KingDragon9", cam_BJ_Y:9, cam_BJ_X:9},
// ]
