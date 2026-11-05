(function () {
  const { addXP, confetti } = window.IT7;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------- لعبة الذاكرة: بطاقة واحدة في كل مرة ---------------- */
  const memoryStatements = [
    { text: 'تفقد محتواها عند انقطاع التيار الكهربائي', answer: 'ram' },
    { text: 'تحتوي معلومات بدء التشغيل', answer: 'rom' },
    { text: 'تخزّن ملفاتك وصورك بشكل دائم', answer: 'hdd' },
    { text: 'البرامج والتطبيقات المفتوحة حاليًا', answer: 'ram' },
    { text: 'قابلة للقراءة فقط ولا يمكن تغيير محتوياتها', answer: 'rom' },
    { text: 'تحتفظ بالبرامج والبيانات بعد إيقاف التشغيل', answer: 'hdd' }
  ];
  const memoryCard = $('#memoryCard');
  const memoryScore = $('#memoryScore');
  const memoryFeedback = $('#memoryFeedback');
  const memoryReset = $('#memoryReset');
  const bins = $$('.memory-bins .bin');
  let pool = [];
  let currentStatement = null;
  let solved = 0;

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function updateScore() {
    if (memoryScore) memoryScore.textContent = solved + ' / ' + memoryStatements.length;
  }

  function renderCard() {
    if (!memoryCard) return;
    if (!pool.length) {
      currentStatement = null;
      memoryCard.textContent = 'أحسنت! رتّبت كل البطاقات في مكانها الصحيح.';
      return;
    }
    currentStatement = pool.pop();
    memoryCard.textContent = currentStatement.text;
    memoryCard.classList.remove('pop');
    void memoryCard.offsetWidth;
    memoryCard.classList.add('pop');
  }

  function tryPlace(bin) {
    if (!currentStatement) {
      memoryFeedback.className = 'feedback';
      memoryFeedback.textContent = 'انتهت البطاقات… اضغط «إعادة اللعبة» للبدء من جديد.';
      return;
    }
    if (currentStatement.answer !== bin.dataset.bin) {
      bin.classList.add('wrong');
      setTimeout(() => bin.classList.remove('wrong'), 450);
      memoryFeedback.className = 'feedback pop bad';
      memoryFeedback.textContent = 'ليست هذه الذاكرة المناسبة… فكّر مرة أخرى.';
      return;
    }
    bin.classList.add('done');
    solved++;
    updateScore();
    memoryFeedback.className = 'feedback pop good';
    memoryFeedback.textContent = 'إجابة صحيحة! ' + solved + ' من ' + memoryStatements.length;
    addXP(2);
    currentStatement = null;
    if (solved === memoryStatements.length) {
      memoryFeedback.className = 'feedback pop good';
      memoryFeedback.textContent = 'رائع! رتّبت كل البطاقات في مكانها الصحيح.';
      addXP(6, 'أتقنت أنواع الذاكرة!');
      confetti(85);
      renderCard();
    } else {
      renderCard();
    }
  }

  if (memoryCard) {
    bins.forEach((bin) => {
      bin.addEventListener('click', () => tryPlace(bin));
      bin.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          tryPlace(bin);
        }
      });
    });

    memoryReset.addEventListener('click', () => {
      solved = 0;
      currentStatement = null;
      pool = shuffle(memoryStatements);
      bins.forEach((bin) => bin.classList.remove('done', 'wrong'));
      updateScore();
      memoryFeedback.className = 'feedback';
      memoryFeedback.textContent = 'اختر الذاكرة المناسبة للبطاقة.';
      renderCard();
    });

    pool = shuffle(memoryStatements);
    updateScore();
    renderCard();
  }

  /* ---------------- النظام العشري ---------------- */
  const decInput = $('#decInput');
  const decDigits = $('#decDigits');
  const decExpansion = $('#decExpansion');
  const placeNames = ['الآحاد', 'العشرات', 'المئات', 'الآلاف'];

  function renderDecimal(value) {
    const number = Math.max(0, Math.min(999, Number(value) || 0));
    decInput.value = number;
    const digits = String(number).split('');
    decDigits.innerHTML = digits.map((digit, index) => {
      const position = digits.length - 1 - index;
      const weight = Math.pow(10, position);
      const name = placeNames[position] || ('10 أس ' + position);
      return '<div class="digit-box" style="animation-delay:' + (index * 55) + 'ms">' +
        '<b>' + digit + '</b>' +
        '<small>' + name + '</small>' +
        '<span class="weight">× ' + weight + '</span>' +
        '</div>';
    }).join('');
    const terms = digits.map((digit, index) => {
      const position = digits.length - 1 - index;
      return '<span class="num">' + digit + '</span><span class="op">×</span>10<sup>' + position + '</sup>';
    });
    decExpansion.innerHTML = terms.join('<span class="op">+</span>') +
      '<span class="op">=</span><span class="sum">' + number + '</span>';
  }

  if (decInput) {
    decInput.addEventListener('input', () => {
      if (decInput.value === '') return;
      renderDecimal(decInput.value);
    });
    decInput.addEventListener('blur', () => renderDecimal(decInput.value));
    decInput.addEventListener('change', () => renderDecimal(decInput.value));
    $('#decMinus').addEventListener('click', () => renderDecimal(Number(decInput.value) - 1));
    $('#decPlus').addEventListener('click', () => renderDecimal(Number(decInput.value) + 1));
    $$('[data-dec]').forEach((button) => button.addEventListener('click', () => renderDecimal(button.dataset.dec)));
    renderDecimal(345);
  }

  /* ---------------- مختبر الثنائي ---------------- */
  const weights = [128, 64, 32, 16, 8, 4, 2, 1];
  const bits = [0, 0, 0, 0, 0, 0, 0, 0];
  const switches = $('#bitSwitches');
  const binTarget = $('#binTarget');
  const binReadout = $('#binReadout');
  const binValue = $('#binValue');
  const binFeedback = $('#binFeedback');
  let target = 13;
  let targetDone = false;

  if (switches) {
    switches.innerHTML = weights.map((weight, index) =>
      '<button type="button" class="bit-switch" data-index="' + index + '" aria-pressed="false">' +
      '<span class="bit-weight">' + weight + '</span>' +
      '<span class="switch-track"><span class="switch-thumb"></span></span>' +
      '<span class="bit-state">0</span>' +
      '</button>'
    ).join('');

    const switchButtons = $$('.bit-switch', switches);

    function updateBinary() {
      let value = 0;
      switchButtons.forEach((button, index) => {
        const on = bits[index] === 1;
        button.classList.toggle('is-on', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
        button.querySelector('.bit-state').textContent = bits[index];
        if (on) value += weights[index];
      });
      binReadout.textContent = bits.join('');
      binValue.textContent = value;
      if (value === target) {
        if (!targetDone) {
          targetDone = true;
          binFeedback.className = 'feedback pop good';
          binFeedback.textContent = 'أحسنت! هذا هو العدد ' + target + ' بالثنائي.';
          addXP(10, '+10 XP');
          confetti(70);
        }
      } else if (!targetDone) {
        binFeedback.className = 'feedback';
        binFeedback.textContent = 'حاول أن تجعل القيمة تساوي ' + target + '.';
      }
    }

    switchButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        bits[index] = bits[index] ? 0 : 1;
        if (targetDone) {
          binFeedback.className = 'feedback';
          binFeedback.textContent = '';
        }
        updateBinary();
      });
    });

    $('#binZero').addEventListener('click', () => {
      bits.fill(0);
      targetDone = false;
      binFeedback.className = 'feedback';
      binFeedback.textContent = 'حاول الوصول إلى الهدف من جديد.';
      updateBinary();
    });

    $('#binNewTarget').addEventListener('click', () => {
      const targets = [5, 9, 13, 21, 42, 85, 100, 111];
      let next = targets[Math.floor(Math.random() * targets.length)];
      if (next === target) next = targets[(targets.indexOf(next) + 1) % targets.length];
      target = next;
      targetDone = false;
      bits.fill(0);
      binTarget.textContent = target;
      binFeedback.className = 'feedback';
      binFeedback.textContent = 'هدف جديد: اصنع العدد ' + target + '.';
      updateBinary();
    });

    updateBinary();
  }

  /* ---------------- من الثنائي إلى العشري ---------------- */
  const binToDecInput = $('#binToDecInput');
  const binToDecSteps = $('#binToDecSteps');
  const binToDecResult = $('#binToDecResult');
  const binToDecError = $('#binToDecError');

  function convertBinary(raw) {
    const value = String(raw).trim();
    if (!/^[01]{1,8}$/.test(value)) {
      binToDecError.textContent = 'اكتب عددًا ثنائيًا من 0 و1 فقط (حتى 8 بتات).';
      binToDecSteps.innerHTML = '';
      binToDecResult.classList.remove('show');
      return;
    }
    binToDecError.textContent = '';
    let sum = 0;
    const rows = value.split('').map((digit, index) => {
      const position = value.length - 1 - index;
      const weight = Math.pow(2, position);
      const product = Number(digit) * weight;
      sum += product;
      return '<div class="step-row" style="--d:' + index + '">' +
        '<span class="term">' + digit + ' × 2<sup>' + position + '</sup></span>' +
        '<span class="weight">= ' + weight + '</span>' +
        '<span class="product">' + product + '</span>' +
        '</div>';
    }).join('');
    binToDecSteps.innerHTML = rows +
      '<div class="step-row total" style="--d:' + value.length + '">' +
      '<span class="term">المجموع</span><span class="weight"></span>' +
      '<span class="product">' + sum + '</span></div>';
    binToDecResult.innerHTML = '(' + value + ')<sub>2</sub> = (' + sum + ')<sub>10</sub>';
    binToDecResult.classList.add('show');
  }

  if (binToDecInput) {
    $('#binToDecBtn').addEventListener('click', () => convertBinary(binToDecInput.value));
    binToDecInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') convertBinary(binToDecInput.value);
    });
    $$('[data-b2d]').forEach((button) => {
      button.addEventListener('click', () => {
        binToDecInput.value = button.dataset.b2d;
        convertBinary(button.dataset.b2d);
      });
    });
    convertBinary('110');
  }

  /* ---------------- من العشري إلى الثنائي ---------------- */
  const decToBinInput = $('#decToBinInput');
  const ladderTable = $('#ladderTable');
  const ladderResult = $('#ladderResult');
  const ladderNext = $('#ladderNext');
  const ladderCard = ladderTable ? ladderTable.closest('.ladder-card') : null;
  let ladderRows = [];
  let ladderStep = 0;
  let ladderDone = false;
  let ladderNumber = 254;

  function buildLadder(value) {
    const number = Math.max(0, Math.min(255, Number(value) || 0));
    ladderNumber = number;
    decToBinInput.value = number;
    ladderRows = [];
    let remainderValue = number;
    do {
      const quotient = Math.floor(remainderValue / 2);
      const remainder = remainderValue % 2;
      ladderRows.push({ dividend: remainderValue, quotient: quotient, remainder: remainder });
      remainderValue = quotient;
    } while (remainderValue > 0);
    ladderStep = 0;
    ladderDone = false;
    ladderCard.classList.remove('reading');
    ladderResult.textContent = '';
    ladderResult.classList.remove('show');
    ladderNext.disabled = false;
    ladderNext.innerHTML = 'الخطوة التالية <svg class="ico"><use href="#i-arrow-left"/></svg>';
    ladderTable.innerHTML = '<div class="lad-head"><span>القسمة</span><span>الناتج</span><span>الباقي</span></div>' +
      ladderRows.map((row, index) =>
        '<div class="lad-row" data-index="' + index + '">' +
        '<span class="division">' + row.dividend + ' ÷ 2</span>' +
        '<span class="quotient">' + row.quotient + '</span>' +
        '<span class="rem" style="--rd:' + (ladderRows.length - 1 - index) + '">' + row.remainder + '</span>' +
        '</div>'
      ).join('');
  }

  function revealLadderStep() {
    if (ladderDone) return;
    const row = ladderTable.querySelector('.lad-row[data-index="' + ladderStep + '"]');
    if (row) row.classList.add('revealed');
    ladderStep++;
    if (ladderStep >= ladderRows.length) {
      ladderDone = true;
      const binary = ladderRows.map((item) => item.remainder).reverse().join('');
      ladderResult.innerHTML = '(' + ladderNumber + ')<sub>10</sub> = (' + binary + ')<sub>2</sub>';
      ladderResult.classList.add('show');
      ladderCard.classList.add('reading');
      ladderNext.disabled = true;
      ladderNext.textContent = 'تم التحويل';
    }
  }

  if (decToBinInput) {
    ladderNext.addEventListener('click', revealLadderStep);
    $('#ladderStart').addEventListener('click', () => buildLadder(decToBinInput.value));
    decToBinInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') buildLadder(decToBinInput.value);
    });
    $$('[data-d2b]').forEach((button) => {
      button.addEventListener('click', () => buildLadder(button.dataset.d2b));
    });
    buildLadder(254);
  }

  /* ---------------- جدول التحويل ---------------- */
  const convTableBody = $('#convTableBody');
  const convTable = $('.conv-table');
  const tableToggle = $('#tableToggle');
  let tableHidden = false;

  function toBinary(number) {
    return number.toString(2).padStart(4, '0');
  }

  if (convTableBody) {
    convTableBody.innerHTML = Array.from({ length: 9 }, (_, number) => {
      const second = number + 9;
      const left = '<td class="dec-cell">' + number + '</td><td class="bin-cell" data-binary="' + toBinary(number) + '">' + toBinary(number) + '</td>';
      const right = second <= 16
        ? '<td class="dec-cell">' + second + '</td><td class="bin-cell" data-binary="' + toBinary(second) + '">' + toBinary(second) + '</td>'
        : '<td class="dec-cell empty">—</td><td class="bin-cell empty">—</td>';
      return '<tr>' + left + right + '</tr>';
    }).join('');

    tableToggle.addEventListener('click', () => {
      tableHidden = !tableHidden;
      convTable.classList.toggle('hide-bin', tableHidden);
      if (tableHidden) {
        $$('.bin-cell', convTable).forEach((cell) => cell.classList.remove('revealed'));
        tableToggle.innerHTML = '<svg class="ico"><use href="#i-spy"/></svg> أظهر الثنائي';
      } else {
        $$('.bin-cell', convTable).forEach((cell) => cell.classList.add('revealed'));
        tableToggle.innerHTML = '<svg class="ico"><use href="#i-spy"/></svg> اختبرني: أخفِ الثنائي';
      }
    });

    convTableBody.addEventListener('click', (event) => {
      const cell = event.target.closest('.bin-cell');
      if (!cell || !tableHidden) return;
      cell.classList.add('revealed');
    });
  }

  /* ---------------- اختبارات الأنظمة السريعة ---------------- */
  $$('[data-qq]').forEach((quiz) => {
    const buttons = $$('button', quiz);
    const feedback = $('.qq-feedback', quiz);
    let answered = false;
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const correct = button.dataset.correct === 'true';
        button.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) {
          buttons.forEach((item) => {
            if (item.dataset.correct === 'true') item.classList.add('correct');
          });
          feedback.textContent = 'ليست الإجابة الصحيحة. الرمز الصحيح: ' + (buttons.find((item) => item.dataset.correct === 'true') || {}).textContent;
          feedback.style.color = 'var(--red-dark)';
        } else {
          feedback.textContent = 'إجابة صحيحة! هذا الرمز غير مسموح.';
          feedback.style.color = '';
          addXP(3);
        }
        buttons.forEach((item) => { item.disabled = true; });
      });
    });
  });

  /* ---------------- بطاقات القلب ---------------- */
  const seenCards = new Set();
  $$('[data-flip]').forEach((card) => {
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      const flipped = card.classList.contains('flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
      if (flipped && !seenCards.has(card)) {
        seenCards.add(card);
        addXP(2);
      }
    });
  });
})();
