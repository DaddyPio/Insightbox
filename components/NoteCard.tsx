import Link from 'next/link';
import type { Note } from '@/lib/supabase/types';
import { format } from 'date-fns';

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/card/${note.id}`}>
      <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <h3 className="text-xl font-serif font-semibold text-wood-800 mb-2">
          {note.title}
        </h3>
        <p className="text-wood-600 mb-4 line-clamp-3">
          {note.content}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {note.tags && note.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-wood-500">
          <div className="flex items-center space-x-4">
            {note.topic && (
              <span className="font-medium">{note.topic}</span>
            )}
            {note.emotion && (
              <span className="italic">{note.emotion}</span>
            )}
          </div>
          <span>{format(new Date(note.created_at), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </Link>
  );
}

