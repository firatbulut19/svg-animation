
var params = {};
var start_time = 0;
var reset = false
var paused = false
var values = {}
var fps = 60

const SVGs = document.getElementsByClassName('svg-container')

const event1 = new Event('click')
event1.targets = [document.getElementById('svg-1-form-1')]

var svg_height = 400;
var ball_radius = 7;

function on_submit(event) {
  event.preventDefault()
  let target_id = ((event.targets == undefined) ? event.target.id : event.targets[0].id)
  let inputs = ((event.targets == undefined) ? event.target.children[2] : event.targets[0].children[2])
  var dict = get_values(inputs)
  let ruler_3 = document.getElementById(target_id).parentElement.children[0].children[1].children[0].children[2]
  setAttributes(ruler_3, {
    x: 80,
    y: 50
  })
  ruler_3.setAttribute('x', parseInt(ruler_3.getAttribute('x')) + 2 * ball_radius * parseInt(dict['divisor']))
  let first_coor = [parseInt(ruler_3.getAttribute('x')) - ball_radius, parseInt(ruler_3.getAttribute('y')) + 269 + dict['divisor'] / 2]
  var svg = inputs.parentElement.parentElement.children[0]
  while (svg.children[1].children[1].children[1]) {
    svg.children[1].children[1].removeChild(svg.children[1].children[1].children[1])
  }
  while (svg.children[1].children[2].children[1]) {
    svg.children[1].children[2].removeChild(svg.children[1].children[2].children[1])
  }
  while (svg.children[1].children[3].children[1]) {
    svg.children[1].children[3].removeChild(svg.children[1].children[3].children[1])
  }
  for (let i = 0; i < parseInt(dict['total'] / dict['divisor']); i++) {
    for (let j = 0; j < dict['divisor']; j++) {
      var new_ball = document.getElementById('balls').children[0].cloneNode()
      setAttributes(new_ball, {
        id: 'ball-' + i * dict['divisor'] + j,
        cx: first_coor[0] - 2 * ball_radius * j,
        cy: first_coor[1] - 2 * ball_radius * i - j / 2,
        r: ball_radius,
        fill: dict['color'],
        'fill-opacity': 0.6
      })
      new_ball.removeAttribute('hidden')
      document.getElementById('balls').appendChild(new_ball)
    }
  }
  for (let i = 0; i < dict['total'] % dict['divisor']; i++) {
    var new_ball = document.getElementById('balls').children[0].cloneNode()
    setAttributes(new_ball, {
      id: 'ball-' + parseInt(dict['total'] / dict['divisor']) * dict['divisor'] + i,
      cx: first_coor[0] - 2 * ball_radius * i,
      cy: first_coor[1] - 2 * ball_radius * parseInt(dict['total'] / dict['divisor']) - i / 2,
      r: ball_radius,
      fill: dict['color'],
      'fill-opacity': 0.6
    })
    new_ball.removeAttribute('hidden')
    document.getElementById('balls').appendChild(new_ball)
  }

  params["ruler"] = new_config(dict)

  let rulers = document.getElementById('ruler').children
  let first_mark = parseInt(rulers[0].getAttribute('y')) + parseInt(rulers[0].getAttribute('height')) - parseInt(rulers[1].getAttribute('height'))
  console.log(first_mark)
  for (let i = 0; i < (first_mark - parseInt(rulers[0].getAttribute('y'))) / (2 * ball_radius); i++) {
    var new_mark = document.getElementById('marks').children[0].cloneNode()
    setAttributes(new_mark, {
      x1: parseInt(rulers[0].getAttribute('x')) + 4 * parseInt(rulers[0].getAttribute('width') / 5),
      y1: first_mark - 2 * ball_radius * i,
      x2: parseInt(rulers[0].getAttribute('x')) + parseInt(rulers[0].getAttribute('width')),
      y2: first_mark - 2 * ball_radius * i,
    })
    new_mark.removeAttribute('hidden')
    document.getElementById('numbers').appendChild(new_mark)

    var new_label = document.getElementById('numbers').children[0].cloneNode()
    setAttributes(new_label, {
      id: 'ruler-1-mark-' + (i + 1),
      x: parseInt(rulers[0].getAttribute('x')) + parseInt(rulers[0].getAttribute('width') / 2),
      y: first_mark - 2 * ball_radius * i + 3,
      style: 'font-size: 60%',
    })
    new_label.innerHTML = i + 1
    document.getElementById('numbers').appendChild(new_label)
  }
  let second_mark = parseInt(rulers[0].getAttribute('x')) + parseInt(rulers[0].getAttribute('width')) + ball_radius

  for (let i = 0; i < parseInt(rulers[2].getAttribute('x') - second_mark) / (2 * ball_radius); i++) {
    var new_mark = document.getElementById('marks').children[0].cloneNode()
    setAttributes(new_mark, {
      x1: second_mark + 2 * ball_radius * i,
      y1: first_mark + ball_radius + i * 0.5,
      x2: second_mark + 2 * ball_radius * i,
      y2: first_mark + ball_radius + i * 0.5 + parseInt(rulers[1].getAttribute('height')) / 5,
    })
    new_mark.removeAttribute('hidden')
    document.getElementById('numbers').appendChild(new_mark)

    var new_label = document.getElementById('numbers').children[0].cloneNode()
    setAttributes(new_label, {
      id: 'ruler-2-mark-' + (parseInt(parseInt(rulers[2].getAttribute('x') - second_mark) / (2 * ball_radius)) + 1 - i),
      x: second_mark + 2 * ball_radius * i - 2,
      y: first_mark + ball_radius + i * 0.5 + parseInt(rulers[1].getAttribute('height')) / 2,
      style: 'font-size: 60%',
    })
    new_label.innerHTML = parseInt(parseInt(rulers[2].getAttribute('x') - second_mark) / (2 * ball_radius)) + 1 - i
    document.getElementById('numbers').appendChild(new_label)
  }
  if (params['ruler']['dividend'] != 0) {
    let dividend_val = [document.getElementById('ruler-1-mark-' + params['ruler']['dividend']).getAttribute('x'), document.getElementById('ruler-1-mark-' + params['ruler']['dividend']).getAttribute('y')]

    var dividend_circ = document.getElementById('balls').children[0].cloneNode()
    setAttributes(dividend_circ, {
      id: 'dividend-circ',
      cx: parseInt(dividend_val[0]) + ball_radius / 2,
      cy: parseInt(dividend_val[1]) - ball_radius / 2,
      r: ball_radius,
      fill: 'red',
      'fill-opacity': 0.5
    })
    dividend_circ.removeAttribute('hidden')
    document.getElementById('balls').appendChild(dividend_circ)

    let divisor_value = [document.getElementById('ruler-2-mark-' + params['ruler']['divisor']).getAttribute('x'), document.getElementById('ruler-2-mark-' + params['ruler']['divisor']).getAttribute('y')]
    var divisor_circ = document.getElementById('balls').children[0].cloneNode()
    setAttributes(divisor_circ, {
      id: 'dividend-circ2',
      cx: parseInt(divisor_value[0]) + ball_radius / 2,
      cy: parseInt(divisor_value[1]) - ball_radius / 2,
      r: ball_radius,
      fill: 'green',
      'fill-opacity': 0.5
    })
    divisor_circ.removeAttribute('hidden')
    document.getElementById('balls').appendChild(divisor_circ)
    
  }
  if (params['ruler']['remainder'] != 0) {

    let remainder_val = [document.getElementById('ruler-2-mark-' + params['ruler']['remainder']).getAttribute('x'), document.getElementById('ruler-2-mark-' + params['ruler']['remainder']).getAttribute('y')]
    var remainder_circ = document.getElementById('balls').children[0].cloneNode()
    setAttributes(remainder_circ, {
      id: 'remainder-circ',
      cx: parseInt(remainder_val[0]) + ball_radius / 2,
      cy: parseInt(remainder_val[1]) - ball_radius / 2,
      r: ball_radius,
      fill: 'yellow',
      'fill-opacity': 0.5
    })
    remainder_circ.removeAttribute('hidden')
    document.getElementById('balls').appendChild(remainder_circ)
  }
  setAttributes(document.getElementById('equation'), {
    x: 80,
    y: 300
  })
  document.getElementById('total-text-eq').innerHTML = params['ruler']['total']
  document.getElementById('plus').innerHTML = '+'
  document.getElementById('equal').innerHTML = '='
  document.getElementById('divides').innerHTML = '/'
  document.getElementById('remainder-text-eq').innerHTML = params['ruler']['remainder']
  document.getElementById('divisor-text-eq').innerHTML = params['ruler']['divisor']
  document.getElementById('dividend-text-eq').innerHTML = params['ruler']['dividend']

}

