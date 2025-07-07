import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { forumCategories } from '@/lib/forums-data';
import { forumTopicsData, Topic } from '@/lib/forum-topics-data';
import { MessageCircle, Eye } from 'lucide-react';

interface ForumPageProps {
  params: {
    categorySlug: string;
    forumSlug: string;
  };
}

export default function ForumPage({ params }: ForumPageProps) {
  const { categorySlug, forumSlug } = params;

  const category = forumCategories.find((cat) => cat.slug === categorySlug);
  if (!category) {
    notFound();
  }

  const forum = category.forums.find((f) => f.slug === forumSlug);
  if (!forum) {
    notFound();
  }

  const topics: Topic[] = forumTopicsData[categorySlug]?.[forumSlug] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{forum.name}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">{forum.description}</p>

      <div className="mb-6">
        <Link href={`/forums/${categorySlug}/${forumSlug}/new`} passHref>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Topic
          </button>
        </Link>
      </div>

      {topics.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No topics yet in this forum. Be the first to create one!</p>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link href={`/forums/${categorySlug}/${forumSlug}/${topic.slug}`} passHref>
                  <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 cursor-pointer">
                    {topic.title}
                  </h2>
                </Link>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Started by {topic.author.name} - Last activity: {topic.lastActivity}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" /> {topic.replies} replies
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" /> {topic.views} views
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
