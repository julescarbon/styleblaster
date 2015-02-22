import processing.opengl.*;
import processing.video.*;
import org.seltar.Bytes2Web.*;
import java.awt.Rectangle;
//import gifAnimation.*;

OpticalFlow of;
Capture cam;
Capture sensor;
Timer cameraTimer, sensorTimer;
int numPixels;
boolean blast; //turns photo-taking on or off
boolean ignoreSensor = true;
boolean debug = false;
boolean uploading = false;
boolean checkRight = false;
boolean grab = false;
boolean disable = false;
//boolean recordGif = false;
// f boolean doGifs = false;
ImageToWeb img;
byte[] imgBytes;
PImage grabImage;
//GifMaker gifExport;

MotionSensor leftSensor;

//SETUP VARS
String version = "2.0";
int startHour = 7; //am
int endHour = 18;  //3:59pm
int endMinute = 25; 
int sensorBuffer = -220;
int sensorBufferY = 50;
String uploadURL;
String nycUploadURL = "http://styleblaster.herokuapp.com/upload/nyc";
String gdlUploadURL = "http://styleblaster.herokuapp.com/upload/gdl";
String devUploadURL = "http://styleblaster.herokuapp.com/upload/dev";

int camWidth;
int camHeight = 720;
int sensorThreshold = 13;
int flowThreshold = -220;
float sensorRes = 1;

public void setup() {
  uploadURL = nycUploadURL;
  
  int camWidth = 1280;//(16*camHeight)/9; //get correct aspect ratio for width
  //camHeight = 2;
  int sketchHeight = 1000;
  int sketchWidth = 666;
  float m = .7;

  size(round(sketchWidth*m), round(sketchHeight*m));

  String[] devices = Capture.list();
  // uncomment the line below to print a list of devices ready for img capture
  println(devices);
  fill(255, 50, 50);
  noFill();
  String[] cameras = Capture.list();
  //Microsoft Studio
 // cam = new Capture(this, 1920, 1080, "Microsoft¬Æ LifeCam Studio(TM)");
  cam = new Capture(this, 1920, 1080);
  
  cam.start();

  //set global framerate
  int f = 25;
  frameRate(f);
  cameraTimer = new Timer(1000);

  sensorTimer = new Timer(1000);

  //initialize the hit area
  int boxSize = 20;
  leftSensor = new MotionSensor(width/2-boxSize/2,height/2-boxSize/2,boxSize,boxSize);
  blast = false;
  of = new OpticalFlow(cam);
}

void draw() {
  background(0);
  blast = false;
  if (hour()>=startHour) {
    if (hour()<endHour) {
      if (cam.available()) {
        if (disable == false) {
          blast = true;
        }
      }
    }
  }

  if (mousePressed) {
    rectMode(CORNER);

    leftSensor._bDiff = 0;
    ignoreSensor = true;
    int sensorWidth = round((mouseX - leftSensor._r.x));
    int sensorHeight =  mouseY - leftSensor._r.y;
    leftSensor._r.width = sensorWidth;
    leftSensor._r.height = sensorHeight;

    leftSensor.update();

    blast = false;
  }

  if (! uploading) {
    cam.read();
    grabImage = cam.get(cam.width/2-width/2, cam.height/2-height/2, width, height);
    image(grabImage, 0, 0);

    of.updateImage(grabImage);
    of.draw();

    if (ignoreSensor) {
      ignoreSensor = false;
    }
    else {
      if (grab) {
        fill(255, 0, 0);
        onHit();
      }
      else {
        noFill();
      }
    }
  }

  stroke(255, 100, 100);
  //***DRAW DEBUG SHIT TO SCREEN***
  if (debug) {
    rectMode(CORNER);
    noFill();
    //date
    text(getTimestamp(), 5, 15);

    leftSensor.draw();

    fill(255);
    text("threshold: "+sensorThreshold, 5, height-5);
    text("xFlowSum: "+of.xFlowSum, width - 150, height - 5); // time (msec) for this frame
  }

  if (blast) {

    //BLAST OFF!
    boolean hit = false;
    grab = false;
    //update the reference image on the sensors
    leftSensor._image = grabImage;

    hit = leftSensor.checkHitArea();     
    if (hit) {
      leftSensor.reset();

      if (of.xFlowSum < flowThreshold) {
        grab = true;
      }
    }
  }
}

void mousePressed() {
  leftSensor._r.x = mouseX;
  leftSensor._r.y = mouseY;
  ignoreSensor = true;
}

void onHit() {
  //IS THE CAMERA TIMER NEEDED HERE?
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
  String name = getTimestamp() + ".png";
  println("uploading "+name+" to "+uploadURL);
  img.post("test", uploadURL, name, false, imgBytes);
  cameraTimer.start();
}

void keyPressed() {
  if (key == ' ') {
    debug = !debug;
  } 
  else if (key == 'c') {
    //open camera settings
    // cam.settings();
    ignoreSensor = true;
  }
  else if (key == '.') {
    //increase the threshold
    sensorThreshold += 1;
    leftSensor._thresh = sensorThreshold;
  }
  else if (key == ',') {
    //increase the threshold
    sensorThreshold -= 1;

    leftSensor._thresh = sensorThreshold;
  //  rightSensor._thresh = sensorThreshold;
  }
  else if (key=='w') of.flagseg=!of.flagseg; // segmentation on/off
  else if (key=='s') of.flagsound=!of.flagsound; //  sound on/off
  else if (key=='m') of.flagmirror=!of.flagmirror; // mirror on/off
  else if (key=='f') of.flagflow=!of.flagflow; // show opticalflow on/off
  else if (key=='d') disable=!disable; // show opticalflow on/off
}

