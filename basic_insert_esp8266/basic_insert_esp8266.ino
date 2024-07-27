/*
  MySQL Connector/Arduino Example : connect by wifi

  This example demonstrates how to connect to a MySQL server from an
  Arduino using an Arduino-compatible Wifi shield. Note that "compatible"
  means it must conform to the Ethernet class library or be a derivative
  with the same classes and methods.

  For more information and documentation, visit the wiki:
  https://github.com/ChuckBell/MySQL_Connector_Arduino/wiki.

  INSTRUCTIONS FOR USE

  1) Change the address of the server to the IP address of the MySQL server
  2) Change the user and password to a valid MySQL user and password
  3) Change the SSID and pass to match your WiFi network
  4) Connect a USB cable to your Arduino
  5) Select the correct board and port
  6) Compile and upload the sketch to your Arduino
  7) Once uploaded, open Serial Monitor (use 115200 speed) and observe

  If you do not see messages indicating you have a connection, refer to the
  manual for troubleshooting tips. The most common issues are the server is
  not accessible from the network or the user name and password is incorrect.

  Created by: Dr. Charles A. Bell
*/

/*
    1. WiFi 연결: ESP8266을 WiFi 네트워크에 연결합니다.
    2. MySQL 서버 연결: MySQL 서버에 연결을 시도합니다.
    3. DHT11 센서 데이터 읽기: 온도와 습도 데이터를 DHT11 센서로부터 읽어옵니다.
    4. 데이터베이스에 데이터 삽입: 읽어온 온도와 습도 데이터를 MySQL 데이터베이스에 저장합니다.
    5. 주기적 작업: 데이터베이스에 데이터를 삽입한 후 5초 간격으로 이 작업을 반복합니다.
*/

#include <ESP8266WiFi.h>                // ESP8266 보드에서 WiFi 기능을 사용하기 위한 라이브러리
#include <MySQL_Connection.h>           // MySQL 데이터베이스와 연결하기 위한 라이브러리
#include <MySQL_Cursor.h>               // MySQL 쿼리를 실행하기 위한 커서 객체 라이브러리
#include "DHT.h"                        // DHT 센서 라이브러리

#define DHTPIN 5                        // DHT 센서가 연결된 핀 번호 (GPIO5)
#define typeDHT DHT11                   // 사용하는 DHT 센서의 종류 (DHT11)

DHT dht(DHTPIN, typeDHT);               // DHT 객체를 생성, 핀 번호와 센서 타입 설정

IPAddress server_addr(172, 30, 1, 34);  // MySQL 서버의 IP 주소
char user[] = "user1";                  // MySQL 사용자 이름
char password[] = "1234";               // MySQL 사용자 비밀번호

// 데이터베이스에 삽입할 SQL 쿼리 문자열
char INSERT_SQL[] = "INSERT INTO dht11.dev01(Temperature, Humidity) VALUES (%d, %d)";
char query[128];                        // 쿼리 문자열을 저장할 배열

// WiFi 네트워크 정보
char ssid[] = "KT_GiGA_2G_43E1";        // 연결할 WiFi 네트워크의 SSID
char pass[] = "6gb28gd078";             // WiFi 네트워크의 비밀번호

WiFiClient client;                      // WiFi 클라이언트 객체 생성
MySQL_Connection conn(&client);         // MySQL 연결 객체 생성
MySQL_Cursor* cursor;                   // MySQL 커서 객체 포인터

void setup()
{
  Serial.begin(115200);                 // 시리얼 통신 시작, 속도는 115200 bps
  while (!Serial);                      // 시리얼 포트가 연결될 때까지 대기 (Leonardo 보드에서 필요)

  // WiFi 연결 시작
  Serial.printf("\nConnecting to %s", ssid);
  WiFi.begin(ssid, pass);                 // WiFi 네트워크에 연결 요청
  while (WiFi.status() != WL_CONNECTED) { // WiFi 연결 상태 확인
    delay(500);                           // 0.5초 대기
    Serial.print(".");                    // 연결 상태를 표시하는 점 출력
  }

  // WiFi 연결 성공 시 정보 출력
  Serial.println("\nConnected to network");
  Serial.print("My IP address is: ");
  Serial.println(WiFi.localIP());         // 연결된 네트워크의 IP 주소 출력

  // MySQL 서버에 연결 시도
  Serial.print("Connecting to SQL...  ");
  if (conn.connect(server_addr, 3306, user, password))  // MySQL 서버에 연결
    Serial.println("OK.");                              // 연결 성공 시 메시지 출력
  else
    Serial.println("FAILED.");                          // 연결 실패 시 메시지 출력

  // MySQL 커서 객체 생성
  cursor = new MySQL_Cursor(&conn);
}

void loop()
{
  float t = dht.readTemperature(); // DHT 센서로부터 온도 읽기
  float h = dht.readHumidity();    // DHT 센서로부터 습도 읽기

  int Temperature = int(t) % 100;  // 온도를 정수로 변환하고 100으로 나눈 나머지로 설정
  int Humidity    = int(h) % 100;  // 습도를 정수로 변환하고 100으로 나눈 나머지로 설정

  Serial.print(Temperature);  Serial.print("*C\t"); // 온도 출력
  Serial.print(Humidity);     Serial.print("%\n");  // 습도 출력

  sprintf(query, INSERT_SQL, Temperature, Humidity); // 쿼리 문자열에 온도와 습도를 삽입

  if (conn.connected())       // MySQL 서버에 연결된 상태인지 확인
    cursor->execute(query);   // SQL 쿼리 실행

  delay(5000);                // 5초 대기
}
