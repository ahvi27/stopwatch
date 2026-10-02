const timeDisplay = document.getElementById('time');
const fractionDisplay = document.getElementById('fraction');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const lapButton = document.getElementById('lap');
const statusDisplay = document.getElementById('status');
const lapList = document.getElementById('lap-list');

// Measure actual elapsed time instead of counting animation frames.
let running = false;
let elapsed = 0;
let startedAt = 0;
let animationId = null;
let previousLap = 0;
let lapCount = 0;

function currentTime() {
  return elapsed + (running ? performance.now() - startedAt : 0);
}

function format(milliseconds) {
  const centiseconds = Math.floor(milliseconds / 10);
  const pad = number => String(number).padStart(2, '0');
  const hours = pad(Math.floor(centiseconds / 360000));
  const minutes = pad(Math.floor(centiseconds / 6000) % 60);
  const seconds = pad(Math.floor(centiseconds / 100) % 60);
  return { main: `${hours}:${minutes}:${seconds}`, fraction: `.${pad(centiseconds % 100)}` };
}

function draw() {
  const value = format(currentTime());
  timeDisplay.textContent = value.main;
  fractionDisplay.textContent = value.fraction;
}

function tick() {
  draw();
  if (running) animationId = requestAnimationFrame(tick);
}

startButton.addEventListener('click', () => {
  if (running) {
    elapsed = currentTime();
    running = false;
    cancelAnimationFrame(animationId);
    draw();
    startButton.textContent = 'Resume';
    statusDisplay.textContent = 'Paused — take your time';
  } else {
    startedAt = performance.now();
    running = true;
    startButton.textContent = 'Pause';
    statusDisplay.textContent = 'In motion';
    tick();
  }
  resetButton.disabled = false;
  lapButton.disabled = !running;
});

resetButton.addEventListener('click', () => {
  running = false;
  cancelAnimationFrame(animationId);
  elapsed = 0;
  previousLap = 0;
  lapCount = 0;
  draw();
  startButton.textContent = 'Start';
  statusDisplay.textContent = 'Ready when you are';
  resetButton.disabled = true;
  lapButton.disabled = true;
  lapList.replaceChildren();
  document.getElementById('lap-count').textContent = '0 laps';
  document.getElementById('empty').hidden = false;
});

lapButton.addEventListener('click', () => {
  if (!running) return;
  const total = currentTime();
  const split = format(total - previousLap);
  const cumulative = format(total);
  previousLap = total;
  lapCount += 1;
  const row = document.createElement('li');
  const label = document.createElement('span');
  label.textContent = `Lap ${String(lapCount).padStart(2, '0')}`;
  const values = document.createElement('div');
  values.textContent = split.main + split.fraction;
  const detail = document.createElement('small');
  detail.textContent = `Total ${cumulative.main}${cumulative.fraction}`;
  values.append(detail);
  row.append(label, values);
  lapList.prepend(row);
  document.getElementById('lap-count').textContent = `${lapCount} ${lapCount === 1 ? 'lap' : 'laps'}`;
  document.getElementById('empty').hidden = true;
});
