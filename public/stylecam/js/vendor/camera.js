var camera = (function(){
  var loaded = false, video

  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  if (! navigator.getMedia) {
    $("#camera").hide()
    return
  }

  $("#camera").click(load)
  
  function load(){
    if (! loaded) {
      build()
    }
    else {
      ready()
    }
    window.gif = window.img = null
  }

  function ready(){
    // defer here if necessary.. firefox fires "canplay" before videoWidth is available
    if (! video.videoWidth) {
      setTimeout(ready, 50)
      return
    }
//    cc.canvas.width = actual_w = w = min(video.videoWidth, 400)
//    cc.canvas.height = actual_h = h = video.videoHeight / (video.videoWidth/w)
    video.setAttribute('width', video.videoWidth)
    video.setAttribute('height', video.videoHeight)
    window.gif = window.img = null
    window.cam = video
    window.loaded(video)
  }
  
  function build(){
    video = document.createElement("video")
    navigator.getMedia({
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    )

    video.addEventListener('canplay', function(e){
      if (! loaded) {
        loaded = true
        ready()
      }
    }, false);
  }

  load()

})()
