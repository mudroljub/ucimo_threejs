/* global THREE, Physijs */
import {renderer, camera } from '../../utils/scene.js'

Physijs.scripts.worker = 'libs/physijs_worker.js'
Physijs.scripts.ammo = 'ammo.js'

const loader = new THREE.TextureLoader()
const rockTexture = loader.load('/assets/textures/rocks.jpg')

const scene = new Physijs.Scene()
scene.setGravity(new THREE.Vector3(0, -30, 0))
scene.addEventListener('update', () => scene.simulate(undefined, 2))

camera.position.set(30, 25, 30)
camera.lookAt(scene.position)

const light = new THREE.DirectionalLight(0xFFFFFF)
light.position.set(20, 40, -15)
light.castShadow = true
scene.add(light)

const ground = createGround()
scene.add(ground)

const car = addCar(scene)
scene.simulate()

/* FUNCTIONS */

function addCar(scene) {
  const car = {}
  const carMaterial = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({color: 0xff6666}),
    .8, // high friction
    .2 // low restitution
  )

  const wheelMaterial = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({color: 0x444444}),
    .8, // high friction
    .5 // medium restitution
  )
  const wheelGeometry = new THREE.CylinderGeometry(2, 2, 1, 8)
  car.body = new Physijs.BoxMesh(
    new THREE.BoxGeometry(10, 5, 7),
    carMaterial,
    1000
  )
  car.body.position.y = 10
  car.body.receiveShadow = car.body.castShadow = true
  scene.add(car.body)

  car.wheelFl = new Physijs.CylinderMesh(
    wheelGeometry,
    wheelMaterial,
    500
  )
  car.wheelFl.rotation.x = Math.PI / 2
  car.wheelFl.position.set(-3.5, 6.5, 5)
  car.wheelFl.receiveShadow = car.wheelFl.castShadow = true
  scene.add(car.wheelFl)
  car.wheelFlConstraint = new Physijs.DOFConstraint(
    car.wheelFl, car.body, new THREE.Vector3(-3.5, 6.5, 5)
  )
  scene.addConstraint(car.wheelFlConstraint)
  car.wheelFlConstraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 })
  car.wheelFlConstraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 })

  car.wheelFr = new Physijs.CylinderMesh(
    wheelGeometry,
    wheelMaterial,
    500
  )
  car.wheelFr.rotation.x = Math.PI / 2
  car.wheelFr.position.set(-3.5, 6.5, -5)
  car.wheelFr.receiveShadow = car.wheelFr.castShadow = true
  scene.add(car.wheelFr)
  car.wheelFrConstraint = new Physijs.DOFConstraint(
    car.wheelFr, car.body, new THREE.Vector3(-3.5, 6.5, -5)
  )
  scene.addConstraint(car.wheelFrConstraint)
  car.wheelFrConstraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 })
  car.wheelFrConstraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 })

  car.wheelBl = new Physijs.CylinderMesh(
    wheelGeometry,
    wheelMaterial,
    500
  )
  car.wheelBl.rotation.x = Math.PI / 2
  car.wheelBl.position.set(3.5, 6.5, 5)
  car.wheelBl.receiveShadow = car.wheelBl.castShadow = true
  scene.add(car.wheelBl)
  car.wheelBlConstraint = new Physijs.DOFConstraint(
    car.wheelBl, car.body, new THREE.Vector3(3.5, 6.5, 5)
  )
  scene.addConstraint(car.wheelBlConstraint)
  car.wheelBlConstraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 })
  car.wheelBlConstraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 })

  car.wheelBr = new Physijs.CylinderMesh(
    wheelGeometry,
    wheelMaterial,
    500
  )
  car.wheelBr.rotation.x = Math.PI / 2
  car.wheelBr.position.set(3.5, 6.5, -5)
  car.wheelBr.receiveShadow = car.wheelBr.castShadow = true
  scene.add(car.wheelBr)
  car.wheelBrConstraint = new Physijs.DOFConstraint(
    car.wheelBr, car.body, new THREE.Vector3(3.5, 6.5, -5)
  )
  scene.addConstraint(car.wheelBrConstraint)
  car.wheelBrConstraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 })
  car.wheelBrConstraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 })
  return car
}

function createGround() {
  const groundMaterial = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({ map: rockTexture}),
    .8, // high friction
    .4 // low restitution
  )
  groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping
  groundMaterial.map.repeat.set(3, 3)

  const ground = new Physijs.BoxMesh(
    new THREE.BoxGeometry(100, 1, 100),
    groundMaterial,
    0 // mass
  )
  return ground
}

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('keydown', ev => {
  switch(ev.keyCode) {
    case 37:
    // Left
      car.wheelFlConstraint.configureAngularMotor(1, -Math.PI / 2, Math.PI / 2, 1, 200)
      car.wheelFrConstraint.configureAngularMotor(1, -Math.PI / 2, Math.PI / 2, 1, 200)
      car.wheelFlConstraint.enableAngularMotor(1)
      car.wheelFrConstraint.enableAngularMotor(1)
      break

    case 39:
    // Right
      car.wheelFlConstraint.configureAngularMotor(1, -Math.PI / 2, Math.PI / 2, -1, 200)
      car.wheelFrConstraint.configureAngularMotor(1, -Math.PI / 2, Math.PI / 2, -1, 200)
      car.wheelFlConstraint.enableAngularMotor(1)
      car.wheelFrConstraint.enableAngularMotor(1)
      break

    case 38:
    // Up
      car.wheelBlConstraint.configureAngularMotor(2, 1, 0, 5, 2000)
      car.wheelBrConstraint.configureAngularMotor(2, 1, 0, 5, 2000)
      car.wheelBlConstraint.enableAngularMotor(2)
      car.wheelBrConstraint.enableAngularMotor(2)
      break

    case 40:
    // Down
      car.wheelBlConstraint.configureAngularMotor(2, 1, 0, -5, 2000)
      car.wheelBrConstraint.configureAngularMotor(2, 1, 0, -5, 2000)
      car.wheelBlConstraint.enableAngularMotor(2)
      // car.wheelBrConstraint.enableAngularMotor( 2 );
      break
  }
})

document.addEventListener('keyup', ev => {
  switch(ev.keyCode) {
    case 37:
    // Left
      car.wheelFlConstraint.disableAngularMotor(1)
      car.wheelFrConstraint.disableAngularMotor(1)
      break

    case 39:
    // Right
      car.wheelFlConstraint.disableAngularMotor(1)
      car.wheelFrConstraint.disableAngularMotor(1)
      break

    case 38:
    // Up
      car.wheelBlConstraint.disableAngularMotor(2)
      car.wheelBrConstraint.disableAngularMotor(2)
      break

    case 40:
    // Down
      car.wheelBlConstraint.disableAngularMotor(2)
      car.wheelBrConstraint.disableAngularMotor(2)
      break
  }
})
