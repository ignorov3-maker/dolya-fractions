(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const topics = window.VEKTOR_FRACTIONS.topics;
  let session;
  for (const topic of topics) $('topic').add(new Option(topic.short, topic.id));
  $('topic').value = 'add-diff';

  function progress() {
    $('progress').replaceChildren(...Array.from({ length: 4 }, (_, i) => {
      const el = document.createElement('span');
      el.className = session?.answers[i] ? (session.answers[i].ok ? 'correct' : 'wrong') : (session?.index === i ? 'active' : '');
      el.title = `Задание ${i + 1}: ${session?.answers[i] ? (session.answers[i].ok ? 'верно' : 'ошибка') : 'ожидает ответа'}`;
      return el;
    }));
  }
  function showTask() {
    const task = session.task;
    $('task-count').textContent = `${session.index + 1} из 4`;
    $('topic-title').textContent = session.topic.title;
    // HTML ниже создан только нашими генераторами. Ввод ученика сюда не попадает.
    $('story').innerHTML = task.story;
    $('question').innerHTML = task.question;
    $('answer').value = '';
    $('answer').disabled = false;
    $('submit').hidden = false;
    $('next').hidden = true;
    $('feedback').hidden = true;
    $('answer').removeAttribute('aria-invalid');
    $('signs').hidden = session.topic.id !== 'compare';
    $('signs').querySelectorAll('button').forEach(b => b.disabled = false);
    $('answer').placeholder = task.placeholder || (session.topic.id === 'compare' ? '<, > или =' : 'Например, 3/4');
    $('format').textContent = session.topic.id === 'compare' ? 'Введи знак или нажми кнопку: <, =, >.' : task.accept === 'mixed' ? 'Смешанное число: целая часть, пробел, дробь. Например, 2 1/3.' : 'Дробь: 3/4 · смешанное число: 2 1/3 · целое: 5';
    progress();
    $('answer').focus({ preventScroll: true });
  }
  function start() {
    session = window.VEKTOR_SESSION.createSession(topics.find(t => t.id === $('topic').value), Number($('level').value));
    $('welcome').hidden = true;
    $('result').hidden = true;
    $('task-view').hidden = false;
    $('topic').disabled = true;
    $('level').disabled = true;
    $('start').textContent = 'Начать заново ↗';
    $('settings-note').textContent = 'Тему и сложность можно поменять после четырёх заданий.';
    showTask();
  }
  function resultView() {
    $('task-view').hidden = true;
    $('result').hidden = false;
    $('task-count').textContent = 'Готово';
    const passed = session.score >= 3;
    $('result').innerHTML = `<div class="result-mark" aria-hidden="true">${passed ? '✓' : '↗'}</div><h2>${passed ? 'Отлично, проверка пройдена!' : 'Ещё немного практики'}</h2><p class="result-score">${session.score} <small>из 4 верно</small></p><p class="muted">${passed ? 'Ты справился! Можно взять другую тему или повысить сложность.' : 'Ошибки подсказывают, что повторить. Попробуй ещё раз — задания будут новыми.'}</p><button class="primary" id="again">Попробовать ещё раз ↗</button>`;
    $('again').addEventListener('click', start);
    $('topic').disabled = false;
    $('level').disabled = false;
    $('start').textContent = 'Начать проверку ↗';
    $('settings-note').innerHTML = '4 задания · без таймера<br>Зачёт — от 3 верных ответов.';
    progress();
    $('result').focus({ preventScroll: true });
  }
  $('start').addEventListener('click', start);
  $('answer-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!session) return;
    const result = session.submit($('answer').value);
    if (!result) return;
    const feedback = $('feedback');
    feedback.hidden = false;
    if (result.empty || result.unreadable) {
      feedback.className = 'invalid';
      feedback.textContent = result.msg;
      $('answer').setAttribute('aria-invalid', 'true');
      $('answer').focus();
      return;
    }
    $('answer').removeAttribute('aria-invalid');
    feedback.className = result.ok ? 'success' : 'error';
    const title = document.createElement('strong');
    title.textContent = result.ok ? 'Верно!' : result.almost ? 'Значение верное, проверь запись' : 'Пока не так';
    feedback.replaceChildren(title);
    const mistake = session.topic.mistakes.find(m => m.id === result.mistake);
    const msg = result.msg || result.note || mistake?.say || (result.ok ? 'Хорошая работа. Идём дальше!' : 'Сравни своё решение с разбором ниже.');
    const message = document.createElement('p');
    message.textContent = msg;
    feedback.append(message);
    if (!result.ok) {
      const details = document.createElement('details');
      details.open = true;
      details.innerHTML = `<summary>Разбор решения</summary><p>${session.task.solution}</p>`;
      feedback.append(details);
    }
    $('answer').disabled = true;
    $('submit').hidden = true;
    $('signs').querySelectorAll('button').forEach(b => b.disabled = true);
    $('next').textContent = session.index === 3 ? 'Посмотреть результат →' : 'Следующее задание →';
    $('next').hidden = false;
    progress();
    $('next').focus({ preventScroll: true });
  });
  $('next').addEventListener('click', () => {
    if (!session?.next()) return;
    if (session.finished) resultView(); else showTask();
  });
  $('signs').addEventListener('click', event => {
    const button = event.target.closest('button[data-sign]');
    if (!button || button.disabled) return;
    $('answer').value = button.dataset.sign;
    $('answer').focus();
  });
  progress();
})();
