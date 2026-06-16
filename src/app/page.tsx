import { revalidatePath } from 'next/cache';

async function getPosts() {
  //This is a temporary solution to get posts. We will replace this with a proper API call later.
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
      <h1 className="text-4xl font-bold mb-8">Simple Blog</h1>
      <form action={createPost} className="w-full max-w-lg mb-8">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="p-2 rounded-md bg-gray-800 text-white"
          />
          <textarea
            name="content"
            placeholder="Content"
            className="p-2 rounded-md bg-gray-800 text-white h-32"
          ></textarea>
          <button type="submit" className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors">
            Create Post
          </button>
        </div>
      </form>

      <div className="w-full max-w-lg">
        {posts.map((post: { id: number; title: string; content: string }) => (
          <div key={post.id} className="p-4 mb-4 rounded-md bg-gray-800">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
