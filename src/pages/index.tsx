import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

interface Diary {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function Home() {
  const [diaries, setDiaries] = useState<Diary[]>([]);

  useEffect(() => {
    // 从本地存储获取日记
    const savedDiaries = localStorage.getItem('diaries');
    if (savedDiaries) {
      setDiaries(JSON.parse(savedDiaries));
    }
  }, []);

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        {diaries.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            还没有任何日记，快来写第一篇吧！
          </div>
        ) : (
          <div className="space-y-6">
            {diaries.map(diary => (
              <div key={diary.id} className="bg-white p-6 rounded-lg shadow">
                <Link href={`/diary/${diary.id}`}>
                  <h2 className="text-xl font-bold mb-2">{diary.title}</h2>
                </Link>
                <p className="text-gray-600">{diary.content.substring(0, 200)}...</p>
                <div className="mt-4 text-sm text-gray-500">
                  作者: {diary.author} | {new Date(diary.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}