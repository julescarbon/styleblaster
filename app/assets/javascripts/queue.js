function Queue () {
  var base = this;
  base.queue = [];
  base.index = 0;
  
  base.append = function(item){
    base.queue.push(item);
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
}
