import { ChapterAttempts, GATE_MS, chapterStatus, firstLockedChapter, officialAnswer, submitAnswer } from './quiz-attempt.service';

const key = { courseId: 'c', chapterId: 'ch1' };
const T0 = Date.parse('2026-01-01T10:00:00Z');

function answerAll(rights: boolean[], at = T0, prev?: ChapterAttempts) {
  let rec = prev;
  rights.forEach((r, i) => { rec = submitAnswer(rec, key, i, rights.length, [i], r, at + i).next; });
  return rec!;
}

describe('quiz attempts', () => {
  it('keeps the first answer and ignores any later one', () => {
    const first = submitAnswer(undefined, key, 0, 2, [1], false, T0);
    expect(first.accepted).toBeTrue();
    const again = submitAnswer(first.next, key, 0, 2, [0], true, T0 + 1000);
    expect(again.accepted).toBeFalse();
    expect(again.next.rounds[0].answers[0].right).toBeFalse();
    expect(officialAnswer(again.next, 0, T0 + 2000)?.picked).toEqual([1]);
  });

  it('completes the round when every question is answered and computes the score', () => {
    const rec = answerAll([true, true, false, true]);
    const r = rec.rounds[0];
    expect(r.score).toBe(0.75);
    expect(r.passed).toBeTrue();
    expect(chapterStatus(rec, T0 + 1000)).toEqual(jasmine.objectContaining({ kind: 'passed' }));
  });

  it('is still open while questions are missing', () => {
    const rec = submitAnswer(undefined, key, 0, 3, [0], true, T0).next;
    expect(chapterStatus(rec, T0)).toEqual({ kind: 'open', answered: 1 });
  });

  it('fails below 70 % and allows a retake only after 24 hours, as a new round that keeps the old one', () => {
    const rec = answerAll([true, false]);
    expect(rec.rounds[0].passed).toBeFalse();
    expect(chapterStatus(rec, T0 + GATE_MS - 1000).kind).toBe('failed');
    // too early: the answer is not accepted
    expect(submitAnswer(rec, key, 0, 2, [0], true, T0 + GATE_MS - 1000).accepted).toBeFalse();
    // after the wait: a new round starts, the first one stays as history
    const later = T0 + GATE_MS + 5000;
    expect(officialAnswer(rec, 0, later)).toBeUndefined();
    const retake = submitAnswer(rec, key, 0, 2, [0], true, later);
    expect(retake.accepted).toBeTrue();
    expect(retake.next.rounds.length).toBe(2);
    expect(retake.next.rounds[0].answers[1].right).toBeFalse();
  });

  it('a passed round is final: nothing can be replaced', () => {
    const rec = answerAll([true, true]);
    expect(submitAnswer(rec, key, 0, 2, [3], false, T0 + 10 * GATE_MS).accepted).toBeFalse();
  });

  it('opens the next chapter right after the quiz is passed, and keeps it closed after a failure', () => {
    const chapters = [{ id: 'ch1', quizzes: 2 }, { id: 'ch2', quizzes: 0 }, { id: 'ch3', quizzes: 0 }];
    const passed = answerAll([true, true]);
    expect(firstLockedChapter(chapters, id => (id === 'ch1' ? passed : undefined), T0 + 1000)).toBe(3);
    const failed = answerAll([true, false]);
    expect(firstLockedChapter(chapters, id => (id === 'ch1' ? failed : undefined), T0 + 1000)).toBe(1);
    expect(firstLockedChapter(chapters, id => (id === 'ch1' ? failed : undefined), T0 + GATE_MS + 1000)).toBe(1); // retake still needed
    expect(firstLockedChapter(chapters, () => undefined, T0)).toBe(1);
  });

  it('never blocks on chapters without quiz, but blocks when a quiz was not passed', () => {
    const chapters = [{ id: 'a', quizzes: 0 }, { id: 'b', quizzes: 1 }, { id: 'c', quizzes: 0 }];
    expect(firstLockedChapter(chapters, () => undefined, T0)).toBe(2);
    expect(firstLockedChapter([{ id: 'a', quizzes: 0 }, { id: 'b', quizzes: 0 }], () => undefined, T0)).toBe(2);
  });
});
