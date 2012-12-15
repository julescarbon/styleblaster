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
boolean ignoreSensor = false;
boolean debug = false;
boolean uploading = false;
boolean checkRight = false;
boolean grab = false;
boolean disable = false;
boolean recordGif = false;
boolean doGifs = false;
ImageToWeb img;
byte[] imgBytes;
PImage grabImage;
//GifMaker gifExport;

MotionSensor motionSensor;

//SETUP VARS
String version = "1.5";
int startHour = 7; //am
int endHour = 16;  //3:59pm
int endMinute = 25; 
<<<<<<< HEAD
int sensorBuffer = -220;
int sensorBufferY = 50;

boolean production = false;

String nycUploadURL = "http://styleblaster.herokuapp.com/upload/nyc";
String gdlUploadURL = "http://styleblaster.herokuapp.com/upload/gdl";
String devUploadURL = "http://styleblaster.herokuapp.com/upload/dev";

// select the production endpoint for the compiled build
String uploadURL = nycUploadURL;
String tag = "nyc";

=======
String uploadURL = "http://styleblaster.herokuapp.com/upload";
>>>>>>> master
int camWidth;
int camHeight = 720;
int sensorThreshold = 13;
int flowDirection = -1; //-1 = right to left, 1 = left to right
int flowThreshold = 220;
float sensorRes = 1;

public void setup() {
  int camWidth = 1280;//(16*camHeight)/9; //get correct aspect ratio for width
  //camHeight = 2;
  int sketchHeight = 1000;
  int sketchWidth = 666;
  float m = .7;

  size(round(sketchWidth*m), round(sketchHeight*m));
  //   size(1280, 720);

  String[] devices = Capture.list();
  // uncomment the line below to print a list of devices ready for img capture
  println(devices);
  fill(255, 50, 50);
  noFill();
  String[] cameras = Capture.list();
  if (version == "2.0") {
    cam = new Capture(this, 1280, 960, "Logitech Camera");
  }
  else {
    //   cam = new Capture(this, 2592,1944);
    //Logitech 910c
    //cam = new Capture(this, 1280, 960);
    //Microsoft Studio
    cam = new Capture(this, 1920, 1080);
    // cam = new Capture(this, 1280, 720);
  }

  if (version == "2.0") {
    //   cam.start();
  }
  //set global framerate
  int f = 25;
  frameRate(f);
  cam.frameRate(f);
  cameraTimer = new Timer(1000);

  sensorTimer = new Timer(1000);

  //initialize the hit areas
  motionSensor = new MotionSensor();
  //initialize sensor position
  motionSensor._r.width = 20;
  motionSensor._r.height = 20;
  motionSensor._r.x = width/2 - motionSensor._r.width/2;
  motionSensor._r.y = height * 2/3;
  motionSensor.update();

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

    motionSensor._bDiff = 0;
    ignoreSensor = true;
    int sensorWidth = round((mouseX - motionSensor._r.x));
    int sensorHeight =  mouseY - motionSensor._r.y;
    motionSensor._r.width = sensorWidth;
    motionSensor._r.height = sensorHeight;

    motionSensor.update();

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
        println("!!!HIT!!! @ : ");
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

    motionSensor.draw();

    fill(255);
    text("threshold: "+sensorThreshold, 5, height-5);
    text("xFlowSum: "+of.xFlowSum, width - 150, height - 5); // time (msec) for this frame
  }

  if (blast) {

    //BLAST OFF!
    boolean hit = false;
    grab = false;
    //update the reference image on the sensors
    motionSensor._image = grabImage;
    
    //GIF EXPORT*********START
    if (doGifs){
      
    if (of.xFlowSum < flowThreshold) {
      if (!recordGif) {
       // gifExport = new GifMaker(this, getTimestamp()+".gif");
       // gifExport.setRepeat(0); // make it an "endless" animation
      }
      //start recording gif
      //gifExport.setDelay(40);
      //gifExport.addFrame();
      recordGif = true;
    }
    else if (recordGif) {
      //stop recording gif
      //gifExport.finish();
      recordGif = false;
      //  gifExport = new GifMaker(this, "export.gif");
    }}
//GIF EXPORT**********END

    hit = motionSensor.checkHitArea();     
    if (hit) {
      motionSensor.reset();
      boolean dir = false;
      if(flowDirection == -1){
        //right to left
        dir = of.xFlowSum < flowThreshold*flowDirection;
      }
      else{
        //left to right
        dir = of.xFlowSum > flowThreshold;
      }
      
      if (dir) {
        grab = true;
      }
    }
  }
}

void mousePressed() {
  motionSensor._r.x = mouseX;
  motionSensor._r.y = mouseY;
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
  filename += "-";
  filename += production ? tag : "dev";
  return filename;
}

void takePicture() {

  /* PGraphics pg = createGraphics(grabImage.width, grabImage.height, P2D); // I create a PGraphics from it
   pg.loadPixels();
   grabImage.loadPixels();
   for (int i = 0; i < grabImage.pixels.length; i++)
   {
   pg.pixels = grabImage.pixels;
   }*/

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
  if (production) {
    img.post("test", uploadURL, getTimestamp() + ".png", false, imgBytes);
  } else {
    img.post("test", devUploadURL, getTimestamp() + ".png", false, imgBytes);
  }
  cameraTimer.start();
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
    motionSensor._thresh = sensorThreshold;
  }
  else if (key == ',') {
    //increase the threshold
    sensorThreshold -= 1;

    motionSensor._thresh = sensorThreshold;
  }
  else if (key=='w') of.flagseg=!of.flagseg; // segmentation on/off
  else if (key=='s') of.flagsound=!of.flagsound; //  sound on/off
  else if (key=='m') of.flagmirror=!of.flagmirror; // mirror on/off
  else if (key=='f') of.flagflow=!of.flagflow; // show opticalflow on/off
<<<<<<< HEAD
  else if (key=='d') disable=!disable; // show opticalflow on/off
  else if (key=='v') production=!production; // send to production endpoint
=======
  else if (key=='d') disable=!disable; // disable/enable
>>>>>>> master
}

