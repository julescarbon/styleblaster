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

  function init () {
    if (window.PLOPS && PLOPS.length) {
      preload(PLOPS);
      var plop = queue.first();
      show(plop);
    }
    startTimer();
  }

  var timer = null;
  function startTimer () {
    clearTimeout(timer);
    setTimeout(refresh, 5000);
  }

  function refresh () {
    $.get("/refresh.json", csrf({ limit: 1 }), function(data) {
      startTimer();
      if (! (data && data.length > 0) ) return;
      var plopData = data.shift();
      if (plopData.id !== queue.first().id) {
        var plop = new Plop(plopData);
        plop.preload();
        queue.prepend(plop);
        queue.index = 0;
        show(plop);
        $("#square").hide().fadeIn(500);
      }
    }, "json");
  }

  function preload(plops){
    for (var i in plops) {
      var plop = new Plop(plops[i]);
      plop.preload();
      queue.append(plop);
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
    clearTimeout(timer);
    var plop = queue.forward();
    if (plop) {
      show(plop);
    }
    if (queue.almostAtEnd()) {
      fetch(queue.last().data.id);
    }
  }

  function back () {
    clearTimeout(timer);
    var plop = queue.back();
    if (plop) {
      show(plop);
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
    startTimer();
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
