$(function(){

  var queue = new Queue ();
  var ext = { 'image/png': 'png', 'image/jpeg': 'jpg' };

  $(window).bind("keydown", keydown);

  init();

  function Plop (data){
    var base = this;
    base.data = data || { id: 0, image_url: "", filetype: "" };

    base.type = ext[data.photo_content_type]
    base.data.image_url = "http://s3.amazonaws.com/styleblaster/styleblaster/photos/original/" + data.photo_file_name.replace(/.png$/, ".jpg");
    // http://s3.amazonaws.com/styleblaster/styleblaster/photos/original
    // created_at":"2012-10-06T21:22:45Z","id":836,"photo_content_type":"image/png","photo_file_name
    
    base.preload = function(){
      var img = new Image();
      img.src = base.data.image_url;
    }
  };

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

  function init () {
    if (window.PLOPS && PLOPS.length) {
      preload(PLOPS);
      var plop = queue.first();
      show(plop);
    }
  }

  function keydown (e) {
    switch (e.keyCode) {
      case 37: // left
        var plop = queue.forward();
        if (plop) {
          show(plop);
        }
        if (queue.almostAtEnd()) {
          fetch(queue.last().data.id);
        }
        break;
      case 39: // right
        var plop = queue.back();
        if (plop) {
          show(plop);
        }
        break;
      case 38: // up
        random();
        break;
      case 40: // down
        latest();
        break;
    }
  }

  function preload(plops){
    for (var i in plops) {
      var plop = new Plop(plops[i]);
      plop.preload();
      queue.append(plop);
    }
  }

  function show(plop){
    console.log(plop.data.id);  
    document.body.style.backgroundImage = 'url(' + plop.data.image_url + ')';
    $("#square").attr('src', plop.data.image_url);
    $("#link").attr('href', plop.data.image_url);
  }

  function random(){
    window.location.href = "/random";
  }

  function latest(){
    window.location.href = "/";
  }

  function fetch(id) {
    id = parseInt(id) - 1;
    if (id > 0) {
      $.get("/p/" + id, csrf(), function(plops){
        preload(plops);
      }, "json")
    }
  }

});
