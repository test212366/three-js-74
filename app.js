import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import fragmentShaderPoints from './shaders/fragment copy.glsl'
import vertexShaderPoints from './shaders/vertexParticles.glsl'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'

import {DotScreenShader} from './customShader'

import particleImg from './Purple.png'
import particleImg1 from './Blue.png'

function lerp(a,b,t) {
	return a * (1-t)+ b * t
}


export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true})
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x000000, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
		this.materials = []

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 120,
			 this.width / this.height,
			 0.1,
			 1000
		)
 
	 
	 
		this.time = 0
		// const frusumSize = 1
		// const aspect = 1
		// this.camera = new THREE.OrthographicCamera(frusumSize *aspect / -2, frusumSize * aspect / 2, frusumSize / 2, frusumSize / -2, -1000, 1000)
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.camera.position.set(0, 0, .4) 
		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true
		this.initPost()
		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()
		this.settings()
 
	}
	initPost() {
		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(new RenderPass(this.scene, this.camera))
		this.effect1 = new ShaderPass(DotScreenShader)
		 
		this.composer.addPass(this.effect1)
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 1920/1080
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				resolution: {value: new THREE.Vector4()}
			},
			vertexShader,
			fragmentShader
		})
		
		this.geometry = new THREE.PlaneGeometry(this.width,this.height,1,1)



		this.plane = new THREE.Mesh(this.geometry, this.material)

		this.scene.add(this.plane)

		 

		const data = [
			 particleImg,
			 particleImg1
		]
		data.forEach((texture, i) => {
			console.log(i);
			this.count = i === 0 ? 14000 : 8000
			const pos = new Float32Array(this.count * 3)
	
			for (let i = 0; i < this.count; i++) {
				let angle = Math.random() * 2 * Math.PI
				let r = lerp(0.3, 1.5, Math.random())
	
				let x = r* Math.sin(angle) 
				let y = (Math.random() - 0.5) * 0.1
				let z = r* Math.cos(angle) 
	
				
				pos.set([
					x,y,z
				], i * 3)
				
			}
	
	
			this.geometryPoints = new THREE.BufferGeometry()
			
	
			this.geometryPoints.setAttribute('position', new THREE.Float32BufferAttribute(pos,3))
	
			const materialPoints = new THREE.ShaderMaterial({
				extensions: {
					derivatives: '#extension GL_OES_standard_derivatives : enable'
				},
				side: THREE.DoubleSide,
				uniforms: {
					time: {value: 0},
					texture1: {value: new THREE.TextureLoader().load(texture)},
					resolution: {value: new THREE.Vector4()},
					uAmp: 3,
					
				},
				transparent: true,
				vertexColors: true,
				depthTest: false,
				vertexShader: vertexShaderPoints,
				fragmentShader: fragmentShaderPoints
			})
			this.materials.push(materialPoints)
			
			this.points = new THREE.Points(this.geometryPoints, materialPoints)
			this.points.rotateZ(250)
	 
		 
			this.scene.add(this.points)
		})
	 
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time


		this.materials.forEach(mat => {
			mat.uniforms.time.value = this.time
		 
		})
		this.effect1.uniforms.progress.value = this.settings.progress
		this.effect1.uniforms.time.value = this.time
 
		//this.renderer.setRenderTarget(this.renderTarget)
		// this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
		this.composer.render()
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 