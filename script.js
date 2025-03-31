var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;
let secondModelMixer, secondModelActions = [];
let sound, secondSound;

init();

function init(){

  const assetPath = './';

  clock = new THREE.Clock();
  
  scene = new THREE.Scene();
  
  scene.background = new THREE.Color(0x00000);
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

  camera.position.set(-5, 25, 20);

  // Set up audio for the scene
  const listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);
  secondSound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('assets/canOpenSound_01.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false)
    //jj
    sound.setVolume(1.0);
  });

  audioLoader.load('assets/Can crush.mp3', function (buffer) {
    secondSound.setBuffer(buffer);
    secondSound.setLoop(false);
    secondSound.setVolume(1.0);
  });

//Set up renderer for scene
const canvas = document.getElementById('threeContainer');
renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setPixelRatio( window.devicePixelRatio );
resize();

//Add Lighting
const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(ambient);

const light = new THREE.DirectionalLight(0xFFFFFF, 2);
light.position.set(0, 10, 2);
scene.add(light);

//Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(1, 2, 0);
controls.update();

//Controls animations to the object
mode = 'open';
const btn = document.getElementById("btn");
btn.addEventListener('click', function(){
  if (actions.length === 2) {
    if (mode === "open") {
      actions.forEach(action => {
        action.timeScale = 1;
        action.reset();
        action.play();

        if (sound.isPlaying) sound.stop();
        sound.play();

      });
    }
  }
});

// Wireframe toggle button
const wireframeBtn = document.getElementById("toggleWireframe");
wireframeBtn.addEventListener('click', function() {
  isWireframe = !isWireframe;
  toggleWireframe(isWireframe);
})

// Button Logic
const rotateBtn = document.getElementById("Rotate");
rotateBtn.addEventListener('click', function() {
  if (loadedModel) {
    const axis = new THREE.Vector3(0, 1, 0);
    const angle = Math.PI / 8;
    loadedModel.rotateOnAxis(axis, angle);
  } else {
    console.warn('Model not loaded yet.')
  }
});

const playSecondModelBtn = document.getElementById("playSecondAnimation");
playSecondModelBtn.addEventListener('click', function() {
  if (secondModelActions.length > 0) {
    secondModelActions.forEach(action => {
      action.reset();
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();

      if (secondSound.isPlaying) secondSound.stop();
      secondSound.play();
    });
  } else {
    console.warn('No animation available.');
  }
})

//Loads the giTF model
const loader = new THREE.GLTFLoader();
function loadModel(modelPath) {
  if (loadedModel) {
    scene.remove(loadedModel);
  }

  loader.load(modelPath, function (giTF) {
    const model = giTF.scene;

    model.position.set(0, 0, 0);
    scene.add(model);
    loadedModel = model;

    mixer = new THREE.AnimationMixer(model);
    const animations = giTF.animations;
    actions = [];

    animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      actions.push(action);
    });

    if (modelPath === 'assets/canModelSquashVid.glb') {
      secondModelMixer = mixer;
      secondModelActions = actions;
    }
  });
}

loadModel('assets/models/cameraModel.glb');
const switchBtn = document.getElementById("switchModel");
switchBtn.addEventListener('click', function() {
  loadModel('assets/canModelSquashVid.glb');
});

//Resizing Screen
window.addEventListener('resize', resize, false);

//Begin animation loop
animate();
}

function toggleWireframe(enable) {
  scene.traverse(function (object) {
    if (object.isMesh) {
      object.material.wireframe = enable;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (mixer) mixer.update(clock.getDelta());
  if (secondModelMixer) secondModelMixer.update(clock.getDelta());


renderer.render(scene, camera);
}

function resize(){
  const canvas = document.getElementById('threeContainer');
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}