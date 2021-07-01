
var animations = {};
var params = {};
var moving = "";
var start_time = 0;
var draw_vector = false
var collision = false
var terminate = false
var paused = false
var plane = false
var values = {}
var fps = 120
var g = 10
var svg_height = 400;
var ball_radius = 15;

const SVGs = document.getElementsByClassName('svg-container')

const event1 = new Event('click')
event1.targets = [document.getElementById('svg-1-form-1')]


function on_submit(event) {
  event.preventDefault()
  let inputs = ((event.targets == undefined) ? event.target.children[2] : event.targets[0].children[2])
  var dict = get_values(inputs)
  var svg = inputs.parentElement.parentElement.children[0]

  params[svg.children[1].children[0].id] = new_config(dict)

  let cx = svg.children[1].children[0].children[0].getAttribute("cx")
  let cy = svg.children[1].children[0].children[0].getAttribute("cy")
  let new_x1 = parseInt(cx) + ball_radius * Math.cos(dict['angle'] * Math.PI / 180)
  let new_y1 = parseInt(cy) - ball_radius * Math.sin(dict['angle'] * Math.PI / 180)
  let new_x2 = parseInt(cx) + ball_radius * 2 * Math.cos(dict['angle'] * Math.PI / 180)
  let new_y2 = parseInt(cy) - ball_radius * 2 * Math.sin(dict['angle'] * Math.PI / 180)
  setAttributes(svg.children[1].children[0].children[1], { "x1": new_x1, "y1": new_y1, "x2": new_x2, "y2": new_y2 })
  while (svg.children[1].children[3].children[2]) {
    svg.children[1].children[3].removeChild(svg.children[1].children[3].children[2])

  }


}

function get_values(inputs) {
  var dict = {}
  for (let i = 0; i < inputs.children.length - 1; i++) {
    dict[inputs.children[i].name] = inputs.children[i].value
  }
  dict["id"] = inputs.id
  dict[inputs.children[inputs.children.length - 1].name] = inputs.children[inputs.children.length - 1].checked
  return dict
}



function new_config(dict) {
  var distance = parseFloat((dict['distance'] == undefined ? 500 : dict['distance']))
  let vector = [parseFloat(Math.cos((360 - (dict['angle'])) * Math.PI / 180)).toFixed(2), parseFloat(Math.sin((180 - dict['angle']) * Math.PI / 180)).toFixed(2)]
  const new_params = {
    velocity: dict['velocity'],
    vector: vector,
    mass: dict['mass'],
    distance: distance,
    angle: dict['angle'],
    elasticity: dict['elasticity'],
    gravity: dict['gravity'],
    'show-trace': dict['show-trace']
  }
  return new_params
}

