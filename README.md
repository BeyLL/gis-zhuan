##视频专网gis平台项目
###map详解
` file:///F:/SuperMap/index.html
`
###技术栈：
> jquery、jQuery-easing、jquery-jcImgScroll、boostrap、bootstrap-treeview、bootstrap-typeahead、jquery.table2excel
###文件介绍
supMap的介绍
- 地图定义了：摄像头图层、车辆图层、电子地图、影像地图、矢量绘制图层
- js
    - bufferService  生成缓冲区的，用在地图操作框中关于缓冲区中摄像头、汽车的查询
    - cameraOperations 摄像头获取数据，悬浮框操作，点击弹出菜单框
    - commonFeture  调用后台接口进行圆形、矩形、多边形查询
    - common  摄像头列表展现以及摄像头选择事件
    - config  调取地图的接口
    - mapTools  定义了全局变量，以及对于地图操作框的操作方法
    - mapLayerChange 初始化地图的图层
    
- html
    - login.html 登录界面
    - cameraManagement.html 主页面



