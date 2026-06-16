import { revalidatePath } from 'next/cache';
import { AnimatedPostList } from '@/components/animated-post-list';
import { AnimatedPostForm } from '@/components/animated-post-form';

async function getPosts() {
  const res = await fetch('http://localhost:3000/api/posts', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export default async function Home() {
  const posts = await getPosts();

  async function createPost(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    const res = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      throw new Error('Failed to create post');
    }

    revalidatePath('/');
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-zinc-50 font-sans dark:bg-black text-white p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Modern Blog
        </h1>
        <p className="text-gray-400">Share your thoughts with the world</p>
      </header>

      <AnimatedPostForm action={createPost} />

      <div className="w-full max-w-lg mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold border-l-4 border-blue-500 pl-3">Recent Posts</h2>
        <span className="text-sm text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </span>
      </div>

      <AnimatedPostList posts={posts} />
    </div>
  );
}
