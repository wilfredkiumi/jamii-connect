import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/lib/blog-posts';

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Blogs & Stories</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out">
            <Link href={`/blog/${post.slug}`} passHref>
              <div className="relative w-full h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-600">{post.category}</Badge>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  By {post.author} on {post.date}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                  {/* Display a snippet of the content */}
                  {post.content.substring(0, 150)}...
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
