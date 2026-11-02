(function () {
  const { addXP, confetti, goTo } = window.IT7;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const routeData = {
    internet: {
      title: 'عبر الشبكة والإنترنت',
      icon: 'globe',
      examples: ['البريد الإلكتروني', 'الروابط الخبيثة', 'التحميلات المجهولة', 'شبكات التواصل'],
      tip: 'لا تفتح الروابط المجهولة حتى لو جاءت من صديق.'
    },
    media: {
      title: 'عبر وسائط التخزين',
      icon: 'usb',
      examples: ['الفلاش ميموري', 'الأقراص الليزرية', 'الأقراص الصلبة الخارجية'],
      tip: 'افحص أي وسيط تخزين قبل فتح الملفات الموجودة عليه.'
    },
    vuln: {
      title: 'عبر الثغرات الأمنية',
      icon: 'warning',
      examples: ['أنظمة غير محدّثة', 'برامج قديمة', 'ثغرات في التطبيقات'],
      tip: 'حدّث نظام التشغيل وبرامجك باستمرار.'
    },
    social: {
      title: 'عبر الهندسة الاجتماعية',
      icon: 'mask',
      examples: ['إقناع المستخدم بفتح ملف', 'إدخال بيانات بنفسه', 'رسائل تنتحل صفة جهة موثوقة'],
      tip: 'لا تشارك كلمات المرور أو البيانات الشخصية مع أحد.'
    }
  };

  const routeNodes = $$('.route-node');
  const routeLines = $$('.route-line');
  const routeIconUse = $('#routeIcon use');
  const routeTitle = $('#routeTitle');
  const routeExamples = $('#routeExamples');
  const routeTip = $('#routeTip span');
  const visitedRoutes = new Set(['internet']);

  function activateRoute(key) {
    const data = routeData[key];
    if (!data) return;
    routeNodes.forEach((node) => node.classList.toggle('active', node.dataset.route === key));
    routeLines.forEach((line) => line.classList.toggle('active', line.dataset.route === key));
    routeIconUse.setAttribute('href', '#i-' + data.icon);
    routeTitle.textContent = data.title;
    routeExamples.innerHTML = data.examples.map((item) => '<li>' + item + '</li>').join('');
    routeTip.textContent = data.tip;
    if (!visitedRoutes.has(key)) {
      visitedRoutes.add(key);
      addXP(2);
    }
  }

  routeNodes.forEach((node) => node.addEventListener('click', () => activateRoute(node.dataset.route)));
  activateRoute('internet');

  const symptomData = {
    slow: 'بطء شديد في عمل الحاسوب.',
    files: 'اختفاء ملفات أو مجلدات دون سبب.',
    weird: 'ظهور أيقونات غريبة أو تغيّر شكل الملفات.',
    errors: 'ظهور رسائل خطأ متكررة.',
    freeze: 'عدم استجابة الحاسوب لبعض الأوامر.',
    full: 'امتلاء مساحة التخزين دون سبب واضح.'
  };
  const symptomList = $('#symptomList');
  const symFound = $('#symFound');
  const damageCard = $('#damageCard');
  const pcHotspots = $$('.pc-hotspot');
  const foundSymptoms = new Set();

  function renderSymptoms() {
    symptomList.innerHTML = Object.keys(symptomData).map((key) =>
      '<li data-sym="' + key + '">دليل لم يُكتشف بعد</li>'
    ).join('');
  }

  function updateSymptoms() {
    symFound.textContent = foundSymptoms.size + ' / ' + Object.keys(symptomData).length;
  }

  pcHotspots.forEach((spot) => {
    spot.addEventListener('click', () => {
      const key = spot.dataset.sym;
      if (!key || foundSymptoms.has(key)) return;
      foundSymptoms.add(key);
      spot.classList.add('found');
      const item = symptomList.querySelector('[data-sym="' + key + '"]');
      if (item) {
        item.classList.add('found');
        item.textContent = symptomData[key];
      }
      updateSymptoms();
      addXP(2);
      if (foundSymptoms.size === Object.keys(symptomData).length) {
        damageCard.hidden = false;
        addXP(6, 'اكتشفت كل الدلائل!');
        confetti(80);
      }
    });
  });

  function resetSymptoms() {
    foundSymptoms.clear();
    pcHotspots.forEach((spot) => spot.classList.remove('found'));
    damageCard.hidden = true;
    renderSymptoms();
    updateSymptoms();
  }

  $('#symReset').addEventListener('click', resetSymptoms);
  renderSymptoms();
  updateSymptoms();

  const protectCards = $$('.protect-card');
  const shieldCount = $('#shieldCount');
  const shieldMsg = $('#shieldMsg');
  const layerMap = {
    antivirus: '.l-antivirus',
    firewall: '.l-firewall',
    backup: '.l-backup',
    encryption: '.l-encryption'
  };
  let shieldAwarded = false;

  function updateShield() {
    let active = 0;
    protectCards.forEach((card) => {
      const on = card.getAttribute('aria-pressed') === 'true';
      if (on) active++;
      const layer = $(layerMap[card.dataset.protect]);
      if (layer) layer.classList.toggle('on', on);
    });
    shieldCount.textContent = active + ' / 4';
    if (active === 4) {
      shieldMsg.classList.add('good');
      shieldMsg.textContent = 'درعك مكتمل! أنت أكثر أمانًا الآن.';
      if (!shieldAwarded) {
        shieldAwarded = true;
        addXP(10, 'اكتمل درع الحماية!');
        confetti(90);
      }
    } else {
      shieldMsg.classList.remove('good');
      shieldMsg.textContent = active === 0
        ? 'الدرع ضعيف… فعّل وسائل الحماية.'
        : 'الدرع يحتاج ' + (4 - active) + ' طبقة أخرى.';
    }
  }

  protectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const pressed = card.getAttribute('aria-pressed') === 'true';
      card.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      updateShield();
    });
  });
  updateShield();

  const questions = [
    {
      unit: 'الوحدة الأولى',
      q: 'تحتاج شركة إلى جهاز واحد يخدم موظفيها العشرين في الوقت نفسه، ويحفظ الملفات المشتركة بينهم. أي نوع من الحواسيب تختار؟',
      options: ['الحاسوب المحمول', 'الحاسوب الخادم', 'الحاسوب الثابت', 'الحواسب الضخمة'],
      correct: 1,
      explain: 'الحاسوب الخادم يخدم عدة مستخدمين في الوقت نفسه ويحفظ الملفات المشتركة.'
    },
    {
      unit: 'الوحدة الأولى',
      q: 'في حاسوب سليم كل القطع متصلة وتعمل. إذا أزلنا اللوحة الأم، فماذا يحدث؟',
      options: ['يعمل المعالج وحده دون باقي القطع', 'تعمل الشاشة دون غيرها', 'تنقطع الصلة بين المكونات', 'يُحذف محتوى القرص الصلب'],
      correct: 2,
      explain: 'اللوحة الأم هي التي تربط بين جميع المكونات، فإزالتها تقطع الصلة بينها.'
    },
    {
      unit: 'الوحدة الأولى',
      q: 'كتب أحمد واجبه على الحاسوب، ثم انقطعت الكهرباء فاختفى ما كتبه. وعندما عاد التيار ظهرت شاشة البداية كالمعتاد. أي استنتاج صحيح؟',
      options: ['الواجب وشاشة البداية في ذاكرة مؤقتة', 'الواجب في ذاكرة دائمة، وشاشة البداية في ذاكرة مؤقتة', 'الواجب وشاشة البداية في ذاكرة دائمة', 'الواجب في ذاكرة مؤقتة، وشاشة البداية في ذاكرة دائمة'],
      correct: 3,
      explain: 'الواجب كان في RAM فاختفى، وشاشة البداية تأتي من ROM التي تحتفظ بمحتوياتها.'
    },
    {
      unit: 'الوحدة الثانية',
      q: 'جاء في وصف ملف أنه بحجم 4 بايتات. كم بت يساوي؟',
      options: ['12', '16', '32', '64'],
      correct: 2,
      explain: 'البايت الواحد = 8 بتات، إذن 4 × 8 = 32 بت.'
    },
    {
      unit: 'الوحدة الثانية',
      q: 'العدد الثنائي 110. ما العدد العشري المساوي له؟',
      options: ['5', '6', '3', '7'],
      correct: 1,
      explain: '1×4 + 1×2 + 0×1 = 6.'
    },
    {
      unit: 'الوحدة الثانية',
      q: 'العدد العشري 13 يساوي بالنظام الثنائي:',
      options: ['1011', '1110', '1001', '1101'],
      correct: 3,
      explain: '13 = 8 + 4 + 1، أي 1101₂.'
    },
    {
      unit: 'الوحدة الثانية',
      q: 'في النظام الستة عشري تُستخدم الأرقام من 0 إلى 9 ثم الحروف من A إلى F. أي رمز لا يمكن استخدامه في هذا النظام؟',
      options: ['9', 'G', 'F', 'A'],
      correct: 1,
      explain: 'الحرف G يأتي بعد F، لذلك لا يُستخدم في النظام الستة عشري.'
    },
    {
      unit: 'الوحدة الثالثة',
      q: 'أي برنامج ضار ينتشر ذاتيًا عبر الشبكات ولا يحتاج ملفًا مضيفًا؟',
      options: ['الفيروس', 'حصان طروادة', 'الدودة', 'برامج الدعاية'],
      correct: 2,
      explain: 'الدودة تنتشر ذاتيًا عبر الشبكات ولا تحتاج ملفًا مضيفًا.'
    },
    {
      unit: 'الوحدة الثالثة',
      q: 'أي وسيلة تحمي الحاسوب من الاختراق عبر الشبكة؟',
      options: ['مضاد الفيروسات', 'جدار الحماية', 'النسخ الاحتياطي', 'التشفير'],
      correct: 1,
      explain: 'جدار الحماية يحمي الحاسوب من الاختراق عبر الشبكة.'
    },
    {
      unit: 'الوحدة الأولى',
      q: 'أي العبارات التالية صحيحة عن الذاكرة ROM؟',
      options: ['تفقد محتواها عند انقطاع الكهرباء', 'تحفظ البرامج المفتوحة حاليًا', 'قابلة للقراءة فقط وتحتفظ بمحتوياتها بعد إيقاف التشغيل', 'تُستخدم لتخزين الصور والملفات'],
      correct: 2,
      explain: 'ROM قابلة للقراءة فقط، وتحتوي معلومات بدء التشغيل، وتحتفظ بمحتوياتها بعد إيقاف التشغيل.'
    }
  ];

  const quizBody = $('#quizBody');
  const quizProgress = $('#quizProgress');
  const quizCounter = $('#quizCounter');
  const quizScore = $('#quizScore');
  const optionKeys = ['أ', 'ب', 'ج', 'د'];
  let qIndex = 0;
  let qScore = 0;
  let answered = false;
  let bonusGiven = false;

  function updateQuizHead() {
    const pct = ((qIndex + 1) / questions.length) * 100;
    quizProgress.style.width = pct + '%';
    quizCounter.textContent = Math.min(qIndex + 1, questions.length) + ' / ' + questions.length;
    quizScore.textContent = qScore + ' / ' + questions.length;
  }

  function renderQuestion() {
    answered = false;
    const question = questions[qIndex];
    quizBody.innerHTML =
      '<div class="quiz-question">' +
        '<div class="q-meta"><span class="q-unit">' + question.unit + '</span><span class="q-num">سؤال ' + (qIndex + 1) + '</span></div>' +
        '<h3>' + question.q + '</h3>' +
        '<div class="quiz-options">' +
          question.options.map((option, index) =>
            '<button type="button" class="quiz-option" data-i="' + index + '"><span class="opt-key">' + optionKeys[index] + '</span><span>' + option + '</span></button>'
          ).join('') +
        '</div>' +
        '<div class="quiz-feedback" id="quizFeedback"></div>' +
        '<div class="quiz-next-row" id="quizNextRow"></div>' +
      '</div>';
    updateQuizHead();
    $$('.quiz-option', quizBody).forEach((button) => {
      button.addEventListener('click', () => chooseAnswer(Number(button.dataset.i)));
    });
  }

  function chooseAnswer(index) {
    if (answered) return;
    answered = true;
    const question = questions[qIndex];
    const correct = index === question.correct;
    if (correct) qScore++;
    const options = $$('.quiz-option', quizBody);
    options.forEach((button, i) => {
      button.disabled = true;
      if (i === question.correct) button.classList.add('correct');
      else if (i === index) button.classList.add('wrong');
      else button.classList.add('dim');
    });
    const feedback = $('#quizFeedback');
    feedback.classList.add('show', correct ? 'good' : 'bad');
    feedback.innerHTML = correct
      ? '<b>إجابة صحيحة!</b> ' + question.explain
      : '<b>الإجابة الصحيحة: ' + question.options[question.correct] + '.</b> ' + question.explain;
    quizScore.textContent = qScore + ' / ' + questions.length;
    if (correct) addXP(10, '+10 XP');
    const nextRow = $('#quizNextRow');
    const next = document.createElement('button');
    next.type = 'button';
    next.id = 'quizNext';
    next.className = 'btn btn-primary btn-sm';
    next.innerHTML = (qIndex === questions.length - 1 ? 'اعرض النتيجة' : 'التالي') + ' <svg class="ico"><use href="#i-arrow-left"/></svg>';
    next.addEventListener('click', nextQuestion);
    nextRow.appendChild(next);
  }

  function nextQuestion() {
    if (qIndex < questions.length - 1) {
      qIndex++;
      renderQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    const percent = Math.round((qScore / questions.length) * 100);
    const stars = qScore >= 9 ? 3 : qScore >= 7 ? 2 : qScore >= 5 ? 1 : 0;
    const message = qScore >= 9
      ? 'مذهل! أنت خبير في تكنولوجيا المعلومات.'
      : qScore >= 7
        ? 'رائع! مستواك ممتاز، راجع ما أخطأت فيه فقط.'
        : qScore >= 5
          ? 'بداية جيدة! أعد مراجعة الشرائح ثم حاول مرة أخرى.'
          : 'لا بأس! راجع الوحدات وجرّب من جديد… أنت تستطيع.';
    quizProgress.style.width = '100%';
    quizCounter.textContent = questions.length + ' / ' + questions.length;
    quizScore.textContent = qScore + ' / ' + questions.length;
    quizBody.innerHTML =
      '<div class="quiz-result">' +
        '<div class="score-ring" style="--p:' + percent + '"><div class="inner">' + qScore + '<small>/' + questions.length + '</small></div></div>' +
        '<div class="result-stars">' +
          Array.from({ length: 3 }, (_, i) => '<svg class="ico' + (i < stars ? ' on' : '') + '"><use href="#i-star"/></svg>').join('') +
        '</div>' +
        '<h3>' + (qScore >= 7 ? 'أحسنت!' : 'انتهى التحدي') + '</h3>' +
        '<p>' + message + '</p>' +
        '<div class="quiz-actions">' +
          '<button type="button" class="btn btn-primary" id="quizRetry"><svg class="ico"><use href="#i-backup"/></svg> أعد المحاولة</button>' +
          '<button type="button" class="btn btn-ghost" id="quizReview"><svg class="ico"><use href="#i-book"/></svg> راجع الخلاصة</button>' +
        '</div>' +
      '</div>';
    if (qScore >= 7 && !bonusGiven) {
      bonusGiven = true;
      addXP(15, 'أداء رائع!');
      confetti(110);
    }
    $('#quizRetry').addEventListener('click', () => {
      qIndex = 0;
      qScore = 0;
      answered = false;
      renderQuestion();
    });
    $('#quizReview').addEventListener('click', () => window.IT7.goToKey('recap'));
  }

  renderQuestion();

  document.addEventListener('keydown', (event) => {
    if (window.IT7.currentKey !== 'quiz') return;
    if (document.body.classList.contains('editing')) return;
    if (event.target.matches && event.target.matches('input, textarea, select')) return;
    if (event.key >= '1' && event.key <= '4' && !answered) {
      const button = $('.quiz-option[data-i="' + (Number(event.key) - 1) + '"]', quizBody);
      if (button) button.click();
    } else if (event.key === 'Enter') {
      const next = $('#quizNext');
      if (next) next.click();
    }
  });

  function updateFinalXP() {
    const finalXP = $('#finalXP');
    if (finalXP) finalXP.textContent = window.IT7.xp + ' XP';
  }
  document.addEventListener('it7:slide', (event) => {
    if (event.detail.index === 16) updateFinalXP();
  });
})();
