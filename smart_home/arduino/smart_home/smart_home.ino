#include <Servo.h>

int pinDHT11 = 12;
// SimpleDHT11 dht11(pinDHT11);

Servo servo;

#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

#define OPEN 90 /* window */
#define CLOSE 0 /* window */
LiquidCrystal_I2C lcd(0x27,16,2);

String inputString = ""; /* string recieved from serial port */
String str2lcd = ""; /* string to display on LCD */
bool stringComplete = false;
String tempString = "";
String passwd = "1234"; /* password string for door */

const int pinR    =  23; /* Red Pin of RGB LED   */
const int pinG    =  35; /* Green Pin of RGB LED */
const int pinB     = 36; /* Blue Pin of RGB LED  */
const int pinSW     = 2;
const int pinBuzz  = 11;
const int pinLock  = 31;
const int pinGasFan = 4;
const int pinFan =   32; // ceiling
const int pinservo =  9;  // window
const int pinDHT   = 12;  // dht11 sensor
const int ding = 784; /* Freq.1 of Door Bell Sound */
const int dong = 659; /* Freq.2 of Door Bell Sound */
volatile bool inten  =  false;


void setup() {
  pinMode(pinSW, INPUT);
  pinMode(pinFan, OUTPUT);
  pinMode(pinGasFan, OUTPUT);
  pinMode(pinLock, OUTPUT);
    attachInterrupt(digitalPinToInterrupt(pinSW), intfunc, RISING);
  pinMode(pinR, OUTPUT);  pinMode(pinG, OUTPUT);  pinMode(pinB, OUTPUT);
  servo.attach(pinservo);
  servo.write(CLOSE);
  Serial.begin(115200);
  inputString.reserve(20);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print(">> Smart Home <<");
} /*****************************************************************************/

void light_on(void){
  digitalWrite(pinR, HIGH); digitalWrite(pinG, HIGH); digitalWrite(pinB, HIGH);
  str2lcd = "light on"; Serial.println("light_on");
}

void light_off(void){
  digitalWrite(pinR, LOW); digitalWrite(pinG, LOW); digitalWrite(pinB, LOW);
  str2lcd = "light off";  Serial.println("light_off");
}

void door_open(void){
  digitalWrite(pinLock, HIGH);  delay(3000);
  str2lcd ="DoorLockReleased";  write_lcd();  Serial.println("door_open");
  delay(3000);  door_close();
  
  }
void door_close(void){
  digitalWrite(pinLock, LOW);
  str2lcd ="Door is Locked";
  }

void gas_fan_on(void){
  digitalWrite(pinGasFan, HIGH);
  str2lcd ="GasFan On";  Serial.println("gasfan_on");
}

void gas_fan_off(void){
  digitalWrite(pinGasFan, LOW);
  str2lcd ="GasFan Off";  Serial.println("gasfan_off");
}

void fan_on(void){
  digitalWrite(pinFan, HIGH);
  str2lcd ="Ceiling Fan On";
}

void fan_off(void){
  digitalWrite(pinFan, LOW);
  str2lcd ="Ceiling Fan Off";
}


void window_open(void){
  servo.write(OPEN);
  str2lcd ="window opened";
}

void window_close(void){
  servo.write(CLOSE);
  str2lcd ="window closed";
}

void write_lcd(void)
{
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print(">> Smart Home <<");
  lcd.setCursor(0,1);
  lcd.print(str2lcd);
}

void loop() {
  /***************************************************************************/
  
  byte temperature = 0;
  byte humidity = 0;
  int err = SimpleDHTErrSuccess;
  if ((err = dht11.read(&temperature, &humidity, NULL)) != SimpleDHTErrSuccess) {
    Serial.print("Read DHT11 failed, err="); Serial.print(SimpleDHTErrCode(err));
    Serial.print(","); Serial.println(SimpleDHTErrDuration(err)); delay(1000);
    return;
  }
  Serial.print("TEMP"); Serial.println((int)temperature);
  Serial.print("HUMI"); Serial.println((int)humidity);
  delay(1500);


  
  if(inten) {
  
    tone(pinBuzz, ding); delay(300); noTone(pinBuzz);
    tone(pinBuzz, dong); delay(500); noTone(pinBuzz);
    tone(pinBuzz, ding); delay(300); noTone(pinBuzz);
    tone(pinBuzz, dong); delay(500); noTone(pinBuzz);
    inten = false;
  }
  /***************************************************************************/
  if (stringComplete) {
    /* Serial.println(inputString); */
    if(inputString.substring(0, 2) == "pw"){
      if(inputString.substring(2,6) == passwd) door_open();
    }
    if(inputString.substring(0, 3) == "lcd")
    {
      str2lcd = inputString.substring(3);
      write_lcd();      
    }
    if(inputString.substring(0, 6) == "light_")
    {
      if(inputString.substring(6) == "on")
      {
        light_on();
      }
      if(inputString.substring(6) == "off")
      {
        light_off();
      }
    }

    if(inputString.substring(0, 7) == "window_")
    {
      if(inputString.substring(7) == "open")
      {
        window_open();
      }
      if(inputString.substring(7) == "close")
      {
        window_close();
      }
    }


    
      if(inputString.substring(0, 7) == "gasfan_"){
        if(inputString.substring(7) == "on")  {
          gas_fan_on();
          }
        if(inputString.substring(7) == "off"){
          gas_fan_off();
        }
    }
      if(inputString.substring(0, 11) == "ceilingfan_"){
        if(inputString.substring(11) == "on")  {
          fan_on();
          }
        if(inputString.substring(11) == "off"){
          fan_off();
        }
      
    }
  write_lcd();
    // clear the string:
    inputString = "";
    stringComplete = false;
  }/*
  int h = dht.readHumidity();
  int t = dht.readTemperature();
  Serial.print("TEMP"); Serial.println(t);
  Serial.print("HUMI"); Serial.println(h);
  delay(2000);
  */
}
  
void intfunc()
{
  inten = true;
}

void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = Serial.read();
    // add it to the inputString:
    if(inChar != '\n'){
      inputString += inChar;
    }
    else {
      stringComplete = true;
    }
  }
}
