const slides = Array.from(document.querySelectorAll('.slide'));
const total = slides.length;
let current = 0;
let xp = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const xpValue = $('#xpValue');
const xpPill = $('.xp-pill');
const toastEl = $('#toast');
let toastTimer;
let saveTimer;
let savedTimer;

function toast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function addXP(amount, message) {
  if (!amount) return;
  xp += amount;
  if (xpValue) xpValue.textContent = xp;
  if (xpPill) {
    xpPill.classList.remove('bump');
    void xpPill.offsetWidth;
    xpPill.classList.add('bump');
    setTimeout(() => xpPill.classList.remove('bump'), 450);
  }
  if (message) toast(message);
}

function confetti(count = 70) {
  if (reducedMotion) return;
  const layer = $('#confettiLayer');
  if (!layer) return;
  const colors = ['#58cc02', '#89e219', '#1cb0f6', '#ffc800', '#ff9600', '#ce82ff', '#ff4b4b'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = 6 + Math.random() * 8 + 'px';
    piece.style.height = 10 + Math.random() * 10 + 'px';
    piece.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4600);
  }
}

const progressFill = $('#progressFill');
const progressLabel = $('#progressLabel');
const navCounter = $('#navCounter');
const unitLabel = $('#unitLabel');
const prevBtn = $('#prevBtn');
const nextBtn = $('#nextBtn');
const navDots = $('#navDots');
const outline = $('#outline');
const outlineButtons = [];

slides.forEach((slide, i) => {
  if (navDots) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'nav-dot';
    dot.setAttribute('aria-label', 'الشريحة ' + (i + 1) + ': ' + (slide.dataset.title || ''));
    dot.addEventListener('click', () => goTo(i));
    navDots.appendChild(dot);
  }

  const item = document.createElement('button');
  item.type = 'button';
  item.innerHTML = '<i>' + (i + 1) + '</i><span>' + (slide.dataset.title || 'شريحة') + '</span>';
  item.addEventListener('click', () => {
    goTo(i);
    if (window.innerWidth < 900) closeEditor();
  });
  if (outline) outline.appendChild(item);
  outlineButtons.push(item);
});

const dotEls = $$('.nav-dot');

function goTo(index, options = {}) {
  index = Math.max(0, Math.min(total - 1, index));
  current = index;
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  const pct = ((index + 1) / total) * 100;
  if (progressFill) progressFill.style.width = pct + '%';
  if (progressLabel) progressLabel.textContent = (index + 1) + ' / ' + total;
  if (navCounter) navCounter.textContent = (index + 1) + ' / ' + total;
  if (unitLabel) unitLabel.textContent = slides[index].dataset.unit || 'الصف السابع';
  dotEls.forEach((dot, i) => dot.classList.toggle('is-on', i === index));
  outlineButtons.forEach((btn, i) => btn.classList.toggle('is-on', i === index));
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === total - 1;
  if (!options.keepScroll) slides[index].scrollTop = 0;
  document.dispatchEvent(new CustomEvent('it7:slide', { detail: { index, key: slides[index].dataset.key || '' } }));
}

function goToKey(key) {
  const index = slides.findIndex((slide) => slide.dataset.key === key);
  if (index >= 0) goTo(index);
  return index;
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-goto]');
  if (!trigger) return;
  const target = trigger.dataset.goto;
  event.preventDefault();
  if (/^\d+$/.test(target)) goTo(parseInt(target, 10));
  else goToKey(target);
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    const request = document.documentElement.requestFullscreen;
    if (request) request.call(document.documentElement).catch(() => toast('تعذر تفعيل ملء الشاشة'));
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}
$('#fullscreenBtn').addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const typing = target && (target.matches('input, textarea, select') || target.isContentEditable);
  if (event.key === 'Escape') {
    if (editorOpen) closeEditor();
    return;
  }
  if (typing || document.body.classList.contains('editing') || editorOpen) return;
  if (event.key === 'ArrowLeft' || event.key === 'PageDown') {
    event.preventDefault();
    goTo(current + 1);
  } else if (event.key === 'ArrowRight' || event.key === 'PageUp') {
    event.preventDefault();
    goTo(current - 1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    goTo(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    goTo(total - 1);
  } else if (event.key === 'f' || event.key === 'F') {
    toggleFullscreen();
  } else if (event.key === 'e' || event.key === 'E') {
    openEditor();
  }
});

const EDITOR_KEY = 'it7_content_v1';
let edits = {};
try {
  edits = JSON.parse(localStorage.getItem(EDITOR_KEY) || '{}') || {};
} catch (error) {
  edits = {};
}

function applyEdits() {
  $$('[data-edit]').forEach((el) => {
    const key = el.dataset.edit;
    if (typeof edits[key] === 'string') el.innerHTML = edits[key];
  });
}
applyEdits();

