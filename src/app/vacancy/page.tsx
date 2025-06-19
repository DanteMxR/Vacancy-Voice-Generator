'use client';
import React, { useReducer, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useVacancyGeneration } from "@/hooks/useVacancyGeneration";
import { VacancyQuestions } from "@/components/VacancyQuestions";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { ProgressRing } from "@/components/ProgressRing";
import { QUESTIONS, SECTION_LABELS } from "@/constants/vacancyQuestions";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { ErrorMessage } from "@/components/ErrorMessage";

// Динамический импорт TipTap Editor (SSR off)
const Tiptap = dynamic(() => import("@/components/TiptapEditor"), { ssr: false });

const answersSchema = z.array(z.string()).length(QUESTIONS.length);

// Типы для состояния и экшенов
interface State {
  answers: string[];
  current: number;
  showResult: boolean;
  editorContent: string;
  copied: boolean;
  editMode: boolean;
  validationError: string;
}

type Action =
  | { type: "SET_ANSWER"; index: number; value: string }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SHOW_RESULT" }
  | { type: "SET_EDITOR_CONTENT"; value: string }
  | { type: "SET_COPIED"; value: boolean }
  | { type: "SET_EDIT_MODE"; value: boolean }
  | { type: "SET_ERROR"; value: string }
  | { type: "RESET" };

const initialState: State = {
  answers: Array(QUESTIONS.length).fill(""),
  current: 0,
  showResult: false,
  editorContent: "",
  copied: false,
  editMode: false,
  validationError: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ANSWER": {
      const updated = [...state.answers];
      updated[action.index] = action.value;
      return { ...state, answers: updated };
    }
    case "NEXT":
      return { ...state, current: state.current + 1 };
    case "PREV":
      return { ...state, current: state.current - 1 };
    case "SHOW_RESULT":
      return { ...state, showResult: true, editMode: false };
    case "SET_EDITOR_CONTENT":
      return { ...state, editorContent: action.value };
    case "SET_COPIED":
      return { ...state, copied: action.value };
    case "SET_EDIT_MODE":
      return { ...state, editMode: action.value };
    case "SET_ERROR":
      return { ...state, validationError: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function VacancyPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { answers, current, showResult, editorContent, copied, editMode, validationError } = state;

  // Голосовой ввод
  const { isRecording, start, stop } = useSpeechRecognition(
    useCallback((text: string) => {
      dispatch({ type: "SET_ANSWER", index: current, value: text });
    }, [current])
  );

  // Генерация вакансии через API
  const { generate, loading, error, result } = useVacancyGeneration();

  const handleAnswerChange = useCallback((value: string) => {
    dispatch({ type: "SET_ANSWER", index: current, value });
  }, [current]);

  const handleNext = useCallback(() => {
    if (current < QUESTIONS.length - 1) dispatch({ type: "NEXT" });
    else handleShowResult();
  }, [current, answers]);

  const handlePrev = useCallback(() => {
    if (current > 0) dispatch({ type: "PREV" });
  }, [current]);

  const handleShowResult = useCallback(async () => {
    const parse = answersSchema.safeParse(answers);
    if (!parse.success) {
      dispatch({ type: "SET_ERROR", value: parse.error.errors[0]?.message || "Заполните все поля" });
      return;
    }
    dispatch({ type: "SET_ERROR", value: "" });
    dispatch({ type: "SHOW_RESULT" });
    await generate(answers);
  }, [answers, generate]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(editorContent);
    dispatch({ type: "SET_COPIED", value: true });
    setTimeout(() => dispatch({ type: "SET_COPIED", value: false }), 1500);
  }, [editorContent]);

  const handleEdit = useCallback(() => {
    dispatch({ type: "SET_EDIT_MODE", value: true });
  }, []);

  const handleSave = useCallback((content: string) => {
    dispatch({ type: "SET_EDITOR_CONTENT", value: content });
    dispatch({ type: "SET_EDIT_MODE", value: false });
  }, []);

  const handleRetry = useCallback(async () => {
    await generate(answers);
  }, [answers, generate]);

  useEffect(() => {
    if (showResult && result) {
      dispatch({ type: "SET_EDITOR_CONTENT", value: result });
    }
  }, [showResult, result]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-neutral-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-8">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center mb-6">
                <ProgressRing progress={current / (SECTION_LABELS.length - 1)} size={72} stroke={7} />
                <span className="mt-2 text-sm text-neutral-500">{current + 1} / {SECTION_LABELS.length}</span>
              </div>
              <VacancyQuestions
                questions={SECTION_LABELS}
                answers={answers}
                current={current}
                onChange={handleAnswerChange}
                onNext={handleNext}
                onPrev={handlePrev}
                onRecord={isRecording ? stop : start}
                isRecording={isRecording}
              />
              {validationError && (
                <ErrorMessage message={validationError} className="mt-2" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6">Итоговое описание вакансии</h2>
              <div className="bg-neutral-100 rounded-lg p-6 mb-4 min-h-[200px] prose prose-neutral flex flex-col items-center justify-center">
                {loading ? (
                  <Loader />
                ) : error ? (
                  <div className="flex flex-col items-center justify-center">
                    <ErrorMessage message={error} className="mb-2" />
                    <Button className="bg-blue-600 text-white" onClick={handleRetry} type="button">
                      Повторить
                    </Button>
                  </div>
                ) : editMode ? (
                  <>
                    <Tiptap content={editorContent} onChange={content => dispatch({ type: "SET_EDITOR_CONTENT", value: content })} />
                    <div className="flex gap-2 mt-4">
                      <Button className="bg-blue-600 text-white" onClick={() => handleSave(editorContent)} type="button">
                        Сохранить
                      </Button>
                      <Button className="bg-neutral-200" onClick={() => dispatch({ type: "SET_EDIT_MODE", value: false })} type="button">
                        Отмена
                      </Button>
                    </div>
                  </>
                ) : (
                  <ReactMarkdown
                    components={{
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                    }}
                  >
                    {editorContent}
                  </ReactMarkdown>
                )}
              </div>
              <div className="flex gap-2">
                {!editMode && !loading && !error && (
                  <Button className="bg-neutral-200" onClick={handleEdit} type="button">
                    Редактировать
                  </Button>
                )}
                <Button className="bg-blue-600 text-white" onClick={handleCopy} type="button" disabled={!editorContent || loading}>
                  {copied ? 'Скопировано!' : 'Скопировать текст'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 