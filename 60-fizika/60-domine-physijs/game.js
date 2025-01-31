/* global Physijs, THREE */
Physijs.scripts.worker = '/libs/physijs_worker.js'
Physijs.scripts.ammo = './ammo.js'
import {renderer, camera, createOrbitControls} from '../../utils/scene.js'

createOrbitControls()
camera.position.set(10, 10, 50)

const scene = new Physijs.Scene
scene.add(new THREE.AmbientLight(0x343434))
scene.add(new THREE.AmbientLight(0xcccccc))

scene.setGravity(new THREE.Vector3(0, -50, 0))

createGround()
addBlocks()

/* FUNCTIONS */

function addBlocks() {
  const blocks = []
  const colors = [0x000000, 0xffffff]
  const points = getPoints()
  points.forEach((point, index) => {
    const blockGeom = new THREE.BoxGeometry(1, 6, 2)
    const block = new Physijs.BoxMesh(blockGeom, Physijs.createMaterial(new THREE.MeshStandardMaterial({
      color: colors[index % colors.length]
    })))
    block.position.copy(point)
    block.lookAt(scene.position)
    block.position.y = 3.5
    blocks.push(block)
    scene.add(block)
  })
  blocks[0].rotation.x = 0.4 // first block to fall
  blocks[0].__dirtyRotation = true
}

function getPoints() {
  const points = []
  const r = 27
  const cX = 0
  const cY = 0
  let circleOffset = 0
  for (let i = 0; i < 1000; i += 6 + circleOffset) {
    circleOffset = 4.5 * (i / 360)
    const x = (r / 1440) * (1440 - i) * Math.cos(i * (Math.PI / 180)) + cX
    const z = (r / 1440) * (1440 - i) * Math.sin(i * (Math.PI / 180)) + cY
    const y = 0
    points.push(new THREE.Vector3(x, y, z))
  }
  return points
}

function createGround() {
  const textureLoader = new THREE.TextureLoader()
  const ground_material = Physijs.createMaterial(
    new THREE.MeshStandardMaterial({
      map: textureLoader.load('../../assets/textures/wood_1-1024x1024.png')
    }),
    .9, .3)
  const ground = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 1, 60), ground_material, 0)
  scene.add(ground)
}

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
  scene.simulate()
}()