function collectEdits() {
  const result = {};
  $$('[data-edit]').forEach((el) => {
    result[el.dataset.edit] = el.innerHTML;
  });
  return result;
}

const saveStatus = $('#saveStatus');
function setSaveStatus(message, saved) {
  if (!saveStatus) return;
  saveStatus.textContent = message;
  saveStatus.classList.toggle('saved', !!saved);
  clearTimeout(savedTimer);
  if (saved) {
    savedTimer = setTimeout(() => {
      saveStatus.textContent = 'التغييرات تُحفظ تلقائيًا في هذا المتصفح.';
      saveStatus.classList.remove('saved');
    }, 1600);
  }
}

function persistEdits(showStatus) {
  edits = collectEdits();
  try {
    localStorage.setItem(EDITOR_KEY, JSON.stringify(edits));
    if (showStatus) setSaveStatus('تم الحفظ ✓', true);
  } catch (error) {
    if (showStatus) setSaveStatus('تعذر الحفظ في هذا المتصفح — استخدم تصدير المحتوى.', false);
  }
}

const editor = $('#editor');
const scrim = $('#scrim');
let editorOpen = false;

function openEditor() {
  editorOpen = true;
  editor.classList.add('open');
  editor.setAttribute('aria-hidden', 'false');
  scrim.classList.add('show');
}
function closeEditor() {
  editorOpen = false;
  editor.classList.remove('open');
  editor.setAttribute('aria-hidden', 'true');
  scrim.classList.remove('show');
}
$('#editorBtn').addEventListener('click', () => (editorOpen ? closeEditor() : openEditor()));
$('#editorClose').addEventListener('click', closeEditor);
scrim.addEventListener('click', closeEditor);

function setEditMode(enabled) {
  document.body.classList.toggle('editing', enabled);
  const toggle = $('#editToggle');
  toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
  $$('[data-edit]').forEach((el) => {
    if (enabled) {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    } else {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    }
  });
  if (!enabled) persistEdits(true);
  else setSaveStatus('وضع التحرير مفعّل: اضغط أي نص وعدّله.', false);
}
$('#editToggle').addEventListener('click', () => {
  setEditMode($('#editToggle').getAttribute('aria-checked') !== 'true');
});

document.addEventListener('input', (event) => {
  const target = event.target.closest('[data-edit]');
  if (!target || !document.body.classList.contains('editing')) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persistEdits(true), 450);
});
document.addEventListener('blur', (event) => {
  if (event.target.matches && event.target.matches('[data-edit]')) persistEdits(true);
}, true);

function downloadFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

$('#exportBtn').addEventListener('click', () => {
  persistEdits(false);
  const data = { version: 1, savedAt: new Date().toISOString(), edits: collectEdits() };
  downloadFile('it7-content-backup.json', JSON.stringify(data, null, 2));
  toast('تم تصدير المحتوى');
});

$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const incoming = parsed && parsed.edits ? parsed.edits : parsed;
      if (!incoming || typeof incoming !== 'object') throw new Error('bad');
      const clean = {};
      Object.keys(incoming).forEach((key) => {
        if (typeof incoming[key] === 'string') clean[key] = incoming[key];
      });
      localStorage.setItem(EDITOR_KEY, JSON.stringify(clean));
      toast('تم استيراد المحتوى… إعادة التحميل');
      setTimeout(() => location.reload(), 700);
    } catch (error) {
      toast('تعذر قراءة ملف المحتوى');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
});

$('#resetBtn').addEventListener('click', () => {
  if (!window.confirm('هل تريد استعادة المحتوى الأصلي؟ ستُحذف كل التعديلات المحفوظة.')) return;
  try {
    localStorage.removeItem(EDITOR_KEY);
  } catch (error) {}
  location.reload();
});

const typeData = {
  laptop: { name: 'الحاسوب المحمول' },
  desktop: { name: 'الحاسوب الثابت' },
  server: { name: 'الحاسوب الخادم' },
  super: { name: 'الحواسب الضخمة' }
};

const scenarios = [
  {
    text: 'تحتاج شركة إلى جهاز واحد يخدم موظفيها العشرين في الوقت نفسه، ويحفظ الملفات المشتركة بينهم.',
    answer: 'server',
    explain: 'الخادم يخدم عدة مستخدمين في الوقت نفسه ويحفظ الملفات المشتركة.'
  },
  {
    text: 'يحتاج طالب إلى جهاز خفيف يحمله معه بين المنزل والمدرسة، ويمكنه العمل عليه دون كهرباء لفترة.',
    answer: 'laptop',
    explain: 'الحاسوب المحمول صغير وخفيف ويعمل ببطارية.'
  },
  {
    text: 'تحتاج مديرية الأرصاد إلى جهاز شديد القدرة يحسب ملايين القراءات بسرعة هائلة لمعرفة حالة الطقس.',
    answer: 'super',
    explain: 'الحواسب الضخمة تُستخدم للحسابات والمحاكاة المعقدة بسرعة كبيرة.'
  },
  {
    text: 'تريد عائلة جهازًا ثابتًا في المنزل مع شاشة كبيرة، وتريد لاحقًا ترقية بعض قطعه.',
    answer: 'desktop',
    explain: 'الحاسوب الثابت يناسب المنزل والمكتب ويمكن ترقية مكوناته.'
  }
];

