function init(){
  realtime.store.Model.prototype.create = function (obj) {
    var _constructor = obj;
    if ((typeof obj).toLocaleLowerCase() === 'string') {
      _constructor = realtime.store.custom.registTypes[obj]['type'];
    }

    if ((typeof _constructor).toLocaleLowerCase() !== 'function') {
      throw new Error("Can not create custom object of " + typeof  _constructor)
    }
    var self_ = this;
//        _constructor.prototype.model = this;
    _constructor.prototype.constructor = _constructor;
    var custom_object = new _constructor();
    var c_map = this.createMap();
    var id = c_map.id();
    var name = custom_object.id;
    c_map.set(id, name);
    custom_object.mapId = id;
    var relations = realtime.store.custom.objectRelationShips[id] = {};
    relations['map'] = c_map;
    relations['model'] = this;
    var initializer = realtime.store.custom.registTypes[name]['initializer'];
    if(initializer){
      var args = [];
      for(var i=1;i<arguments.length;i++){
        args.push(arguments[i]);
      }
      initializer.apply(custom_object,args);
    }
//    console.log('Name#####################'+name);
    for (var i = 0; i < realtime.store.custom.fields.length; i++) {
      var prop = realtime.store.custom.fields[i];
      if(typeof custom_object[prop] !== "undefined"){
        c_map.set(prop, custom_object[prop]);
      }else{
        c_map.set(prop, "");
      }
      (function (__key,_c_map) {
        Object.defineProperty(custom_object, __key, {
          get: function () {
            var value = _c_map.get(__key);
            if(value === 'true')
              return true;
            if(value === 'false')
              return false;
            return value;
          },
          set: function (value) {
            var value_ = _c_map.get(__key);
            if(value_ === 'true')
              value_ = true;
            if(value_ === 'false')
              value_ = false;
            if (value_ === value) {
              return;
            }
            _c_map.set(__key, value);
          }
        });
      })(prop,c_map)
    }
    return custom_object;
  }
  var setFn = realtime.store.CollaborativeMap.prototype.set;
  realtime.store.CollaborativeMap.prototype.set = function (key, value) {

    var custom = realtime.store.custom.isCustomObject(value);
    if (custom) {
      var id = realtime.store.custom.getId(value);
      setFn.call(this, key, realtime.store.custom.objectRelationShips[id]['map']);
    }else{
      setFn.call(this,key,value);
    }
  }
  var pushFn = realtime.store.CollaborativeList.prototype.push;
  realtime.store.CollaborativeList.prototype.push = function(value){
    var custom = realtime.store.custom.isCustomObject(value);
    if (custom) {
      var id = realtime.store.custom.getId(value);
      pushFn.call(this, realtime.store.custom.objectRelationShips[id]['map']);
    }else{
      pushFn.call(this, value);
    }
  }

  window.convertMapToObject = function(obj){
    var keys = obj.keys().sort();
    var name = obj.get(obj.id());
    var relations = realtime.store.custom.objectRelationShips[obj.id()];
    if(!relations){
      relations = {};
    }
    if(relations.instance){
      return relations.instance;
    }else{
      var obj__ =  realtime.store.custom.registTypes[name]['type'];
      obj__.prototype.constructor = obj__;
      obj__.prototype = realtime.store.custom.registTypes[name]['type'].prototype;

      var obj1 = new obj__();
//        console.log(obj1);
      obj1.mapId = obj.id();
      var relations = realtime.store.custom.objectRelationShips[obj1.mapId] = {};
      relations['map'] = obj;
      for (var i = 0; i < keys.length; i++) {
        var _key = keys[i];
        if (_key === obj.id()) {
          continue;
        }
        (function (__key) {
          Object.defineProperty(obj1, __key, {
            get: function () {
              var value = realtime.store.custom.objectRelationShips[obj1.mapId]['map'].get(__key);
              var _value = value.toString();
              if(_value === 'true')
                return true;
              if(_value === 'false')
                return false;
              return value;
            },
            set: function (value) {
              var value_ = realtime.store.custom.objectRelationShips[obj1.mapId]['map'].get(__key).toString();
              if(value_ === 'true')
                value_ = true;
              if(value_ === 'false')
                value_ = false;
              if (value_ === value) {
                return;
              }
              realtime.store.custom.objectRelationShips[obj1.mapId]['map'].set(__key, value);
            }
          });
        })(_key)
      }
      window.customObject = obj1;
      relations.instance = obj1;
      return obj1;
    }


  }
  var getFn = realtime.store.CollaborativeMap.prototype.get;
  realtime.store.CollaborativeMap.prototype.get = function (key) {
    var obj = getFn.call(this, key);
    if (obj instanceof realtime.store.CollaborativeMap) {
      var isCustomObj = obj.get(obj.id());
      if (isCustomObj === undefined || isCustomObj === null) {
        return obj;
      } else {
        return convertMapToObject(obj);
      }
    } else {
      return obj;
    }
  }
  var listGetFn = realtime.store.CollaborativeList.prototype.get;
  realtime.store.CollaborativeList.prototype.get = function (key) {
    var obj = listGetFn.call(this, key);
    if (obj instanceof realtime.store.CollaborativeMap) {
      var isCustomObj = obj.get(obj.id());
      if (isCustomObj) {
        return convertMapToObject(obj);
      }
    }
    return obj;
  }

  var removeValueFn = realtime.store.CollaborativeList.prototype.removeValue;
  realtime.store.CollaborativeList.prototype.removeValue = function (value) {
    var custom = realtime.store.custom.isCustomObject(value);
    if (custom) {
      var id = realtime.store.custom.getId(value);
      removeValueFn.call(this, realtime.store.custom.objectRelationShips[id]['map']);
    }else{
      removeValueFn.call(this, value);
    }
  }
}
