/**
 * Loads a Wavefront .mtl file specifying materials
 *
 * @author angelxuanchang
 */

THREE.MTLLoader = function(baseUrl, options, crossOrigin) {

  this.baseUrl = baseUrl
  this.options = options
  this.crossOrigin = crossOrigin

}

THREE.MTLLoader.prototype = {

  constructor: THREE.MTLLoader,

  load(url, onLoad, onProgress, onError) {

    const scope = this

    const loader = new THREE.XHRLoader()
    loader.setCrossOrigin(this.crossOrigin)
    loader.load(url, text => {

      onLoad(scope.parse(text))

    })

  },

  /**
	 * Parses loaded MTL file
	 * @param text - Content of MTL file
	 * @return {THREE.MTLLoader.MaterialCreator}
	 */
  parse(text) {

    const lines = text.split('\n')
    let info = {}
    const delimiter_pattern = /\s+/
    const materialsInfo = {}

    for (let i = 0; i < lines.length; i ++) {

      let line = lines[ i ]
      line = line.trim()

      if (line.length === 0 || line.charAt(0) === '#')

      // Blank line or comment ignore
        continue

      const pos = line.indexOf(' ')

      let key = (pos >= 0) ? line.substring(0, pos) : line
      key = key.toLowerCase()

      let value = (pos >= 0) ? line.substring(pos + 1) : ''
      value = value.trim()

      if (key === 'newmtl') {

        // New material

        info = { name: value }
        materialsInfo[ value ] = info

      } else if (info)

        if (key === 'ka' || key === 'kd' || key === 'ks') {

          const ss = value.split(delimiter_pattern, 3)
          info[ key ] = [ parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2]) ]

        } else {

          info[ key ] = value

        }

    }

    const materialCreator = new THREE.MTLLoader.MaterialCreator(this.baseUrl, this.options)
    materialCreator.setMaterials(materialsInfo)
    return materialCreator

  }

}

/**
 * Create a new THREE-MTLLoader.MaterialCreator
 * @param baseUrl - Url relative to which textures are loaded
 * @param options - Set of options on how to construct the materials
 *                  side: Which side to apply the material
 *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
 *                  wrap: What type of wrapping to apply for textures
 *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
 *                                Default: false, assumed to be already normalized
 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
 *                                  Default: false
 *                  invertTransparency: If transparency need to be inverted (inversion is needed if d = 0 is fully opaque)
 *                                      Default: false (d = 1 is fully opaque)
 * @constructor
 */

THREE.MTLLoader.MaterialCreator = function(baseUrl, options) {

  this.baseUrl = baseUrl
  this.options = options
  this.materialsInfo = {}
  this.materials = {}
  this.materialsArray = []
  this.nameLookup = {}

  this.side = (this.options && this.options.side) ? this.options.side : THREE.FrontSide
  this.wrap = (this.options && this.options.wrap) ? this.options.wrap : THREE.RepeatWrapping

}

