$(function(){
    $("#datepicker").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function () {
			console.log(this.value);
        }
    });

	if (!( 'REGION' in window )) return;
	
	var region = "/" + REGION;

  var randomMode = false;
  var queue = new Queue ();
  var randomQueue = new Queue ();

  var radPhrases = ['cool!','top style!','rad!','bangin!','sweet!','sick!','dang!','awesome!','sooo good!','boom!','ooh!','tres&nbsp;brooklyn!','wickid!','wow!','holla!','new&nbsp;aesthetic!'];

  var History = window.History;
  History.Adapter.bind(window, 'statechange', function(){
    var path = History.getState().url.replace(/#.*/,"").split("/").slice(2);
    switch (path[0]) {
//      default:
    }
  });

  function init () {
    bind();
    load();
    window.top.scrollTo(0, 1);
  }

  function bind () { 
    $(window).keydown(keydown);
    $("#forward").click(forward);
    $("#back").click(back);
    $("#link").click(function(e){
      e.preventDefault();
      forward();
      return false;
    });
    $("#tophat").click(like);
    $("#random").click(random);
    $("#popular").click(popular);
    $("h1").click(latest);
  }

  function load () {
    if (window.PLOPS && PLOPS.length) {
      preload(PLOPS);
      rewind();
    }
		var pathparts = window.location.pathname.replace(/^\//,"").replace(/\/$/,"").split("/");
		if (pathparts.length == 0 || (pathparts.length == 1 && pathparts[0] == REGION)) startTimer();
  }

  var timer = null;
  function startTimer () {
    clearTimeout(timer);
    timer = setTimeout(refresh, 3000);
  }

  function refresh () {
    $.get(region + "/refresh.json", csrf({ limit: 1 }), function(data) {
      startTimer();
      if (! (data && data.length > 0) ) return;
      var plopData = data.shift();
      if (plopData.id !== queue.first().id) {
        var plop = new Plop(plopData);
        plop.preload();
        queue.prepend(plop);
        rewind();
        History.pushState(undefined, undefined, region + "/");
      }
    }, "json");
  }

  var fetchingRandom = false;
  function fetchRandom(){
    if (fetchingRandom) return;
    fetchingRandom = true;
    $.get(region + "/random", csrf({ 'limit': 10 }), function(data){
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
  function fetch (id, callback) {
    console.log("not fetching yet..", id);
    id = parseInt(id) - 1;
    if (id > 0 && ! fetching) {
      fetching = true;
      $.get(region + "/p/" + id, csrf({ limit: 24 }), function(plops){
      	if (plops.length > 0) {
					preload(plops, callback);
				}
				setTimeout(function(){
					fetching = false;
				}, 2000);
      }, "json")
    }
  }

  function rewind(){
    queue.index = 0;
    show(queue.first());
    flash();
  }

  function preload(plops, callback){
    console.log([plops[0].id, "<=>", plops[plops.length-1].id].join(" "));
    for (var i in plops) {
      var plop = new Plop(plops[i]);
      plop.preload();
      queue.append(plop);
    }
    if (callback) callback();
  }
  
  var holdThrottle = null;
  function keydown (e) {
    switch (e.keyCode) {
			
			case 27: // esc
				window.location.href = region + "/gallery";
				break;

      case 39: // right
      	if (! holdThrottle && ! fetching) {
					forward();
					holdThrottle = setTimeout(function(){
						holdThrottle = null;
					}, 50);
      	}
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
  
      case 32: // spacebar
        like();
        break;

    }
  }

  var refaved = false;
  function like () {
    var plop = randomMode ? randomQueue.current() : queue.current();
    $("#rad").stop().css('opacity', 0.0);
    $("#rad").html( choice(radPhrases) )
    $("#rad").css('opacity', 1.0).animate({ 'opacity': 0.0 }, 800);

    if (! isLiked(plop.id) ) {
      refaved = false;
      plop.score += 1;

      localStorage.setItem("p" + plop.id, "t");

      $.post(region + "/p/" + plop.id + "/like", csrf(), function(data){
        show(plop);
      });

      _gaq.push(['_trackEvent', 'fave', 'click']);
    } else if (! refaved) {
      refaved = true;
      _gaq.push(['_trackEvent', 'refave', 'click']);
    }
  }

  function isLiked (id) {
    return localStorage.getItem("p" + id) == "t"
  }

  function forward () {
    randomMode = false;
    clearTimeout(timer);
    var plop = queue.forward();
    if (plop) {
      show(plop);
      History.pushState(undefined, undefined, region + "/p/" + plop.id);
    }
    if (queue.almostAtEnd()) {
      fetch(queue.last().data.id);
    }
    _gaq.push(['_trackEvent', 'forward', 'click']);
  }

  function back () {
    randomMode = false;
    clearTimeout(timer);
    var plop = queue.back();
    if (plop) {
      show(plop);
      History.pushState(undefined, undefined, region + "/p/" + plop.id);
    }
    _gaq.push(['_trackEvent', 'back', 'click']);
  }

  function latest(){
    // History.pushState(undefined, undefined, "/");
    // rewind();
    window.location.href = region;
  }

  function popular(){
    // History.pushState(undefined, undefined, "/");
    // rewind();
    window.location.href = region + "/popular";
  }

  function random(){
    randomMode = true;
    History.pushState(undefined, undefined, region + "/random");
    if (randomQueue.empty()) {
      fetchRandom();
    } else {
      show( randomQueue.forward() );
    }
    _gaq.push(['_trackEvent', 'random', 'click']);
    return false;
  }

	var socialLoaded = false;
  function show(plop){ 
    $("#square").attr( 'src', plop.image_url );
    $("#link").attr( 'href', plop.image_url );
    $("#day").html( plop.day );
    $("#month").html( plop.month );
    $("#time").html( plop.time );
    $("#score").html( tophats(plop.score) );
    if (socialLoaded) {
			buildSocialButtons( "http://styleblaster.net/" + REGION + "/p/" + plop.id );
		} else {
			socialLoaded = true;
		}
  }

  function flash(){
    $("#square").hide().fadeIn(500);
  }

  function choice(list){
    return list[ Math.floor(Math.random() * list.length) ]
  }

  function tophats (count) {
    var hats = [];
    var hatCount = Math.min(count, 5);
    if (count == 0) return "";
    while (hatCount--) {
      hats.push( "<img src='/assets/tophat.png' width='24'>" )
    }
    if (count > 5) {
      hats.push( "<span id='hatcount'>+ " + (count - 5) + "</span>" ); // pluralize(count - 5, "fave", "faves") );
    }
    return hats.join("");
  }

  function pluralize (i, a, b) {
    return i + " " + (i == 1 ? a : b);
  }

  init();

});
