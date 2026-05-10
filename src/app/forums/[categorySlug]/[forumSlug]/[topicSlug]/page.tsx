import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageCircle, ArrowLeft } from 'lucide-react';
import { forumTopicsData, Topic, Post } from '@/lib/forum-topics-data';
import { forumCategories } from '@/lib/forums-data';

interface TopicPageProps {
  params: Promise<{ categorySlug: string; forumSlug: string; topicSlug: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { categorySlug, forumSlug, topicSlug } = await params;

  const category = forumCategories.find((cat) => cat.slug === categorySlug);
  if (!category) {
    notFound();
  }

  const forum = category.forums.find((f) => f.slug === forumSlug);
  if (!forum) {
    notFound();
  }

  const topicsInForum = forumTopicsData[categorySlug]?.[forumSlug] || [];
  const topic = topicsInForum.find((t) => t.slug === topicSlug);

  if (!topic) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/forums/${categorySlug}/${forumSlug}`} passHref>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {forum.name}
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{topic.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Started by {topic.author.name} - {topic.views} views - {topic.replies} replies
        </p>
      </div>

      <div className="space-y-6">
        {topic.posts.map((post) => (
          <Card key={post.id} className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6 flex space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-500">
                  <ThumbsUp className="h-5 w-5" />
                </Button>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{post.upvotes - post.downvotes}</span>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                  <ThumbsDown className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
                    {post.author.isModerator && (
                      <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">Moderator</Badge>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">{post.createdAt}</p>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">Reply to Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Write your reply here..." rows={5} className="mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600" />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Post Reply
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
