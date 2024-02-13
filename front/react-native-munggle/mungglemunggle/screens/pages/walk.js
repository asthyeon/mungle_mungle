import React, { useEffect, useRef, useState } from "react";
import { Button, View, Text, Modal, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { KAKAOMAP_API_KEY } from '@env';
import WalkCreate from "./walkOthers/walkCreate";
import WalkCalendar from "./walkOthers/walkCalendar";
import { Calendar } from "react-native-calendars";
import axios from "axios";

import htht from "./htht.html"


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const apiKey = KAKAOMAP_API_KEY

const htmlContainer = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      .dot {overflow:hidden;float:left;width:12px;height:12px;background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/mini_circle.png');}    
      .dotOverlay {position:relative;bottom:10px;border-radius:6px;border: 1px solid #ccc;border-bottom:2px solid #ddd;float:left;font-size:12px;padding:5px;background:#fff;}
      .dotOverlay:nth-of-type(n) {border:0; box-shadow:0px 1px 2px #888;}    
      .number {font-weight:bold;color:#ee6152;}
      .dotOverlay:after {content:'';position:absolute;margin-left:-6px;left:50%;bottom:-8px;width:11px;height:8px;background:url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white_small.png')}
      .distanceInfo {position:relative;top:5px;left:5px;list-style:none;margin:0;}
      .distanceInfo .label {display:inline-block;width:50px;}
      .distanceInfo:after {content:none;}
      
      #map {
        width: 397px;
        height: 682px;
      }
      #startButton {
        width: 100px;
        height: 100px;
        background-color: rgb(253, 245, 169);
        border: none;
        border-radius: 100%;
        z-index: 5;
        position: absolute;
        bottom: 0%;
        left: 50%;
        display: none;
        transform: translate(-50%, -50%);
      }
      #startText {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
      }
      #pauseButton {
        width: 100px;
        height: 100px;
        background-color: rgb(255, 230, 0);
        border: none;
        border-radius: 100%;
        z-index: 5;
        position: absolute;
        bottom: 0%;
        left: 50%;
        display: none;
        transform: translate(-50%, -50%);
      }
      #pauseText {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
      }
      #stopButton {
        width: 80px;
        height: 80px;
        background-color: rgb(255, 0, 0);
        border: none;
        border-radius: 100%;
        z-index: 5;
        position: absolute;
        bottom: 0%;
        left: 70%;
        display: none;
        transform: translate(-50%, -50%);
      }
      #stopText {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
      }
      #changeButton {
        width: 100px;
        height: 100px;
        background-color: rgb(255, 230, 0);
        border: none;
        border-radius: 100%;
        z-index: 5;
        position: absolute;
        bottom: 0%;
        left: 50%;
        display: none;
        transform: translate(-50%, -50%);
      }
      #changeText {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
      }

      #backButton {
        width: 80px;
        height: 80px;
        background-color: rgb(200, 230, 0);
        border: none;
        border-radius: 100%;
        z-index: 5;
        position: absolute;
        bottom: 0%;
        left: 20%;
        display: none;
        transform: translate(-50%, -50%);
      }
      #backText {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 20px;
      }

      #mapIsNullMessage {
        display: flex;
        font-size: 30px;
        position: absolute;
        top: 50%;
        text-align: center;
        justify-content: center;
        align-items: center;
        left: 50%;
        font-weight: bold;
        transform: translate(-50%, -50%);
      }
  
      #timer {
        display: none;
        position: absolute;
        z-index: 6;
        top: 5%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 36px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 텍스트 그림자 효과 */
      }

      #startButton.show, #stopButton.show, #changeButton.show, #backButton.show {
        opacity: 0; /* 초기에는 버튼을 투명하게 설정합니다 */
        transition: opacity 0.5s ease; /* 투명도가 변경될 때 0.5초 동안 부드럽게 변경되도록 설정합니다 */
    }

      #startButton.show, #stopButton.show, #changeButton.show, #backButton.show {
        opacity: 1; /* show 클래스가 적용되면 버튼이 나타나도록 설정합니다 */
    }
    </style>
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer,drawing"></script> 
  </head>
  <body>
    <div id="map"></div>
    <button id="changeButton">
      <div id="changeText">
        산책갈까?
      </div>
    </button>
    <button id="startButton">
      <div id="startText">
        Start
      </div>
    </button>
    <button id="pauseButton">
      <div id="pauseText">
        Pause
      </div>
    </button>
    <button id="stopButton">
      <div id="stopText">
        Stop
      </div>
    </button>
    <button id="backButton">
      <div id="backText">
        Back
      </div>
    </button>
    <div id="mapIsNullMessage">
      Loading...
    </div>
    <h1 id="timer">00 : 00 : 00</h1>
    <script>
      let seconds = 0;
      let hours = Math.floor(seconds / 3600);
      let minutes = Math.floor((seconds % 3600) / 60);
      let secs = seconds % 60;
      let intervalId;
      let isActive = false;

      function startTimer() {
        if (isActive) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "start", 
            data: '',
          }));
          hours = Math.floor(seconds / 3600);
          minutes = Math.floor((seconds % 3600) / 60);
          secs = seconds % 60;
          var formattedHours = ('0' + hours).slice(-2);
          var formattedMinutes = ('0' + minutes).slice(-2);
          var formattedSecs = ('0' + secs).slice(-2);
          document.getElementById('timer').innerText = formattedHours + ' : ' + formattedMinutes + ' : ' + formattedSecs;
          intervalId = setInterval(updateTimer, 1000);
        } else {
          isActive = true;
          startTimer();
        }
      }

      function stopTimer() {
        isActive = false;
        clearInterval(intervalId);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "timer", 
          data: seconds,
        }));
        seconds = 0;
        hours = 0;
        minutes = 0;
        secs = 0;
      }

      function updateTimer() {
        seconds++;
        hours = Math.floor(seconds / 3600);
        minutes = Math.floor((seconds % 3600) / 60);
        secs = seconds % 60;
        var formattedHours = ('0' + hours).slice(-2);
        var formattedMinutes = ('0' + minutes).slice(-2);
        var formattedSecs = ('0' + secs).slice(-2);
        // 타이머를 HTML 요소에 업데이트합니다.
        document.getElementById('timer').innerText = formattedHours + ' : ' + formattedMinutes + ' : ' + formattedSecs;
      }

      function resetTimer() {
        clearInterval(intervalId);
        seconds = 0;
        hours = 0;
        minutes = 0;
        secs = 0;
        document.getElementById('timer').textContent = "00 : 00 : 00";
      }

      function change() {
        startButton.style.display = 'block';
        stopButton.style.display = 'block';
        changeButton.style.display = 'none';
        backButton.style.display = 'block';
      }

      function back() {
        startButton.style.display = 'none';
        stopButton.style.display = 'none';
        changeButton.style.display = 'block';
        backButton.style.display = 'none';
        timer.style.display = 'none';
        stopDrawing();
        // 지도 위에 선이 표시되고 있다면 지도에서 제거합니다
        deleteClickLine();
        
        // 지도 위에 커스텀오버레이가 표시되고 있다면 지도에서 제거합니다
        deleteDistnce();

        // 지도 위에 선을 그리기 위해 클릭한 지점과 해당 지점의 거리정보가 표시되고 있다면 지도에서 제거합니다
        deleteCircleDot();
      }

      function pauseTimer() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "pause", 
          data: '',
        }));
        clearInterval(intervalId);
        startButton.style.display = 'block';
        pauseButton.style.display = 'none';
        
      }

      document.getElementById('changeButton').addEventListener('click', change);
      document.getElementById('backButton').addEventListener('click', back);
      document.getElementById('startButton').addEventListener('click', startTimer);
      document.getElementById('pauseButton').addEventListener('click', pauseTimer);
      document.getElementById('stopButton').addEventListener('click', stopTimer);

      var startButton = document.getElementById('startButton');
      var pauseButton = document.getElementById('pauseButton');
      var map = null;
      var currentLocation = null;
      var marker = null;
      var markerPosition = null;
      var mapIsNullMessage = document.getElementById('mapIsNullMessage');
      var timer = document.getElementById('timer');

      var drawingFlag = false; // 선이 그려지고 있는 상태를 가지고 있을 변수입니다
      var moveLine; // 선이 그려지고 있을때 마우스 움직임에 따라 그려질 선 객체 입니다
      var clickLine // 마우스로 클릭한 좌표로 그려질 선 객체입니다
      var distanceOverlay; // 선의 거리정보를 표시할 커스텀오버레이 입니다
      var dots = {}; // 선이 그려지고 있을때 클릭할 때마다 클릭 지점과 거리를 표시하는 커스텀 오버레이 배열입니다.

      var staticMap = null;
      
      document.addEventListener('message', async (e) => {
        const { type, data } = JSON.parse(e.data);
        currentLocation = data;
        if (!map) {
          createMap(currentLocation.latitude, -currentLocation.longitude);  
          mapIsNullMessage.style.display = 'none';
          changeButton.style.display = 'block';
          alert('맵생성완료');
        } else {
          // alert('이미맵이생성됨')
          if (drawingFlag) {
            startDrawing(currentLocation.latitude, -currentLocation.longitude);
          }
        }
      });
      
      function createMap(lat, lng) {
        var mapContainer = document.getElementById('map'); // 지도를 표시할 div 
        var mapOptions = { 
          center: new kakao.maps.LatLng(lat, lng), // 맵의 중심좌표를 현재 위치로 설정
          level: 3 // 맵의 확대 레벨
        };
        // 새로운 맵 객체 생성
        map = new kakao.maps.Map(mapContainer, mapOptions);

        // 마커가 표시될 위치입니다 
        markerPosition  = new kakao.maps.LatLng(lat, lng); 
        
        // 마커를 생성합니다
        marker = new kakao.maps.Marker({
          position: markerPosition
        });
        
        // 마커가 지도 위에 표시되도록 설정합니다
        marker.setMap(map);        
      };

      startButton.onclick = function() {
        startButton.style.display = 'none';
        pauseButton.style.display = 'block';
        timer.style.display = 'block';
        backButton.style.display = 'none';
        startDrawing(currentLocation.latitude, -currentLocation.longitude);
      }

      pauseButton.onclick = function() {
        startButton.style.display = 'block';
        pauseButton.style.display = 'none';
      }
      
      stopButton.onclick = function() {
        startButton.style.display = 'block';
        pauseButton.style.display = 'none';
        stopDrawing();
        backButton.style.display = 'block';
      }

      function panTo(lat, lng) {
        // 이동할 위도 경도 위치를 생성합니다 
        var moveLatLon = new kakao.maps.LatLng(lat, lng);
        
        // 지도 중심을 부드럽게 이동시킵니다
        // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
        map.panTo(moveLatLon);

        // 마커가 표시될 위치입니다 
        markerPosition  = new kakao.maps.LatLng(lat, lng);
        
        marker.setMap(null);

        // 마커를 생성합니다
        marker = new kakao.maps.Marker({
          position: markerPosition
        });
        
        // 마커가 지도 위에 표시되도록 설정합니다
        marker.setMap(map);   
      }        
      
      // 지도에 클릭 이벤트를 등록합니다
      // 지도를 클릭하면 선 그리기가 시작됩니다 그려진 선이 있으면 지우고 다시 그립니다
      function startDrawing(lat, lng) {
        panTo(lat, lng);

        // 지도 클릭이벤트가 발생했는데 선을 그리고있는 상태가 아니면
        if (!drawingFlag) {
    
          // 상태를 true로, 선이 그리고있는 상태로 변경합니다
          drawingFlag = true;
          
          // 지도 위에 선이 표시되고 있다면 지도에서 제거합니다
          deleteClickLine();
          
          // 지도 위에 커스텀오버레이가 표시되고 있다면 지도에서 제거합니다
          deleteDistnce();

          // 지도 위에 선을 그리기 위해 클릭한 지점과 해당 지점의 거리정보가 표시되고 있다면 지도에서 제거합니다
          deleteCircleDot();
      
          // 클릭한 위치를 기준으로 선을 생성하고 지도위에 표시합니다
          clickLine = new kakao.maps.Polyline({
              map: map, // 선을 표시할 지도입니다 
              path: [new kakao.maps.LatLng(lat, lng)], // 선을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다
              strokeWeight: 3, // 선의 두께입니다 
              strokeColor: '#db4040', // 선의 색깔입니다
              strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
              strokeStyle: 'solid' // 선의 스타일입니다
          });
          
          // 선이 그려지고 있을 때 마우스 움직임에 따라 선이 그려질 위치를 표시할 선을 생성합니다
          moveLine = new kakao.maps.Polyline({
              strokeWeight: 3, // 선의 두께입니다 
              strokeColor: '#db4040', // 선의 색깔입니다
              strokeOpacity: 0.5, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
              strokeStyle: 'solid' // 선의 스타일입니다    
          });
      
          // 클릭한 지점에 대한 정보를 지도에 표시합니다
          displayCircleDot(new kakao.maps.LatLng(lat, lng), 0);
    
                
        } else { // 선이 그려지고 있는 상태이면
    
          // 그려지고 있는 선의 좌표 배열을 얻어옵니다
          var path = clickLine.getPath();

          // 좌표 배열에 클릭한 위치를 추가합니다
          path.push(new kakao.maps.LatLng(lat, lng));
          
          // 다시 선에 좌표 배열을 설정하여 클릭 위치까지 선을 그리도록 설정합니다
          clickLine.setPath(path);

          var distance = Math.round(clickLine.getLength());
          displayCircleDot(new kakao.maps.LatLng(lat, lng), distance);

          console.log(path);
        };
      };     
      
      // 지도에 마우스 오른쪽 클릭 이벤트를 등록합니다
      // 선을 그리고있는 상태에서 마우스 오른쪽 클릭 이벤트가 발생하면 선 그리기를 종료합니다
      function stopDrawing () {

        // 지도 오른쪽 클릭 이벤트가 발생했는데 선을 그리고있는 상태이면
        if (drawingFlag) {
            
          // 마우스무브로 그려진 선은 지도에서 제거합니다
          moveLine.setMap(null);
          moveLine = null;  
          
          // 마우스 클릭으로 그린 선의 좌표 배열을 얻어옵니다
          var path = clickLine.getPath();

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "locations", 
            data: path,
          }));

          // 선을 구성하는 좌표의 개수가 2개 이상이면
          if (path.length > 1) {

            // 마지막 클릭 지점에 대한 거리 정보 커스텀 오버레이를 지웁니다
            if (dots[dots.length-1].distance) {
                dots[dots.length-1].distance.setMap(null);
                dots[dots.length-1].distance = null;    
            }

            var distance = Math.round(clickLine.getLength()), // 선의 총 거리를 계산합니다
                content = getTimeHTML(distance); // 커스텀오버레이에 추가될 내용입니다
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "distance", 
              data: distance,
            }));

            // 그려진 선의 거리정보를 지도에 표시합니다
            showDistance(content, path[path.length-1]);  
              
          } else {

            // 선을 구성하는 좌표의 개수가 1개 이하이면 
            // 지도에 표시되고 있는 선과 정보들을 지도에서 제거합니다.
            deleteClickLine();
            deleteCircleDot(); 
            deleteDistnce();

          }
          
          // 상태를 false로, 그리지 않고 있는 상태로 변경합니다
          drawingFlag = false;          
        }  
      };   
      
      // 클릭으로 그려진 선을 지도에서 제거하는 함수입니다
      function deleteClickLine() {
        if (clickLine) {
          clickLine.setMap(null);    
          clickLine = null;        
        }
      }
      
      // 마우스 드래그로 그려지고 있는 선의 총거리 정보를 표시하거
      // 마우스 오른쪽 클릭으로 선 그리가 종료됐을 때 선의 정보를 표시하는 커스텀 오버레이를 생성하고 지도에 표시하는 함수입니다
      function showDistance(content, position) {
          
        if (distanceOverlay) { // 커스텀오버레이가 생성된 상태이면
            
          // 커스텀 오버레이의 위치와 표시할 내용을 설정합니다
          distanceOverlay.setPosition(position);
          distanceOverlay.setContent(content);
            
        } else { // 커스텀 오버레이가 생성되지 않은 상태이면
            
          // 커스텀 오버레이를 생성하고 지도에 표시합니다
          distanceOverlay = new kakao.maps.CustomOverlay({
            map: map, // 커스텀오버레이를 표시할 지도입니다
            content: content,  // 커스텀오버레이에 표시할 내용입니다
            position: position, // 커스텀오버레이를 표시할 위치입니다.
            xAnchor: 0,
            yAnchor: 0,
            zIndex: 3  
          });      
        }
      }
      
      // 그려지고 있는 선의 총거리 정보와 
      // 선 그리가 종료됐을 때 선의 정보를 표시하는 커스텀 오버레이를 삭제하는 함수입니다
      function deleteDistnce () {
        if (distanceOverlay) {
            distanceOverlay.setMap(null);
            distanceOverlay = null;
        }
      }
      
      // 선이 그려지고 있는 상태일 때 지도를 클릭하면 호출하여 
      // 클릭 지점에 대한 정보 (동그라미와 클릭 지점까지의 총거리)를 표출하는 함수입니다
      function displayCircleDot(position, distance) {
      
        // 클릭 지점을 표시할 빨간 동그라미 커스텀오버레이를 생성합니다
        var circleOverlay = new kakao.maps.CustomOverlay({
            content: '<span class="dot"></span>',
            position: position,
            zIndex: 1
        });
    
        // 지도에 표시합니다
        circleOverlay.setMap(map);
    
        if (distance > 0) {
            // 클릭한 지점까지의 그려진 선의 총 거리를 표시할 커스텀 오버레이를 생성합니다
            var distanceOverlay = new kakao.maps.CustomOverlay({
                content: '<div class="dotOverlay">거리 <span class="number">' + distance + '</span>m</div>',
                position: position,
                yAnchor: 1,
                zIndex: 2
            });
    
            // 지도에 표시합니다
            distanceOverlay.setMap(map);
        }
    
        // 배열에 추가합니다
        dots.push({circle:circleOverlay, distance: distanceOverlay});
      }
      
      // 클릭 지점에 대한 정보 (동그라미와 클릭 지점까지의 총거리)를 지도에서 모두 제거하는 함수입니다
      function deleteCircleDot() {
        var i;
    
        for ( i = 0; i < dots.length; i++ ){
            if (dots[i].circle) { 
                dots[i].circle.setMap(null);
            }
    
            if (dots[i].distance) {
                dots[i].distance.setMap(null);
            }
        }
    
        dots = [];
      }
      
      // 마우스 우클릭 하여 선 그리기가 종료됐을 때 호출하여 
      // 그려진 선의 총거리 정보와 거리에 대한 도보, 자전거 시간을 계산하여
      // HTML Content를 만들어 리턴하는 함수입니다
      function getTimeHTML(distance) {
    
        // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
        var walkkTime = distance / 67 | 0;
        var walkHour = '', walkMin = '';
    
        // 계산한 도보 시간이 60분 보다 크면 시간으로 표시합니다
        if (walkkTime > 60) {
            walkHour = '<span class="number">' + Math.floor(walkkTime / 60) + '</span>시간 '
        }
        walkMin = '<span class="number">' + walkkTime % 60 + '</span>분'
    
        var content = '<ul class="dotOverlay distanceInfo">';
        content += '    <li>';
        content += '        <span class="label">총거리</span><span class="number">' + distance + '</span>m';
        content += '    </li>';
        content += '</ul>'
    
        return content;
      }
          
    </script>    
  </body>
