import * as THREE from '/node_modules/three108/build/three.module.js'
import { GUI } from '/node_modules/three108/examples/jsm/libs/dat.gui.module.js'
import { GLTFLoader } from '/node_modules/three108/examples/jsm/loaders/GLTFLoader.js'
import {scene, camera, renderer, clock, createOrbitControls, initLights} from '/utils/scene.js'

let gui, mixer, actions, activeAction, previousAction, model, face

const api = { state: 'Walking' }

initLights()
createOrbitControls()

camera.position.set(- 5, 3, 10)
camera.lookAt(new THREE.Vector3(0, 2, 0))

scene.background = new THREE.Color(0xe0e0e0)

// model
const loader = new GLTFLoader()
loader.load('/assets/models/RobotExpressive.glb', gltf => {
  model = gltf.scene
  scene.add(model)
  createGUI(model, gltf.animations)
})

function createGUI(model, animations) {
  const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ]
  const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ]

  gui = new GUI()
  mixer = new THREE.AnimationMixer(model)
  actions = {}

  for (let i = 0; i < animations.length; i ++) {
    const clip = animations[i]
    const action = mixer.clipAction(clip)
    actions[clip.name] = action
    if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      action.clampWhenFinished = true
      action.loop = THREE.LoopOnce
    }
  }

  // states
  const statesFolder = gui.addFolder('States')
  const clipCtrl = statesFolder.add(api, 'state').options(states)
  clipCtrl.onChange(() => {
    fadeToAction(api.state, 0.5)
  })
  statesFolder.open()

  // emotes
  const emoteFolder = gui.addFolder('Emotes')
  function createEmoteCallback(name) {
    api[name] = function() {
      fadeToAction(name, 0.2)
      mixer.addEventListener('finished', restoreState)
    }
    emoteFolder.add(api, name)
  }

  function restoreState() {
    mixer.removeEventListener('finished', restoreState)
    fadeToAction(api.state, 0.2)
  }

  for (let i = 0; i < emotes.length; i ++)
    createEmoteCallback(emotes[ i ])
  emoteFolder.open()

  // expressions
  face = model.getObjectByName('Head_2')
  const expressions = Object.keys(face.morphTargetDictionary)
  const expressionFolder = gui.addFolder('Expressions')

  for (let i = 0; i < expressions.length; i ++)
    expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[ i ])

  activeAction = actions.Walking
  activeAction.play()
  expressionFolder.open()
}

function fadeToAction(name, duration) {
  previousAction = activeAction
  activeAction = actions[name]

  if (previousAction !== activeAction)
    previousAction.fadeOut(duration)

  activeAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play()
}

/* LOOP */

void function animate() {
  const dt = clock.getDelta()
  if (mixer) mixer.update(dt)
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
