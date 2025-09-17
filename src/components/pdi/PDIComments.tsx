import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../common/Badge';

interface Comment {
  id: string;
  objective_id: string;
  user_id: string;
  comentario: string;
  created_at: string;
  user_name?: string;
  user_role?: string;
}

interface PDICommentsProps {
  objectiveId: string;
}

const PDIComments: React.FC<PDICommentsProps> = ({ objectiveId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (objectiveId) {
      fetchComments();
    }
  }, [objectiveId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Single query with join to get comments and user data
      const { data, error: fetchError } = await supabase
        .from('pdi_comments')
        .select(`
          *,
          profiles!pdi_comments_user_id_fkey(nome, role)
        `)
        .eq('objective_id', objectiveId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Process comments with user data from join
      const enrichedComments = (data || []).map(comment => ({
        ...comment,
        user_name: comment.profiles?.nome || 'Usuário Desconhecido',
        user_role: comment.profiles?.role || 'colaborador'
      }));

      setComments(enrichedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    
    try {
      const { data, error: insertError } = await supabase
        .from('pdi_comments')
        .insert({
          objective_id: objectiveId,
          user_id: user.id,
          comentario: newComment.trim()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add the new comment to the list with user data
      const newCommentWithUser: Comment = {
        ...data,
        user_name: user.nome,
        user_role: user.role
      };

      setComments(prev => [...prev, newCommentWithUser]);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Erro ao enviar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      const { error } = await supabase
        .from('pdi_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Erro ao excluir comentário. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'error' as const;
      case 'gestor': return 'warning' as const;
      case 'rh': return 'info' as const;
      default: return 'neutral' as const;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comentários ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {comment.user_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{comment.user_name}</span>
                    <Badge variant={getRoleBadgeVariant(comment.user_role || 'colaborador')} size="sm">
                      {comment.user_role?.charAt(0).toUpperCase() + comment.user_role?.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                </div>
              </div>
              
              {user?.id === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Excluir comentário"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-gray-700 ml-11">{comment.comentario}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Nenhum comentário ainda.</p>
            <p className="text-sm">Seja o primeiro a comentar!</p>
          </div>
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="border-t border-gray-200 pt-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {user?.nome?.charAt(0) || 'U'}
            </span>
          </div>
          
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={submitting}
            />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                {newComment.length}/500 caracteres
              </span>
              
              <button
                type="submit"
                disabled={!newComment.trim() || submitting || newComment.length > 500}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Enviando...' : 'Comentar'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PDIComments;