function move() {

  if (!paused) {
    let net_a = values['gravity'] / fps
    let a_vector = [0, net_a]
    let v_vector_new = [a_vector[0] + values['vector'][0], a_vector[1] + values['vector'][1]]
    if (v_vector_new[1] * v_vector_new[1] <= 0.01 && values['position'][1] + ball_radius >= values['elem'].parentElement.parentElement.children[2].children[0].getAttribute('y1')) {
      v_vector_new = [v_vector_new[0], 0]
      values['position'][1] = values['elem'].parentElement.parentElement.children[2].children[0].getAttribute('y1') - ball_radius
    }
    values['time'] += 1 / fps;
    values['position'] = [values['position'][0] + v_vector_new[0], values['position'][1] + v_vector_new[1]]
    setAttributes(values['elem'], { "cx": values['position'][0] + v_vector_new[0], "cy": values['position'][1] + v_vector_new[1] })

    values['vector'] = v_vector_new
    let velocity = parseFloat((Math.sqrt(Math.pow(v_vector_new[0], 2) + Math.pow(v_vector_new[1], 2))).toFixed(2))
    setAttributes(values['elem'].parentElement.children[1], {
      "x1": parseFloat(values['position'][0] + ball_radius * values['vector'][0] / velocity),
      "y1": parseFloat(values['position'][1] + ball_radius * values['vector'][1] / velocity),
      "x2": parseFloat(values['position'][0] + (ball_radius / 2) * values['vector'][0] + ball_radius * values['vector'][0] / velocity),
      "y2": parseFloat(values['position'][1] + (ball_radius / 2) * values['vector'][1] + ball_radius * values['vector'][1] / velocity)
    })
    if (values['count'] % (fps / 4) == 0 && values['show-trace']) {
      var new_arrow = document.getElementById('temp-lines').children[0].cloneNode()
      setAttributes(new_arrow, {
        class: 'line',
        style: "stroke:black;stroke-width:2;visible:true",
        'marker-end': "url(#arrow-1)",
        visible: true,
        "x1": parseInt(values['position'][0] + ball_radius * values['vector'][0] / velocity),
        "y1": parseInt(values['position'][1] + ball_radius * values['vector'][1] / velocity),
        "x2": parseInt(values['position'][0] + 2 * (ball_radius / 2) * values['vector'][0] + ball_radius * values['vector'][0] / velocity),
        "y2": parseInt(values['position'][1] + 2 * (ball_radius / 2) * values['vector'][1] + ball_radius * values['vector'][1] / velocity),
        id: 'svg-1-line-dummy-' + parseInt(values['count'] / (fps / 4) + 1)

      })
      document.getElementById('temp-lines').appendChild(new_arrow)
      var new_text = document.getElementById('svg-1-speed-1').cloneNode()
      setAttributes(new_text, {
        'x': values['position'][0] - 3 * ball_radius,
        'y': values['position'][1] - 2 * ball_radius,
        class: 'small',
        hidden: true,
        id: 'svg-1-text-dummy-' + parseInt(values['count'] / (fps / 4) + 1)
      })
      new_text.innerHTML = velocity + "m/s, " + (values['time']).toFixed(2) + 's'
      document.getElementById('temp-lines').appendChild(new_text)
      var new_ball = document.getElementById('svg-1-ball-dummy').cloneNode()

      setAttributes(new_ball, {
        style: 'opacity:0.5',
        cx: values['position'][0],
        cy: values['position'][1],
        r: ball_radius,
        id: 'svg-1-ball-dummy-' + parseInt(values['count'] / (fps / 4) + 1)
      })
      new_ball.addEventListener("mouseover", (event) => {
        document.getElementById('svg-1-text-dummy-' + event.target.id.substring(17)).removeAttribute('hidden')
      })
      new_ball.addEventListener("mouseout", (event) => {
        document.getElementById('svg-1-text-dummy-' + event.target.id.substring(17)).setAttribute('hidden', true)
      })
      document.getElementById('temp-lines').appendChild(new_ball)
    }
    values['count']++

    values['elem'].parentElement.parentElement.children[1].children[0].innerHTML = 'velocity: '+velocity + "m/s"
    values['elem'].parentElement.parentElement.children[1].children[1].innerHTML = "vector: (" + v_vector_new[0].toFixed(2) + ", " + v_vector_new[1].toFixed(2) + ")"
    values['elem'].parentElement.parentElement.children[1].children[2].innerHTML = 'time: '+(values['time']).toFixed(2) + 's'
    values['elem'].parentElement.parentElement.children[1].children[3].innerHTML = 'height: '+(parseFloat(values['elem'].parentElement.parentElement.children[2].children[0].getAttribute('y1')- values['position'][1] - ball_radius).toFixed(2)) + 'm'

    if (values['position'][0] > values['elem'].parentElement.parentElement.parentElement.clientWidth || terminate) {
      clearInterval(values['handler']);
      setup_svg(values['elem'].parentElement.parentElement.parentElement.parentElement)
      document.getElementById('svg-1-form-1').onsubmit(event1)
      values = {}
      terminate = false
      plane = false
      return
    }
    if (values['position'][1] + ball_radius >= values['elem'].parentElement.parentElement.children[2].children[0].getAttribute('y1') && !plane && values['vector'][1] > 0) {
      var new_text = document.getElementById('svg-1-speed-1').cloneNode()
      values['vector'][1] = -values['vector'][1] * parseFloat(values['elasticity'])
      setAttributes(new_text, {
        'x': values['position'][0],
        'y': values['position'][1] + 2 * ball_radius,
        class: 'small'
      })
      new_text.innerHTML = (values['position'][0] - values['start'][0]).toFixed(2) + "m, " + (values['time']).toFixed(2) + 's'
      document.getElementById('temp-lines').appendChild(new_text)
    }
  }


}
function timelines(svg) {
  let param = params[svg.children[1].children[0].id]

  values['elem'] = document.getElementById("svg-1-ball-1")
  values['start'] = [parseFloat(svg.children[1].children[0].children[0].getAttribute('cx')), parseFloat(svg.children[1].children[0].children[0].getAttribute('cy'))]
  values['distance'] = (param['distance'] == undefined ? 300 : parseFloat((param['distance']).toFixed(2)))
  values['unit-vector'] = [parseFloat(Math.cos((param['angle']) * Math.PI / 180)).toFixed(2), parseFloat(Math.sin((360 - param['angle']) * Math.PI / 180)).toFixed(2)]
  values['finish'] = [values['start'][0] + values['unit-vector'][0] * values['distance'], values['start'][1] + values['unit-vector'][1] * values['distance']]
  values['position'] = values['start']
  values['angle'] = param['angle']
  values['vector'] = [values['unit-vector'][0] * parseFloat(param['velocity']), values['unit-vector'][1] * parseFloat(param['velocity'])];
  values['time'] = (values['time'] == undefined ? 0 : values['time'])
  values['mass'] = param['mass']
  values['count'] = 0
  values['elasticity'] = param['elasticity']
  values['gravity'] = param['gravity']
  values['handler'] = setInterval(move, 1000 / fps)
  values['show-trace'] = param['show-trace']

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
  setAttributes(svg_container.children[0].children[1].children[0].children[0], { "cx": ball_radius * 7, "cy": ball_radius * 139 / 12, "r": ball_radius });
  setAttributes(svg_container.children[0].children[1].children[0], { "style": "" })
  setAttributes(svg_container.children[0].children[1].children[1].children[0], { "x": 20, "y": 20 });
  setAttributes(svg_container.children[0].children[1].children[1].children[1], { "x": 20, "y": 45 });
  setAttributes(svg_container.children[0].children[1].children[1].children[2], { "x": 20, "y": 70 });
  setAttributes(svg_container.children[0].children[1].children[1].children[3], { "x": 20, "y": 95 });

  setAttributes(svg_container.children[0].children[1].children[2].children[0], {
    "x1": 0,
    "y1": svg_height * 4 / 5,
    "x2": svg_container.children[0].clientWidth,
    "y2": svg_height * 4 / 5
  });

  setAttributes(svg_container.children[0].children[2], { "x": svg_container.children[0].clientWidth / 2 - 20, "y": 20 });

  params[svg_container.children[0].children[1].children[0].id] = new_config(get_values(svg_container.children[1].children[1]))
  set_disabled(svg_container, [false, true, true, true])
}

