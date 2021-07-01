
var animations = {};
var params = {};
var moving = "";
var start_time = 0;
var draw_vector = false
var collision = false

const SVGs = document.getElementsByClassName('svg-container')

var svg_height = 300;
var ball_radius = 15;

function on_submit(event) {
  event.preventDefault()
  let target = ((event.targets == undefined) ? event.target.id : event.targets[0].id)
  let inputs = ((event.targets == undefined) ? event.target.children[2] : event.targets[0].children[2])
  var dict = get_values(inputs)
  var svg = inputs.parentElement.parentElement.children[0]
  var new_params = new_config(dict)
  params[svg.children[target.substring(11)].children[0].id] = new_params
  let cx = svg.children[target.substring(11)].children[0].children[0].getAttribute("cx")
  let cy = svg.children[target.substring(11)].children[0].children[0].getAttribute("cy")
  let new_x1 = parseInt(cx) + ball_radius * Math.cos(dict['angle'] * Math.PI / 180)
  let new_y1 = parseInt(cy) - ball_radius * Math.sin(dict['angle'] * Math.PI / 180)
  let new_x2 = parseInt(cx) + ball_radius * 2 * Math.cos(dict['angle'] * Math.PI / 180)
  let new_y2 = parseInt(cy) - ball_radius * 2 * Math.sin(dict['angle'] * Math.PI / 180)
  setAttributes(svg.children[target.substring(11)].children[0].children[1], { "x1": new_x1, "y1": new_y1, "x2": new_x2, "y2": new_y2 })
}

function get_values(inputs) {
  var dict = {}
  for (let i = 0; i < inputs.children.length; i++) {
    dict[inputs.children[i].name] = inputs.children[i].value
  }
  dict["id"] = inputs.id
  return dict
}

function new_config(dict) {
  var distance = 10000
  var duration = 100000 / dict['velocity']
  let vector = [parseFloat(Math.cos((dict['angle']) * Math.PI / 180)).toFixed(2),
  parseFloat(Math.sin((360 - dict['angle']) * Math.PI / 180)).toFixed(2)]
  const new_params = {
    velocity: dict['velocity'],
    vector: vector,
    mass: dict['mass'],
    angle: dict['angle'],
    duration: duration,
    easing: 'linear',
    keyframes: [
      { translateX: distance * vector[0], translateY: distance * vector[1] },
    ]
  }
  return new_params
}

function stop_anim() {
  for (const anim of Object.keys(animations)) {
    animations[anim].pause()
  }
}

function createNewAnim(svg, balls) {
  for (const ball of balls) {
    timelines(svg, ball)
  }
}

function timelines(svg, ball_count) {
  let param = params[svg.children[1].children[0].id]
  param.targets = svg.children[ball_count].children[0]
  param.update = function (anim) {
    document.getElementById(svg.children[1].children[1].children[0].id).innerHTML = params[svg.children[ball_count].children[0].id].velocity + 'm/s'
    document.getElementById(svg.children[1].children[1].children[1].id).innerHTML = params[svg.children[ball_count].children[0].id].angle + ' \''
    document.getElementById(svg.children[1].children[1].children[2].id).innerHTML = '[' + params[svg.children[ball_count].children[0].id].vector + ']'
    document.getElementById('svg-1-time').innerHTML = ((new Date().getTime() - start_time) / 1000).toFixed(2)
    let b1x = parseFloat(svg.children[1].children[0].children[0].getAttribute('cx')) + parseFloat(animations[svg.children[1].children[0].id].animations[0]['currentValue'])
    let b1y = parseFloat(svg.children[1].children[0].children[0].getAttribute('cy')) + parseFloat(animations[svg.children[1].children[0].id].animations[1]['currentValue'])
    if (b1x > svg.clientWidth + ball_radius || b1x < -ball_radius || b1y > svg_height + ball_radius || b1y < -ball_radius) {
      console.log("hereerere")
      anim.restart()
      anim.pause()
      animations[svg.children[1].children[0].id].restart()
      animations[svg.children[1].children[0].id].pause()
      setup_svg(svg.parentElement)
    }
  }

  const timeline1 = anime(param)
  animations[svg.children[1].children[0].getAttribute('id')] = timeline1
}

function set_disabled(svg_container, list) {
  for (let i = 0; i < list.length; i++) {
    svg_container.children[2].children[i].disabled = list[i]
  }
}

