'use client';

import { motion } from 'framer-motion';
import { useFormStatus } from 'react-dom';

interface AnimatedPostFormProps {
  action: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {pending ? 'Creating...' : 'Create Post'}
    </motion.button>
  );
}

export function AnimatedPostForm({ action }: AnimatedPostFormProps) {
  return (
    <motion.form
      action={action}
      className="w-full max-w-lg mb-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-4 p-6 rounded-xl bg-gray-900 border border-gray-800 shadow-xl">
        <h3 className="text-xl font-semibold mb-2">New Post</h3>
        <motion.input
          type="text"
          name="title"
          placeholder="What's the title?"
          required
          className="p-3 rounded-md bg-gray-800 text-white border border-transparent focus:border-blue-500 outline-none transition-all"
          whileFocus={{ scale: 1.01 }}
        />
        <motion.textarea
          name="content"
          placeholder="Write your thoughts..."
          required
          className="p-3 rounded-md bg-gray-800 text-white h-32 border border-transparent focus:border-blue-500 outline-none transition-all resize-none"
          whileFocus={{ scale: 1.01 }}
        ></motion.textarea>
        <SubmitButton />
      </div>
    </motion.form>
  );
}
