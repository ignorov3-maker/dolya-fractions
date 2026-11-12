// Генераторы и сообщения об ошибках из Вектора. Источник: SOURCE.md.
(function () {
'use strict';
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  // склонение после числа: pl(1,'кусок','куска','кусков') → 'кусок'
  const pl = (k, one, few, many) => (k % 10 === 1 && k % 100 !== 11 ? one : [2, 3, 4].includes(k % 10) && ![12, 13, 14].includes(k % 100) ? few : many);
  const parts = k => pl(k, 'часть', 'части', 'частей');
  const pieces = k => pl(k, 'кусок', 'куска', 'кусков');
  const pick = arr => arr[rnd(0, arr.length - 1)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => (a * b) / gcd(a, b);
  const f = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const simp = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
  const fracStr = (n, d) => { const [a, b] = simp(n, d); return b === 1 ? String(a) : `${a}/${b}`; };
  const fracHtml = (n, d) => { const [a, b] = simp(n, d); return b === 1 ? String(a) : f(a, b); };
  const is = (got, n, d) => got && got.kind === 'frac' && got.n === n && got.d === d;
  const L3 = (lv, a, b, c) => [a, b, c][Math.min(3, Math.max(1, lv || 2)) - 1]; // значение по уровню
  const coprime = (lo, hi, d) => { let a; do { a = rnd(lo, hi); } while (gcd(a, d) !== 1); return a; };

  const DENOMS = [2, 3, 4, 5, 6, 8, 10, 12];


window.DOLYA_FRACTIONS = { topics: [{
  id: "concept", short: "Доли и дроби", title: "Доли и дроби",
  mistakes: [{"id":"flipped","title":"Числитель и знаменатель перепутаны местами","say":"Внизу пишут, на сколько частей разделили целое, — это всегда больше или столько же, сколько взяли."},{"id":"took-eaten","title":"Посчитана не та часть","say":"Перечитай вопрос: спрашивают, сколько осталось, а не сколько съели."},{"id":"unequal-parts","title":"Считает доли, хотя части неравные","say":"Дробь работает только с равными частями: если куски разного размера, их нельзя называть долями."}],
  generate(lv) {
        const [lo, hi] = L3(lv, [3, 6], [4, 10], [6, 12]);
        let n, k; do { n = rnd(lo, hi); k = rnd(1, n - 1); } while (2 * k === n); // половина неоднозначна
        if (Math.random() < 0.5) {
          return {
            story: `Пиццу разрезали на ${n} ${pl(n, 'равный кусок', 'равных куска', 'равных кусков')}. Съели ${k}.`,
            question: 'Какая часть пиццы осталась?',
            figure: { type: 'circle', parts: n, empty: k },
            answer: `${n - k}/${n}`, accept: 'equivalent',
            hints: ['Сколько всего равных кусков? Это знаменатель.', `Осталось ${n} − ${k} = ${n - k} ${pieces(n - k)}. Это числитель.`],
            solution: `Всего ${n} ${pieces(n)}, осталось ${n - k}: ${f(n - k, n)}.`,
            misc: got => (is(got, k, n) ? 'took-eaten' : is(got, n, n - k) ? 'flipped' : null),
            p: { kind: 'left', n, k }, // числа для сюжетов про интересы (stories.js)
          };
        }
        return {
          story: `Полоску разделили на ${n} равных частей и закрасили ${k}.`,
          question: 'Какая часть полоски закрашена?',
          figure: { type: 'bar', parts: n, shaded: k },
          answer: `${k}/${n}`, accept: 'equivalent',
          hints: ['На сколько равных частей разделили полоску?', `Закрашено ${k} ${parts(k)} из ${n}.`],
          solution: `${k} ${parts(k)} из ${n}: ${f(k, n)}.`,
          misc: got => (is(got, n, k) ? 'flipped' : is(got, n - k, n) ? 'took-eaten' : null),
          p: { kind: 'shaded', n, k },
        };
      }
},
{
  id: "reduce", short: "Сокращение", title: "Сокращение дробей",
  mistakes: [{"id":"not-fully-reduced","title":"Дробь сокращена не до конца","say":"Проверь, нет ли у числителя и знаменателя ещё общего делителя."},{"id":"only-one-part","title":"Разделён только числитель или только знаменатель","say":"Делить нужно оба числа на одно и то же — иначе дробь меняется."},{"id":"subtract-instead","title":"Из чисел вычитают, а не делят","say":"Сокращение — это деление. Если из 6/8 вычесть по 2, получится 4/6, а это другая дробь."}],
  generate(lv) {
        const b = pick(L3(lv, [3, 4, 5], [3, 4, 5, 6, 7], [5, 6, 7, 8, 9])), a = coprime(1, b - 1, b);
        const m = rnd(...L3(lv, [2, 3], [2, 5], [3, 8]));
        const A = a * m, B = b * m;
        return {
          story: 'Сократи дробь так, чтобы её нельзя было сократить ещё раз.',
          question: `${f(A, B)} = ?`,
          answer: `${a}/${b}`, accept: 'simplest',
          hints: [`На какое число делятся и ${A}, и ${B}?`, `Наибольший общий делитель — ${m}. Раздели на него оба числа.`],
          solution: `${A} : ${m} = ${a}, ${B} : ${m} = ${b}. Ответ: ${f(a, b)}.`,
          misc: got => {
            if (!got || got.kind !== 'frac') return null;
            if ((got.n === a && got.d === B) || (got.n === A && got.d === b)) return 'only-one-part';
            const k = A - got.n; if (k > 0 && B - got.d === k) return 'subtract-instead';
            return null;
          },
        };
      }
},
{
  id: "compare", short: "Сравнение", title: "Сравнение дробей",
  mistakes: [{"id":"bigger-denominator-bigger","title":"Считает, что больше знаменатель — больше дробь","say":"Чем на большее число частей делят целое, тем мельче каждая часть."},{"id":"compare-numerators-only","title":"Сравнивает только числители при разных знаменателях","say":"Числители можно сравнивать, только когда доли одинаковые, то есть знаменатели равны."}],
  generate(lv) {
        const type = pick(L3(lv, ['den', 'den', 'num'], ['den', 'num', 'diff'], ['num', 'diff', 'diff']));
        let a, b, c, d;
        if (type === 'den') { b = d = rnd(5, 12); a = rnd(1, b - 1); do { c = rnd(1, d - 1); } while (c === a); }
        else if (type === 'num') { a = c = rnd(1, 4); b = rnd(a + 1, 9); do { d = rnd(a + 1, 10); } while (d === b); }
        else { do { b = pick(DENOMS); d = pick(DENOMS); } while (b === d); a = rnd(1, b - 1); c = rnd(1, d - 1); }
        const L = lcm(b, d), x = a * (L / b), y = c * (L / d);
        const sign = x < y ? '<' : x > y ? '>' : '=';
        const hints = type === 'den' ? ['Знаменатели одинаковые — доли одного размера.', 'Сравни числители.']
          : type === 'num' ? ['Числители одинаковые — долей взяли поровну.', 'Где доли крупнее: где целое делили на меньшее число частей?']
          : [`Приведи дроби к общему знаменателю ${L}.`, `${f(a, b)} = ${f(x, L)}, ${f(c, d)} = ${f(y, L)}.`];
        return {
          story: 'Поставь знак между дробями.',
          question: `${f(a, b)} ? ${f(c, d)}`,
          choices: ['<', '=', '>'], answer: sign, accept: 'exact',
          hints,
          solution: type === 'diff' ? `${f(x, L)} ${sign} ${f(y, L)}, значит ${f(a, b)} ${sign} ${f(c, d)}.` : `${f(a, b)} ${sign} ${f(c, d)}.`,
          misc: got => {
            if (!got || got.kind !== 'sign' || got.v === sign) return null;
            if (type === 'num') return 'bigger-denominator-bigger';
            if (type === 'diff' && got.v === (a < c ? '<' : a > c ? '>' : '=')) return 'compare-numerators-only';
            return null;
          },
        };
      }
},
{
  id: "add-same", short: "Одинаковые знаменатели", title: "Сложение и вычитание с одинаковыми знаменателями",
  mistakes: [{"id":"add-denominators","title":"Складывает и знаменатели тоже","say":"Знаменатель — это размер доли. От того, что долей стало больше, они не стали мельче."},{"id":"subtract-denominators","title":"Вычитает и знаменатели","say":"Знаменатель показывает размер доли, он не меняется. Вычитай только числители."}],
  generate(lv) {
        const d = rnd(...L3(lv, [4, 8], [4, 12], [8, 16])), plus = Math.random() < 0.6;
        let a, b;
        if (plus) { a = rnd(1, d - 2); b = rnd(1, d - 1 - a); }
        else { a = rnd(2, d - 1); b = rnd(1, a - 1); }
        const n = plus ? a + b : a - b, op = plus ? '+' : '−';
        return {
          story: plus ? `Утром Оля прошла ${f(a, d)} пути, днём — ещё ${f(b, d)}.` : `В бутылке было ${f(a, d)} литра сока, выпили ${f(b, d)} литра.`,
          question: `${f(a, d)} ${op} ${f(b, d)} = ?`,
          figure: { type: 'bar', parts: d, shaded: plus ? n : a, split: plus ? a : null, crossed: plus ? 0 : b },
          answer: `${n}/${d}`, accept: 'equivalent',
          hints: [`Знаменатели одинаковые — ${plus ? 'сложи' : 'вычти'} только числители.`, `${a} ${op} ${b} = ${n}. Получится ${f(n, d)}${gcd(n, d) > 1 ? ', её можно сократить' : ''}.`],
          figureIsHint: true,
          solution: `${a} ${op} ${b} = ${n}, знаменатель остаётся ${d}: ${f(n, d)}${gcd(n, d) > 1 ? ` = ${fracHtml(n, d)}` : ''}.`,
          misc: got => (plus && is(got, a + b, 2 * d) ? 'add-denominators' : null),
          p: { kind: plus ? 'sum' : 'diff', x: [a, d], y: [b, d] },
        };
      }
},
{
  id: "add-diff", short: "Разные знаменатели", title: "Сложение и вычитание с разными знаменателями",
  mistakes: [{"id":"add-denominators","title":"Складывает числители и знаменатели","say":"Так складывать нельзя: доли разного размера. Сначала приведи к общему знаменателю."},{"id":"forgot-scale-numerators","title":"Привёл знаменатели, но не домножил числители","say":"Когда меняешь знаменатель, числитель надо домножить на тот же множитель."}],
  generate(lv) {
        let b, d;
        const pool = L3(lv, [2, 3, 4, 6, 8, 12], DENOMS, [...DENOMS, 9, 15]), cap = L3(lv, 12, 24, 45);
        do { b = pick(pool); d = pick(pool); } while (b === d || lcm(b, d) > cap || (lv === 1 && b % d && d % b));
        const a = coprime(1, b - 1, b), c = coprime(1, d - 1, d), L = lcm(b, d);
        let A = a, B = b, C = c, D = d, p = a * (L / b), q = c * (L / d);
        let plus = Math.random() < 0.55;
        if (!plus && p === q) plus = true;
        if (!plus && p < q) { [A, B, C, D, p, q] = [C, D, A, B, q, p]; } // уменьшаемое — бо́льшая дробь
        const n = plus ? p + q : p - q, op = plus ? '+' : '−';
        return {
          story: 'Вычисли.',
          question: `${f(A, B)} ${op} ${f(C, D)} = ?`,
          answer: `${n}/${L}`, accept: 'equivalent',
          hints: [`Общий знаменатель для ${B} и ${D} — ${L}.`, `${f(A, B)} = ${f(p, L)}, ${f(C, D)} = ${f(q, L)}.`],
          solution: `${f(p, L)} ${op} ${f(q, L)} = ${f(n, L)}${gcd(n, L) > 1 ? ` = ${fracHtml(n, L)}` : ''}.`,
          misc: got => {
            if (plus && is(got, A + C, B + D)) return 'add-denominators';
            if (got && got.kind === 'frac' && got.d === L && got.n !== n && got.n === (plus ? A + C : A - C)) return 'forgot-scale-numerators';
            return null;
          },
          p: { kind: plus ? 'sum' : 'diff', x: [A, B], y: [C, D] },
        };
      }
},
{
  id: "mixed", short: "Смешанные числа", title: "Смешанные числа",
  mistakes: [{"id":"add-whole-to-numerator","title":"Прибавляет целую часть к числителю","say":"В одной целой не одна доля, а столько, сколько в знаменателе. Целую часть сначала умножь на знаменатель."},{"id":"multiply-whole-numerator","title":"Умножает целую часть на числитель","say":"На знаменатель, а не на числитель: целое содержит столько долей, сколько показывает знаменатель."}],
  generate(lv) {
        const d = rnd(...L3(lv, [2, 5], [2, 9], [5, 12])), w = rnd(...L3(lv, [1, 3], [1, 5], [3, 9]));
        const n = coprime(1, d - 1, d), P = w * d + n;
        if (Math.random() < 0.5) {
          return {
            story: 'Запиши смешанное число в виде неправильной дроби.',
            question: `${w} ${f(n, d)} = ?`,
            answer: `${P}/${d}`, accept: 'fraction', placeholder: 'например, 7/3',
            hints: [`Сколько долей по ${f(1, d)} в ${w} целых?`, `${w} · ${d} = ${w * d}, да ещё ${n}.`],
            solution: `${w} · ${d} + ${n} = ${P}. Ответ: ${f(P, d)}.`,
            misc: got => (is(got, w + n, d) ? 'add-whole-to-numerator' : is(got, w * n, d) ? 'multiply-whole-numerator' : null),
          };
        }
        return {
          story: 'Выдели целую часть: целые впиши в левую клеточку, а оставшуюся дробь — справа.',
          question: `${f(P, d)} = ?`,
          answer: `${w} ${n}/${d}`, accept: 'mixed', placeholder: 'например, 2 1/3',
          hints: [`Раздели ${P} на ${d} с остатком.`, `${P} : ${d} = ${w}, остаток ${n}.`],
          solution: `${P} : ${d} = ${w} (ост. ${n}). Ответ: ${w} ${f(n, d)}.`,
          misc: () => null,
        };
      }
},
{
  id: "mult", short: "Умножение", title: "Умножение дробей",
  mistakes: [{"id":"cross-multiply","title":"Умножает «крест-накрест»","say":"Крест-накрест — это не умножение. Числитель на числитель, знаменатель на знаменатель."},{"id":"multiply-both","title":"Умножает на число и числитель, и знаменатель","say":"Если умножить на число и верх, и низ, дробь не изменится. На натуральное число умножают только числитель."}],
  generate(lv) {
        const [lo, hi] = L3(lv, [2, 5], [2, 9], [4, 12]);
        if (Math.random() < L3(lv, 0.6, 0.35, 0.2)) {
          const d = rnd(Math.max(3, lo), hi + 3), a = rnd(1, d - 1), k = rnd(...L3(lv, [2, 4], [2, 6], [3, 9]));
          return {
            story: 'Вычисли.', question: `${k} · ${f(a, d)} = ?`,
            answer: `${k * a}/${d}`, accept: 'equivalent',
            hints: ['Натуральное число умножаем только на числитель.', `${k} · ${a} = ${k * a}, знаменатель остаётся ${d}.`],
            solution: `${f(k * a, d)}${gcd(k * a, d) > 1 || k * a >= d ? ` = ${fracHtml(k * a, d)}` : ''}.`,
            misc: got => (is(got, k * a, k * d) ? 'multiply-both' : null),
          };
        }
        const b = rnd(lo, hi), d = rnd(lo, hi), a = rnd(1, b - 1), c = rnd(1, d - 1);
        return {
          story: 'Найди произведение.', question: `${f(a, b)} · ${f(c, d)} = ?`,
          answer: `${a * c}/${b * d}`, accept: 'equivalent',
          hints: [`Числитель: ${a} · ${c}, знаменатель: ${b} · ${d}.`, `Получится ${f(a * c, b * d)}${gcd(a * c, b * d) > 1 ? ' — сократи' : ''}.`],
          solution: `${f(a * c, b * d)}${gcd(a * c, b * d) > 1 ? ` = ${fracHtml(a * c, b * d)}` : ''}.`,
          misc: got => (got && got.kind === 'frac' && Math.abs(got.v - (a * d) / (b * c)) < 1e-9 && a * d !== a * c ? 'cross-multiply' : null),
        };
      }
},
{
  id: "div", short: "Деление", title: "Деление дробей",
  mistakes: [{"id":"multiply-instead-of-divide","title":"Умножает, не перевернув делитель","say":"Деление заменяем умножением, только перевернув вторую дробь."},{"id":"flip-first","title":"Переворачивает не ту дробь","say":"Переворачивают делитель — дробь, на которую делят, то есть вторую."}],
  generate(lv) {
        const [lo, hi] = L3(lv, [2, 5], [2, 9], [4, 12]);
        const b = rnd(lo, hi), d = rnd(lo, hi), a = rnd(1, b - 1), c = rnd(1, d - 1);
        const n = a * d, m = b * c;
        return {
          story: 'Вычисли.', question: `${f(a, b)} : ${f(c, d)} = ?`,
          answer: fracStr(n, m), accept: 'equivalent',
          hints: [`Переверни ${f(c, d)}: получится ${f(d, c)}.`, `${f(a, b)} · ${f(d, c)} = ${f(n, m)}.`],
          solution: `${f(a, b)} · ${f(d, c)} = ${f(n, m)}${gcd(n, m) > 1 || n >= m ? ` = ${fracHtml(n, m)}` : ''}.`,
          misc: got => {
            if (!got) return null;
            if (Math.abs(got.v - (a * c) / (b * d)) < 1e-9 && a * c * m !== n * b * d) return 'multiply-instead-of-divide';
            if (Math.abs(got.v - (b * c) / (a * d)) < 1e-9 && b * c * m !== n * a * d) return 'flip-first';
            return null;
          },
        };
      }
},
{
  id: "part-of", short: "Часть и целое", title: "Часть от числа и число по его части",
  mistakes: [{"id":"flip-fraction","title":"Делит на числитель и умножает на знаменатель в прямой задаче","say":"Чтобы найти часть, делим на знаменатель — на сколько частей делим целое."},{"id":"only-one-step","title":"Нашёл одну долю и остановился","say":"Одна доля найдена. Теперь возьми столько долей, сколько в числителе."},{"id":"part-instead-of-whole","title":"В обратной задаче снова ищет часть","say":"Целое больше своей части. Дели на числитель, умножай на знаменатель."}],
  generate(lv) {
        const take = k => `${k} ${pl(k, 'такую часть', 'такие части', 'таких частей')}`;
        const CTX = [
          { min: 12, max: 32, story: (N, fr) => `В классе ${N} ${pl(N, 'ученик', 'ученика', 'учеников')}, ${fr} из них занимаются спортом.`, q: 'Сколько учеников занимаются спортом?' },
          { min: 20, max: 240, story: (N, fr) => `В книге ${N} ${pl(N, 'страница', 'страницы', 'страниц')}. Прочитали ${fr} книги.`, q: 'Сколько страниц прочитали?' },
          { min: 6, max: 120, story: (N, fr) => `В пакете ${N} ${pl(N, 'конфета', 'конфеты', 'конфет')}, ${fr} из них шоколадные.`, q: 'Сколько шоколадных конфет?' },
        ];
        const direct = Math.random() < 0.55, ctx = direct ? pick(CTX) : CTX[1];
        let b, a, unit, tries = 0;
        do {
          b = rnd(...L3(lv, [2, 5], [2, 9], [3, 12])); a = coprime(1, b - 1, b); unit = rnd(...L3(lv, [2, 6], [2, 12], [5, 20]));
        } while ((unit * b < ctx.min || unit * b > ctx.max) && ++tries < 200);
        if (direct) {
          const N = unit * b, ans = unit * a;
          return {
            story: ctx.story(N, f(a, b)),
            question: ctx.q,
            answer: String(ans), accept: 'exact', placeholder: 'число',
            hints: [`Сначала найди ${f(1, b)}: ${N} : ${b}.`, `${f(1, b)} — это ${unit}. Возьми ${take(a)}.`],
            solution: `${N} : ${b} · ${a} = ${ans}.`,
            misc: got => (!got ? null : got.v === unit && a !== 1 ? 'only-one-step' : Math.abs(got.v - (N / a) * b) < 1e-9 ? 'flip-fraction' : null),
            p: { kind: 'part', N, a, b },
          };
        }
        const M = unit * a, whole = unit * b;
        return {
          story: `Прочитали ${M} ${pl(M, 'страницу', 'страницы', 'страниц')} — это ${f(a, b)} книги.`,
          question: 'Сколько страниц во всей книге?',
          answer: String(whole), accept: 'exact', placeholder: 'число',
          hints: [`${a} ${parts(a)} — это ${M}. Сколько приходится на одну часть?`, `Одна часть — ${unit}. А всего частей ${b}.`],
          solution: `${M} : ${a} · ${b} = ${whole}.`,
          misc: got => (!got ? null : got.v === unit && a !== 1 ? 'only-one-step' : Math.abs(got.v - (M / b) * a) < 1e-9 && a !== b ? 'part-instead-of-whole' : null),
          p: { kind: 'whole', M, a, b },
        };
      }
}] };
})();
