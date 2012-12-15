import processing.core.*; 
import processing.xml.*; 

import processing.opengl.*; 
import processing.video.*; 
import org.seltar.Bytes2Web.*; 
import java.awt.Rectangle; 
import gifAnimation.*; 
import java.awt.Rectangle; 
import processing.video.*; 
import processing.video.*; 

import java.applet.*; 
import java.awt.Dimension; 
import java.awt.Frame; 
import java.awt.event.MouseEvent; 
import java.awt.event.KeyEvent; 
import java.awt.event.FocusEvent; 
import java.awt.Image; 
import java.io.*; 
import java.net.*; 
import java.text.*; 
import java.util.*; 
import java.util.zip.*; 
import java.util.regex.*; 

public class StyleBlasterGrabber extends PApplet {







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
boolean recordGif = false;
boolean doGifs = false;
ImageToWeb img;
byte[] imgBytes;
PImage grabImage;
GifMaker gifExport;

MotionSensor leftSensor, rightSensor;

//SETUP VARS
String version = "1.5";
int startHour = 7; //am
int endHour = 16;  //3:59pm
int endMinute = 25; 
int sensorBuffer = -220;
int sensorBufferY = 50;
String uploadURL = "http://styleblaster.herokuapp.com/upload";
int camWidth;
int camHeight = 720;
int sensorThreshold = 13;
int flowThreshold = -220;
float sensorRes = 1;

public void setup() {
  int camWidth = 1280;//(16*camHeight)/9; //get correct aspect ratio for width
  //camHeight = 2;
  int sketchHeight = 1000;
  int sketchWidth = 666;
  float m = .7f;

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
  leftSensor = new MotionSensor();
  rightSensor = new MotionSensor();

  of = new OpticalFlow(cam);


}

public void draw() {
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
        println("!!!HIT!!! @ : "+rightSensor._bDiff);
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
    rightSensor.draw();

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
    if (doGifs){
    if (of.xFlowSum < flowThreshold) {
      if (!recordGif) {
        gifExport = new GifMaker(this, getTimestamp()+".gif");
        gifExport.setRepeat(0); // make it an "endless" animation
      }
      //start recording gif
      gifExport.setDelay(40);
      gifExport.addFrame();
      recordGif = true;
    }
    else if (recordGif) {
      //stop recording gif
      gifExport.finish();
      recordGif = false;
      //  gifExport = new GifMaker(this, "export.gif");
    }}

    hit = leftSensor.checkHitArea();     
    if (hit) {
      leftSensor.reset();

      if (of.xFlowSum < flowThreshold) {
        grab = true;
      }
    }
  }
}

public void mousePressed() {
  leftSensor._r.x = mouseX;
  leftSensor._r.y = mouseY;
  // rightSensor._r.x = mouseX+rightSensor._r.width;
  // rightSensor._r.y = mouseY;
  // rightSensor._r.y = mouseY+sensorBufferY;
  ignoreSensor = true;
}



public void onHit() {
  //IS THE CAMERA TIMER NEEDED HERE?
  if (cameraTimer.isFinished()) {
    takePicture();
    cameraTimer.start();
  }
}

