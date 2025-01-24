import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../components/Navbar';
import { useUser } from '../../../contexts/UserContext';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

interface Diary {
  id: string;
  title: string;
  content: string;
  user_id: string;
}

const EditDiary = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchDiary() {
      if (!id || !user) return;

      try {
        setError(null);
        const { data, error } = await supabase
          .from('diaries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // 检查是否是作者
          if (data.user_id !== user.id) {
            throw new Error('你没有权限编辑这篇日记');
          }

          setDiary(data);
          setTitle(data.title);
          setContent(data.content);
        } else {
          throw new Error('日记不存在');
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDiary();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diary || !user) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('diaries')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', diary.id)
        .eq('user_id', user.id);

      if (error) throw error;

      router.push(`/diary/${diary.id}`);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
      setSaving(false);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <div className="text-center py-8">
            <div className="text-gray-500">正在加载...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            错误: {error}
          </div>
          <Link 
            href={`/diary/${id}`}
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            返回日记
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <Link 
            href={`/diary/${id}`}
            className="text-blue-500 hover:text-blue-600"
          >
            ← 返回日记
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h1 className="text-2xl font-bold mb-4">编辑日记</h1>
          
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

          <div className="flex justify-end space-x-4">
            <Link
              href={`/diary/${id}`}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditDiary;