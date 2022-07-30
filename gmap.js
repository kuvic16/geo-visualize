var map = null;
var markers = [];
var csvData = [];
var opts = {};
var selectedKinds = [];
var firstTime = true;
var infoWindow = null;
var isRouteDrawEnable = false;

function initMap() {
    const input = document.getElementById('upload-file');
    const reader = new FileReader();
    opts = {
        zoom: 10,
        center: new google.maps.LatLng(26.498451998558107, 127.9135912982222),
        scaleControl: true
    }
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        reader.onload = () => {
            csvData = reader.result.split(/\n/);
            processData();            
        }
        reader.readAsText(file);
    });
}

function processData() {
    const csvArray = csvData;            
    map = new google.maps.Map(document.getElementById("map"), opts);
    csv2json(csvArray).then(result => {
        visualizeContents(map, result);
    });
    initMarker();
}

function showSelectedKind(kind){
    markers = [];
    setSelectedKind(kind);
    processData();
}

function setSelectedKind(kind) {
    var isSelected = document.getElementById(kind).checked;
    if(!isExist(kind)){
        selectedKinds.push(kind);
    }

    // remove from array
    if(!isSelected) {
        var index = selectedKinds.indexOf(kind);
        if (index !== -1) {
            selectedKinds.splice(index, 1);
        }
    }
}

function isExist(data){
    return selectedKinds.indexOf(data) > -1;
}



function visualizeContents(map, result) {
    for (const content in result) {
        geoKind = result[content].kind;
        //console.log(geoKind);
        //if(firstTime) setSelectedKind(geoKind);
        //if(selectedKinds.length > 0 && !isExist(geoKind)) continue;
        if(!isExist(geoKind)) continue;

        color = getColor(geoKind);
        const contentCircle = new google.maps.Circle({
            strokeColor: color,
            fillColor: color,            
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillOpacity: 0,
            map,
            center: {
                lat: Number(result[content].latitude),
                lng: Number(result[content].longitude)
            },
            radius: Number(result[content].radius),
            title: result[content].id + "(" + result[content].kind + ")",
            data: result[content]
        });
        const contentId = new google.maps.Marker({
            map,
            position: {
                lat: Number(result[content].latitude),
                lng: Number(result[content].longitude)
            },
            icon: {
                url: '',
                size: new google.maps.Size(1, 1)
            },
            label: {
                text: result[content].id + "(" + result[content].kind + ")",
				color: color,
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                fontSize: '8px'
            },
			title: {
				text: result[content].id + "(" + result[content].kind + ")"
			}
        });

        google.maps.event.addListener(contentCircle, 'click', function(ev) {
            displayInfo(this.get('data'));
            addMarker(ev.latLng);
        });

        //circle is the google.maps.Circle-instance
        google.maps.event.addListener(contentCircle,'mouseover',function(){
            this.getMap().getDiv().setAttribute('title',this.get('title'));
            //displayInfo(this.get('data'));
        });

       google.maps.event.addListener(contentCircle,'mouseout',function(){
            this.getMap().getDiv().removeAttribute('title');});
    }
}

function displayInfo(info){
    document.getElementById("id").innerHTML = info.id;
    document.getElementById("areaId").innerHTML = info.areaId;
    document.getElementById("kind").innerHTML = info.kind;
    document.getElementById("latitude").innerHTML = info.latitude;
    document.getElementById("longitude").innerHTML = info.longitude;
    document.getElementById("radius").innerHTML = info.radius;
    document.getElementById("infnum").innerHTML = info.infnum;
    document.getElementById("outfnum").innerHTML = info.outfnum;
    document.getElementById("ntmg").innerHTML = info.ntmg;
    document.getElementById("storeId").innerHTML = info.storeId;
    document.getElementById("poiId").innerHTML = "<a target='_blank' href='https://api-dev.mobicomma.com/api/v1/poi/zenrin/" + info.poiId + "'>" + info.poiId + "</a>";
}

const csv2json = (csvArray) => {
    return new Promise((resolve, reject) => {
        var jsonArray = [];

        // 1行目から「項目名」の配列を生成する
        var items = csvArray[0].split(',');

        // CSVデータの配列の各行をループ処理する
        //// 配列の先頭要素(行)は項目名のため処理対象外
        //// 配列の最終要素(行)は空のため処理対象外
        for (var i = 1; i < csvArray.length - 1; i++) {
            var a_line = new Object();
            // カンマで区切られた各データに分割する
            var csvArrayD = csvArray[i].split(',');
            //// 各データをループ処理する
            for (var j = 0; j < items.length; j++) {
                // 要素名：items[j]
                // データ：csvArrayD[j]
                a_line[items[j]] = csvArrayD[j];
            }
            jsonArray.push(a_line);
        }
        resolve(jsonArray);
    })
}