</html>
`;


export default function WalkScreen ({ navigation }) {
  const apiUrl = "http://i10a410.p.ssafy.io:8080";
  const [location, setLocation] = useState(null);
  const [pause, setPause] = useState(false);
  const webViewRef = useRef(null);

  const [modalDuration, setModalDuration] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [modalLocations, setModalLocations] = useState(null);
  const [modalDistance, setModalDistance] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMyModalOpen, setIsMyModalOpen] = useState(false);


  const openModalWithData = () => {
    setIsCreateModalOpen(true);
  };
  
  const openModalWithMy = () => {
    setIsMyModalOpen(true);
  }

  const closeModal = () => {
    setIsCreateModalOpen(false);
  };

  const closeMyModal = () => {
    setIsMyModalOpen(false);
  };

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      webViewRef.current.postMessage(JSON.stringify({
        type: 'location',
        data: location.coords
      }));
      console.log(1, JSON.parse(JSON.stringify(location.coords)));
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('현재 위치를 받아올 수 없습니다!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }, 2000);

    return () => clearInterval(timer);
  }, [location]);

  useEffect(() => {
    if (location && !pause) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'location',
        data: location.coords
      }));
      console.log(2, JSON.parse(JSON.stringify(location.coords)));
    }
  }, [location]);


  const onMessage = (event) => {
    const { type, data } = JSON.parse(event.nativeEvent.data);
    if (type === "locations") {
      console.log(data);
      setModalLocations(data);
    } else if (type === "timer") {
      console.log(data);
      setModalDuration(data);
    } else if (type === "start") {
      setPause(false);
      console.log(pause);
    } else if (type === 'pause') {
      setPause(true);
      console.log(pause);
    } else if (type === 'distance') {
      setModalDistance(data);
      console.log(data);
    }
  }

  return (
    <View style={styles.walkMainContainer}>
      {location ? (
        <WebView
          ref={webViewRef}
          style={styles.walkMainMap}
          source={{ html: htmlContainer }}
          onMessage={onMessage}
        />
      ) : (
        <View style={styles.walkMainLoading}>
          <Text style={styles.walkMainLoadingText}>Loading...</Text>
        </View>
      )}

      {modalDuration ? (
        <TouchableOpacity onPress={() => openModalWithData()}>
          <View style={styles.walkMainRecord}>
            <Text style={styles.walkMainRecordText}>Record</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {modalDuration && modalLocations && (
        <Modal
          visible={isCreateModalOpen}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <WalkCreate 
            duration={modalDuration}
            locations={modalLocations}
            distance={modalDistance}
            closeModal={closeModal} />
        </Modal>
      )}
      
      <Button title="My" onPress={() => openModalWithMy()}>
        <View style={styles.walkMainMy}>
          <Text style={styles.walkMainMyText}>My</Text>
        </View>
      </Button>
      
      <Modal
        visible={isMyModalOpen}
        animationType="slide"
        onRequestClose={closeMyModal}
      >
        <WalkCalendar 
          closeModal={closeMyModal} />
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  walkMainContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.82,
  },
  walkMainMap: {
    flex: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.82,
  },
  walkMainStart: {
    width: 100,
    height: 100,
    position: "absolute",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 100,
    bottom: 50,
    left: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "yellow",
  },
  walkMainStartText: {
    fontSize: 20,
  },
  walkMainLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  walkMainLoadingText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
  },
  walkMainCalendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  walkMainRecord: {
    width: 60,
    height: 60,
    position: "absolute",
    borderColor: "black",
    borderRadius: 100,
    bottom: 10,
    left: 215,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "yellow",
    zIndex: 6,
  },
  walkMainRecordText: {
    fontSize: 15,
  },
  walkMainMy: {
    width: 60,
    height: 60,
    position: "absolute",
    borderColor: "black",
    borderRadius: 100,
    top: 100,
    left: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "yellow",
    zIndex: 7,
  },
  walkMainMyText: {
    fontSize: 15,
  },
})