const missionText = $('#missionText');
const missionChoices = $('#missionChoices');
const missionFeedback = $('#missionFeedback');
let currentScenario = -1;

function newScenario() {
  let index = Math.floor(Math.random() * scenarios.length);
  if (scenarios.length > 1 && index === currentScenario) index = (index + 1) % scenarios.length;
  currentScenario = index;
  const scenario = scenarios[index];
  missionText.textContent = scenario.text;
  missionChoices.innerHTML = Object.keys(typeData).map((key) =>
    '<button type="button" data-answer="' + key + '">' + typeData[key].name + '</button>'
  ).join('');
  missionFeedback.className = 'feedback';
  missionFeedback.textContent = '';
}

missionChoices.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-answer]');
  if (!button || button.disabled) return;
  const scenario = scenarios[currentScenario];
  const chosen = button.dataset.answer;
  const buttons = $$('button', missionChoices);
  buttons.forEach((item) => {
    item.disabled = true;
    if (item.dataset.answer === scenario.answer) item.classList.add('correct');
  });
  if (chosen === scenario.answer) {
    missionFeedback.className = 'feedback pop good';
    missionFeedback.textContent = 'إجابة صحيحة! ' + scenario.explain;
    addXP(5, '+5 XP');
  } else {
    button.classList.add('wrong');
    missionFeedback.className = 'feedback pop bad';
    missionFeedback.textContent = 'ليست الإجابة المناسبة. ' + scenario.explain;
  }
});

$('#missionNext').addEventListener('click', newScenario);

const compData = {
  motherboard: { name: 'اللوحة الأم', en: 'Motherboard', icon: 'board', color: '#58cc02', desc: 'القطعة الأساسية التي تُركَّب عليها جميع المكوّنات، وهي التي تربط بينها.' },
  cpu: { name: 'المعالج', en: 'CPU', icon: 'cpu', color: '#1cb0f6', desc: 'عقل الحاسوب الذي ينفّذ العمليات الحسابية والمنطقية وأوامر التحكم.' },
  ram: { name: 'الذاكرة المؤقتة', en: 'RAM', icon: 'ram', color: '#ffc800', desc: 'تحفظ البرامج المفتوحة حاليًا، وتفقد محتواها عند انقطاع التيار الكهربائي.' },
  rom: { name: 'الذاكرة الدائمة', en: 'ROM', icon: 'rom', color: '#ce82ff', desc: 'تحتوي معلومات بدء التشغيل، وهي قابلة للقراءة فقط وتحتفظ بمحتوياتها بعد الإيقاف.' },
  hdd: { name: 'القرص الصلب', en: 'Hard Disk', icon: 'disk', color: '#58cc02', desc: 'يخزّن الملفات والبرامج والبيانات، ويحتفظ بمحتوياته بعد إيقاف التشغيل.' },
  gpu: { name: 'بطاقة الشاشة', en: 'Graphics Card', icon: 'gpu', color: '#ff9600', desc: 'تعالج الرسومات وتحدّد دقة الصورة المعروضة على الشاشة.' },
  sound: { name: 'بطاقة الصوت', en: 'Sound Card', icon: 'sound', color: '#ff4b4b', desc: 'تعالج الصوت وتشغّله عبر السماعات.' },
  network: { name: 'بطاقة الشبكة', en: 'Network Card', icon: 'network', color: '#1cb0f6', desc: 'تربط الحاسوب بالشبكة والإنترنت.' },
  fan: { name: 'مروحة التبريد', en: 'Cooling Fan', icon: 'fan', color: '#8a969b', desc: 'تبرّد المعالج لمنع ارتفاع حرارته.' },
  io: { name: 'أجهزة الإدخال والإخراج', en: 'Input / Output', icon: 'io', color: '#58cc02', desc: 'تُدخل البيانات إلى الحاسوب وتُخرج النتائج منه.' }
};

function selectComp(slide, key) {
  const data = compData[key];
  if (!data) return;
  const detail = $('.p-comp-detail', slide);
  if (!detail) return;
  $$('.hotspot', slide).forEach((spot) => spot.classList.toggle('is-on', spot.dataset.comp === key));
  const icon = $('.p-comp-ico', detail);
  const use = icon.querySelector('use');
  use.setAttribute('href', '#i-' + data.icon);
  icon.style.color = data.color;
  icon.style.background = 'color-mix(in srgb, ' + data.color + ' 13%, #fff)';
  $('.p-comp-en', detail).textContent = data.en;
  $('.p-comp-name', detail).textContent = data.name;
  $('.p-comp-desc', detail).textContent = data.desc;
}

