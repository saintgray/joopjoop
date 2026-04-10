import { NewItemForm } from "./new-item-form";

export default function NewItemPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">새 글 등록</h1>
      <p className="mt-2 text-sm text-zinc-600">
        사진 + 위치 + 시간을 입력하면 유사 글을 자동 추천합니다.
      </p>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white/90 p-5 text-zinc-900 shadow-sm">
        <NewItemForm />
      </div>
    </main>
  );
}

