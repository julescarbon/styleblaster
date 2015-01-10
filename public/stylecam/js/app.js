var blaster = (function(){

  var settings = {
    delay_after_taking_picture: 1500,
    width: 600,
    height: 450,
    use_geolocation: true,
    enabled: false,
    left: true,
    right: false,
    up: false,
    down: false,
    show_flow: true,
    flip: false,
    flop: false,
    rotate: false,
    threshold: 1,
  }

  var position, sun, startTime
  var canvas, ctx, camera, flow
  var taking_photo = false
  var w = 0, h = 0
  var cw, ch, xmin, xmax, ymin, ymax
  var dragging = false
  var capturing = false
  var daylight = true
  var u_range = [0,0]
  var v_range = [0,0]

  
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

    camera = document.createElement('video')
    camera_rapper.appendChild(camera)
    
    flow = new oflow.WebCamFlow(camera)
    flow.onCamera(gotCamera)
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
      w = canvas.width = settings.height
      h = canvas.height = settings.width
    }
    else {
      w = canvas.width = settings.width
      h = canvas.height = settings.height
    }
    
    var camera_aspect = camera.videoWidth / camera.videoHeight
    if (camera_aspect > settings.width/settings.height) {
      cw = settings.width
      ch = (settings.width / camera.videoWidth) * camera.videoHeight
    }
    else {
      cw = (settings.height / camera.videoHeight) * camera.videoWidth
      ch = settings.height
    }
  }

  function bind_el (fn, opt, id) {
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

    canvas.addEventListener("mousedown", function(e){
      dragging = true
      xmin = e.pageX - canvas.offsetLeft  
      ymin = e.pageY - canvas.offsetTop
    })
    canvas.addEventListener("mousemove", function(e){
      if (! dragging) return
      xmax = e.pageX - canvas.offsetLeft
      ymax = e.pageY - canvas.offsetTop
    })
    canvas.addEventListener("mouseup", function(e){
      dragging = false
      var swap
      if (xmax < xmin) {
        swap = xmin; xmin = xmax; xmax = swap
      }
      if (ymax < ymin) {
        swap = ymin; ymin = ymax; ymax = swap
      }
    })
  }
  function start () {
    if (settings.use_geolocation) {
      navigator.geolocation.getCurrentPosition(gotPosition)
    }
    else {
      capturing = true
      flow.startCapture()
    }
  }
  function stop () {
    flow.stopCapture()
  }
  function gotCamera () {
    // wait until we *actually* got the camera
    var interval = setInterval(function(){
      if (camera.videoWidth) {
        rotate()
        xmin = 100
        xmax = canvas.width - 100
        ymin = 100
        ymax = canvas.height - 100
        clearInterval(interval)
      }
    }, 50)
  }
  function gotFlow (direction) {
    // direction is an object which describes current flow:
    // direction.u, direction.v {floats} general flow vector
    // direction.zones {Array} is a collection of flowZones.
    if (! capturing) return
    
    var u = 0, v = 0, i, zone, zoneCount = 0, len, zones = direction.zones
    for (i = 0, len = zones.length; i < len; i++) {
      zone = zones[i]
      if (xmin < zone[0] && zone[0] < xmax && ymin < zone[1] && zone[1] < ymax && zone[2] && zone[3]) {
        u += zone[2]
        v += zone[3]
        zoneCount += 1
      }
    }
    if (zoneCount) {
      u /= zoneCount
      v /= zoneCount
      u_val.innerHTML = u.toFixed(2)
      v_val.innerHTML = v.toFixed(2)
      
      u_range[0] = Math.min(u, u_range[0])
      u_range[1] = Math.max(u, u_range[1])
      u_val.innerHTML = u_range[0].toFixed(2) + ", " + u_range[1].toFixed(2) + " ... " + u.toFixed(2)
    }
    if (zoneCount && settings.enabled && daylight && ! dragging) {
      if (settings.up && v < -settings.threshold) {
        upload()
      }
      else if (settings.down && v > settings.threshold) {
        upload()
      }
      else if (settings.left && u < -settings.threshold) {
        upload()
      }
      else if (settings.right && u > settings.threshold) {
        upload()
      }
    }
    drawCamera()
    drawRegion()
    settings.show_flow && drawFlow(direction.zones)
  }
  function gotPosition (pos) {
    position = pos
    capturing = true
    checkDaylight()
    flow.startCapture()
  }
  function checkDaylight () {
    var now = new Date()
    sun = SunCalc.getTimes(now, position.coords.latitude, position.coords.longitude)
    if (sun.sunrise < now && now < sun.sunset) {
      daylight = true
      sun_el.innerHTML = "sunset at " + moment(sun.sunset).format('h:mm a')
      setTimeout(checkDaylight, sun.sunset - now + 30000)
    }
    else {
      daylight = false
      if (now < sun.sunrise) {
        sun_el.innerHTML = "sunrise at " + moment(sun.sunrise).format('h:mm a')
        setTimeout(checkDaylight, sun.sunrise - now)
      }
      else if (sun.sunset < now) {
        var tomorrow = moment().endOf('day').add(5, 'hour').toDate()
        var tomorrow_sun = SunCalc.getTimes(tomorrow, position.coords.latitude, position.coords.longitude)
        sun_el.innerHTML = "sunrise at " + moment(tomorrow_sun.sunrise).format('h:mm a')
        setTimeout(checkDaylight, tomorrow - now)
      }
    }
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
      if (settings.flop) {
        ctx.translate(0, h)
      }
      else {
        ctx.translate(0, -h)
      }
      ctx.translate((w - cw)/2, (h - ch)/2)
    }

    ctx.lineWidth = 2
    
    var zone, i, r, g, b, aa
    for (i = 0, len = zones.length; i < len; i++) {
      zone = zones[i]
      r = ~~( 255 *  Math.abs( clamp(zone[2], -1, 0) ) )
      g = ~~Math.abs(255*clamp(zone[2]+1,0,2)/2)
      b = ~~Math.abs(255*clamp(zone[3]+1,0,2)/2)
      if (xmin < zone[0] && zone[0] < xmax && ymin < zone[1] && zone[1] < ymax) {
        ctx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")"
      }
      else {
        aa = ((r+g+b)/3)|0
        ctx.strokeStyle = "rgb(" + aa + "," + aa + "," + aa + ")"
      }
      ctx.beginPath()
      ctx.moveTo(zone[0], zone[1])
      ctx.lineTo(zone[0]+zone[2], zone[1]+zone[3])
      ctx.stroke()
    }
    ctx.scale(1, 1)
    ctx.restore()
  }
  function drawRegion () {
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
      if (settings.flop) {
        ctx.translate(0, h)
      }
      else {
        ctx.translate(0, -h)
      }
      ctx.translate((w - cw)/2, (h - ch)/2)
    }
    ctx.fillStyle = "rgba(255,0,0,0.2)"
    ctx.strokeStyle = "#f00"
    ctx.fillRect(xmin, ymin, xmax-xmin, ymax-ymin)
    ctx.strokeRect(xmin, ymin, xmax-xmin, ymax-ymin)
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
      x = (w - cw)/2
      y = (h - ch)/2
    }
    
    ctx.drawImage(camera, 0, 0, camera.videoWidth, camera.videoHeight, x, y, cw, ch)
    ctx.scale(1, 1)
    ctx.restore()
  }

  function upload () {
    if (taking_photo || dragging) return
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
  
  settings.resetRange = function(){ u_range = [0,0] }
  return settings
})()
