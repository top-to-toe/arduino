
#define OPEN 90 /* window */
#define CLOSE 0 /* window */
#define DHTPIN 12
#define DHTTYPE DHT11
#include <Servo.h>
Servo servo;
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27,16,2);
#include "DHT.h"
DHT dht(DHTPIN, DHTTYPE);
String inputString = "";
String str2lcd = "";
String tempString = "";
int count4dht = 0;
String passwd = "1234";
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

const int periode = 1500;
long prv_millis = 0;
long cur_millis = 0;

void setup()  /*********************************************** begin setup() *******/
{
  pinMode(pinSW, INPUT);
  pinMode(pinFan, OUTPUT);
  pinMode(pinGasFan, OUTPUT);
  pinMode(pinLock, OUTPUT);
    attachInterrupt(digitalPinToInterrupt(pinSW), intfunc, RISING);
  pinMode(pinR, OUTPUT);  pinMode(pinG, OUTPUT);  pinMode(pinB, OUTPUT);
  servo.attach(pinservo);
  servo.write(CLOSE);
  Serial.begin(9600);
  inputString.reserve(20);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print(">> Smart Home <<");
}

/************************************************* user define functions *****/
void light_on(void){
  digitalWrite(pinR, HIGH); digitalWrite(pinG, HIGH); digitalWrite(pinB, HIGH);
}

void light_off(void){
  digitalWrite(pinR, LOW); digitalWrite(pinG, LOW); digitalWrite(pinB, LOW);
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
}

void gas_fan_off(void){
  digitalWrite(pinGasFan, LOW);
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

void read_dht(void)
{
  int h = dht.readHumidity();
  int t = dht.readTemperature();
  Serial.print("TEMP");  Serial.println(t);
  Serial.print("HUMI");  Serial.println(h);
  
}



void loop()  /*********************************************** begin loop() *******/
{
  cur_millis = millis();
  if(cur_millis - prv_millis > periode)
  {
    read_dht();
    prv_millis = cur_millis;
  }
  if(inten)
  {
  
    tone(pinBuzz, ding); delay(300); noTone(pinBuzz);
    tone(pinBuzz, dong); delay(500); noTone(pinBuzz);
    tone(pinBuzz, ding); delay(300); noTone(pinBuzz);
    tone(pinBuzz, dong); delay(500); noTone(pinBuzz);
    inten = false;
  }
  if(Serial.available()>0)
  {
    char ch = Serial.read();
    if(ch != '\n')
    {
      inputString += ch;
    }
    else/*** actions ****/
    {
      if(inputString.substring(0, 2) == "pw")
      {
        if(inputString.substring(2,6) == passwd) door_open();
        else;
      }
      if(inputString.substring(0, 6) == "light_")
      {
        if(inputString.substring(6) == "on")  light_on();
        if(inputString.substring(6) == "off")  light_off();
      }
      if(inputString.substring(0, 6) == "light_")
      {
        if(inputString.substring(6) == "on")  light_on();
        if(inputString.substring(6) == "off")  light_off();
      }
      if(inputString.substring(0, 7) == "window_")
    {
      if(inputString.substring(7) == "open")  window_open();
      if(inputString.substring(7) == "close") window_close();      
    }
      if(inputString.substring(0, 7) == "gasfan_")
    {
      if(inputString.substring(7) == "on")  gas_fan_on();
      if(inputString.substring(7) == "off") gas_fan_off();      
    }
      if(inputString.substring(0, 11) == "ceilingfan_")
    {
      if(inputString.substring(11) == "on")  fan_on();
      if(inputString.substring(11) == "off") fan_off();      
    }
    
    inputString = "";
    write_lcd();
  }
}

}

  
void intfunc()
{
  inten = true;
}
