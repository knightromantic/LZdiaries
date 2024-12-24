import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

export default function NewDiary() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 获取当前用户
    const username = localStorage.getItem('username');
    if (!username) {
      alert('请先登录');
      return;
    }

    // 获取现有日记
    const savedDiaries = localStorage.getItem('diaries');
    const diaries = savedDiaries ? JSON.parse(savedDiaries) : [];

    // 创建新日记
    const newDiary = {
      id: Date.now().toString(),
      title,
      content,
      author: username,
      createdAt: new Date().toISOString()
    };

    // 保存日记
    localStorage.setItem('diaries', JSON.stringify([newDiary, ...diaries]));

    // 返回首页
    router.push('/');
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            发布
          </button>
        </form>
      </div>
    </div>
  );
}