import hypermedia.video.*;
import java.awt.Rectangle;


OpenCV opencv;

// contrast/brightness values
int contrast_value    = 0;
int brightness_value  = 0;
//
boolean debug;

void setup() {
  debug  = false;

  size( 1920/2, 1080/2 );

  opencv = new OpenCV( this );
  opencv.capture( width, height );                   // open video stream
  opencv.cascade( OpenCV.CASCADE_FRONTALFACE_ALT );  // load detection description, here-> front face detection : "haarcascade_frontalface_alt.xml"


  // print usage
  println( "Drag mouse on X-axis inside this sketch window to change contrast" );
  println( "Drag mouse on Y-axis inside this sketch window to change brightness" );
}


public void stop() {
  opencv.stop();
  super.stop();
}


void draw() {

  // grab a new frame
  // and convert to gray
  opencv.read();
  //  opencv.convert( GRAY );
  opencv.contrast( contrast_value );
  opencv.brightness( brightness_value );

  // proceed detection
  Rectangle[] faces = opencv.detect( 1.2, 2, OpenCV.HAAR_DO_CANNY_PRUNING, 40, 40 );

  // display the image
  image( opencv.image(), 0, 0 );




  // draw face area(s)
  noFill();
  stroke(255, 0, 0);
  for ( int i=0; i<faces.length; i++ ) {
    
    if (debug) {
      rect( faces[i].x, faces[i].y, faces[i].width, faces[i].height ); 
      //text
      text(faces[i].width, 5, 15);
    }
    int fw =  faces[i].width;
    
    if(fw > 50){
      if(fw <100){
        
      }
    }
  }
}



/**
 * Changes contrast/brigthness values
 */
void mouseDragged() {
  contrast_value   = (int) map( mouseX, 0, width, -128, 128 );
  brightness_value = (int) map( mouseY, 0, width, -128, 128 );
}


void keyPressed() {
  if (key == ' ') {
    debug = !debug;
  }
}