public String getTimestamp() {
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

public void takePicture() {

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

public void uploadPicture() {
  // img.post(String project, String url, String filename, boolean popup, byte[] bytes)
  img.post("test", uploadURL, getTimestamp() + ".png", false, imgBytes);
  cameraTimer.start();
}

public void keyPressed() {
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
  else if (key=='w') of.flagseg=!of.flagseg; // segmentation on/off
  else if (key=='s') of.flagsound=!of.flagsound; //  sound on/off
  else if (key=='m') of.flagmirror=!of.flagmirror; // mirror on/off
  else if (key=='f') of.flagflow=!of.flagflow; // show opticalflow on/off
  else if (key=='d') disable=!disable; // show opticalflow on/off
}





class MotionSensor {
  Rectangle _r = new Rectangle(0, 0, 0, 0);
  int _thresh = 13;
  float _sensorRes = 1;
  float _lastTestAreaBrightness, _bDiff;
  int _numPixels;
  PImage _image;
 // Capture _cam;

  MotionSensor() {
    
  }

  public boolean checkHitArea() {
  //  _cam = cam;
    float testAreaBrightness = getTestAreaBrightness();
    //find teh absolute diff of the current brightness and the last brightness
    //println("testAreaBrightness: "+testAreaBrightness);
    //  println("_lastTestAreaBrightness: "+_lastTestAreaBrightness);
    _bDiff = abs(testAreaBrightness -  _lastTestAreaBrightness);

    _lastTestAreaBrightness = testAreaBrightness;

    if (_bDiff > _thresh) {
      return true;
    }
    return false;
  }

  //returns the average brightness of the test area defined by the test area rectangle
  public float getTestAreaBrightness() {
    _image.loadPixels(); 
    float testAreaBrightness = 0;

    // For each pixel in the test area
    for (int x = _r.x; x < _r.x+_r.width; x+=_sensorRes) {
      for (int y = _r.y; y < _r.y+_r.height; y+=_sensorRes) {
        // println("_cam.get(x, y): "+ _cam.get(x, y));
        testAreaBrightness += brightness(_image.get(x, y));
        //  println("brightness(_cam.get(x, y): "+ brightness(_cam.get(x, y)));
      }
    }

    testAreaBrightness /= _numPixels;
    testAreaBrightness *= _sensorRes;

    return testAreaBrightness;
  }

  public void draw() {
    // println("MotionSensor.draw");
    rect(_r.x, _r.y, _r.width, _r.height);
    text(_bDiff, _r.x, _r.y - 5);
  }

  public void update() {
    _numPixels = _r.width*_r.height;
  }

 public void reset(){
     float testAreaBrightness = getTestAreaBrightness();
    _bDiff = abs(testAreaBrightness -  _lastTestAreaBrightness);
    _lastTestAreaBrightness = testAreaBrightness;
  }

  //GETTERS AND SETTERS
  public void setWidth(int n) {
    _r.width = n;
  }
  
 

  public void setHeight(int n) {
    _r.height = n;
  }

  public void setX(int n) {
    _r.x = n;
  }

  public void setY(int n) {
    _r.y = n;
  }
}

/* OpenProcessing Tweak of *@*http://www.openprocessing.org/sketch/10435*@* */
//Made into a class by Jack Kalish www.jackkalish.com
/* !do not delete the line above, required for linking your tweak if you re-upload */
// Optical Flow 2010/05/28
// Hidetoshi Shimodaira shimo@is.titech.ac.jp 2010 GPL



class OpticalFlow {

  ///////////////////////////////////////////////
  // parameters for desktop pc (high performance)

  int gs=20; // grid step (pixels)
  float predsec=1.0f; // prediction time (sec): larger for longer vector

  ///////////////////////////////////////////////
  // use video
  PImage video;

  PFont font;
  int[] vline;
  MovieMaker movie;

  // capture parameters
  int fps=30;


  int wscreen, hscreen, as, gw, gh, gs2;
  float df, xFlowSum;

  // regression vectors
  float[] fx, fy, ft;
  int fm=3*9; // length of the vectors

  // regularization term for regression
  float fc=pow(10, 8); // larger values for noisy video

  // smoothing parameters
  float wflow=0.1f; // smaller value for longer smoothing

  // switch
  boolean flagseg=false; // segmentation of moving objects?
  boolean flagball=false; // playing ball game?
  boolean flagmirror=false; // mirroring image?
  boolean flagflow=false; // draw opticalflow vectors?
  boolean flagsound=true; // sound effect?
  boolean flagimage=true; // show video image ?
  boolean flagmovie=false; // saving movie?

  // internally used variables
  float ar, ag, ab; // used as return value of pixave
  float[] dtr, dtg, dtb; // differentiation by t (red,gree,blue)
  float[] dxr, dxg, dxb; // differentiation by x (red,gree,blue)
  float[] dyr, dyg, dyb; // differentiation by y (red,gree,blue)
  float[] par, pag, pab; // averaged grid values (red,gree,blue)
  float[] flowx, flowy; // computed optical flow
  float[] sflowx, sflowy; // slowly changing version of the flow
  int clockNow, clockPrev, clockDiff; // for timing check

  float ballpx, ballpy, ballvx, ballvy, ballgy, ballsz, ballsz2, ballfv, ballhv, ballvmax;

  OpticalFlow(Capture v) {
    wscreen=width;
    hscreen=height;

    // grid parameters
    as=gs*2;  // window size for averaging (-as,...,+as)
    gw=wscreen/gs;
    gh=hscreen/gs;
    gs2=gs/2;
    df=predsec*fps;

    // playing ball parameters
    ballpx=wscreen*0.5f; // position x
    ballpy=hscreen*0.5f; // position y
    ballvx=0.0f; // velocity x
    ballvy=0.0f; // velocity y
    ballgy=0.05f; // gravitation
    ballsz=30.0f; // size
    ballsz2=ballsz/2;
    ballfv=0.8f; // rebound factor
    ballhv=50.0f; // hit factor
    ballvmax=10.0f; // max velocity (pixel/frame)

    // screen and video
    video = v;
    // font
    font=createFont("Verdana", 10);
    textFont(font);
    // draw
    ellipseMode(CENTER);

    // arrays
    par = new float[gw*gh];
    pag = new float[gw*gh];
    pab = new float[gw*gh];
    dtr = new float[gw*gh];
    dtg = new float[gw*gh];
    dtb = new float[gw*gh];
    dxr = new float[gw*gh];
    dxg = new float[gw*gh];
    dxb = new float[gw*gh];
    dyr = new float[gw*gh];
    dyg = new float[gw*gh];
    dyb = new float[gw*gh];
    flowx = new float[gw*gh];
    flowy = new float[gw*gh];
    sflowx = new float[gw*gh];
    sflowy = new float[gw*gh];
    fx = new float[fm];
    fy = new float[fm];
    ft = new float[fm];
    vline = new int[wscreen];
  }


  // calculate average pixel value (r,g,b) for rectangle region
  public void pixave(int x1, int y1, int x2, int y2) {
    float sumr, sumg, sumb;
    int pix;
    int r, g, b;
    int n;

    if (x1<0) x1=0;
    if (x2>=wscreen) x2=wscreen-1;
    if (y1<0) y1=0;
    if (y2>=hscreen) y2=hscreen-1;

    sumr=sumg=sumb=0.0f;
    for (int y=y1; y<=y2; y++) {
      for (int i=wscreen*y+x1; i<=wscreen*y+x2; i++) {
        pix=video.pixels[i];
        b=pix & 0xFF; // blue
        pix = pix >> 8;
        g=pix & 0xFF; // green
        pix = pix >> 8;
        r=pix & 0xFF; // red
        // averaging the values
        sumr += r;
        sumg += g;
        sumb += b;
      }
    }
    n = (x2-x1+1)*(y2-y1+1); // number of pixels
    // the results are stored in static variables
    ar = sumr/n; 
    ag=sumg/n; 
    ab=sumb/n;
  }

  // extract values from 9 neighbour grids
  public void getnext9(float x[], float y[], int i, int j) {
    y[j+0] = x[i+0];
    y[j+1] = x[i-1];
    y[j+2] = x[i+1];
    y[j+3] = x[i-gw];
    y[j+4] = x[i+gw];
    y[j+5] = x[i-gw-1];
    y[j+6] = x[i-gw+1];
    y[j+7] = x[i+gw-1];
    y[j+8] = x[i+gw+1];
  }

  // solve optical flow by least squares (regression analysis)
  public void solveflow(int ig) {
    float xx, xy, yy, xt, yt;
    float a, u, v, w;

    // prepare covariances
    xx=xy=yy=xt=yt=0.0f;
    for (int i=0;i<fm;i++) {
      xx += fx[i]*fx[i];
      xy += fx[i]*fy[i];
      yy += fy[i]*fy[i];
      xt += fx[i]*ft[i];
      yt += fy[i]*ft[i];
    }

    // least squares computation
    a = xx*yy - xy*xy + fc; // fc is for stable computation
    u = yy*xt - xy*yt; // x direction
    v = xx*yt - xy*xt; // y direction

    // write back
    flowx[ig] = -2*gs*u/a; // optical flow x (pixel per frame)
    flowy[ig] = -2*gs*v/a; // optical flow y (pixel per frame)
  }

  public void updateImage(PImage i) {
    video = i;
  }

  public void draw() {
    rectMode(CENTER);

    // clock in msec
    clockNow = millis();
    clockDiff = clockNow - clockPrev;
    clockPrev = clockNow;

    // mirror
    if (flagmirror) {
      for (int y=0;y<hscreen;y++) {
        int ig=y*wscreen;
        for (int x=0; x<wscreen; x++) 
          vline[x] = video.pixels[ig+x];
        for (int x=0; x<wscreen; x++) 
          video.pixels[ig+x]=vline[wscreen-1-x];
      }
    }

    // 1st sweep : differentiation by time
    for (int ix=0;ix<gw;ix++) {
      int x0=ix*gs+gs2;
      for (int iy=0;iy<gh;iy++) {
        int y0=iy*gs+gs2;
        int ig=iy*gw+ix;
        // compute average pixel at (x0,y0)
        pixave(x0-as, y0-as, x0+as, y0+as);
        // compute time difference
        dtr[ig] = ar-par[ig]; // red
        dtg[ig] = ag-pag[ig]; // green
        dtb[ig] = ab-pab[ig]; // blue
        // save the pixel
        par[ig]=ar;
        pag[ig]=ag;
        pab[ig]=ab;
      }
    }

    // 2nd sweep : differentiations by x and y
    for (int ix=1;ix<gw-1;ix++) {
      for (int iy=1;iy<gh-1;iy++) {
        int ig=iy*gw+ix;
        // compute x difference
        dxr[ig] = par[ig+1]-par[ig-1]; // red
        dxg[ig] = pag[ig+1]-pag[ig-1]; // green
        dxb[ig] = pab[ig+1]-pab[ig-1]; // blue
        // compute y difference
        dyr[ig] = par[ig+gw]-par[ig-gw]; // red
        dyg[ig] = pag[ig+gw]-pag[ig-gw]; // green
        dyb[ig] = pab[ig+gw]-pab[ig-gw]; // blue
      }
    }

    // 3rd sweep : solving optical flow
     xFlowSum = 0;
    
    for (int ix=1;ix<gw-1;ix++) {
      int x0=ix*gs+gs2;
      for (int iy=1;iy<gh-1;iy++) {
        int y0=iy*gs+gs2;
        int ig=iy*gw+ix;

        // prepare vectors fx, fy, ft
        getnext9(dxr, fx, ig, 0); // dx red
        getnext9(dxg, fx, ig, 9); // dx green
        getnext9(dxb, fx, ig, 18);// dx blue
        getnext9(dyr, fy, ig, 0); // dy red
        getnext9(dyg, fy, ig, 9); // dy green
        getnext9(dyb, fy, ig, 18);// dy blue
        getnext9(dtr, ft, ig, 0); // dt red
        getnext9(dtg, ft, ig, 9); // dt green
        getnext9(dtb, ft, ig, 18);// dt blue

        // solve for (flowx, flowy) such that
        // fx flowx + fy flowy + ft = 0
        solveflow(ig);

        // smoothing
        sflowx[ig]+=(flowx[ig]-sflowx[ig])*wflow;
        sflowy[ig]+=(flowy[ig]-sflowy[ig])*wflow;
        
         xFlowSum += sflowx[ig];
      }
    }

    // 4th sweep : draw the flow
    if (flagseg) {
      noStroke();
      fill(0);
      for (int ix=0;ix<gw;ix++) {
        int x0=ix*gs+gs2;
        for (int iy=0;iy<gh;iy++) {
          int y0=iy*gs+gs2;
          int ig=iy*gw+ix;

          float u=df*sflowx[ig];
          float v=df*sflowy[ig];



          float a=sqrt(u*u+v*v);
          if (a<2.0f) rect(x0, y0, gs, gs);
        }
      }
    }


  //  int flowSum = gw * gh;


    // 5th sweep : draw the flow
    if (flagflow) {
      for (int ix=0;ix<gw;ix++) {
        int x0=ix*gs+gs2;
        for (int iy=0;iy<gh;iy++) {
          int y0=iy*gs+gs2;
          int ig=iy*gw+ix;

          float u=df*sflowx[ig];
          float v=df*sflowy[ig];

        //  xFlowSum += u;          
         // yFlow += v;

          // draw the line segments for optical flow
          float a=sqrt(u*u+v*v);
          if (a>=2.0f) { // draw only if the length >=2.0
            float r=0.5f*(1.0f+u/(a+0.1f));
            float g=0.5f*(1.0f+v/(a+0.1f));
            float b=0.5f*(2.0f-(r+g));
            stroke(255*r, 255*g, 255*b);
            line(x0, y0, x0+u, y0+v);
          }
        }
      }
    }

    ///////////////////////////////////////////////////////
    // ball movement : not essential for optical flow
   /* if (flagball) {
      // updatating position and velocity
      ballpx += ballvx;
      ballpy += ballvy;
      ballvy += ballgy;

      // reflecton
      if (ballpx<ballsz2) {
        ballpx=ballsz2;
        ballvx=-ballvx*ballfv;
      } 
      else if (ballpx>wscreen-ballsz2) {
        ballpx=wscreen-ballsz2;
        ballvx=-ballvx*ballfv;
      }
      if (ballpy<ballsz2) {
        ballpy=ballsz2;
        ballvy=-ballvy*ballfv;
      } 
      else if (ballpy>hscreen-ballsz2) {
        ballpy=hscreen-ballsz2;
        ballvy=-ballvy*ballfv;
      }

      // draw the ball
      fill(50, 200, 200);
      stroke(0, 100, 100);
      ellipse(ballpx, ballpy, ballsz, ballsz);

      // find the grid 
      int ix= round((ballpx-gs2)/gs);
      int iy= round((ballpy-gs2)/gs);
      if (ix<1) ix=1;
      else if (ix>gw-2) ix=gw-2;
      if (iy<1) iy=1;
      else if (iy>gh-2) iy=gh-2;
      int ig=iy*gw+ix;

      // hit the ball by your movement
      float u=sflowx[ig];
      float v=sflowy[ig];
      float a=sqrt(u*u+v*v);
      u=u/a; 
      v=v/a;
      if (a>=2.0) a=2.0;
      if (a>=0.3) {
        ballvx += ballhv*a*u;
        ballvy += ballhv*a*v;
        float b=sqrt(ballvx*ballvx+ballvy*ballvy);
        if (b>ballvmax) {
          ballvx = ballvmax*ballvx/b;
          ballvy = ballvmax*ballvy/b;
        }
      }

    }*/

    ///////////////////////////////////////////////////
    // recording movie 
    if (flagmovie) movie.addFrame();

    //  print information (not shown in the movie)
    fill(255, 0, 0);
    //  if (flagmovie) text("rec", 40, 10);
  }

 /* void keyPressed() {
   
    if (key==' ') { // kick the ball
      ballvy = -3.0;
    }
    else if (key=='b') { // show the ball on/off
      flagball=!flagball;
      if (flagball) { // put the ball at the center
        ballpx=wscreen*0.5;
        ballpy=hscreen*0.5;
        ballvx=ballvy=0.0;
      }
    }
  }*/
  
  //GETTER AND SETTERS
  public float getXFlow(){
    float xsum = 0;
    for(int i=0; i<sflowx.length; i++){
     xsum += sflowx[i]; 
    }
    xsum /= sflowx.length;
    return xsum;
  }
}
class Timer {
 
  int savedTime; // When Timer started
  int totalTime; // How long Timer should last
  
  Timer(int tempTotalTime) {
    totalTime = tempTotalTime;
  }
  
  // Starting the timer
  public void start() {
    // When the timer starts it stores the current time in milliseconds.
    savedTime = millis(); 
  }
  
  // The function isFinished() returns true if 5,000 ms have passed. 
  // The work of the timer is farmed out to this method.
  public boolean isFinished() { 
    // Check how much time has passed
    int passedTime = millis()- savedTime;
    if (passedTime > totalTime) {
      return true;
    } else {
      return false;
    }
  }
}

  static public void main(String args[]) {
    PApplet.main(new String[] { "--bgcolor=#FFFFFF", "StyleBlasterGrabber" });
  }
}
