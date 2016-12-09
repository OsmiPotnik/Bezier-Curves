var point_num = 0;
var pointList= [];
var curveList = [];
var mouseIsDown = false;
var DPressed = false;
var selectedPoint;
var lastSelectedPoint;
var selectedCurve;
var pointEnum = {
  APPROXIMATED: 1,
  INTERPOLATED: 2
}


function Point(x,y,type){
  this.x = x;
  this.y = y;
  this.color = "#000000"
  this.pointType = type || pointEnum.APPROXIMATED;
}

Point.prototype.drawPoint = function (){
  ctx.fillStyle = this.color;
  if (this.pointType == pointEnum.INTERPOLATED)
    ctx.fillRect(this.x - 2.5,this.y - 2.5 ,5,5);
  else if(this.pointType == pointEnum.APPROXIMATED){
    ctx.beginPath();
    var radius = 2.5;
    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

Point.prototype.getX = function(){
  return this.x;
}

Point.prototype.getY = function() {
  return this.y;
}

Point.prototype.typeOf = function (type){
  return type == this.pointType;
}

Point.prototype.setX = function(x){
  this.x = x;
}

Point.prototype.setY = function(y){
  this.y = y;
}

Point.prototype.setColor = function(color){
  this.color = color;
}


function BezierCurve (point1,point2,point3,point4, color){
  this.p1 = point1;
  this.p2 = point2;
  this.p3 = point3;
  this.p4 = point4;
  this.color =  color || "#000000";
  this.leftGlued = null;
  this.rightGlued = null;
}

function bezier (t,point1,point2,point3,point4){
  var x = Math.pow((1-t),3) * point1.getX() + 3*Math.pow((1-t),2)*t*point2.getX() + 3*(1-t)*Math.pow(t,2)*point3.getX()+Math.pow(t,3)*point4.getX();
  var y = Math.pow((1-t),3) * point1.getY() + 3*Math.pow((1-t),2)*t*point2.getY() + 3*(1-t)*Math.pow(t,2)*point3.getY()+Math.pow(t,3)*point4.getY();

  return new Point(x,y,null);
}

BezierCurve.prototype.drawBezier = function (){
  var natancnost = 0.001;
  ctx.moveTo(this.p1.getX(), this.p1.getY());
  var clr = this.color;
  ctx.strokeStyle = clr;
  ctx.beginPath();
  for (var i=0; i<1; i += natancnost){
     var point = bezier(i, this.p1, this.p2, this.p3, this.p4);
     ctx.lineTo(point.getX(), point.getY());
  }
  ctx.stroke();
  ctx.closePath();
  drawLine(this.p1,this.p2);
  drawLine(this.p3, this.p4);
}

BezierCurve.prototype.drawPoints = function() {
  this.p1.drawPoint();
  this.p2.drawPoint();
  this.p3.drawPoint();
  this.p4.drawPoint();
}

BezierCurve.prototype.getPointList = function(){
  return [this.p1, this.p2, this.p3, this.p4];
}

BezierCurve.prototype.getVertexPoints = function(){
  return {vertex1: this.p1, vertex2: this.p4};
}

BezierCurve.prototype.getLeftPoint = function(){
  return this.p1.getX() < this.p4.getX() ? this.p1 : this.p4;
}

BezierCurve.prototype.getRightPoint = function(){
 return this.p1.getX() < this.p4.getX() ? this.p4 : this.p1;
}

BezierCurve.prototype.setPoint1 = function (point){
  this.p1 = point;
}

BezierCurve.prototype.setPoint4 = function (point){
  this.p4 = point;
}

BezierCurve.prototype.changePointsColor = function (color){
  this.p1.setColor(color);
  this.p2.setColor(color);
  this.p3.setColor(color);
  this.p4.setColor(color);
}

BezierCurve.prototype.changeCurveColor = function (color){
  if(color != this.color){
    this.color = color;
    if (this.leftGlued)
      this.leftGlued.changeCurveColor(this.color);
    if (this.rightGlued)
      this.rightGlued.changeCurveColor(this.color);
  }
}

BezierCurve.prototype.glueLeft = function (curve){
  this.leftGlued = curve;
}

BezierCurve.prototype.glueRight = function(curve){
    this.rightGlued = curve;
}

BezierCurve.prototype.getGluedRight = function(){
  return this.rightGlued;
}

BezierCurve.prototype.getGluedLeft = function () {
  return this.leftGlued;
}

BezierCurve.prototype.removeGluedLeft = function() {
  this.leftGlued = null;
}

BezierCurve.prototype.removeGluedRight = function(){
  this.rightGlued = null;
}

BezierCurve.prototype.removeGluedCurve = function(curve){
  if (curve == this.leftGlued)
    this.leftGlued = null;
  if (curve == this.rightGlued)
    this.rightGlued = null;
}


function removeCurve(){
  var index = curveList.indexOf(selectedCurve);
  if (index > -1) {
    if (selectedCurve.getGluedLeft()){
      selectedCurve.getGluedLeft().changePointsColor("#000000");
      selectedCurve.getGluedLeft().removeGluedCurve(selectedCurve);
    }
    if (selectedCurve.getGluedRight()){
        selectedCurve.getGluedRight().changePointsColor("#000000");
        selectedCurve.getGluedRight().removeGluedCurve(selectedCurve);
      }
    curveList.splice(index, 1);
    selectedCurve = null;
    lastSelectedPoint = null;
  }
  draw();
}


function changeColor(){
  if (selectedCurve){
    selectedCurve.changeCurveColor(document.getElementById("colorpicker").value);
    draw();
  }
}

function disselect() {
  if (selectedCurve){
    selectedCurve.changePointsColor("#000000");
    selectedCurve = null;
    lastSelectedPoint = null;
    draw();
  }
}

function drawLine(point1, point2){
  ctx.beginPath();
  ctx.moveTo(point1.getX(),point1.getY());
  ctx.lineTo(point2.getX(),point2.getY());
  ctx.strokeStyle = "gray";
  ctx.stroke();
  ctx.closePath();
}

function draw(){
  clearCanvas();
  pointList.forEach( function (point) {
    point.drawPoint();
  });
  curveList.forEach( function(curve) {
    curve.drawBezier();
    curve.drawPoints();
  });
}

function colorSelected(curve){
  if (curve != selectedCurve){
    selectedCurve.changePointsColor("#000000");
    curve.changePointsColor("#4ef84e");
  }
  else {
    curve.changePointsColor("#4ef84e");
  }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function mouseClick(evt){

  var coords = getMousePos(canvas, evt);
  x = coords.x;
  y = coords.y;


  curveList.forEach ( function (curve) {
    curve.getPointList().forEach(function (point){
      if (x >= point.getX()-2 && x <= point.getX() + 7 && y >= point.getY() - 2 && y <= point.getY() + 7){
        selectedPoint = point;
        lastSelectedPoint = point;
        if (!selectedCurve)
          selectedCurve = curve;
        colorSelected(curve);
        if (selectedPoint) selectedPoint.setColor("blue");
        else lastSelectedPoint.setColor("blue");
        selectedCurve = curve;
        if (point_num == 3 && lastSelectedPoint && lastSelectedPoint.typeOf(pointEnum.INTERPOLATED)){
          if ((selectedCurve.getLeftPoint() == lastSelectedPoint && !selectedCurve.getGluedLeft())
            || (selectedCurve.getRightPoint() == lastSelectedPoint && !selectedCurve.getGluedRight())){
            pointList.push(lastSelectedPoint);
            point_num ++;
            selectedPoint = null;
            //lastSelectedPoint = null;
          }
        }
        draw();
      }
    });
  });

  if (!selectedPoint){

    if(point_num == 0 && lastSelectedPoint && lastSelectedPoint.typeOf(pointEnum.INTERPOLATED)){
      if ((selectedCurve.getLeftPoint() == lastSelectedPoint && !selectedCurve.getGluedLeft())
        || (selectedCurve.getRightPoint() == lastSelectedPoint && !selectedCurve.getGluedRight())){
          pointList.push(lastSelectedPoint);
          point_num ++;
        }
    }
    if (point_num < 4){
      var point;
      point_num ++;
      if (point_num == 1 || point_num == 4)
        point = new Point(x,y,pointEnum.INTERPOLATED);
      else
        point = new Point(x,y,pointEnum.APPROXIMATED);
      point.drawPoint();
      pointList.push(point);
    }

    if (point_num == 4){

      var bezCurve = new BezierCurve(pointList[0],pointList[1],pointList[2],pointList[3], document.getElementById("colorpicker").value);
      if (pointList[0] == lastSelectedPoint){
        if (selectedCurve.getLeftPoint() == lastSelectedPoint){
          selectedCurve.glueLeft(bezCurve);
          bezCurve.glueRight(selectedCurve);
        }
        if (selectedCurve.getRightPoint() == lastSelectedPoint){
          selectedCurve.glueRight(bezCurve);
          bezCurve.glueLeft(selectedCurve);
        }

        lastSelectedPoint = null;
      }

      if (pointList[3] == lastSelectedPoint){
        if (selectedCurve.getLeftPoint() == lastSelectedPoint){
          selectedCurve.glueLeft(bezCurve);
          bezCurve.glueRight(selectedCurve);
        }
        if (selectedCurve.getRightPoint() == lastSelectedPoint){
          selectedCurve.glueRight(bezCurve);
          bezCurve.glueLeft(selectedCurve);
        }

        lastSelectedPoint = null;
      }


      curveList.push(bezCurve);
      lastSelectedPoint = pointList[3];
      lastSelectedPoint.setColor("blue");
      if (selectedCurve) selectedCurve.changePointsColor("#000000");
      selectedCurve = bezCurve;
      colorSelected(bezCurve);
      point_num = 0;
      pointList = [];
      draw();

    }
  }

  else {
    selectedPoint = false;
  }
}

function mouseMove(evt){
  evt.preventDefault();
  if (mouseIsDown){
    var coords = getMousePos(canvas, evt);
    x = coords.x;
    y = coords.y;
    if (selectedPoint){
      selectedPoint.setX(x - 2.5);
      selectedPoint.setY(y - 2.5);
      draw();
    }
    else {
      curveList.forEach ( function (curve) {
        curve.getPointList().forEach(function (point){
          if (x >= point.getX()-2 && x <= point.getX() + 7 && y >= point.getY() - 2 && y <= point.getY() + 7){
            console.log(point);
            selectedPoint = point;
            lastSelectedPoint = point;
            if (!selectedCurve)
              selectedCurve = curve;
            colorSelected(curve);
            selectedPoint.setColor("blue");
            selectedCurve = curve;
          }
        });
      });
    }
  }
}

function mouseDown(evt){
  mouseIsDown = true;
}

function mouseUp(evt){
  mouseIsDown = false;
  if (selectedPoint){
    curveList.forEach( function (curve){
      if (curve != selectedCurve){
        var vertex = curve.getVertexPoints();
        if ((vertex.vertex1.getX() - 2.5 <= selectedPoint.getX() && vertex.vertex1.getX() + 2.5 >= selectedPoint.getX())
          && (vertex.vertex1.getY() - 2.5 <= selectedPoint.getY() && vertex.vertex1.getY() + 2.5 >= selectedPoint.getY())){
          console.log("colision");
          if (!curve.getGluedLeft()){
            curve.setPoint1(selectedPoint);
            curve.glueLeft(selectedCurve);
            selectedPoint.setX(vertex.vertex1.getX());
            selectedPoint.setY(vertex.vertex1.getY());
            if (selectedCurve.getLeftPoint() == selectedPoint)
              selectedCurve.glueLeft(curve);
            else if(selectedCurve.getRightPoint() == selectedPoint)
              selectedCurve.getGluedRight(curve);
            console.log(curve);
          }
        }
        else if ((vertex.vertex2.getX() - 2.5 <= selectedPoint.getX() && vertex.vertex2.getX() + 2.5 >= selectedPoint.getX())
          && (vertex.vertex2.getY() - 2.5 <= selectedPoint.getY() && vertex.vertex2.getY() + 2.5 >= selectedPoint.getY())){
          console.log("colision");
          if (!curve.getGluedRight()){
            curve.setPoint4(selectedPoint);
            selectedPoint.setX(vertex.vertex2.getX());
            selectedPoint.setY(vertex.vertex2.getY());
            curve.glueRight(selectedCurve)
            if (selectedCurve.getVertexPoints().vertex1 == selectedPoint)
              selectedCurve.glueLeft(curve);
            else if(selectedCurve.getVertexPoints().vertex2 == selectedPoint)
              selectedCurve.getGluedRight(curve);
            console.log(curve);
          }
        }
      }
    });
    draw();
  }
}

function clearCanvas (){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

function fullClear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  point_num = 0;
  pointList = [];
  curveList = [];
}
