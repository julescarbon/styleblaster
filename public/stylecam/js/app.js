var blaster = (function(){

  var settings = {
    delay_after_taking_picture: 500,
    use_geolocation: false,
    enabled: false,
    left: true,
    right: false,
    up: false,
    down: false,
    show_flow: true,
    threshold: 1,
  }

  var position, sun, startTime
  var canvas, ctx, camera, flow
  var taking_photo = false
  var w = 0, h = 0
  
  function init () {
    build()
    bind()
    start()
  }
  function build () {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
    document.body.appendChild(canvas)
    taking_photo = false
    
    w = canvas.width = 450
    h = canvas.height = 600
    
    camera = document.createElement('video')
    camera.style.WebkitTransform = "rotate(-90deg) scaleX(-1)"
    rapper.appendChild(camera)

    flow = new oflow.WebCamFlow(camera)
    flow.onCalculated(gotFlow)
  }
  function toggle(opt, id){
    opt[id] = ! opt[id]
    document.getElementById(id + "_button").classList.toggle("enabled")
  }
  function toggle_fn(opt, id) {
    opt[id] && document.getElementById(id + "_button").classList.toggle("enabled")
    return toggle.bind(this, opt, id)
  }
  function bind () {
    keys.on("f", toggle_fn(settings, 'show_flow'))
    keys.on("enter", toggle_fn(settings, 'enabled'))
    keys.on("left", toggle_fn(settings, 'left'))
    keys.on("right", toggle_fn(settings, 'up'))
    keys.on("up", toggle_fn(settings, 'right'))
    keys.on("down", toggle_fn(settings, 'down'))
  }
  function start () {
    if (settings.use_geolocation) {
      navigator.geolocation.getCurrentPosition(gotPosition)
    }
    else {
      flow.startCapture()
    }
  }
  function stop () {
    flow.stopCapture()
  }

  function gotFlow (direction) {
    // direction is an object which describes current flow:
    // direction.u, direction.v {floats} general flow vector
    // direction.zones {Array} is a collection of flowZones. 
    if (settings.left && direction.v < -settings.threshold) {
      settings.enabled && upload()
    }
    else if (settings.right && direction.v > settings.threshold) {
      settings.enabled && upload()
    }
    else if (settings.up && direction.u < settings.threshold) {
      settings.enabled && upload()
    }
    else if (settings.down && direction.u > settings.threshold) {
      settings.enabled && upload()
    }
    drawCamera()
    settings.show_flow && drawFlow(direction.zones)
  }

  function gotPosition (pos) {
    position = pos
    sun = SunCalc.getTimes(new Date(), pos.coords.latitude, pos.coords.longitude)
    flow.startCapture()
  }
  function clamp(n,a,b) { return n<a?a:n<b?n:b }
  function drawFlow (zones) {
    // ctx.clearRect(0,0,w,h)
    ctx.save()
    ctx.translate(w/2, h/2)
    ctx.rotate(Math.PI/2)
    ctx.translate(-w/2, -h/2)
    ctx.translate(-75, 75)
    ctx.lineWidth = 2
    
    var zone, i, r, g, b
    for (i = 0, len = zones.length; i < len; i++) {
      zone = zones[i]
      r = ~~( 255 *  Math.abs( clamp(zone[2], -1, 0) ) )
      g = ~~Math.abs(255*clamp(zone[2]+1,0,2)/2)
      b = ~~Math.abs(255*clamp(zone[3]+1,0,2)/2)
      ctx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")"
      ctx.beginPath()
      ctx.moveTo(zone[0], zone[1])
      ctx.lineTo(zone[0]+zone[2], zone[1]+zone[3])
      ctx.stroke()
    }
    ctx.restore()
  }
  function drawCamera () {
    ctx.save()
    ctx.translate(w/2, h/2)
    ctx.rotate(Math.PI/2)
    ctx.translate(-w/2, -h/2)

    ctx.drawImage(camera, 0, 0, camera.videoWidth, camera.videoHeight, -75, 75, 600, 450)
    ctx.scale(1, 1)
    ctx.restore()
  }

  function upload () {
    if (taking_photo) return
    taking_photo = true
  
    drawCamera()

    canvas.toBlob(gotBlob, "image/jpeg")
  }
  function gotBlob (blob) {
    var params = new FormData()
    params.append('secret', 'crackers')
    params.append('test', blob, moment().format("YYYY-MM-DD-hh-mm-ss") + ".jpg")

    $.ajax({
      url: '/upload/dev',
      data: params,
      contentType: false,
      processData: false,
      type: 'POST',
      success: didUpload,
    })
  }
  function didUpload (data) {
    var img = new Image ()
    img.src = data
    $("#rapper img").remove()
    $("#rapper").append(img)

    setTimeout(function(){
      taking_photo = false
    }, settings.delay_after_taking_picture)
  }

  $(init)

  return settings
})()
