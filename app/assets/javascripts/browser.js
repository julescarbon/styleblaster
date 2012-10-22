$(function(){

  var queue = new Queue ();
  var randomQueue = new Queue ();

  var History = window.History;
  History.Adapter.bind(window, 'statechange', function(){
    var path = History.getState().url.replace(/#.*/,"").split("/").slice(2);
    switch (path[0]) {
//      default:
    }
  });

  $(window).keydown(keydown);
  $("#forward").click(forward);
  $("#back").click(back);
  $("#square").click(function(e){
    e.preventDefault();
    forward();
  });
  $("#tophat").click(like);
  $("h1").click(latest);

  init();

  function init () {
    if (window.PLOPS && PLOPS.length) {
      preload(PLOPS);
      rewind();
    }
    if (window.location.pathname == "/") startTimer();
  }

  var timer = null;
  function startTimer () {
    clearTimeout(timer);
    setTimeout(refresh, 15000);
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
        rewind();
      }
    }, "json");
  }

  var fetchingRandom = false;
  function fetchRandom(){
    if (fetchingRandom) return;
    fetchingRandom = true;
    $.get("/random", csrf({ 'limit': 10 }), function(data){
      var queueWasBare = randomQueue.bare();
      if (! (data && data.length > 0) ) return;
      for (var i in data) {
        var plop = new Plop(data[i]);
        plop.preload();
        randomQueue.append(plop);
      }
      if (queueWasBare) {
        flash();
        show( randomQueue.first() );
      } else {
        show( randomQueue.forward() );
      }
      fetchingRandom = false;
    }, 'json');
  }

  var fetching = false;
  function fetch(id) {
    if (fetching) return;
    id = parseInt(id) - 1;
    if (id > 0) {
      fetching = true;
      $.get("/p/" + id, csrf(), function(plops){
        preload(plops);
        fetching = false;
      }, "json")
    }
  }

  function rewind(){
    queue.index = 0;
    show(queue.first());
    flash();
  }

  function preload(plops){
    console.log([plops[0].id, "<=>", plops[plops.length-1].id].join(" "));
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

      case 40: // down
        latest();
        break;

      case 38: // up
        random();
        break;

    }
  }

  function like () {
    var plop = queue.current();
    if (! isLiked(plop.id) ) {
      plop.score += 1;

      localStorage.setItem("p" + plop.id, "t");

      $.post("/p/" + plop.id + "/like", csrf(), function(data){
        show(plop);
      });
    }
  }

  function isLiked (id) {
    return localStorage.getItem("p" + id) == "t"
  }

  function forward () {
    clearTimeout(timer);
    var plop = queue.forward();
    if (plop) {
      show(plop);
      History.pushState(undefined, undefined, "/p/" + plop.id);
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
      History.pushState(undefined, undefined, "/p/" + plop.id);
    }
  }

  function latest(){
    // History.pushState(undefined, undefined, "/");
    // rewind();
    window.location.href = "/";
  }

  function random(){
    History.pushState(undefined, undefined, "/random");
    if (randomQueue.empty()) {
      fetchRandom();
    } else {
      show( randomQueue.forward() );
    }
  }

  function show(plop){ 
    $("#square").attr( 'src', plop.image_url );
    $("#link").attr( 'href', plop.image_url) ;
    $("#day").html( plop.day );
    $("#month").html( plop.month );
    $("#time").html( plop.time );
    $("#score").html( tophats(plop.score) );
  }

  function flash(){
    $("#square").hide().fadeIn(500);
  }

  function tophats (count) {
    var hats = [];
    var hatCount = Math.min(count, 20);
    if (count == 0) return "";
    while (hatCount--) {
      hats.push( "<img src='/assets/tophat.png' width='24'>" )
    }
    if (count > 20) {
      hats.push( "<br>" );
      hats.push( "+ " + pluralize(count - 20, "fave", "faves") );
    }
    return hats.join("");
  }

  function pluralize (i, a, b) {
    return i + " " + (i == 1 ? a : b);
  }

});
