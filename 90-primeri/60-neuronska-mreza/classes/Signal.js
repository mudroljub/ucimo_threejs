import * as THREE from '/node_modules/three108/build/three.module.js'

export function Signal(particlePool, minSpeed, maxSpeed) {
  this.minSpeed = minSpeed
  this.maxSpeed = maxSpeed
  this.speed = THREE.Math.randFloat(this.minSpeed, this.maxSpeed)
  this.alive = true
  this.t = null
  this.startingPoint = null
  this.axon = null
  this.particle = particlePool.getParticle()
  THREE.Vector3.call(this)
}

Signal.prototype = Object.create(THREE.Vector3.prototype)

Signal.prototype.setConnection = function(Connection) {
  this.startingPoint = Connection.startingPoint
  this.axon = Connection.axon
  if (this.startingPoint === 'A') this.t = 0
  else if (this.startingPoint === 'B') this.t = 1
}

Signal.prototype.travel = function() {
  if (this.startingPoint === 'A') {
    this.t += this.speed
    if (this.t >= 1) {
      this.t = 1
      this.alive = false
      this.axon.neuronB.recievedSignal = true
      this.axon.neuronB.prevReleaseAxon = this.axon
    }
  } else if (this.startingPoint === 'B') {
    this.t -= this.speed
    if (this.t <= 0) {
      this.t = 0
      this.alive = false
      this.axon.neuronA.recievedSignal = true
      this.axon.neuronA.prevReleaseAxon = this.axon
    }
  }
  const pos = this.axon.getPoint(this.t)
  this.particle.set(pos.x, pos.y, pos.z)
}
