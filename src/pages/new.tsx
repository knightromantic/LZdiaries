import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

export default function NewDiary() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('diaries')
        .insert([
          { title, content, user_id: user.id }
        ]);

      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error creating diary:', error);
      alert('创建日记失败，请重试');
    }
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