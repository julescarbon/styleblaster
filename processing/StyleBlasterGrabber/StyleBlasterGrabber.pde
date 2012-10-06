import processing.opengl.*;
import processing.video.*;
import org.seltar.Bytes2Web.*;
import java.awt.Rectangle;

Capture cam;
Capture sensor;
Timer cameraTimer;
int numPixels;
boolean firstTime = true;
boolean debug = true;
boolean uploading = false;
ImageToWeb img;
byte[] imgBytes;

// String uploadURL = "http://styleblaster.herokuapp.com/upload";
String uploadURL = "http://localhost:3000/upload";
int sensorThreshold = 30;
float sensorRes = 1;
float lastTestAreaBrightness;
Rectangle testArea = new Rectangle(50,50,5,5);

public void setup() {
  size(640, 480);
  String[] devices = Capture.list();
  // uncomment the line below to print a list of devices ready for img capture
  println(devices);
  fill(255,255,31);
  noStroke();
  cam = new Capture(this, 640, 480);
  sensor = cam;
  sensor.frameRate(2);
  cam.frameRate(24);
  cameraTimer = new Timer(5000);
  cameraTimer.start();
  noFill();
}

void draw() {
  if (! uploading) {
    cam.read();
    image(cam, 0, 0);
  }
  
  stroke(255,0,0);
  if(debug){
    //draw test area rect
    rect(testArea.x, testArea.y, testArea.width, testArea.height);
  }

  if(cam.available()){

    boolean hit = checkHitArea();
    if(firstTime){
      firstTime = false;
    }
    else{
      if(hit){
        println("!!!HIT!!!");
        fill(255,0,0);
        onHit();
      }
      else{
        noFill();
      }
    }
  }
  
  if(mousePressed) {
     testArea.width = mouseX - testArea.x;
     testArea.height = mouseY - testArea.y;
     if(testArea.width < 3){
       testArea.width = 3;
     }
      if(testArea.height < 3){
       testArea.height = 3;
     }
  }
}

void mousePressed() {
   testArea.x = mouseX;
   testArea.y = mouseY;
}

void keyPressed() {
  if(key == ' '){
    debug = !debug;
  } 
}

void onHit(){
  if (cameraTimer.isFinished()) {
    takePicture();
    cameraTimer.start();
  }
}

boolean checkHitArea() {
  float testAreaBrightness = getTestAreaBrightness();
  //find teh absolute diff of the current brightness and the last brightness
  float bDiff = abs(testAreaBrightness -  lastTestAreaBrightness);
  println("bDiff = " +bDiff);
  println("sensorThreshold = " +sensorThreshold);
       
  lastTestAreaBrightness = testAreaBrightness;

  if (bDiff > sensorThreshold) {
    return true;
  }
  return false;
}

//returns the average brightness of the test area defined by the test area rectangle
float getTestAreaBrightness(){
  cam.loadPixels(); 
  float testAreaBrightness = 0;
   // For each pixel in the video frame...
  for (int x = testArea.x; x < testArea.x+testArea.width; x+=sensorRes) {
    for(int y = testArea.y; y < testArea.y+testArea.height; y+=sensorRes){
      testAreaBrightness += brightness(cam.get(x,y));
    }
  }
  
    numPixels = testArea.width*testArea.height;
  testAreaBrightness /= numPixels;
  testAreaBrightness *= sensorRes;
  return testAreaBrightness;
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
  
 //  img.save(String format, boolean useDate); // saves a local copy to disk
   img.save("jpg", true);

  img.setType(ImageToWeb.PNG);

  // load the raw bytes from the thing
  imgBytes = img.getBytes();

  // upload the picture
  uploadPicture();
}

void uploadPicture() {
  // img.post(String project, String url, String filename, boolean popup, byte[] bytes)
  img.post("test", uploadURL, getTimestamp(), false, imgBytes);
  cameraTimer.start();
}

