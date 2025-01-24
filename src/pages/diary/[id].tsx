import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

interface Diary {
  id: string;
  title: string;
  content: string;
  user_id: string;
  profiles?: {
    email: string;
  };
}

const DiaryDetail = () => {
  const router = useRouter();
  const { user } = useUser();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果用户未登录，重定向到首页
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchDiary() {
      if (!router.isReady) return;
      const { id } = router.query;

      try {
        setError(null);
        console.log('开始获取日记详情...');

        // 分开查询日记内容和用户信息
        const { data: diaryData, error: diaryError } = await supabase
          .from('diaries')
          .select('*')
          .eq('id', id)
          .single();

        if (diaryError) {
          console.error('获取日记详情错误:', diaryError);
          throw new Error(`获取日记失败: ${diaryError.message}`);
        }

        if (diaryData) {
          // 获取作者信息
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', diaryData.user_id)
            .single();

          if (userError) {
            console.error('获取作者信息错误:', userError);
            // 即使获取作者信息失败，也继续显示日记
            setDiary({
              ...diaryData,
              profiles: { email: '未知用户' }
            });
          } else {
            setDiary({
              ...diaryData,
              profiles: userData
            });
          }
        } else {
          throw new Error('日记不存在');
        }
      } catch (err: any) {
        console.error('完整错误:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDiary();
  }, [router.isReady, router.query]);

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
            href="/"
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            返回首页
          </Link>
        </main>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <div className="text-center py-8">
            <div className="text-gray-500">日记不存在</div>
            <Link 
              href="/"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600"
            >
              返回首页
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <article className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <Link 
              href="/"
              className="text-blue-500 hover:text-blue-600"
            >
              ← 返回列表
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{diary.title}</h1>
          
          <div className="flex justify-between text-sm text-gray-500 mb-6">
            <span>作者: {diary.profiles?.email}</span>
            <span>{new Date(diary.created_at).toLocaleString('zh-CN')}</span>
          </div>
          
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{diary.content}</p>
          </div>

          {user?.id === diary.user_id && (
            <div className="mt-6 flex space-x-4">
              <Link
                href={`/diary/edit/${diary.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                编辑
              </Link>
              <button
                onClick={async () => {
                  if (confirm('确定要删除这篇日记吗？')) {
                    try {
                      const { error } = await supabase
                        .from('diaries')
                        .delete()
                        .eq('id', diary.id);
                      
                      if (error) throw error;
                      router.push('/');
                    } catch (error) {
                      console.error('Error deleting diary:', error);
                      alert('删除日记失败');
                    }
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                删除
              </button>
            </div>
          )}
        </article>
      </main>
    </div>
  );
};

export default DiaryDetail;