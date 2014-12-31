var blaster = (function(){

  var settings = {
    delay_after_taking_picture: 1500,
    use_geolocation: false,
    enabled: false,
    left: true,
    right: false,
    up: false,
    down: false,
    show_flow: true,
    flip: false,
    flop: false,
    rotate: true,
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
    canvas_rapper.appendChild(canvas)
    taking_photo = false
    
    if (settings.rotate) {
      w = canvas.width = 450
      h = canvas.height = 600
    }
    else {
      w = canvas.width = 600
      h = canvas.height = 450
    }
    camera = document.createElement('video')
    camera_rapper.appendChild(camera)

    flow = new oflow.WebCamFlow(camera)
    flow.onCalculated(gotFlow)
  }
  function toggle(opt, id){
    opt[id] = ! opt[id]
    document.getElementById(id + "_button").classList.toggle("enabled")
  }
  function toggle_rotate(opt, id){
    toggle(opt, id)
    rotate()
  }
  function rotate(){
    if (settings.rotate) {
      w = canvas.width = 450
      h = canvas.height = 600
    }
    else {
      w = canvas.width = 600
      h = canvas.height = 450
    }
  }

  function bind_el(fn, opt, id) {
    var button = document.getElementById(id + "_button")
    var fn = fn.bind(this, opt, id)
    opt[id] && button.classList.add("enabled")
    button.addEventListener("click", fn)
    return fn
  }
  function bind () {
    keys.on("f", bind_el(toggle, settings, 'show_flow'))
    keys.on("enter", bind_el(toggle, settings, 'enabled'))
    keys.on("left", bind_el(toggle, settings, 'left'))
    keys.on("right", bind_el(toggle, settings, 'up'))
    keys.on("up", bind_el(toggle, settings, 'right'))
    keys.on("down", bind_el(toggle, settings, 'down'))
    keys.on("\\", bind_el(toggle_rotate, settings, 'rotate'))
    keys.on("[", bind_el(toggle, settings, 'flip'))
    keys.on("]", bind_el(toggle, settings, 'flop'))
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
    if (settings.rotate) {
      ctx.translate(w/2, h/2)
      ctx.rotate(Math.PI/2)
      ctx.translate(-w/2, h/2)
    }
    if (settings.flip) {
      ctx.scale(-1, 1)
      ctx.translate(-w, 0)
    }
    if (settings.flop) {
      ctx.scale(1, -1)
      ctx.translate(0, -h)
    }
    if (settings.rotate) {
      ctx.translate(-75, 75)
    }
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
    var x = 0
    var y = 0
    if (settings.rotate) {
      ctx.translate(w/2, h/2)
      ctx.rotate(Math.PI/2)
      ctx.translate(-w/2, -h/2)
    }
    if (settings.flip) {
      ctx.scale(-1, 1)
      ctx.translate(-w, 0)
    }
    if (settings.flop) {
      ctx.scale(1, -1)
      ctx.translate(0, -h)
    }
    if (settings.rotate) {
      x = (w - camera.videoWidth)/2 + 20
      y = (h - camera.videoHeight)/2 + 10
    }
    
    ctx.drawImage(camera, 0, 0, camera.videoWidth, camera.videoHeight, x, y, 600, 450)
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
    taking_photo_el.classList.add("active")
    setTimeout(function(){
      taking_photo = false
      taking_photo_el.classList.remove("active")
    }, settings.delay_after_taking_picture)
  }
  function didUpload (data) {
    var img = new Image ()
    img.src = data
    taking_photo_el.classList.remove("active")
    $("#image_rapper").empty()
    $("#image_rapper").append(img)
  }
  $(init)
  $('body').addClass('loaded')
  
  return settings
})()
