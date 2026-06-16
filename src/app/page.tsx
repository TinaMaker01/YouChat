import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { LogoutButton } from '@/components/logout-button';

async function getPosts() {
  const db = await openDb();
  return db.all('SELECT * FROM posts ORDER BY created_at DESC');
}

async function getUser(userId: string) {
  const db = await openDb();
  return db.get('SELECT email FROM users WHERE id = ?', userId);
}

export default async function Home() {
  const session = await getSession();
  const posts = await getPosts();
  const user = session ? await getUser(session.userId) : null;

  async function createPost(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    const db = await openDb();
    await db.run('INSERT INTO posts (title, content) VALUES (?, ?)', title, content);

    revalidatePath('/');
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-zinc-50 font-sans dark:bg-black p-8">
      <div className="w-full max-w-lg flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Simple Blog</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</span>
            <LogoutButton />
          </div>
        )}
      </div>

      <form action={createPost} className="w-full max-w-lg mb-8">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="p-2 rounded-md bg-gray-800 text-white"
            required
          />
          <textarea
            name="content"
            placeholder="Content"
            className="p-2 rounded-md bg-gray-800 text-white h-32"
            required
          ></textarea>
          <button type="submit" className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-white">
            Create Post
          </button>
        </div>
      </form>

      <div className="w-full max-w-lg">
        {posts.map((post: { id: number; title: string; content: string }) => (
          <div key={post.id} className="p-4 mb-4 rounded-md bg-gray-800">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-gray-300">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
