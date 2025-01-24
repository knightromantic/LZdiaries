import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Auth from '../components/Auth';
import Navbar from '../components/Navbar';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
}

interface Diary {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: Profile;
}

const Home: NextPage = () => {
  const { user, loading: userLoading } = useUser();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDiaries() {
      try {
        setError(null);
        console.log('开始获取日记列表...');

        const { data, error } = await supabase
          .from('diaries')
          .select(`
            id,
            title,
            content,
            created_at,
            user_id
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('获取日记列表错误:', error);
          throw new Error(`获取日记失败: ${error.message}`);
        }

        if (data && data.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', data.map(d => d.user_id));

          if (userError) {
            console.error('获取用户信息错误:', userError);
            throw new Error(`获取用户信息失败: ${userError.message}`);
          }

          const diariesWithUser = data.map(diary => ({
            ...diary,
            profiles: userData?.find(u => u.id === diary.user_id)
          }));

          console.log('成功获取日记:', diariesWithUser);
          setDiaries(diariesWithUser);
        } else {
          setDiaries([]);
        }
      } catch (err: any) {
        console.error('完整错误:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDiaries();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <div className="text-center py-8">
            <div className="text-gray-500">正在加载用户信息...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        {!user ? (
          <Auth />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">日记列表</h1>
              <Link
                href="/new"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                写新日记
              </Link>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                错误: {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">正在加载日记列表...</div>
              </div>
            ) : diaries.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                还没有任何日记，快来写第一篇吧！
              </div>
            ) : (
              <div className="grid gap-6">
                {diaries.map((diary) => (
                  <div
                    key={diary.id}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <Link href={`/diary/${diary.id}`}>
                      <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                        {diary.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {diary.content}
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>作者: {diary.profiles?.email}</span>
                      <span>
                        {new Date(diary.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;