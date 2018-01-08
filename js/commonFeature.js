//调用后台接口进行圆形、矩形、多边形的查询方法，这里只是查询

/***************************************摄像头选择**************************************/
/*----------------------------------------圆形选择-----------------------------------*/
function cameraSelectCircle(x,y,radius,callback){
    var settings = {
        "url": urlName+"/camera/cameraSelectCircle",
        "method": "POST",
        "async":"false",
        "data":{
            mobile:mobile,
            token:token,
            centerX:y,
            centerY:x,
            radius:radius
        },
        async:false
    }
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            console.log(response,'000000000000');
            callback(response.data.data);
        } else {
            console.log(response.error);

        }
    });
}
/*----------------------------------------矩形选择-----------------------------------*/
function cameraSelectReact(leftTopX,leftTopY,rightBottomX,rightBottomY,callback){
    var settings = {
        "url": urlName + "/camera/cameraSelectRect",
        "method": "POST",
        "data":{
            mobile:mobile,
            token:token,
            leftTopX:leftTopX,
            leftTopY:leftTopY,
            rightBottomX:rightBottomX,
            rightBottomY:rightBottomY,
        },
        async:false
    };
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            console.log(response,'111111111111111111')
            console.log(response.data.data)
            callback(response.data.data);
        } else {
            console.log(response.error);
        }
    });
}
/*----------------------------------------多边形选择查询------------------------------*/
function cameraSelectPolygon(points,callback){
    var settings = {
        "url": urlName + "/camera/cameraSelectPolygon",
        "method": "POST",
        "data":{
            mobile: mobile,
            token: token,
            points: JSON.stringify(points)
        },
        async:false
    }
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            callback(response.data.data);
        } else {
            console.log(response.error);
        }
    });
}
/*----------------------------------------直线查询-----------------------------------*/
function cameraSelectLine(points,distance,callback) {
    var settings = {
        "url": urlName + "/camera/cameraSelectLine",
        "method": "POST",
        "data":{
            mobile: mobile,
            token: token,
            points: JSON.stringify(points),
            space: distance,
        },
        async:false
    }
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            console.log(response)
            callback(response.data.data);
        } else {
            console.log(response.error);
        }
    });
}

/***************************************汽车选择**************************************/
/*----------------------------------------圆形选择-----------------------------------*/
function carSelectCircle(x,y,radius,callback){
    var settings = {
        "url": urlName+"/car/carSelectCircle",
        "method": "POST",
        "async":"false",
        "data":{
            mobile:mobile,
            token:token,
            centerX:y,
            centerY:x,
            radius:radius,
        },
        async:false
    }
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            callback(response.data.data);
            console.log(response);
        } else {
            console.log(response.error);

        }
    });
}
/*----------------------------------------矩形选择-----------------------------------*/
function carSelectReact(leftTopX,leftTopY,rightBottomX,rightBottomY,callback){
    var settings = {
        "url": urlName + "/car/carSelectRect",
        "method": "POST",
        "data":{
            mobile:mobile,
            token:token,
            leftTopX:leftTopX,
            leftTopY:leftTopY,
            rightBottomX:rightBottomX,
            rightBottomY:rightBottomY,
        },
        async:false
    };
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            console.log('矩形选33333333333333')
            callback(response.data.data);
        } else {
            console.log(response.error);
        }
    });
}
/*----------------------------------------多边形选择查询------------------------------*/
function carSelectPolygon(points,callback){
    var settings = {
        "url": urlName + "/car/carSelectPolygon",
        "method": "POST",
        "data":{
            mobile: mobile,
            token: token,
            points: JSON.stringify(points)
        },
        async:false
    }
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            console.log(response)
            callback(response.data.data);
        } else {
            console.log(response.error);
        }
    });
}
/*----------------------------------------直线查询-----------------------------------*/
function carSelectLine(points,distance,callback) {
    var settings = {
        "url": urlName + "/car/carSelectLine",
        "method": "POST",
        "data":{
            mobile: mobile,
            token: token,
            points: JSON.stringify(points),
            space: distance,
        },
        async:false
    }
    $.ajax(settings).done(function (response) {
        if(response.code==200){
            callback(response.data.data);
        } else {
            console.log(response.error);
        }
    });
}

