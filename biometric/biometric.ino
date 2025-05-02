#include <Adafruit_Fingerprint.h>
#include <SoftwareSerial.h>

SoftwareSerial mySerial(18, 19); 
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&Serial1);

uint8_t id = 1; // Start from ID 1
String fingerprintId = ""; 

void setup()  
{
  Serial.begin(9600);
  Serial1.begin(57600); // Set the baud rate for the fingerprint sensor
  Serial.println("\n\nFingerprint sensor enrollment");

  // Verify fingerprint sensor
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) { delay(1); }
  }
}

void loop() {
  // Command to fetch the last enrolled fingerprint ID
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    
    if (command == "VERIFY_FINGERPRINT") {
      verify_fingerprint();
    }
  }
}

uint8_t verify_fingerprint() {
  uint8_t p = finger.getImage();
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image taken");
      break;
    case FINGERPRINT_NOFINGER:
      Serial.println("No finger detected");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_IMAGEFAIL:
      Serial.println("Imaging error");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  } // OK success!

  p = finger.image2Tz();
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  } // OK converted!

  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
    Serial.println("Found a print match!");
    Serial.print("Found ID: ");
    Serial.println(finger.fingerID);
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return p;
  } else if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("Did not find a match");
    return p;
  } else {
    Serial.println("Unknown error");
    return p;
  }
  {digitalWrite(11, HIGH);
  delay(3000);
  digitalWrite(11, LOW);
  Serial.print("Not Found"); 
  Serial.print("Error"); 
  return finger.fingerID;
 }

  Serial.print("Found ID: ");
  Serial.println(finger.fingerID);

  return finger.fingerID;
}