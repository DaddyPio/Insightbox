'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Note } from '@/lib/supabase/types';
import { format } from 'date-fns';

export default function CardPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editable fields
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editSummary, setEditSummary] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchNote(params.id as string);
    }
  }, [params.id]);

  const fetchNote = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${id}`);
      if (!response.ok) throw new Error('Note not found');

      const data = await response.json();
      setNote(data.note);
      
      // Initialize edit fields
      setEditTitle(data.note.title);
      setEditContent(data.note.content);
      setEditTags(data.note.tags || []);
      setEditSummary(data.note.summary || '');

      // Fetch related notes
      const relatedResponse = await fetch(`/api/notes/${id}/related`);
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        setRelatedNotes(relatedData.notes || []);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      router.push('/cards');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!note) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          tags: editTags,
          summary: editSummary,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update note');
      }

      const data = await response.json();
      setNote(data.note);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!note) return;
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditSummary(note.summary || '');
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!note) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      router.push('/cards');
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-wood-300 border-t-accent rounded-full animate-spin"></div>
        <p className="mt-4 text-wood-600">Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-wood-600 text-lg">Note not found.</p>
        <Link href="/cards" className="text-accent hover:underline mt-2 inline-block">
          Back to Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        href="/cards"
        className="inline-flex items-center text-wood-600 hover:text-wood-800 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Cards
      </Link>

      {/* Main Card */}
      <div className="card mb-8">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-3xl font-serif font-bold text-wood-800 bg-transparent border-b-2 border-wood-300 focus:border-accent focus:outline-none w-full"
              />
            ) : (
              <h1 className="text-3xl font-serif font-bold text-wood-800">
                {note.title}
              </h1>
            )}
            <div className="flex gap-2 ml-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-wood-600 hover:text-wood-800 p-2"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-green-600 hover:text-green-800 p-2 disabled:opacity-50"
                    title="Save"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="text-wood-600 hover:text-wood-800 p-2 disabled:opacity-50"
                    title="Cancel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-wood-500">
            {format(new Date(note.created_at), 'MMMM d, yyyy • h:mm a')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="prose max-w-none mb-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-wood-50 min-h-[200px] resize-y"
              rows={8}
            />
          ) : (
            <p className="text-wood-700 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          {isEditing ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {editTags.map((tag, idx) => (
                  <span key={idx} className="tag flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-wood-600 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="input-field flex-1"
                />
                <button
                  onClick={addTag}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm mb-6 pb-6 border-b border-wood-200">
          {note.topic && (
            <div>
              <span className="text-wood-500">Topic:</span>{' '}
              <span className="font-medium text-wood-700">{note.topic}</span>
            </div>
          )}
          {note.emotion && (
            <div>
              <span className="text-wood-500">Emotion:</span>{' '}
              <span className="font-medium text-wood-700 italic">{note.emotion}</span>
            </div>
          )}
        </div>

        {/* AI Summary */}
        <div className="bg-wood-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-wood-800 mb-2">AI Summary</h3>
          {isEditing ? (
            <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full px-4 py-2 border border-wood-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white min-h-[100px] resize-y"
              rows={4}
            />
          ) : (
            <p className="text-wood-700">{note.summary || 'No summary available'}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isEditing && (
            <Link
              href={`/share/${note.id}`}
              className="btn-primary inline-block"
            >
              Generate Share Image
            </Link>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-wood-800 mb-4">Delete Note?</h3>
            <p className="text-wood-600 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Notes */}
      {relatedNotes.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-bold text-wood-800 mb-4">
            Related Notes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedNotes.map(relatedNote => (
              <Link
                key={relatedNote.id}
                href={`/card/${relatedNote.id}`}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="font-serif font-semibold text-wood-800 mb-2">
                  {relatedNote.title}
                </h3>
                <p className="text-wood-600 text-sm line-clamp-2 mb-2">
                  {relatedNote.content}
                </p>
                <div className="flex items-center justify-between text-xs text-wood-500">
                  <span>{relatedNote.topic}</span>
                  <span>{format(new Date(relatedNote.created_at), 'MMM d, yyyy')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

