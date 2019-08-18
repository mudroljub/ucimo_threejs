/** KONFIG **/

let misX = 0
let misY = 0

let polaEkranaX = window.innerWidth / 2
let polaEkranaY = window.innerHeight / 2

/** INIT **/

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
camera.position.z = 250

const scene = new THREE.Scene()

const ambijent = new THREE.AmbientLight(0x444444)
scene.add(ambijent)

const usmerenoSvetlo = new THREE.DirectionalLight(0xffeedd)
usmerenoSvetlo.position.set(0, 0, 1).normalize()
scene.add(usmerenoSvetlo)

const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

/** FUNKCIJE **/

const onProgress = function(xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = xhr.loaded / xhr.total * 100
    console.log(Math.round(percentComplete, 2) + '% ucitano')
  }
}

const onError = function(xhr) {}

const onWindowResize = function() {
  polaEkranaX = window.innerWidth / 2
  polaEkranaY = window.innerHeight / 2
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const onDocumentMouseMove = function(event) {
  misX = (event.clientX - polaEkranaX) / 2
  misY = (event.clientY - polaEkranaY) / 2
}

const render = function() {
  camera.position.x += (misX - camera.position.x) * 0.05
  camera.position.y += (-misY - camera.position.y) * 0.05
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
}

const update = function() {
  requestAnimationFrame(update)
  render()
}

/** LOGIKA **/

const ucitavacModela = new THREE.OBJLoader()
const ucitavacTeksture = new THREE.MTLLoader()

ucitavacModela.load('modeli/vojnik/model.obj', model => {
  model.position.y = -95
  scene.add(model)
}, onProgress, onError)

ucitavacTeksture.setPath('modeli/vojnik/')
ucitavacTeksture.load('model.mtl', materijali => {
  ucitavacModela.setMaterials(materijali)
})

update()

/** EVENTS **/

document.addEventListener('mousemove', onDocumentMouseMove)
window.addEventListener('resize', onWindowResize)
