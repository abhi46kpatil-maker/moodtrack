const assert = require('assert');
const { dayDifference, parseDate, formatDate } = require('./services/stressEngine');

console.log('Testing stressEngine helper functions...');

// Test 1: Day difference
assert.strictEqual(dayDifference('2026-09-01', '2026-09-02'), 1, 'Adjacent days should diff to 1');
assert.strictEqual(dayDifference('2026-09-01', '2026-09-03'), 2, 'Gap day should diff to 2');
assert.strictEqual(dayDifference('2026-08-31', '2026-09-01'), 1, 'Month transition should diff to 1');

// Test 2: Sequence detection logic simulation
function detectHighStressSequences(items) {
  const highStressSequences = [];
  let currentSeq = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.stress_level >= 4) {
      if (currentSeq.length === 0) {
        currentSeq.push(item);
      } else {
        const prev = currentSeq[currentSeq.length - 1];
        const diff = dayDifference(prev.date, item.date);
        if (diff === 1) {
          currentSeq.push(item);
        } else {
          if (currentSeq.length >= 3) {
            highStressSequences.push([...currentSeq]);
          }
          currentSeq = [item];
        }
      }
    } else {
      if (currentSeq.length >= 3) {
        highStressSequences.push([...currentSeq]);
      }
      currentSeq = [];
    }
  }

  if (currentSeq.length >= 3) {
    highStressSequences.push([...currentSeq]);
  }

  return highStressSequences;
}

// Case 1: 4 -> 5 -> 4 consecutive
const case1 = [
  { date: '2026-09-01', stress_level: 4 },
  { date: '2026-09-02', stress_level: 5 },
  { date: '2026-09-03', stress_level: 4 }
];
const res1 = detectHighStressSequences(case1);
assert.strictEqual(res1.length, 1, '4 -> 5 -> 4 must be FLAGGED');
assert.strictEqual(res1[0].map(x => x.stress_level).join(' → '), '4 → 5 → 4');

// Case 2: 5 -> 5 -> 5 consecutive
const case2 = [
  { date: '2026-09-01', stress_level: 5 },
  { date: '2026-09-02', stress_level: 5 },
  { date: '2026-09-03', stress_level: 5 }
];
const res2 = detectHighStressSequences(case2);
assert.strictEqual(res2.length, 1, '5 -> 5 -> 5 must be FLAGGED');

// Case 3: 4 -> 4 -> 5 consecutive
const case3 = [
  { date: '2026-09-01', stress_level: 4 },
  { date: '2026-09-02', stress_level: 4 },
  { date: '2026-09-03', stress_level: 5 }
];
const res3 = detectHighStressSequences(case3);
assert.strictEqual(res3.length, 1, '4 -> 4 -> 5 must be FLAGGED');

// Case 4: 4 -> 5 -> 3 (3 breaks high-stress)
const case4 = [
  { date: '2026-09-01', stress_level: 4 },
  { date: '2026-09-02', stress_level: 5 },
  { date: '2026-09-03', stress_level: 3 }
];
const res4 = detectHighStressSequences(case4);
assert.strictEqual(res4.length, 0, '4 -> 5 -> 3 must NOT be flagged');

// Case 5: 4 on Monday (Sep 1), 5 on Wednesday (Sep 3), 4 on Friday (Sep 5) - gaps break streak
const case5 = [
  { date: '2026-09-01', stress_level: 4 },
  { date: '2026-09-03', stress_level: 5 },
  { date: '2026-09-05', stress_level: 4 }
];
const res5 = detectHighStressSequences(case5);
assert.strictEqual(res5.length, 0, 'Non-consecutive dates must NOT be flagged');

console.log('✅ All stressEngine test cases PASSED perfectly!');