$$('.p-comp-slide').forEach((slide) => {
  const spots = $$('.hotspot', slide);
  spots.forEach((spot) => {
    spot.addEventListener('click', () => {
      if (document.body.classList.contains('editing')) return;
      selectComp(slide, spot.dataset.comp);
    });
  });
  if (spots.length) selectComp(slide, spots[0].dataset.comp);
});

const challengeBoard = $('.p-board-challenge');
const challengeBtn = $('#challengeBtn');
const challengeProgress = $('#challengeProgress');
const challengePrompt = $('#challengePrompt');
const challengeFeedback = $('#challengeFeedback');
const challenges = [
  { prompt: 'أين تُنفَّذ العمليات الحسابية والمنطقية؟', answer: 'cpu' },
  { prompt: 'أين تُركَّب جميع المكوّنات وتترابط؟', answer: 'motherboard' },
  { prompt: 'أين تُحفظ البرامج المفتوحة وتفقد محتواها بانقطاع الكهرباء؟', answer: 'ram' },
  { prompt: 'أين تُخزَّن ملفاتك وصورك بشكل دائم؟', answer: 'hdd' },
  { prompt: 'أي قطعة تربط الحاسوب بالشبكة والإنترنت؟', answer: 'network' }
];
let challengeMode = false;
let challengeStep = 0;
let challengeHits = 0;

function renderChallenge() {
  if (challengeStep >= challenges.length) {
    challengeMode = false;
    challengeBoard.classList.remove('challenge-mode');
    challengeProgress.textContent = 'مكتمل';
    challengePrompt.textContent = 'ممتاز! أجبت ' + challengeHits + ' من ' + challenges.length;
    challengeFeedback.className = 'feedback pop good';
    challengeFeedback.textContent = 'أصبحت تعرف وظائف المكونات!';
    challengeBtn.textContent = 'إعادة التحدي';
    addXP(6, 'أتقنت مكونات الحاسوب!');
    confetti(80);
    return;
  }
  challengeProgress.textContent = (challengeStep + 1) + ' / ' + challenges.length;
  challengePrompt.textContent = challenges[challengeStep].prompt;
  challengeFeedback.className = 'feedback';
  challengeFeedback.textContent = '';
}

function startChallenge() {
  challengeMode = true;
  challengeStep = 0;
  challengeHits = 0;
  challengeBoard.classList.add('challenge-mode');
  challengeBtn.textContent = 'إنهاء التحدي';
  renderChallenge();
}

function stopChallenge() {
  challengeMode = false;
  challengeBoard.classList.remove('challenge-mode');
  challengeProgress.textContent = '1 / 5';
  challengePrompt.textContent = 'اضغط «ابدأ التحدي» ثم اختر القطعة الصحيحة.';
  challengeFeedback.className = 'feedback';
  challengeFeedback.textContent = '';
  challengeBtn.textContent = 'ابدأ التحدي';
}

challengeBtn.addEventListener('click', () => {
  if (!challengeMode) startChallenge();
  else stopChallenge();
});

if (challengeBoard) {
  $$('.hotspot', challengeBoard).forEach((spot) => {
    spot.addEventListener('click', () => {
      if (!challengeMode || document.body.classList.contains('editing')) return;
      const answer = challenges[challengeStep].answer;
      if (spot.dataset.comp === answer) {
        challengeHits++;
        challengeStep++;
        addXP(4);
        spot.classList.add('correct');
        setTimeout(() => spot.classList.remove('correct'), 750);
        challengeFeedback.className = 'feedback pop good';
        challengeFeedback.textContent = 'إجابة صحيحة!';
        if (challengeStep >= challenges.length) renderChallenge();
        else setTimeout(renderChallenge, 650);
      } else {
        spot.classList.add('wrong');
        setTimeout(() => spot.classList.remove('wrong'), 500);
        challengeFeedback.className = 'feedback pop bad';
        challengeFeedback.textContent = 'ليست هذه القطعة… حاول مرة أخرى.';
      }
    });
  });
}

newScenario();

window.IT7 = {
  addXP,
  toast,
  confetti,
  goTo,
  goToKey,
  get current() { return current; },
  get currentKey() { return slides[current] ? slides[current].dataset.key : ''; },
  get xp() { return xp; },
  total
};

function slideFromHash() {
  const match = window.location.hash.match(/^#s(\d+)$/);
  if (!match) return 0;
  const index = Number(match[1]);
  return index >= 0 && index < total ? index : 0;
}

window.addEventListener('hashchange', () => goTo(slideFromHash()));
goTo(slideFromHash());
