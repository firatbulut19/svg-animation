
var animations = {};
var params = {};
var moving = "";
var start_time = 0;
var draw_vector = false
var collision = false
var centers = [[0, 0], [200, 200]]
var showTrace = false
var svg_height = 300;
var ball_radius = 15;

const event1 = new Event('click')
event1.targets = [document.getElementById('svg-1-form-1')]
const event2 = new Event('click')
event2.targets = [document.getElementById('svg-1-form-2')]

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
  console.log(dict)
  let new_x1 = parseInt(cx) + ball_radius * Math.cos(dict['angle'] * Math.PI / 180)
  let new_y1 = parseInt(cy) - ball_radius * Math.sin(dict['angle'] * Math.PI / 180)
  let new_x2 = parseInt(cx) + ball_radius * 2 * Math.cos(dict['angle'] * Math.PI / 180)
  let new_y2 = parseInt(cy) - ball_radius * 2 * Math.sin(dict['angle'] * Math.PI / 180)
  setAttributes(svg.children[target.substring(11)].children[0].children[1], { "x1": new_x1, "y1": new_y1, "x2": new_x2, "y2": new_y2 })
  for (let i = 1; i < 3; i++) {
    while (svg.children[i].children[2].children[2]) {
      svg.children[i].children[2].removeChild(svg.children[i].children[2].children[2])
    }
  }
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
  showTrace = document.getElementById('show-trace').checked
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
  let param = params[svg.children[ball_count].children[0].id]
  param.targets = svg.children[ball_count].children[0]
  var count = 0
  param.update = function (anim) {
    document.getElementById(svg.children[ball_count].children[1].children[0].id).innerHTML = 'Velocity: '+params[svg.children[ball_count].children[0].id].velocity + 'm/s'
    document.getElementById(svg.children[ball_count].children[1].children[1].id).innerHTML = 'Angle: '+params[svg.children[ball_count].children[0].id].angle + ' \''
    document.getElementById(svg.children[ball_count].children[1].children[2].id).innerHTML = 'Vector[' + params[svg.children[ball_count].children[0].id].vector + ']'

    document.getElementById('svg-1-time').innerHTML = 'Time: '+((new Date().getTime() - start_time) / 1000).toFixed(2)

    if (ball_count == 2) {
      let b1x = parseFloat(svg.children[1].children[0].children[0].getAttribute('cx')) + parseFloat(animations[svg.children[1].children[0].id].animations[0]['currentValue'])
      let b1y = parseFloat(svg.children[1].children[0].children[0].getAttribute('cy')) + parseFloat(animations[svg.children[1].children[0].id].animations[1]['currentValue'])
      let b2x = parseFloat(svg.children[2].children[0].children[0].getAttribute('cx')) + parseFloat(animations[svg.children[2].children[0].id].animations[0]['currentValue'])
      let b2y = parseFloat(svg.children[2].children[0].children[0].getAttribute('cy')) + parseFloat(animations[svg.children[2].children[0].id].animations[1]['currentValue'])

      if ((b1x > svg.clientWidth + ball_radius || b1x < -ball_radius || b1y > svg_height + ball_radius || b1y < -ball_radius) && (b2x > svg.clientWidth + ball_radius || b2x < -ball_radius || b2y > svg_height + ball_radius || b2y < -ball_radius)) {
        anim.restart()
        anim.pause()
        document.getElementById('svg-1-form-1').onsubmit(event1)
        document.getElementById('svg-1-form-2').onsubmit(event2)
        animations[svg.children[1].children[0].id].restart()
        animations[svg.children[1].children[0].id].pause()
        setup_svg(svg.parentElement)
      }

      if (Math.sqrt(Math.pow((b1x - b2x), 2) + Math.pow(b1y - b2y, 2)) < 2 * ball_radius) {
        let info1 = [parseInt(params[svg.children[1].children[0].id].mass), parseInt(params[svg.children[1].children[0].id].velocity), parseInt(params[svg.children[1].children[0].id].angle)]
        let info2 = [parseInt(params[svg.children[2].children[0].id].mass), parseInt(params[svg.children[2].children[0].id].velocity), parseInt(params[svg.children[2].children[0].id].angle)]

        animations[svg.children[1].children[0].id].pause()
        animations[svg.children[2].children[0].id].pause()

        let v1x = (info1[1] * Math.cos(info1[2] * Math.PI / 180)).toFixed(2)
        let v1y = (info1[1] * Math.sin((360 - info1[2]) * Math.PI / 180)).toFixed(2)

        let v2x = (info2[1] * Math.cos(info2[2] * Math.PI / 180)).toFixed(2)
        let v2y = (info2[1] * Math.sin((360 - info2[2]) * Math.PI / 180)).toFixed(2)

        let v1i = [v1x, v1y]
        let v2i = [v2x, v2y]

        let dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
        let n = [b2x - b1x, b2y - b1y]
        let n_mag = Math.sqrt(Math.pow(b2x - b1x, 2) + Math.pow(b2y - b1y, 2))
        let un = [n[0] / n_mag, n[1] / n_mag]
        let ut = [-un[1], un[0]]

        let v1n = dot(v1i, un)
        let v1t = dot(v1i, ut)
        let v2n = dot(v2i, un)
        let v2t = dot(v2i, ut)

        let v1tf = v1t
        let v2tf = v2t

        let v1nf = (v1n * (info1[0] - info2[0]) + 2 * info2[0] * v2n) / (info1[0] + info2[0])
        let v2nf = (v2n * (info2[0] - info1[0]) + 2 * info1[0] * v1n) / (info1[0] + info2[0])

        let v1nf_vector = [v1nf * un[0], v1nf * un[1]]
        let v1tf_vector = [v1tf * ut[0], v1tf * ut[1]]
        let v2nf_vector = [v2nf * un[0], v2nf * un[1]]
        let v2tf_vector = [v2tf * ut[0], v2tf * ut[1]]

        let v1f_vector = [parseFloat((v1nf_vector[0] + v1tf_vector[0]).toFixed(2)), parseFloat((v1nf_vector[1] + v1tf_vector[1]).toFixed(2))]
        let v2f_vector = [parseFloat((v2nf_vector[0] + v2tf_vector[0]).toFixed(2)), parseFloat((v2nf_vector[1] + v2tf_vector[1]).toFixed(2))]



        let v1f = parseFloat((Math.sqrt(Math.pow(v1f_vector[0], 2) + Math.pow(v1f_vector[1], 2))).toFixed(2))
        let v2f = parseFloat((Math.sqrt(Math.pow(v2f_vector[0], 2) + Math.pow(v2f_vector[1], 2))).toFixed(2))

        let angle1 = parseFloat((Math.atan(-v1f_vector[1] / v1f_vector[0]) * 180 / Math.PI + ((0 < v1f_vector[0]) ? 0 : 180)).toFixed(2))
        let angle2 = parseFloat((Math.atan(-v2f_vector[1] / v2f_vector[0]) * 180 / Math.PI + ((0 < v2f_vector[0]) ? 0 : 180)).toFixed(2))


        setAttributes(svg.children[1].children[0].children[1], {
          "x1": b1x + ball_radius * parseFloat((Math.cos(angle1 * Math.PI / 180)).toFixed(2)),
          "x2": b1x + 2 * ball_radius * parseFloat((Math.cos(angle1 * Math.PI / 180)).toFixed(2)),
          "y1": b1y + ball_radius * parseFloat((Math.sin((360 - angle1) * Math.PI / 180)).toFixed(2)),
          "y2": b1y + 2 * ball_radius * parseFloat((Math.sin((360 - angle1) * Math.PI / 180)).toFixed(2))
        })

        setAttributes(svg.children[2].children[0].children[1], {
          "x1": b2x + ball_radius * parseFloat((Math.cos(angle2 * Math.PI / 180)).toFixed(2)),
          "x2": b2x + 2 * ball_radius * parseFloat((Math.cos(angle2 * Math.PI / 180)).toFixed(2)),
          "y1": b2y + ball_radius * parseFloat((Math.sin((360 - angle2) * Math.PI / 180)).toFixed(2)),
          "y2": b2y + 2 * ball_radius * parseFloat((Math.sin((360 - angle2) * Math.PI / 180)).toFixed(2))
        })

        setAttributes(svg.children[1].children[0].children[0], { "cx": b1x, "cy": b1y })
        setAttributes(svg.children[2].children[0].children[0], { "cx": b2x, "cy": b2y })

        setAttributes(svg.children[1].children[0], { "style": "" })
        setAttributes(svg.children[2].children[0], { "style": "" })

        if (showTrace) {
          
          var new_arrow = document.getElementById('temp-lines').children[0].cloneNode()
          setAttributes(new_arrow, {
            class: 'line',
            style: "stroke:black;stroke-width:2;visible:true",
            'marker-end': "url(#arrow-1)",
            visible: true,
            "x1": parseInt(b1x + ball_radius * v1f_vector[0] / v1f),
            "y1": parseInt(b1y + ball_radius * v1f_vector[1] / v1f),
            "x2": parseInt(b1x + 2 * (ball_radius / 2) * v1f_vector[0] + ball_radius * v1f_vector[0] / v1f),
            "y2": parseInt(b1y + 2 * (ball_radius / 2) * v1f_vector[1] + ball_radius * v1f_vector[1] / v1f),
            id: 'svg-1-line-dummy-1'

          })
          document.getElementById('temp-lines').appendChild(new_arrow)
          var new_text = document.getElementById('svg-1-speed-1').cloneNode()
          setAttributes(new_text, {
            'x': b1x - 3 * ball_radius,
            'y': b1y - 2 * ball_radius,
            class: 'small',
            hidden: true,
            id: 'svg-1-text-dummy-1'
          })
          new_text.innerHTML = v1f + "m/s, " + ((new Date().getTime() - start_time) / 1000).toFixed(2) + 's'
          document.getElementById('temp-lines').appendChild(new_text)
          var new_ball = document.getElementById('svg-1-ball-dummy').cloneNode()

          setAttributes(new_ball, {
            style: 'opacity:0.5',
            cx: b1x,
            cy: b1y,
            r: ball_radius,
            id: 'svg-1-ball-dummy-1'
          })
          new_ball.addEventListener("mouseover", (event) => {
            document.getElementById('svg-1-text-dummy-' + event.target.id.substring(17)).removeAttribute('hidden')
          })
          new_ball.addEventListener("mouseout", (event) => {
            document.getElementById('svg-1-text-dummy-' + event.target.id.substring(17)).setAttribute('hidden', true)
          })
          document.getElementById('temp-lines').appendChild(new_ball)


          var new_arrow = document.getElementById('temp-lines').children[0].cloneNode()
          setAttributes(new_arrow, {
            class: 'line',
            style: "stroke:black;stroke-width:2;visible:true",
            'marker-end': "url(#arrow-1)",
            visible: true,
            "x1": parseInt(b2x + ball_radius * v2f_vector[0] / v2f),
            "y1": parseInt(b2y + ball_radius * v2f_vector[1] / v2f),
            "x2": parseInt(b2x + 2 * (ball_radius / 2) * v2f_vector[0] + ball_radius * v2f_vector[0] / v2f),
            "y2": parseInt(b2y + 2 * (ball_radius / 2) * v2f_vector[1] + ball_radius * v2f_vector[1] / v2f),
            id: 'svg-1-line-dummy-2'

          })
          document.getElementById('temp-lines').appendChild(new_arrow)


          var new_text = document.getElementById('svg-1-speed-1').cloneNode()
          setAttributes(new_text, {
            'x': b2x - 3 * ball_radius,
            'y': b2y - 2 * ball_radius,
            class: 'small',
            hidden: true,
            id: 'svg-1-text-dummy-2'
          })
          new_text.innerHTML = v2f + "m/s, " + ((new Date().getTime() - start_time) / 1000).toFixed(2) + 's'
          document.getElementById('temp-lines').appendChild(new_text)
          var new_ball = document.getElementById('svg-1-ball-dummy').cloneNode()

          setAttributes(new_ball, {
            style: 'opacity:0.5;fill:red',
            cx: b2x,
            cy: b2y,
            r: ball_radius,
            id: 'svg-1-ball-dummy-2'
          })
          new_ball.addEventListener("mouseover", (event) => {
            document.getElementById('svg-1-text-dummy-2').removeAttribute('hidden')
          })
          new_ball.addEventListener("mouseout", (event) => {
            document.getElementById('svg-1-text-dummy-2').setAttribute('hidden', true)
          })
          document.getElementById('temp-lines').appendChild(new_ball)
        }


        params[svg.children[1].children[0].id] = new_config({ mass: info1[0], velocity: v1f, angle: angle1, id: svg.children[1].children[0].children[0].id })
        params[svg.children[2].children[0].id] = new_config({ mass: info2[0], velocity: v2f, angle: angle2, id: svg.children[2].children[0].children[0].id })

        animations[svg.children[1].children[0].id] = null
        animations[svg.children[2].children[0].id] = null


        createNewAnim(svg, [1, 2])


      }
    }
  }

  const timeline1 = anime(param)
  animations[svg.children[ball_count].children[0].getAttribute('id')] = timeline1
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
  if (svg_container.children[0].children.length > 3) {
    setAttributes(svg_container.children[0].children[2].children[0], { "style": "" })
    setAttributes(svg_container.children[0].children[2].children[0].children[0], {
      "cx": svg_container.children[0].clientWidth - ball_radius * 2,
      "cy": svg_height * 7 / 12,
      "r": ball_radius
    });
    setAttributes(svg_container.children[0].children[2].children[0].children[1], {
      "x1": svg_container.children[0].clientWidth - ball_radius * 3,
      "y1": svg_height * 7 / 12,
      "x2": svg_container.children[0].clientWidth - ball_radius * 4,
      "y2": svg_height * 7 / 12
    })
    setAttributes(svg_container.children[0].children[2].children[1].children[0], { "x": svg_container.children[0].clientWidth - 100, "y": 20 });
    setAttributes(svg_container.children[0].children[2].children[1].children[1], { "x": svg_container.children[0].clientWidth - 100, "y": 35 });
    setAttributes(svg_container.children[0].children[2].children[1].children[2], { "x": svg_container.children[0].clientWidth - 100, "y": 50 });

    setAttributes(svg_container.children[0].children[3], { "x": svg_container.children[0].clientWidth / 2 - 20, "y": 20 });

    params[svg_container.children[0].children[2].children[0].id] = new_config(get_values(svg_container.children[3].children[1]))
  } else {
    setAttributes(svg_container.children[0].children[4], { "x": svg_container.children[0].clientWidth / 2 - 20, "y": 20 });
  }
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
  for (const index of [1, 3]) {
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


    document.getElementById('svg-1-form-1').onsubmit(event1)
    document.getElementById('svg-1-form-2').onsubmit(event2)
    start_time = new Date().getTime()

    timelines(svg_container.children[0], 1)
    timelines(svg_container.children[0], 2)
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
      document.getElementById('svg-1-form-1').onsubmit(event1)
      document.getElementById('svg-1-form-2').onsubmit(event2)
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

const SVG = document.getElementsByClassName('svg-container')
setup_svg_container(SVG[0])


