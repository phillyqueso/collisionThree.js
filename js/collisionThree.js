function Ball(particle, speed) {
    this.particle = particle;
    this.speed = speed;
}

$(document).ready(function() {
	const numBalls = 50;

	const xLimit = (window.innerWidth / 2);
	const yLimit = (window.innerHeight / 2);

	var camera, scene, renderer;
	var balls = new Array();

	var cameraSpeed = new THREE.Vector3(0,0,0);

	init();
	setInterval( loop, 1000 / 60 );

	$(document).keydown(function(event) {
		//alert("x:" + event.which);
		switch(event.which) {
		case 87: //w
		    //zoom in
		    camera.translateZ(-10);
		    break;
		case 83: //s
		    //zoom out
		    camera.translateZ(10);
		    break;
		case 65: //a
		    //left
		    camera.translateX(-10);
		    break;
		case 68: //d
		    //right
		    camera.translateX(10);
		    break;
		}
		renderer.render( scene, camera );
 	});

	$(document).mousemove(function(e) {
		cameraSpeed.x = ((e.pageX - xLimit) - camera.position.x) * 0.09;
		cameraSpeed.y = (((e.pageY - yLimit) * -1) - camera.position.y) * 0.09;
		//camera.target.position.x = (e.pageX - xLimit) * 1.5;
		//camera.target.position.y = (e.pageY - yLimit) * -1;
	});

	function init() {
	    
	    camera = new THREE.Camera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	    camera.position.z = 1000;
	    
	    scene = new THREE.Scene();
	    
	    for (var i = 0; i < numBalls; i++) {
		particle = new THREE.Particle( new THREE.ParticleCircleMaterial( { color: Math.random() * 0xffffff, opacity: 0.8 } ) );
		particle.position.x = Math.random() * (xLimit * 2) - xLimit;
		particle.position.y = Math.random() * (yLimit * 2) - yLimit;
		particle.position.z = Math.random() * 500;
		//particle.scale.x = particle.scale.y = Math.random() * 10 + 10;
		particle.scale.x = particle.scale.y = 15;

		speed = new THREE.Vector3();
		speed.x = Math.random() * 5 - 1;
		speed.y = Math.random() * 5 - 1;
		speed.z = Math.random() * 5 - 1;

		balls[i] = new Ball(particle, speed);

		scene.addObject( particle );
	    }
	    
	    renderer = new THREE.CanvasRenderer();
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    
	    document.body.appendChild( renderer.domElement );
	    
	}
	
	function loop() {

	    camera.target.position.x += cameraSpeed.x;                                                                                                                                 
	    camera.target.position.y += cameraSpeed.y;

	    renderer.render( scene, camera );
	    for (var j = 0; j < numBalls; j++) {

		var curBallPosition = balls[j].particle.position;
		var curBallSpeed = balls[j].speed;

		var xNext = Math.abs(curBallPosition.x + curBallSpeed.x);
		var yNext = Math.abs(curBallPosition.y + curBallSpeed.y);
		var zNext = Math.abs(curBallPosition.z + curBallSpeed.z);

		if ( xNext > xLimit ) {
		    curBallSpeed.x *= -1;
		}

		if ( yNext > yLimit ) {
		    curBallSpeed.y *= -1;
                }

		if ( zNext >= 1500) {
		    curBallSpeed.z *= -1;
		}

		/*
		var gravity = 0.9;
		var friction = 0.1;

		curBallSpeed.y *= (Math.abs((curBallPosition.y * 2) * gravity);
		curBallSpeed.x *= friction;
		curBallSpeed.z *= friction;
		*/
		
		curBallPosition.addSelf(curBallSpeed);

		collisionDetect(j);

	    }
	    
	}

	function collisionDetect(index) {
	    var p1 = balls[index].particle.position;
	    var p1Scale = balls[index].particle.scale;
	    var p1Speed = balls[index].speed;
	    for (var i = 0; i < numBalls; i++) {
		if (i != index) {
		    var p2 = balls[i].particle.position;
		    var p2Scale = balls[i].particle.scale;
		    var p2Speed = balls[i].speed;
		    //var d = Math.sqrt(( Math.pow((p1.x - p2.x),2) ) + ( Math.pow((p1.y - p2.y),2) ) + ( Math.pow((p1.z - p2.z),2) ));
		    var d = p1.distanceTo(p2);
		    if (d <= (p1Scale.x + p2Scale.x)) {
			//console.log(index + " and " + i + " have collided");
			var N = new THREE.Vector3();
			N.sub(p1,p2);

			//p1.addSelf(N);
			//p2.subSelf(N);

			var xVel = new THREE.Vector3();
			xVel.sub(p1Speed, p2Speed);


			//(x * V.x) + (y * V.y) + (z * V.z);			
			var vTemp = new THREE.Vector3();
			vTemp.multiply(N,xVel);
			var nv = (vTemp.x + vTemp.y + vTemp.z);

			var v2Temp = new THREE.Vector3();
			v2Temp.multiply(N,N);
			var n2 = (v2Temp.x + v2Temp.y + v2Temp.z);

			//fElasticity normally 0.8 , fFriction normally 0.1;
			var fElasticity = 1;
			var fFriction   = 1;

			var Vn = new THREE.Vector3();
			//vTemp.divideSelf(v2Temp);
			vTemp.copy(vDivide(vTemp, v2Temp));
			Vn.multiply(N, vTemp);

			var Vt = new THREE.Vector3();
			Vt.sub(xVel, Vn);

			//((1.0f + fElasticity) * fRatio1) * Vn + Vt * fFriction
			var finalV = new THREE.Vector3();
			finalV.add( Vn.multiplyScalar(fElasticity), Vt.multiplyScalar(fFriction) );

			p1Speed.subSelf(finalV);
			p2Speed.addSelf(finalV);

			p1.addSelf(p1Speed);
			p2.addSelf(p2Speed);
			
		    }
		}
	    }

	}

});

//missing function
function vDivide(v1,v2) {
    var Vf = new THREE.Vector3();
    Vf.x = v1.x / v2.x;
    Vf.y = v1.y / v2.y;
    Vf.z = v1.z / v2.z;
    return Vf;
}