import './style.css'

const canvas = document.querySelector('#dragon-canvas')
const context = canvas.getContext('2d')
const depthInput = document.querySelector('#depth-input')
const depthError = document.querySelector('#depth-error')
const maxDepth = 17
const startingTurnInput = document.querySelector('#starting-turn-input')
const zoomOutButton = document.querySelector('#zoom-out-button')
const zoomInButton = document.querySelector('#zoom-in-button')
const lengthOutput = document.querySelector('#length-output')
const drawButton = document.querySelector('#draw-button')
const resetButton = document.querySelector('#reset-button')
const baseLineLength = 5
let zoomPercent = 100
let lineLength = baseLineLength
let dragonCurveInstructions = null
let offsetX = 0
let offsetY = 0
let dragPointerId = null
let lastPointerX
let lastPointerY
let renderFrame = null
let x
let y
let angle

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

function isValidDepth(depth) {
  return Number.isInteger(depth) && depth >= 0 && depth <= maxDepth
}

function draw(regenerate = false) {
  if (regenerate) {
    const depth = depthInput.valueAsNumber
    const valid = isValidDepth(depth)
    depthInput.setAttribute('aria-invalid', String(!valid))
    depthError.hidden = valid
    depthError.textContent = valid
      ? ''
      : `Veuillez saisir une profondeur entière entre 0 et ${maxDepth}.`

    if (!valid) {
      return
    }

    const startingTurn = Number(startingTurnInput.value)
    dragonCurveInstructions = generateDragonCurveInstructions(depth, startingTurn)
    offsetX = 0
    offsetY = 0
  }

  clearCanvas()
  if (dragonCurveInstructions === null) {
    return
  }

  const { width, height } = canvas.getBoundingClientRect()
  x = width / 2 + offsetX
  y = height / 2 + offsetY
  angle = 0

  context.beginPath()
  context.moveTo(x, y)

  dragonCurveInstructions.forEach(instruction => {
    if (instruction === 1) {
      turnRight();
    } else {
      turnLeft();
    }
  })

  context.strokeStyle = 'black'
  context.lineWidth = 2
  context.stroke()
}

// 1 means right, 0 means left.
function generateDragonCurveInstructions(depth, startingTurn) {
  if (!isValidDepth(depth)) {
    throw new RangeError(`Depth must be an integer between 0 and ${maxDepth}.`)
  }

  if (depth === 0) {
    return []
  }

  const previousInstructions = generateDragonCurveInstructions(depth - 1, startingTurn)
  const swappedInstructions = [...previousInstructions]
    .reverse()
    .map(turn => 1 - turn)

  return [...previousInstructions, startingTurn, ...swappedInstructions]
}

function turnRight() {
  angle += Math.PI / 2;
  moveForward();
}

function turnLeft() {
  angle -= Math.PI / 2;
  moveForward();
}

function moveForward() {
  const nextX = x + Math.cos(angle) * lineLength;
  const nextY = y + Math.sin(angle) * lineLength;

  context.lineTo(nextX, nextY)

  x = nextX;
  y = nextY;
}

function resizeCanvas() {
  const { width, height } = canvas.getBoundingClientRect()
  const pixelRatio = window.devicePixelRatio || 1

  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

  draw()
}

drawButton.addEventListener('click', () => draw(true))

resetButton.addEventListener('click', () => {
  dragonCurveInstructions = null
  offsetX = 0
  offsetY = 0
  clearCanvas()
})
function changeZoom(step) {
  zoomPercent = Math.min(400, Math.max(20, zoomPercent + step))
  lineLength = baseLineLength * zoomPercent / 100
  lengthOutput.value = `${zoomPercent}%`
  zoomOutButton.disabled = zoomPercent === 20
  zoomInButton.disabled = zoomPercent === 400
  draw()
}

zoomOutButton.addEventListener('click', () => changeZoom(-10))
zoomInButton.addEventListener('click', () => changeZoom(10))

canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0 || dragPointerId !== null || dragonCurveInstructions === null) {
    return
  }

  dragPointerId = event.pointerId
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  canvas.setPointerCapture(event.pointerId)
  canvas.classList.add('dragging')
})

canvas.addEventListener('pointermove', event => {
  if (event.pointerId !== dragPointerId) {
    return
  }

  offsetX += event.clientX - lastPointerX
  offsetY += event.clientY - lastPointerY
  lastPointerX = event.clientX
  lastPointerY = event.clientY

  if (renderFrame === null) {
    renderFrame = window.requestAnimationFrame(() => {
      renderFrame = null
      draw()
    })
  }
})

function stopDragging(event) {
  if (event.pointerId !== dragPointerId) {
    return
  }

  dragPointerId = null
  canvas.classList.remove('dragging')
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId)
  }
}

canvas.addEventListener('pointerup', stopDragging)
canvas.addEventListener('pointercancel', stopDragging)
canvas.addEventListener('lostpointercapture', stopDragging)
window.addEventListener('resize', resizeCanvas)

resizeCanvas()
draw(true)