function get_values(inputs) {
  var dict = {}
  for (let i = 0; i < inputs.children.length; i++) {
    dict[inputs.children[i].name] = (parseInt(inputs.children[i].value) ? parseInt(inputs.children[i].value) : inputs.children[i].value)
  }
  dict["id"] = inputs.id
  return dict
}



function new_config(dict) {
  const new_params = {
    total: dict['total'],
    divisor: dict['divisor'],
    dividend: parseInt(dict['total'] / dict['divisor']),
    remainder: dict['total'] % dict['divisor'],
    color: dict['color'],
  }
  return new_params
}

function move() {

  if (!paused) {
    console.log("here")
    if (reset) {
      clearInterval(values['handler']);
      setup_svg(SVGs[0])
      reset = false
      return
    }

    let ruler_3 = document.getElementById('ruler').children[2]
    ruler_3.setAttribute('y', parseInt(ruler_3.getAttribute('y')) + 1)
    console.log(70 + 2 * ball_radius * (param['dividend'] + 1))
    if (ruler_3.getAttribute('y') == 70 + 2 * ball_radius * (param['dividend'] + 1)) {
      paused = true
    }


  }


}
function timelines(svg) {
  console.log(params)
  let param = params[svg.children[1].children[0].id]
  values['total'] = param['total']
  values['divisor'] = param['divisor']
  values['dividend'] = param['dividend']
  values['remainder'] = param['remainder']
  values['done'] = 0
  values['handler'] = setInterval(move, 1000 / fps)

}

function setAttributes(el, attrs) {
  for (let key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function setup_svg(svg_container) {
  document.getElementById('svg-1-form-1').onsubmit(event1)
  svg_container.children[0].setAttribute("height", svg_height)

}

function setup_svg_container(svg_container) {

  setup_svg(svg_container)

  let form = svg_container.children[1]
  for (let i = 0; i < form.children[2].children.length; i++) {
    form.children[2].children[i].oninput = function () {
      form.children[1].children[i].innerHTML = this.value;
    }
  }
}

for (let i = 0; i < SVGs.length; i++) {
  setup_svg_container(SVGs[i])
}



