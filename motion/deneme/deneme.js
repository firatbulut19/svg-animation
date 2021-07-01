function easeInQuad(x, t, b, c, d) {

    return c / 2 * t * t + b;

}

function move() {
  //position += increment;
  time += 1 / fps;
  position = easeInQuad(time * 100 / duration, time, start, finish, duration);

  if (position >= finish) {
    clearInterval(handler);
    box.style.left = finish + "px";
    return;
  }
  box.style.left = position + "px";
  console.log("here")
}

var box = document.getElementById("box"),
    fps = 60,
    duration = 2, // seconds
    start = 0, // pixel
    finish = window.innerWidth - box.clientWidth,
    distance = finish - start,
    increment = distance / (duration * fps),
    position = start,
    time = 0,
    handler = setInterval(move, 1000 / fps);
