import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface Diary {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function DiaryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [diary, setDiary] = useState<Diary | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (id) {
      // 从本地存储获取日记
      const savedDiaries = localStorage.getItem('diaries');
      if (savedDiaries) {
        const diaries = JSON.parse(savedDiaries);
        const found = diaries.find(d => d.id === id);
        if (found) {
          setDiary(found);
        }
      }

      // 从本地存储获取评论
      const savedComments = localStorage.getItem(`comments_${id}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    }
  }, [id]);

  const handleComment = (e) => {
    e.preventDefault();
    const username = localStorage.getItem('username');
    if (!username) {
      alert('请先登录');
      return;
    }

    // 创建新评论
    const newComment = {
      id: Date.now().toString(),
      content: comment,
      author: username,
      createdAt: new Date().toISOString()
    };

    // 保存评论
    const updatedComments = [newComment, ...comments];
    localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));
    setComments(updatedComments);
    setComment('');
  };

  if (!diary) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto p-4">
          日记不存在
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <article className="bg-white p-6 rounded-lg shadow mb-8">
          <h1 className="text-3xl font-bold mb-4">{diary.title}</h1>
          <p className="text-gray-600 whitespace-pre-wrap mb-4">{diary.content}</p>
          <div className="text-sm text-gray-500">
            作者: {diary.author} | {new Date(diary.createdAt).toLocaleString()}
          </div>
        </article>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">评论</h2>
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="写下你的评论..."
              rows={3}
              required
            />
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              发表评论
            </button>
          </form>

          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded">
                <p>{comment.content}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {comment.author} | {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}