function setup_svg_container(svg_container) {
  setup_svg(svg_container)

  document.getElementById('svg-1-form-1').onsubmit(event1)
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

  document.getElementById('svg-1-ball-1').addEventListener("mousedown", (event) => {
    moving = event.target.id
  })
  for (const index of [1]) {
    let form = svg_container.children[index]
    for (let i = 0; i < form.children[2].children.length - 1; i++) {
      form.children[2].children[i].oninput = function () {
        form.children[1].children[i].innerHTML = this.value;
      }
    }
    for (let i = 0; i < form.children[1].children.length - 1; i++) {
      form.children[1].children[i].oninput = function () {
        form.children[2].children[i].innerHTML = this.value;
      }
    }
  }
  svg_container.children[2].children[0].addEventListener("mousedown", () => {
    document.getElementById('svg-1-form-1').onsubmit(event1)
    start_time = new Date().getTime()

    timelines(svg_container.children[0], 1)
    set_disabled(svg_container, [true, false, false, true])
  });
  svg_container.children[2].children[1].addEventListener("mousedown", () => {
    paused = true
    set_disabled(svg_container, [true, true, false, false])
  });
  svg_container.children[2].children[2].addEventListener("mousedown", () => {
    paused = false
    terminate = true
    plane = true
    setup_svg(svg_container)
    document.getElementById('svg-1-form-1').onsubmit(event1)
    set_disabled(svg_container, [false, true, true, true])

  });
  svg_container.children[2].children[3].addEventListener("mousedown", () => {
    paused = false
    set_disabled(svg_container, [true, false, false, true])
  });
}

for (let i = 0; i < SVGs.length; i++) {
  setup_svg_container(SVGs[i])
}



