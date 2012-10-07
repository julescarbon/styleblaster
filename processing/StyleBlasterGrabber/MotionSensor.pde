import java.awt.Rectangle;
import processing.video.*;


class MotionSensor {
  Rectangle _r = new Rectangle(0, 0, 0, 0);
  int _thresh = 13;
  float _sensorRes = 1;
  float _lastTestAreaBrightness, _bDiff;
  int _numPixels;
  Capture _cam;

  MotionSensor(Capture cam) {
    _cam = cam;
  }

  boolean checkHitArea() {
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
  float getTestAreaBrightness() {
    _cam.loadPixels(); 
    float testAreaBrightness = 0;

    // For each pixel in the test area
    for (int x = _r.x; x < _r.x+_r.width; x+=_sensorRes) {
      for (int y = _r.y; y < _r.y+_r.height; y+=_sensorRes) {
        // println("_cam.get(x, y): "+ _cam.get(x, y));
        testAreaBrightness += brightness(_cam.get(x, y));
        //  println("brightness(_cam.get(x, y): "+ brightness(_cam.get(x, y)));
      }
    }

    testAreaBrightness /= _numPixels;
    testAreaBrightness *= _sensorRes;

    return testAreaBrightness;
  }

  void draw() {
    // println("MotionSensor.draw");
    rect(_r.x, _r.y, _r.width, _r.height);
    text(_bDiff, _r.x, _r.y - 5);
  }

  void update() {
    _numPixels = _r.width*_r.height;
  }

 void reset(){
     float testAreaBrightness = getTestAreaBrightness();
    _bDiff = abs(testAreaBrightness -  _lastTestAreaBrightness);
    _lastTestAreaBrightness = testAreaBrightness;
  }

  //GETTERS AND SETTERS
  void setWidth(int n) {
    _r.width = n;
  }
  
 

  void setHeight(int n) {
    _r.height = n;
  }

  void setX(int n) {
    _r.x = n;
  }

  void setY(int n) {
    _r.y = n;
  }
}

