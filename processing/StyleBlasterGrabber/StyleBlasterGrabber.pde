import processing.opengl.*;
import processing.video.*;
import org.seltar.Bytes2Web.*;
import java.awt.Rectangle;

Capture cam;
Capture sensor;
Timer cameraTimer;
int numPixels;
boolean ignoreSensor = true;
boolean debug = true;
boolean uploading = false;
ImageToWeb img;
byte[] imgBytes;

String uploadURL = "http://styleblaster.herokuapp.com/upload";
//String uploadURL = "http://localhost:3000/upload";
int sensorThreshold = 15;
float sensorRes = 1;

//
MotionSensor leftSensor, rightSensor;

public void setup() {
  size(800, 600);
  String[] devices = Capture.list();
  // uncomment the line below to print a list of devices ready for img capture
  println(devices);
  fill(255, 50, 50);
  cam = new Capture(this, 800, 600);
  cam.frameRate(24);
  cameraTimer = new Timer(5000);
  cameraTimer.start();

  //initialize the hit areas
  leftSensor = new MotionSensor();
   rightSensor = new MotionSensor();
}

void draw() {
  if (! uploading) {
    cam.read();
    image(cam, 0, 0);
  }

  stroke(255, 100, 100);
  //***DRAW DEBUG SHIT TO SCREEN***
  if (debug) {
    //date
    text(getTimestamp(), 5, 25);
    
    leftSensor.draw();
    rightSensor.draw();

    text("threshold: "+sensorThreshold, 5, height-5);
  }

  if (mousePressed) {
    leftSensor._bDiff = 0;
    rightSensor._bDiff = 0;

    ignoreSensor = true;
    int sensorWidth = round((mouseX - leftSensor._r.x)/2);
    int sensorHeight =  mouseY - leftSensor._r.y;
    leftSensor._r.width = sensorWidth;
    rightSensor._r.width = sensorWidth;
    leftSensor._r.height = sensorHeight;
    rightSensor._r.height = sensorHeight;
    
     rightSensor._r.x = leftSensor._r.x+sensorWidth;
    // rightSensor._r.y = mouseY;
    
    if (leftSensor._r.width < 3) {
      leftSensor.setWidth(3);
      rightSensor.setWidth(3);
    }
    
    if (leftSensor._r.height < 3) {
      leftSensor.setWidth(3);
      rightSensor.setWidth(3);
    }
    
    leftSensor.update();
    rightSensor.update();
  }
  else {
    if (cam.available()) {
      boolean hit = leftSensor.checkHitArea(cam);
      if (ignoreSensor) {
        ignoreSensor = false;
      }
      else {
        if (hit) {
          println("!!!HIT LEFT!!! @ : "+leftSensor._bDiff);
          fill(255, 0, 0);
          onHit();
        }
        else {
          noFill();
        }
      }
    }
  }
}

void mousePressed() {
  leftSensor._r.x = mouseX;
  leftSensor._r.y = mouseY;
 // rightSensor._r.x = mouseX+rightSensor._r.width;
  rightSensor._r.y = mouseY;
  ignoreSensor = true;
}

void keyPressed() {
  if (key == ' ') {
    debug = !debug;
  } 
  else if (key == 'c') {
    //open camera settings
    cam.settings();
    ignoreSensor = true;
  }
  else if (key == '.') {
    //increase the threshold
    sensorThreshold += 1;
    leftSensor._thresh = sensorThreshold;
        rightSensor._thresh = sensorThreshold;

  }
  else if (key == ',') {
    //increase the threshold
    sensorThreshold -= 1;

    leftSensor._thresh = sensorThreshold;
        rightSensor._thresh = sensorThreshold;

  }
}

void onHit() {
  if (cameraTimer.isFinished()) {
    takePicture();
    cameraTimer.start();
  }
}

String getTimestamp() {
  String filename = "";
  filename += String.valueOf(year());
  filename += "-";
  filename += String.valueOf(month());
  filename += "-";
  filename += String.valueOf(day());
  filename += "-";
  filename += String.valueOf(hour());
  filename += "-";
  filename += String.valueOf(minute());
  filename += "-";
  filename += String.valueOf(second());
  return filename;
}

void takePicture() {
  // "this" references the processing PApplet itself and is mandatory here
  img = new ImageToWeb(this);
  img.setType(ImageToWeb.PNG);

  // load the raw bytes from the thing
  imgBytes = img.getBytes();

  // upload the picture
  uploadPicture();
}

void uploadPicture() {
  // img.post(String project, String url, String filename, boolean popup, byte[] bytes)
  img.post("test", uploadURL, getTimestamp() + ".png", false, imgBytes);
  cameraTimer.start();
}
