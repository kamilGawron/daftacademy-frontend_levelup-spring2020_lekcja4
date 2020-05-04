import { visibleHeightAtZDepth, visibleWidthAtZDepth, lerp } from "../utils.js"
import { nextSlide } from "../main.js"
import { prevSlide } from "../main.js"

const raycaster = new THREE.Raycaster()
const objLoader = new THREE.OBJLoader()
let arrowBox = null;
let arrowBoxes = [];
let arrowBoxRotation = 0
let arrowBoxesRotation = [0, 0]

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

document.body.append(renderer.domElement)

objLoader.load(
  'models/cube.obj',
  ({ children }) => {
    const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2
    const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2

    addCube(children[0], nextSlide, screenBorderRight - 1.2, screenBottom + 1)
    addCube(children[0], prevSlide, screenBorderRight - 2.2, screenBottom + 1)

    animate()
  }
)

const addCube = (object, callbackFn, x, y) => {
  const cubeMesh = object.clone()

  cubeMesh.scale.setScalar(.3)
  cubeMesh.rotation.set(THREE.Math.degToRad(90), 0, 0)

  const boundingBox = new THREE.Mesh(
    new THREE.BoxGeometry(.7, .7, .7),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  )

  boundingBox.position.x = x
  boundingBox.position.y = y
  boundingBox.position.z = -10

  boundingBox.add(cubeMesh)

  boundingBox.callbackFn = callbackFn

  arrowBox = boundingBox
  arrowBoxes.push(boundingBox)
  scene.add(boundingBox)
}

const animate = () => {
  arrowBoxes.forEach((element, index) => {
    arrowBoxesRotation[index] = lerp(arrowBoxesRotation[index], 0, .03)
    element.rotation.set(THREE.Math.degToRad(arrowBoxesRotation[index]), 0, 0)
  })


  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

export const handleThreeAnimation = (index) => {
  index == 0 ? arrowBoxesRotation[0] = 360 : arrowBoxesRotation[1] = -360;
}

window.addEventListener('click', () => {
  const mousePosition = new THREE.Vector2()
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mousePosition, camera)

  const interesctedObjects = raycaster.intersectObjects(scene.children)
  interesctedObjects.length && interesctedObjects[0].object.callbackFn()
})