function Queue () {
  var base = this;
  base.queue = [];
  base.index = 0;
  base.headless = false;
  base.maxId = 0;
  base.minId = 999999999999;
  
  base.append = function(item){
    base.queue.push(item);
    if (base.queue.length > 100) {
      var item = base.queue.shift();
      item.destroy && item.destroy();
      base.headless = true;
    }
  }
  
  base.prepend = function(item){
    base.queue.unshift(item);
  }

  base.forward = function(){
    base.index += 1;
    if (base.index > base.queue.length - 1) {
      base.index = base.queue.length - 1;
      return undefined;
    } else {
      return base.queue[base.index];
    }
  }

  base.back = function(){
    base.index -= 1;
    if (base.index < 0) {
      base.index = 0;
      return undefined;
    } else {
      return base.queue[base.index];
    }
  }

  base.first = function(){
    return base.queue[0];
  }

  base.last = function(){
    return base.queue[base.queue.length - 1];
  }

  base.almostAtEnd = function(){
    return base.index > base.queue.length - 4
  }

  base.almostAtStart = function(){
    return base.index < 4;
  }

  base.empty = function(){
    return base.index < base.queue.length - 1;
  }
}
