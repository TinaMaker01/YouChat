'use client';

import { motion } from 'framer-motion';

interface Post {
  id: number;
  title: string;
  content: string;
}

interface AnimatedPostListProps {
  posts: Post[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AnimatedPostList({ posts }: AnimatedPostListProps) {
  return (
    <motion.div
      className="w-full max-w-lg"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {posts.map((post) => (
        <motion.div
          key={post.id}
          className="p-4 mb-4 rounded-md bg-gray-800 border border-gray-700 hover:border-blue-500/50 transition-colors shadow-lg"
          variants={item}
          whileHover={{ scale: 1.02 }}
          layout
        >
          <h2 className="text-2xl font-bold text-blue-400 mb-2">{post.title}</h2>
          <p className="text-gray-300 leading-relaxed">{post.content}</p>
        </motion.div>
      ))}
      {posts.length === 0 && (
        <motion.p
          className="text-center text-gray-500 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No posts yet. Be the first to share something!
        </motion.p>
      )}
    </motion.div>
  );
}
