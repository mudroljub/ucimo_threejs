import * as THREE from '/node_modules/three108/build/three.module.js'
import { scene, camera, renderer, createOrbitControls, addLights } from '/utils/scene.js'
import { randomInRange, randomGray, generateCityTexture } from '/utils/helpers.js'

const size = 150

createOrbitControls()
addLights()
renderer.setClearColor(0x7ec0ee)

camera.position.set(0, 50, 200)

scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025)
scene.add(createFloor(size * 2, 0x101018))

for (let i = 0; i < size; i++)
  scene.add(createBuilding(size))

/* FUNCTIONS */

function createBuilding(size) {
  const width = randomInRange(10, 20)
  const height = randomInRange(width, width * 4)
  const geometry = new THREE.BoxGeometry(width, height, width)
  // geometry.faces.splice(6, 2) // remove bottom for optimization

  // remove roof texture
  geometry.faceVertexUvs[0][4][0].set(0, 0)
  geometry.faceVertexUvs[0][4][1].set(0, 0)
  geometry.faceVertexUvs[0][4][2].set(0, 0)
  geometry.faceVertexUvs[0][5][0].set(0, 0)
  geometry.faceVertexUvs[0][5][1].set(0, 0)
  geometry.faceVertexUvs[0][5][2].set(0, 0)

  const TEXTURE_SIZE = 16
  const texture = Math.random() > 0.2 ? 'gray-bricks.jpg' : 'bricks.jpg'
  const map = new THREE.TextureLoader().load(`/assets/textures/${texture}`)
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.repeat.set(width / TEXTURE_SIZE, height / TEXTURE_SIZE)

  const material = new THREE.MeshStandardMaterial({ map: generateCityTexture(), color: randomGray() })
  const mesh = new THREE.Mesh(geometry, material)

  mesh.rotation.y = Math.random()
  mesh.position.set(randomInRange(-size, size), height / 2, randomInRange(-size, size))
  return mesh
}

function createFloor(r = 1000, color = 0x60bf63) {
  const material = new THREE.MeshBasicMaterial({ color })
  const geometry = new THREE.CircleGeometry(r, 32)
  geometry.rotateX(-Math.PI / 2)
  return new THREE.Mesh(geometry, material)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
