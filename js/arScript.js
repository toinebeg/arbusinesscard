const arScript = function(){

var myCanvas;

var texture;

var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1, markerControls1;

var mesh1;

const debugAngles = true;
function initializeAr()
{

	scene = new THREE.Scene();

	let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
	scene.add( ambientLight );
				
	camera = new THREE.Camera();
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot1 = new THREE.Group();
	scene.add(markerRoot1);
	markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type: 'pattern', patternUrl: "data/hiro.patt",
	})

	let geometry1 = new THREE.PlaneBufferGeometry(2,2, 4,4);

	myCanvas = document.createElement("canvas");
	myCanvas.width = 480;
	myCanvas.height = 320;
	texture = new THREE.CanvasTexture( myCanvas );
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;
	let material1 = new THREE.MeshBasicMaterial( { map: texture } );
	
	mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.rotation.x = -Math.PI/2;
	
	markerRoot1.add( mesh1 );
}


function computeEulerAngles(matrix) {
    // Extract the 3x3 rotation matrix from the 4x4 matrix
    const rotationMatrix = [
        [matrix[0], matrix[1], matrix[2]],
        [matrix[4], matrix[5], matrix[6]],
        [matrix[8], matrix[9], matrix[10]]
    ];

    let sy = Math.sqrt(rotationMatrix[0][0] * rotationMatrix[0][0] + rotationMatrix[1][0] * rotationMatrix[1][0]);

    let singular = sy < 1e-6; // If sy is close to zero, singular

    let x, y, z;
    if (!singular) {
        x = Math.atan2(rotationMatrix[2][1], rotationMatrix[2][2]);
        y = Math.atan2(-rotationMatrix[2][0], sy);
        z = Math.atan2(rotationMatrix[1][0], rotationMatrix[0][0]);
    } else {
        x = Math.atan2(-rotationMatrix[1][2], rotationMatrix[1][1]);
        y = Math.atan2(-rotationMatrix[2][0], sy);
        z = 0;
    }

    return [x, y, z]; // roll (x), pitch (y), yaw (z)
}

function update()
{
	// update artoolkit on every frame
	if  ( arToolkitSource.ready !== false ){

		arToolkitContext.update( arToolkitSource.domElement );
	}
}


function render()
{
	renderer.render( scene, camera );
}


function animateAr()
{
	//requestAnimationFrame(animateAr);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	if(debugAngles && markerRoot1.visible) {
		const dataDisplay = document.getElementById("dataDisplay");
		let mat = markerControls1.object3d.matrix;
		let angles = computeEulerAngles(mat.toArray())
		dataDisplay.innerHTML = `<p> roll :${angles[0]}</p> <p> pitch : ${angles[1]}</p> <p>yaw : ${angles[2]} </p>`;
	}
	texture.needsUpdate = true;
	update();
	render();
}

function getTextureCanvas(){
    return myCanvas;
}

function isMarkerVisible(){
    return markerRoot1.visible;
}

function getEulerAngles(){
	let mat = markerControls1.object3d.matrix;
	let angles = computeEulerAngles(mat.toArray());

	return angles;
}

return {
    initializeAr,
    animateAr,
    getTextureCanvas,
    isMarkerVisible,
	getEulerAngles
}

}()