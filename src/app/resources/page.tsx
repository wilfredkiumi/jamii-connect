import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resources } from '@/lib/resources-data';
import { FileText, Download, ExternalLink, Lock } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-display text-4xl font-bold text-[var(--clay)] dark:text-[var(--clay-50)] mb-8 text-center">Community Resources & Templates</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center">
                {resource.type === 'document' && <FileText className="mr-2 h-5 w-5 text-blue-500" />}
                {resource.type === 'template' && <Download className="mr-2 h-5 w-5 text-green-500" />}
                {resource.type === 'link' && <ExternalLink className="mr-2 h-5 w-5 text-purple-500" />}
                {resource.title}
                {resource.adminOnly && (
                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-600">
                    <Lock className="h-3 w-3 mr-1" /> Admin Only
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--clay-600)] dark:text-[var(--clay-300)] mb-4">{resource.description}</p>
              <div className="flex justify-between items-center text-sm text-[var(--clay-500)] dark:text-[var(--clay-400)]">
                <span>Category: {resource.category}</span>
                <Link href={resource.link} className="text-[var(--terracotta)] hover:text-[var(--terracotta-light)] dark:text-[var(--terracotta-light)] dark:hover:text-[var(--clay-200)] flex items-center">
                    Access Resource <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