THREE.MTLLoader.MaterialCreator.prototype = {

  constructor: THREE.MTLLoader.MaterialCreator,

  setMaterials(materialsInfo) {

    this.materialsInfo = this.convert(materialsInfo)
    this.materials = {}
    this.materialsArray = []
    this.nameLookup = {}

  },

  convert(materialsInfo) {

    if (!this.options) return materialsInfo

    const converted = {}

    for (const mn in materialsInfo) {

      // Convert materials info into normalized form based on options

      const mat = materialsInfo[ mn ]

      const covmat = {}

      converted[ mn ] = covmat

      for (const prop in mat) {

        let save = true
        let value = mat[ prop ]
        const lprop = prop.toLowerCase()

        switch (lprop) {

          case 'kd':
          case 'ka':
          case 'ks':

            // Diffuse color (color under white light) using RGB values

            if (this.options && this.options.normalizeRGB)

              value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ]

            if (this.options && this.options.ignoreZeroRGBs)

              if (value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 1 ] === 0) {

                // ignore

                save = false

              }

            break

          case 'd':

            // According to MTL format (http://paulbourke.net/dataformats/mtl/):
            //   d is dissolve for current material
            //   factor of 1.0 is fully opaque, a factor of 0 is fully dissolved (completely transparent)

            if (this.options && this.options.invertTransparency)

              value = 1 - value

            break

          default:

            break
        }

        if (save)

          covmat[ lprop ] = value

      }

    }

    return converted

  },

  preload() {

    for (const mn in this.materialsInfo)

      this.create(mn)

  },

  getIndex(materialName) {

    return this.nameLookup[ materialName ]

  },

  getAsArray() {

    let index = 0

    for (const mn in this.materialsInfo) {

      this.materialsArray[ index ] = this.create(mn)
      this.nameLookup[ mn ] = index
      index ++

    }

    return this.materialsArray

  },

  create(materialName) {

    if (this.materials[ materialName ] === undefined)

      this.createMaterial_(materialName)

    return this.materials[ materialName ]

  },

  createMaterial_(materialName) {

    // Create material

    const mat = this.materialsInfo[ materialName ]
    const params = {

      name: materialName,
      side: this.side

    }

    for (const prop in mat) {

      const value = mat[ prop ]

      switch (prop.toLowerCase()) {

        // Ns is material specular exponent

        case 'kd':

          // Diffuse color (color under white light) using RGB values

          params.diffuse = new THREE.Color().fromArray(value)

          break

        case 'ka':

          // Ambient color (color under shadow) using RGB values

          params.ambient = new THREE.Color().fromArray(value)

          break

        case 'ks':

          // Specular color (color when light is reflected from shiny surface) using RGB values
          params.specular = new THREE.Color().fromArray(value)

          break

        case 'map_kd':

          // Diffuse texture map

          params.map = this.loadTexture(this.baseUrl + value)
          params.map.wrapS = this.wrap
          params.map.wrapT = this.wrap

          break

        case 'ns':

          // The specular exponent (defines the focus of the specular highlight)
          // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

          params.shininess = value

          break

        case 'd':

          // According to MTL format (http://paulbourke.net/dataformats/mtl/):
          //   d is dissolve for current material
          //   factor of 1.0 is fully opaque, a factor of 0 is fully dissolved (completely transparent)

          if (value < 1) {

            params.transparent = true
            params.opacity = value

          }

          break

        default:
          break

      }

    }

    if (params.diffuse) {

      if (!params.ambient) params.ambient = params.diffuse
      params.color = params.diffuse

    }

    this.materials[ materialName ] = new THREE.MeshPhongMaterial(params)
    return this.materials[ materialName ]

  },

  loadTexture(url, mapping, onLoad, onError) {

    const isCompressed = /\.dds$/i.test(url)

    if (isCompressed)

      var texture = THREE.ImageUtils.loadCompressedTexture(url, mapping, onLoad, onError)

		 else {

      const image = new Image()
      var texture = new THREE.Texture(image, mapping)

      const loader = new THREE.ImageLoader()
      loader.crossOrigin = this.crossOrigin
      loader.load(url, image => {

        texture.image = THREE.MTLLoader.ensurePowerOfTwo_(image)
        texture.needsUpdate = true

        if (onLoad) onLoad(texture)

      })

    }

    return texture

  }

}

THREE.MTLLoader.ensurePowerOfTwo_ = function(image) {

  if (! THREE.Math.isPowerOfTwo(image.width) || ! THREE.Math.isPowerOfTwo(image.height)) {

    const canvas = document.createElement('canvas')
    canvas.width = THREE.MTLLoader.nextHighestPowerOfTwo_(image.width)
    canvas.height = THREE.MTLLoader.nextHighestPowerOfTwo_(image.height)

    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height)
    return canvas

  }

  return image

}

THREE.MTLLoader.nextHighestPowerOfTwo_ = function(x) {

  --x

  for (let i = 1; i < 32; i <<= 1)

    x |= x >> i

  return x + 1

}

THREE.EventDispatcher.prototype.apply(THREE.MTLLoader.prototype)
