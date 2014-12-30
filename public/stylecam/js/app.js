var settings = {
  delay_after_taking_picture: 500,
  use_geolocation: false,
  left: true,
  right: false,
  up: false,
  down: false,
  threshold: 1,
}

var position, sun, startTime
var canvas, ctx, camera, flow
var taking_photo = false

function init () {
  build()
  start()
}
function build () {
  canvas = document.createElement('canvas')
  ctx = canvas.getContext('2d')
  taking_photo = false

  camera = document.createElement('video')
  camera.style.WebkitTransform = "rotate(-90deg) scaleX(-1)"
  rapper.appendChild(camera)

  flow = new oflow.WebCamFlow(camera)
  flow.onCalculated(gotFlow)
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
		return upload()
  }
  else if (settings.right && direction.v > settings.threshold) {
		return upload()
  }
  // v_val.innerHTML = Math.floor( direction.v * 100 )
  // Each flow zone describes optical flow direction inside of it.
  // flowZone : {
  //  x, y // zone center
  //  u, v // vector of flow in the zone
  // }
}

function gotPosition (pos) {
  position = pos
  sun = SunCalc.getTimes(new Date(), pos.coords.latitude, pos.coords.longitude)
  flow.startCapture()
}

function upload () {
	if (taking_photo) return
	taking_photo = true
	
	var w = canvas.width = 450
	var h = canvas.height = 600

	ctx.translate(w/2, h/2)
	ctx.rotate(Math.PI/2)
	ctx.translate(-w/2, -h/2)

	ctx.drawImage(camera, 0, 0, camera.videoWidth, camera.videoHeight, -75, 75, 600, 450)
  ctx.scale(1, 1)

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