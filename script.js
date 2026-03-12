const tracks = [
  {
    title: "Show Me Love (with Tyla)",
    artist: "WizTheMc, Tyla , bees & honey",
    src: "show me love ft tyla.mp3",
    cover: "Show Me Love (with Tyla) cover.jpg",
  },
  {
    title: "Me Gustas Tu",
    artist: "Manu Chao",
    src: "Manu Chao - Me Gustas Tu (SPOTISAVER).mp3",
    cover: "me gustas tu cover.jpg",
  },
  {
    title: "THE GREATEST",
    artist: "Billie Eilish",
    src: "Billie Eilish - THE GREATEST (SPOTISAVER).mp3",
    cover: "THE GREATEST cover.jpg",
  }
];

let currentIndex = 0;
let isDragging = false;

const audio = new Audio();
const playPauseBtn = document.getElementById('play-pause');
const progressContainer = document.querySelector('.progress-container');
const progressBar = document.querySelector('.progress');
const currentTimeElem = document.getElementById('current-time');
const durationElem = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

function loadTrack(index, autoplay = false) {
  const track = tracks[index];
  document.getElementById('track-title').textContent = track.title;
  document.querySelector('.track-artist').textContent = track.artist;
  document.querySelector('.cover-container img').src = track.cover;
  currentTimeElem.textContent = '0:00';
  durationElem.textContent = '0:00';
  progressBar.style.width = '0%';
  audio.src = track.src;
  audio.load();

  if (autoplay) {
    audio.play().then(() => {
      playPauseBtn.textContent = '⏸️';
    }).catch(() => {
      playPauseBtn.textContent = '▶️';
    });
  } else {
    playPauseBtn.textContent = '▶️';
  }
}

// ── Playback controls ──────────────────────────────────────────
playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = '⏸️';
  } else {
    audio.pause();
    playPauseBtn.textContent = '▶️';
  }
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex, true);
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex, true);
});

audio.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex, true);
});

// ── Time & progress updates ────────────────────────────────────
audio.addEventListener('loadedmetadata', () => {
  durationElem.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (!isDragging) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = (isNaN(percent) ? 0 : percent) + '%';
    currentTimeElem.textContent = formatTime(audio.currentTime);
  }
});

// ── Progress bar — click to seek ───────────────────────────────
progressContainer.addEventListener('click', (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percent = clickX / rect.width;
  audio.currentTime = percent * audio.duration;
  progressBar.style.width = (percent * 100) + '%';
  currentTimeElem.textContent = formatTime(audio.currentTime);
});

// ── Progress bar — drag to seek ────────────────────────────────
progressContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  seekTo(e);

  const onMouseMove = (e) => seekTo(e);
  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

// touch support for mobile
progressContainer.addEventListener('touchstart', (e) => {
  isDragging = true;
  seekTo(e.touches[0]);

  const onTouchMove = (e) => seekTo(e.touches[0]);
  const onTouchEnd = () => {
    isDragging = false;
    progressContainer.removeEventListener('touchmove', onTouchMove);
    progressContainer.removeEventListener('touchend', onTouchEnd);
  };

  progressContainer.addEventListener('touchmove', onTouchMove);
  progressContainer.addEventListener('touchend', onTouchEnd);
});

function seekTo(e) {
  const rect = progressContainer.getBoundingClientRect();
  let clickX = e.clientX - rect.left;
  clickX = Math.max(0, Math.min(clickX, rect.width)); // clamp
  const percent = clickX / rect.width;
  audio.currentTime = percent * audio.duration;
  progressBar.style.width = (percent * 100) + '%';
  currentTimeElem.textContent = formatTime(audio.currentTime);
}

// ── Volume ─────────────────────────────────────────────────────
audio.volume = 0.5;
volumeSlider.value = 0.5;
volumeSlider.disabled = false;

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

// ── Autoplay on load ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTrack(currentIndex);
  setTimeout(() => {
    audio.play().then(() => {
      playPauseBtn.textContent = '⏸️';
    }).catch(() => {
      playPauseBtn.textContent = '▶️';
    });
  }, 300);
});

// ── Helpers ────────────────────────────────────────────────────
function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// ── Quiz ──────────────────────────────────────────
const quizAnswers  = { q1: 'sports', q2: 'summer', q3: 'night' };
const quizSelected = {};

function pick(btn, qid) {
  document.querySelectorAll('#' + qid + ' .opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  quizSelected[qid] = btn.dataset.val;
}

function checkQuiz() {
  let score = 0;
  const total = Object.keys(quizAnswers).length;

  Object.keys(quizAnswers).forEach(qid => {
    document.querySelectorAll('#' + qid + ' .opt').forEach(b => {
      b.disabled = true;
      b.classList.remove('correct', 'wrong');
      if (b.dataset.val === quizAnswers[qid])         b.classList.add('correct');
      else if (b.classList.contains('selected'))      b.classList.add('wrong');
    });
    if (quizSelected[qid] === quizAnswers[qid]) score++;
  });

  const msgs = [
    { title: "Stranger alert 👀",    body: "You don't know Verena yet! She's into sports, loves summer, and stays up way too late." },
    { title: "Getting there 🌷",     body: "One right! Check the green ones to learn the rest about her." },
    { title: "Pretty close 💕",      body: "Two out of three! You know Verena well — just missed one sneaky one." },
    { title: "You know Verena! 🌸",  body: "Perfect score! Sports lover, summer fan, certified night owl — you really know her." }
  ];

  document.getElementById('result-score').textContent = score + '/' + total;
  document.getElementById('result-title').textContent = msgs[score].title;
  document.getElementById('result-body').textContent  = msgs[score].body;

  const card = document.getElementById('result');
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function retryQuiz() {
  Object.keys(quizAnswers).forEach(qid => {
    document.querySelectorAll('#' + qid + ' .opt').forEach(b => {
      b.disabled = false;
      b.classList.remove('selected', 'correct', 'wrong');
    });
    delete quizSelected[qid];
  });
  document.getElementById('result').style.display = 'none';
}