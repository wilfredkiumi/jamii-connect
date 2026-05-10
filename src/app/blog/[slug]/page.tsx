import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { blogPosts } from '@/lib/blog-posts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/blog" passHref>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
        By {post.author} on {post.date} - Category: {post.category}
      </p>

      <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          layout="fill"
          objectFit="cover"
        />
      </div>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
}
