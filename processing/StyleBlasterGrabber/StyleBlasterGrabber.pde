import processing.opengl.*;
import processing.video.*;
import org.seltar.Bytes2Web.*;
import java.awt.Rectangle;

Capture cam;
Capture sensor;
Timer cameraTimer, sensorTimer;
int numPixels;
boolean blast; //turns photo-taking on or off
boolean ignoreSensor = true;
boolean debug = true;
boolean uploading = false;
boolean checkRight = false;
ImageToWeb img;
byte[] imgBytes;
PImage grabImage;

MotionSensor leftSensor, rightSensor;

//SETUP VARS
int startHour = 7; //7am
int endHour = 18;  //6pm
int sensorBuffer = -355;
int sensorBufferY = 50;
String uploadURL = "http://styleblaster.herokuapp.com/upload";
int camWidth;
int camHeight = 720;
int sensorThreshold = 15;
float sensorRes = 1;

public void setup() {
  int camWidth = 1280;//(16*camHeight)/9; //get correct aspect ratio for width
  //camHeight = 2;
 // int sketchHeight = (camHeight*333)/500;
  size(666, 1000);
 //   size(1280, 720);

  String[] devices = Capture.list();
  // uncomment the line below to print a list of devices ready for img capture
  println(devices);
  fill(255, 50, 50);
  noFill();
  String[] cameras = Capture.list();
  cam = new Capture(this, 2592, 1944, "Logitech Camera");
//cam = new Capture(this, cameras[0]);


  cam.start();
  //cam.frameRate(20);
  cameraTimer = new Timer(5000);
  // cameraTimer.start();

  sensorTimer = new Timer(1000);

  //initialize the hit areas
  leftSensor = new MotionSensor();
  rightSensor = new MotionSensor();
}

void draw() {
  blast = false;
  if (hour()>=startHour) {
    if (hour()<endHour) {
      if (cam.available()) {
        blast = true;
      }
    }
  }

  if (! uploading) {
    cam.read();
 //   image(cam, 0, 0);
    image(cam, -cam.width/2+width/2, -cam.height/2+height/2);
    grabImage = cam.get(cam.width/2-width/2,cam.height/2-height/2,width,height);
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

    rightSensor._r.x = leftSensor._r.x+sensorWidth+sensorBuffer;
    // rightSensor._r.y = mouseY;

 /*   if (leftSensor._r.width < 3) {
      leftSensor.setWidth(3);
      rightSensor.setWidth(3);
    }

    if (leftSensor._r.height < 3) {
      leftSensor.setWidth(3);
      rightSensor.setWidth(3);
    }*/

    leftSensor.update();
    rightSensor.update();
  }
  else {
    if (blast) {

      boolean leftHit = false;
      boolean rightHit = false;
      //update the reference image on the sensors
      rightSensor._image = grabImage;
      leftSensor._image = grabImage;

      //MONOTR THE LEFT SENSOR
      if (!checkRight) {
        //monitor the left sensor
        leftHit = leftSensor.checkHitArea();
        if (leftHit) {
          checkRight = true;
          rightSensor.reset();
          // leftSensor._bDiff = 0;
          //start the timer
          sensorTimer.start();
        }
      }
      else {
        //monitor the RIGHT sensor
        if (sensorTimer.isFinished()) {
          //STOP monitoring the right sensor
          checkRight = false;
          // rightSensor._bDiff = 0;
        }
        else {
          rightHit = false;
          rightHit = rightSensor.checkHitArea();
        }
      }
      if (ignoreSensor) {
        ignoreSensor = false;
      }
      else {
        if (rightHit) {
          leftSensor.reset();
          println("!!!HIT!!! @ : "+rightSensor._bDiff);
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
  rightSensor._r.y = mouseY+sensorBufferY;

  ignoreSensor = true;
}



void onHit() {
  //IS THE CAMERA TIMER NEEDED HERE?
  // if (cameraTimer.isFinished()) {
  takePicture();
  // cameraTimer.start();
  // }
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
  //cameraTimer.start();
}

void keyPressed() {
  if (key == ' ') {
    debug = !debug;
  } 
  else if (key == 'c') {
    //open camera settings
 //   cam.settings();
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
