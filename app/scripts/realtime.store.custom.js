(function(){
  realtime.store.custom = realtime.store.custom || {};
  realtime.store.custom.registTypes = {};
  realtime.store.custom.objectRelationShips = {}
  realtime.store.custom.registerType = function(type,name){
    this.name = name;
    //all registerTypes
    if(this.registTypes[name]){
        throw new Error('the name : ['+ name +'] has already regist , change it pls');
    }
    this.registTypes[name] = {};
    this.registTypes[name]['type'] = type;
    this.fields = [];
    type.prototype.id = name;
//    this.type = type;
  }
  realtime.store.custom.collaborativeField = function(name){
    this.fields.push(name);
//    this.type.prototype.fileds = this.fileds;
  };
  realtime.store.custom.getId = function(obj){
    return obj.mapId;
  };
  realtime.store.custom.getModel = function(obj){
    realtime.store.custom.objectRelationShips[this.getId(obj)]
//    return obj.getModel();
  };
  realtime.store.custom.isCustomObject = function(obj){
    if(!obj)
      return false;
    if(obj.id && this.registTypes[obj.id])
      return true;
    return false;
  };
})();