function setAttributes(el, attrs) {
  for (let key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function setup_svg(svg_container) {
  svg_container.children[0].setAttribute("height", svg_height)
  setAttributes(svg_container.children[0].children[1].children[0].children[0], { "cx": 20 + ball_radius * 5 / 3, "cy": svg_height * 7 / 12, "r": ball_radius });
  setAttributes(svg_container.children[0].children[1].children[0], { "style": "" })
  setAttributes(svg_container.children[0].children[1].children[0].children[1], {
    "x1": 20 + ball_radius * 8 / 3,
    "y1": svg_height * 7 / 12,
    "x2": 20 + ball_radius * 11 / 3,
    "y2": svg_height * 7 / 12
  })
  setAttributes(svg_container.children[0].children[1].children[1].children[0], { "x": 20, "y": 20 });
  setAttributes(svg_container.children[0].children[1].children[1].children[1], { "x": 20, "y": 35 });
  setAttributes(svg_container.children[0].children[1].children[1].children[2], { "x": 20, "y": 50 });

  setAttributes(svg_container.children[0].children[2], { "x": svg_container.children[0].clientWidth / 2 - 20, "y": 20 });
  
  params[svg_container.children[0].children[1].children[0].id] = new_config(get_values(svg_container.children[1].children[1]))
  set_disabled(svg_container, [false, true, true, true])
}

function setup_svg_container(svg_container) {
  setup_svg(svg_container)
  svg_container.children[0].addEventListener("mouseup", (event) => {
    if (moving != "") {
      let ball_to_move = document.getElementById(moving)
      let old_x = ball_to_move.getAttribute('cx')
      let old_y = ball_to_move.getAttribute('cy')
      let diff = [parseFloat(event.offsetX - old_x), parseFloat(event.offsetY - old_y)]
      let arrow_to_move = document.getElementById(ball_to_move.parentElement.children[1].id)
      setAttributes(arrow_to_move, {
        'x1': parseFloat(arrow_to_move.getAttribute('x1')) + diff[0],
        'x2': parseFloat(arrow_to_move.getAttribute('x2')) + diff[0],
        'y1': parseFloat(arrow_to_move.getAttribute('y1')) + diff[1],
        'y2': parseFloat(arrow_to_move.getAttribute('y2')) + diff[1]
      })
      ball_to_move.setAttribute("cx", event.offsetX)
      ball_to_move.setAttribute("cy", event.offsetY)
      moving = ""
    }
  })
  for (const ball of svg_container.children[0].children) {
    ball.addEventListener("mousedown", (event) => {
      moving = event.target.id
    })
  }
  for (const index of [1]) {
    let form = svg_container.children[index]
    for (let i = 0; i < form.children[2].children.length; i++) {
      form.children[2].children[i].oninput = function () {
        form.children[1].children[i].innerHTML = this.value;
      }
    }
    for (let i = 0; i < form.children[1].children.length; i++) {
      form.children[1].children[i].oninput = function () {
        form.children[2].children[i].innerHTML = this.value;
      }
    }
  }
  svg_container.children[2].children[0].addEventListener("mousedown", () => {
    const event = new Event('click')
    event.targets = [document.getElementById('svg-1-form-1')]

    document.getElementById('svg-1-form-1').onsubmit(event)
    start_time = new Date().getTime()

    timelines(svg_container.children[0], 1)
    set_disabled(svg_container, [true, false, false, true])
  });
  svg_container.children[2].children[1].addEventListener("mousedown", () => {
    for (const elem of Object.keys(animations)) {
      let anim = animations[elem]
      anim.pause()
    }
    set_disabled(svg_container, [true, true, false, false])
  });
  svg_container.children[2].children[2].addEventListener("mousedown", () => {
    for (const elem of Object.keys(animations)) {
      let anim = animations[elem]
      anim.restart()
      anim.pause()
      delete anim
      animations[elem] = null
    }
    setup_svg(svg_container)
    set_disabled(svg_container, [false, true, true, true])

  });
  svg_container.children[2].children[3].addEventListener("mousedown", () => {
    for (const elem of Object.keys(animations)) {
      let anim = animations[elem]
      anim.play()
    }
    set_disabled(svg_container, [true, false, false, true])
  });
}

for (let i = 0; i < SVGs.length; i++) {
  setup_svg_container(SVGs[i])
}