function getColor(kind) {
    if (geoKind == "demogra") {
        color = "#641E16";
    } else if (geoKind == "outro") {
        color = "#512E5F";        
    } else if (geoKind == "pre_outro") {
        color = "#154360";
    } else if (geoKind == "around") {
        color = "#0E6251";
    } else if (geoKind == "detour") {
        color = "#145A32";
    } else if (geoKind == "gourmet") {
        color = "#7D6608";
    } else if (geoKind == "spot") {
        color = "#784212";
    } else if (geoKind == "guide") {
        color = "#7B7D7D";
    } else if (geoKind == "souvenir") {
        color = "#1B2631";
    } else if (geoKind == "quiz") {
        color = "red";
    } else if (geoKind == "pre-outro") {
        color = "#FFA07A";
    }else {
        color = "#800080";
    }
    return color;
}

function initMarker(){
    map.addListener('click', function(event) {
        addMarker(event.latLng);
      });
      
      poly = new google.maps.Polyline({
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
      poly.setMap(map);  
}

function addMarker(location) {
    if(!isRouteDrawEnable) return;
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    markers.push(marker);
    
    var path = poly.getPath();
    path.push(location);
}

function deleteAll(){
    var length = markers.length - 1;
    for(var i=length; i>=0; i--){
        deleteMarker(i);	
    }
}

function deleteLast(){
    deleteMarker(markers.length-1);	
}

function deleteMarker(index){
    markers[index].setMap(null);	
	markers.pop();
	
	var path = poly.getPath();
    path.pop();    
}

function toggleRouteDraw(){
    isRouteDrawEnable = document.getElementById("drawRoute").checked;
    toggleRouteButtons(!isRouteDrawEnable);
}

function toggleRouteButtons(enable){
    document.getElementById("deleteAll").disabled = enable;
    document.getElementById("undo").disabled = enable;
    document.getElementById("download").disabled = enable;
}

function generateGPX(){
    var fileName =  document.getElementById("fileName").value;    
    var elevator = new google.maps.ElevationService();

    var locations = [];
    for(i=0; i<markers.length; i++) {
        locations.push(markers[i].position);
    }

    var positionalRequest = {
        'locations': locations
    }

    console.log(positionalRequest);

    var xml = "";
    elevator.getElevationForLocations(positionalRequest, function(results, status) {
        console.log(status);
        if (status == google.maps.ElevationStatus.OK) {
            if (results[0]) {
                for (var i=0; i< results.length; i++) {
                    xml += "<wpt lat='" + markers[i].position.lat() + "' lon='" + markers[i].position.lng() + "'>";
                    xml += "<ele>" + results[i].elevation.toFixed(2) + "</ele>";
                    xml += "</wpt>";
                }
            }
        }
        prepareGpxContent(xml, fileName);
        
    });
}

function prepareGpxContent(xml, fileName){
    xml ="<?xml version='1.0'?><gpx version='1.1' creator='bjit'>"
        + xml
        + "</gpx>"
    ;
    const url = 'data:text/json;charset=utf-8,' + xml;
    const link = document.createElement('a');
    link.download = fileName-+999999 + `.gpx`;
    link.href = url;
    document.body.appendChild(link);
    link.click();    
}


// const createXmlString = (lines: number[][][]): string => {
//     let result = '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="runtracker"><metadata/><trk><name></name><desc></desc>'
//     result += lines.reduce((accum, curr) => {
//       let segmentTag = '<trkseg>';
//       segmentTag += curr.map((point) => `<trkpt lat="${point[1]}" lon="${point[0]}"><ele>${point[2]}</ele></trkpt>`).join('');
//       segmentTag += '</trkseg>'
  
//       return accum += segmentTag;
//     }, '');
//     result += '</trk></gpx>';
//     return result;
//   }
  
//   const downloadGpxFile = (
//     lines: number[][][],
//     distance: number[],
//     units: 'miles' | 'kilometers'
//   ) => {
//     const xml = createXmlString(lines);
//     const url = 'data:text/json;charset=utf-8,' + xml;
//     const link = document.createElement('a');
//     link.download = `${distance[distance.length - 1]}-${units}.gpx`;
//     link.href = url;
//     document.body.appendChild(link);
//     link.click();
//   };