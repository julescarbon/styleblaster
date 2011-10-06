//= require jquery

$(function () {
  var page_data = {};

  var page_keys = function (e) {
    var kc = e.keyCode;
    switch (kc) {
      case 37: // LEFT
        page_prev();
        break;
      case 39: // RIGHT
        page_next();
        break;
    }
  };
  
  var photo_keys = function (e) {
    var kc = e.keyCode;
    switch (kc) {
      case 27: // ESC
        photo_unload();
        break;
      case 37: // LEFT
        photo_prev();
        break;
      case 39: // RIGHT
        photo_next();
        break;
    }
  };
  
  var update_hash = function (page, photo) {
    window.location.hash = page + "/" + photo;
  };
  
  var photos_per_page = 30;
  var photo_index = 1;
  var page_index = 1;
  var page_max = 2;
  var page_base_href = "";
  
  var photo_click = function () {
    photo_index = $(this).data("idx");
    $(window).unbind("keydown");
    $(window).bind("keydown", photo_keys);
    $("#prev").bind("click", photo_prev);
    $("#next").bind("click", photo_next);    
    gallery_hide(photo_load);
  };

  var photo_unload = function () {
    page_load_callback = gallery_show;
    $(window).unbind("keydown");
    $(window).bind("keydown", page_keys);
    $("#prev,#next").unbind("click");
    $("#photo").fadeOut(300, function () {
      gallery_show();
    });
  };

  var photo_load = function () {
    page_load_callback = photo_load;
    if (photo_index > page_data.length)
      photo_index = page_data.length - 1;
    $("#gallery").hide();
    $("#photo img").hide();
    $("#photo").show();
    $("#photo img").attr("src", page_data[photo_index].original);
    $("#photo img").fadeIn(200);
    update_hash(page_index, photo_index);
  };
  
  var photo_next = function (e) {
    if (e) e.preventDefault();
    photo_index += 1;
    if (photo_index === page_data.length)
      if (page_index === page_max)
        photo_unload();
      else
        page_next();
    else
      photo_load();
  };

  var photo_prev = function (e) {
    if (e) e.preventDefault();
    photo_index -= 1;
    if (photo_index === -1) {
      if (page_index === 1)
        photo_unload();
      else
        page_prev();
    } else {
      photo_load();
    }
  };
  
  var page_prev = function () {
    page_index -= 1;
    if (page_index === 0) {
      page_index = 1;
    } else {
      photo_index = photos_per_page - 1;
      $.get(page_base_href+page_index+".json", null, page_load);
    }
    pagination_update();
  };
  
  var page_next = function () {
    page_index += 1;
    if (page_index > page_max) {
      page_index = page_max;
    } else {
      photo_index = 0;
      $.get(page_base_href+page_index+".json", null, page_load);
    }
  };
  
  var pagination_update = function () {
    if (page_index === 1) {
      $(".previous_page").addClass("disabled");
    } else {
      $(".previous_page").removeClass("disabled").attr("href", page_base_href + (page_index - 1));
    }
    if (page_index === page_max) {
      $(".next_page").addClass("disabled");
    } else {
      $(".next_page").removeClass("disabled").attr("href", page_base_href + (page_index + 1));
    }
  };
  var page_number = function (href) {
    return parseInt(href.replace(/^.*page\//, ""));
  };
  
  var page_click = function (e) {
    if (e) e.preventDefault();
    var href = $(this).attr("href");
    page_index = page_number(href);
    $.get(href+".json", null, page_load);
  };
  
  var page_load = function (data) {
    update_hash(page_index, "");
    pagination_update();
    page_data = data.photos;
    $("#gallery").html("");
    var divs = [];
    for (var i = 0, len = data.photos.length; i < len; i++) {
      var el = '<li data-idx="' + i + '"><img src="' + data.photos[i].thumb + '"></li>';
      divs.push(el);
    }
    $("#gallery").append(divs.join(""));
    page_load_callback();
  };
  
  var gallery_show = function (callback) {
    if (! callback) callback = function () {}
    var i = 0;
    $("#gallery li img").hide()
    $("#gallery").show();
    $("#gallery li img").each(function(){$(this).delay(i += 20).fadeIn(200);});
    $(".pagination").fadeIn(1000, callback);
  };
  var gallery_hide = function (callback) {
    if (! callback) callback = function () {}
    var i = 0;
    $("#gallery li img").each(function(){$(this).delay(i += 20).fadeOut(200);});
    $(".pagination").fadeOut(1000, callback);
  };

  var page_load_callback = gallery_show;

  var init = function () {
    $(".pagination a").each(function(){
      var page_num = parseInt($(this).html());
      if (page_num !== NaN && page_num > page_max)
        page_max = page_num;
    });
    page_base_href = $(".next_page").attr("href").replace("2","");
    $("#gallery li").live("click", photo_click);
    $(".pagination a").live("click", page_click);
    $(".pagination .previous_page").replaceWith($("<a>", {"href": page_base_href + "1", "class": "previous_page disabled"}).html("&larr; Previous"));
    $(".pagination em").replaceWith($("<a>", {"href": page_base_href + "1"}).html("1"));
    $(window).bind("keydown", page_keys);
  };
  
  init();
  page_load(first_page);
});
