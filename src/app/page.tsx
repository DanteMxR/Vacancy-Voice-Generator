import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-3xl font-bold text-center mb-4">Добро пожаловать!</h1>
      <p className="text-lg text-center max-w-xl mb-8">
        Этот инструмент поможет вам быстро и удобно сформировать требования к вакансии с помощью голосовых ответов на простые вопросы.
      </p>
      <Link href="/vacancy" className="bg-black text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-neutral-800 transition-colors">
        Начать формировать вакансию
      </Link>
    </div>
  );
}
