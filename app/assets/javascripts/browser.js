$(function(){

  var queue = new Queue ();
  var base_url = "http://s3.amazonaws.com/styleblaster/styleblaster/photos/original/";

  $(window).keydown(keydown);
  $("#forward").click(forward);
  $("#back").click(back);
  $("#square").click(forward);
  init();

  function Plop (data){
    var base = this;
    base.data = data || { id: 0, image_url: "", filetype: "" };

    base.id = base.data.id;
    base.image_url = base_url + data.photo_file_name.replace(/.png$/, ".jpg");

    var d = derail_date(data.created_at);
    base.day = d.getDate();
    base.month = month(d.getMonth());
    base.time = twelve(d.getHours()) + ":" + zero(d.getMinutes()) + " " + merid(d.getHours());

    base.preload = function(){
      var img = new Image();
      img.src = base.image_url;
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

      case 39: // right
        forward();
        break;

      case 37: // left
        back();
        break;

      case 40: // up
        random();
        break;

      case 38: // down
        latest();
        break;

    }
  }

  function forward () {
    var plop = queue.forward();
    if (plop) {
      show(plop);
    }
    if (queue.almostAtEnd()) {
      fetch(queue.last().data.id);
    }
  }

  function back () {
    var plop = queue.back();
    if (plop) {
      show(plop);
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
    $("#square").attr('src', plop.image_url);
    $("#link").attr('href', plop.image_url);
    $("#day").html(plop.day);
    $("#month").html(plop.month);
    $("#time").html(plop.time);
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
