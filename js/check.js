// Проверка из Вектора, адаптированная для мини-приложения. См. SOURCE.md.
(function (root) {
  'use strict';
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  // Точное значение: сравниваем целые произведения, без округления decimal.
  function withExact(got, n, d) {
    if (d === 0n) return null;
    return { ...got, exactN: n, exactD: d };
  }
  function parse(raw) {
    const s = String(raw).trim().replace(/\s+/g, ' ').replace(',', '.').replace(/[−–]/g, '-').replace(/^x\s*=\s*/i, '');
    if (s.length > 80 || /\d{16}/.test(s)) return null;
    let m;
    if (['<', '>', '='].includes(s)) return { kind: 'sign', v: s };
    if ((m = s.match(/^(-?\d+) (\d+)\s*\/\s*(\d+)$/))) {
      const w = +m[1], n = +m[2], d = +m[3], sign = m[1].startsWith('-') ? -1 : 1;
      return withExact({ kind: 'mixed', v: w + sign * n / d, w, n, d }, BigInt(m[1]) * BigInt(d) + BigInt(sign) * BigInt(n), BigInt(d));
    }
    if ((m = s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/))) return withExact({ kind: 'frac', v: m[1] / m[2], n: +m[1], d: +m[2] }, BigInt(m[1]), BigInt(m[2]));
    if (/^-?\d+(\.\d+)?$/.test(s)) {
      const decimals = s.split('.')[1]?.length || 0;
      return withExact({ kind: 'num', v: +s }, BigInt(s.replace('.', '')), 10n ** BigInt(decimals));
    }
    return null;
  }
  // → { ok, almost?, msg?, note?, mistake? }
  function check(input, task) {
    if (!String(input).trim()) return { ok: false, empty: true, msg: 'Сначала впиши ответ.' };
    const got = parse(input), want = parse(task.answer);
    if (!got) return { ok: false, unreadable: true, msg: 'Введи число, дробь 3/4, смешанное число 2 1/3 или знак сравнения. Знаменатель не может быть нулём. В каждом числе — до 15 цифр.' };
    if (want.kind === 'sign') return got.v === want.v ? { ok: true } : { ok: false, mistake: task.misc && task.misc(got) };
    if (got.kind === 'sign' || got.exactN * want.exactD !== want.exactN * got.exactD) return { ok: false, mistake: task.misc && task.misc(got) };
    const reducible = got.kind === 'frac' && gcd(got.n, got.d) > 1;
    // Д-08: в задачах на дроби десятичная запись (0.75 вместо 3/4) не засчитывается
    if (got.kind === 'num' && got.exactN % got.exactD !== 0n && want.kind !== 'num')
      return { ok: false, almost: true, msg: 'Значение верное, но запиши ответ обыкновенной дробью, например 3/4.' };
    switch (task.accept) {
      case 'simplest':
        if (reducible) return { ok: false, almost: true, mistake: 'not-fully-reduced', msg: 'Значение верное, но дробь можно сократить ещё.' };
        return { ok: true };
      case 'fraction':
        if (got.kind !== 'frac') return { ok: false, almost: true, msg: 'Число верное, но запиши его неправильной дробью, например 7/3.' };
        return reducible ? { ok: true, note: 'Дробь можно было сократить.' } : { ok: true };
      case 'mixed':
        if (got.kind !== 'mixed' || got.n >= got.d) return { ok: false, almost: true, msg: 'Значение верное, но нужно выделить целую часть. Запиши через пробел, например 2 1/3.' };
        return { ok: true };
      case 'equivalent':
        if (reducible) return { ok: true, note: 'Дробь ещё можно сократить — в ответах её обычно сокращают.' };
        if (got.kind === 'frac' && got.n >= got.d && got.d !== 1 && want.v >= 1) return { ok: true, note: 'Можно ещё выделить целую часть.' };
        return { ok: true };
      default:
        return { ok: true };
    }
  }
  root.DOLYA_CHECK = { parse, check, gcd };
})(typeof window !== 'undefined' ? window : globalThis);
