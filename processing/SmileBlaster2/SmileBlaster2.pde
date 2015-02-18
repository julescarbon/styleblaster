import processing.opengl.*;
import processing.video.*;
import hypermedia.video.*;
import org.seltar.Bytes2Web.*;
import java.awt.Rectangle;
OpenCV opencv;
//import gifAnimation.*;

OpticalFlow of;
Capture cam;
Capture sensor;
Timer cameraTimer, sensorTimer, smileTimer;
int numPixels, fcnt;
boolean blast; //turns photo-taking on or off
boolean ignoreSensor = false;
boolean debug = false;
boolean uploading = false;
boolean checkRight = false;
int grab = 0;
boolean disable = false;
boolean recordGif = false;
boolean doGifs = false;
ImageToWeb img;
byte[] imgBytes;
PImage grabImage;
//GifMaker gifExport;
//SMILE STUFF
import oscP5.*;
OscP5 oscP5;

SmartRobot robot;

int found;
float smileThreshold = 16;
float mouthWidth, previousMouthWidth;

PFont font, font2;

MotionSensor motionSensor;

//SETUP VARS
String version = "1.5";
int startHour = 7; //am
int endHour = 16;  //3:59pm
int endMinute = 25; 

boolean production = true;

String nycUploadURL = "http://styleblaster.herokuapp.com/upload/nyc";
String gdlUploadURL = "http://styleblaster.herokuapp.com/upload/gdl";
String devUploadURL = "http://styleblaster.herokuapp.com/upload/smile";
String irlUploadURL = "http://styleblaster.herokuapp.com/upload/irl";


// select the production endpoint for the compiled build
String uploadURL = devUploadURL;
String tag = "smile";

int camWidth;
int camHeight = 720;
float sensorRes = 1;
Movie myMovie;


public void setup() {
  noCursor();
  //  myMovie = new Movie(this, "countdown.m4v");
    

  // int camWidth = 1280;//(16*camHeight)/9; //get correct aspect ratio for width
  //camHeight = 2;
  int sketchHeight = 1000;
  int sketchWidth = 666;
  float m = .5;

  size(1280,800);

  String[] devices = Capture.list();
  // uncomment the line below to print a list of devices ready for img capture
  println(devices);
  fill(255, 50, 50);
  noFill();
  String[] cameras = Capture.list();

  int f = 25;
  frameRate(f);
  //  cam.frameRate(f);
  cameraTimer = new Timer(1000);

  sensorTimer = new Timer(1000);
  smileTimer = new Timer(3000);
  
    cam = new Capture(this, round(1280*1.2), round(720*1.2));

//SMILE STUFF
 oscP5 = new OscP5(this, 8338);
  oscP5.plug(this, "found", "/found");
  oscP5.plug(this, "mouthWidthReceived", "/gesture/mouth/width");
  try {
    robot = new SmartRobot();
  } catch (AWTException e) {
  }
  font = createFont("Helvetica", 64);
  font2 = createFont("Klavika", 200);
  textFont(font);
  textAlign(LEFT, TOP);
}

void draw() {
  background(0);
 
       // println("grab: "+grab);


  if (! uploading) {
    cam.read();
    image(cam, -200, 0);

  
  }
  
  
  //SMILE STUFF
//  background(255);
if(grab == 0){
  if (found > 0) {
    noStroke();
    fill(mouthWidth > smileThreshold ? color(255, 0, 0) : 255);
    float drawWidth = map(mouthWidth, 10, 25, 0, width);
    rect(0, 0, drawWidth, 64);
    textFont(font);
    text(nf(mouthWidth, 0, 1), drawWidth + 10, 0);
    if (previousMouthWidth < smileThreshold && mouthWidth > smileThreshold) {
      robot.type(":)\n");
    }
    previousMouthWidth = mouthWidth;
    
    if(mouthWidth > smileThreshold){
       //start timer
       if(smileTimer.running == false){
         smileTimer.start();
         
       }
       //TIMER
         textFont(font2);

       text(1+round((smileTimer.totalTime - smileTimer.passedTime)/1000), width/2, height/2-100);
                textFont(font);

       text("www.styleblaster.com/smile", 200, height/2+100);
        // myMovie.play();
        // image(myMovie, 0,0);
         //blend(myMovie, 0, 0, 1280, 720, 0, 0, 1280, 720, ADD);
    }
    else{
      
               textFont(font);

       text("SMILE MORE!!! :D", 150, height-220);
       smileTimer.reset();
              //  myMovie.stop();

    }
    
    if(smileTimer.running){
      if(smileTimer.isFinished()){
       //take a photo!
       grab = 1;
       //onHit();
      }
    }

  }
  else{
     text("I don't see you...  hold still!", 150, height/2);
  }
  
}

  stroke(255, 100, 100);
  //***DRAW DEBUG SHIT TO SCREEN***
  if (debug) {
    rectMode(CORNER);
    noFill();
    //date

    fill(255);
  }

  if (blast) {

  }
  
   if(grab > 0){
   grab ++; 
  }
  
   if (! uploading) {
   
    
    if (grab == 4) {
      println("!!!HIT!!! @ : ");
      onHit();
      grab = 0;
    }

  }
  
}

/*void mousePressed() {
 motionSensor._r.x = mouseX;
 motionSensor._r.y = mouseY;
 ignoreSensor = true;
 }
 // */

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
  } 
  else {
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
 
  else if (key=='v') production=!production; // send to production endpoint
  else if (key=='d') disable=!disable; // disable/enable
}

//SMILE STUFF
public void found(int i) {
  found = i;
}

public void mouthWidthReceived(float w) {
  mouthWidth = w;
}

// all other OSC messages end up here
void oscEvent(OscMessage m) {
  if (m.isPlugged() == false) {
  }
}

