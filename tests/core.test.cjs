const { test } = require('node:test');
const assert = require('node:assert/strict');
global.window = globalThis;
require('../js/check.js');
require('../js/topics.js');
require('../js/session.js');
const { check, parse } = DOLYA_CHECK;
const task = (answer, accept = 'equivalent') => ({ answer, accept });

test('равные дроби, целые, знаки и смешанные числа', () => {
  for (const [answer, expected] of [['6/8', '3/4'], ['2', '8/4'], ['2 1/3', '7/3'], ['-0 1/2', '-1/2'], ['1/-2', '-1/2'], [' x = 3 / 4 ', '3/4'], ['=', '=']]) assert.equal(check(answer, task(expected)).ok, true, answer);
  assert.equal(check('<', task('>')).ok, false);
  assert.equal(check('1/2', task('3/4')).ok, false);
});
test('точное сравнение не засчитывает близкие, но разные значения', () => {
  assert.equal(check('0.999999999999999', task('1', 'exact')).ok, false);
  assert.equal(check('100000000000001/100000000000000', task('1')).ok, false);
  assert.equal(check('333333333333333/999999999999999', task('1/3')).ok, true);
});
test('требования к записи: сокращение, смешанное число, неправильная дробь', () => {
  assert.equal(check('6/8', task('3/4', 'simplest')).almost, true);
  assert.equal(check('3/4', task('3/4', 'simplest')).ok, true);
  assert.equal(check('7/3', task('2 1/3', 'mixed')).almost, true);
  assert.equal(check('2 1/3', task('2 1/3', 'mixed')).ok, true);
  assert.equal(check('2 1/3', task('7/3', 'fraction')).almost, true);
  assert.equal(check('0,75', task('3/4')).almost, true);
});
test('пустой ответ, нулевой знаменатель и неверный ввод', () => {
  assert.equal(check(' ', task('1')).empty, true);
  for (const input of ['1/0', '2 1/0', 'NaN', 'Infinity', '<script>', '1/2/3', '9'.repeat(80), '2+2']) {
    assert.equal(parse(input), null, input);
    assert.equal(check(input, task('1')).unreadable, true, input);
  }
});
test('каждая тема и каждый уровень: генератор выдаёт корректные задачи', () => {
  assert.equal(DOLYA_FRACTIONS.topics.length, 9);
  let state = 12345;
  const oldRandom = Math.random;
  Math.random = () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
  try {
    for (const topic of DOLYA_FRACTIONS.topics) for (let level = 1; level <= 3; level++) for (let n = 0; n < 300; n++) {
      const generated = topic.generate(level);
      assert.equal(check(generated.answer, generated).ok, true, topic.id);
      assert.doesNotMatch([generated.story, generated.question, generated.solution].join(' '), /undefined|NaN|Infinity/);
      assert.ok(Array.isArray(generated.hints));
      if (generated.misc) assert.equal(generated.misc(parse(generated.answer)), null, topic.id);
    }
  } finally { Math.random = oldRandom; }
});
test('четыре задания: один ответ на задание, неверный ввод не тратит попытку', () => {
  const s = DOLYA_SESSION.createSession(DOLYA_FRACTIONS.topics[1], 1);
  assert.equal(s.next(), false);
  assert.equal(s.submit('').empty, true);
  assert.equal(s.submit('1/0').unreadable, true);
  assert.equal(s.answers.length, 0);
  for (let i = 0; i < 4; i++) {
    assert.equal(s.submit(i === 1 ? '0' : s.task.answer).ok, i !== 1);
    assert.equal(s.submit(s.task.answer), null);
    assert.equal(s.answers.length, i + 1);
    assert.equal(s.next(), true);
  }
  assert.equal(s.finished, true);
  assert.equal(s.score, 3);
  assert.equal(s.next(), false);
  assert.equal(s.submit('1'), null);
});
