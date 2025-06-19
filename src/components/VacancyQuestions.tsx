import React from 'react';

interface VacancyQuestionsProps {
  questions: string[];
  answers: string[];
  current: number;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onRecord: () => void;
  isRecording: boolean;
}

export const VacancyQuestions: React.FC<VacancyQuestionsProps> = ({
  questions,
  answers,
  current,
  onChange,
  onNext,
  onPrev,
  onRecord,
  isRecording,
}) => (
  <>
    <h1 className="text-2xl font-bold mb-4 text-center">{questions[current]}</h1>
    <textarea
      className="w-full min-h-[100px] border rounded p-2 mb-4"
      value={answers[current]}
      onChange={e => onChange(e.target.value)}
      placeholder="Ваш ответ..."
    />
    <div className="flex gap-2 mb-4 justify-center">
      <button
        className={`px-4 py-2 rounded ${isRecording ? 'bg-red-500 text-white' : 'bg-neutral-200'}`}
        onClick={onRecord}
        type="button"
      >
        {isRecording ? 'Говорите...' : 'Голосовой ввод'}
      </button>
      <button
        className="px-4 py-2 rounded bg-neutral-200"
        onClick={onPrev}
        disabled={current === 0}
        type="button"
      >
        Назад
      </button>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white"
        onClick={onNext}
        type="button"
      >
        {current === questions.length - 1 ? 'Сформировать вакансию' : 'Далее'}
      </button>
    </div>
  </>
); 