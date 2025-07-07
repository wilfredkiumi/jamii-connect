import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { forumCategories } from '@/lib/forums-data';

export default function ForumsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Community Forums</h1>

      {forumCategories.map((category) => (
        <div key={category.id} className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{category.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{category.description}</p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {category.forums.map((forum) => (
              <Card key={forum.id} className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <CardHeader>
                  <CardTitle>
                    <Link href={`/forums/${category.slug}/${forum.slug}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                      {forum.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{forum.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Posts: {forum.postCount}</span>
                    <span>Last Activity: {forum.lastActivity}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="my-8" />
        </div>
      ))}
    </div>
  );
}