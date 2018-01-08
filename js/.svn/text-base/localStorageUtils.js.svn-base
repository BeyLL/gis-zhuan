/**
 * localStorage数据存储工具，提供存数据和取数据
 * 参数设置：
 *      @key：存储的数据名称
 *      @data：存储的数据内容
 */
(function (w) {
    w.readData = function (key) {
        return  JSON.parse(localStorage.getItem(key) || '[]')
    };
    w.saveData = function (key, data) {
        localStorage.setItem(key, JSON.stringify(data))
    };
    w.deleteData = function (key) {
        return  JSON.parse(localStorage.removeItem(key) || '[]')
    }
})(window);
