// Состояние одной проверки. Повторный ответ не меняет результат задания.
(function (root) {
  'use strict';
  function createSession(topic, level) {
    const tasks = Array.from({ length: 4 }, () => topic.generate(level));
    const answers = [];
    let index = 0;
    return {
      topic, level, tasks, answers,
      get index() { return index; },
      get task() { return tasks[index]; },
      get score() { return answers.filter(a => a.ok).length; },
      get finished() { return index === tasks.length; },
      submit(raw) {
        if (this.finished || answers[index]) return null;
        const result = root.DOLYA_CHECK.check(raw, tasks[index]);
        if (!result.empty && !result.unreadable) answers.push({ ...result, input: raw });
        return result;
      },
      next() {
        if (this.finished || !answers[index]) return false;
        index++;
        return true;
      },
    };
  }
  root.DOLYA_SESSION = { createSession };
})(typeof window !== 'undefined' ? window : globalThis);
