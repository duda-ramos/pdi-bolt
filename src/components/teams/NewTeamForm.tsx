import React, { useState } from 'react';
import { Users, X } from 'lucide-react';

interface NewTeamFormProps {
  onSubmit: (teamData: { nome: string; descricao: string }) => void;
  onCancel: () => void;
}

const NewTeamForm: React.FC<NewTeamFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Por favor, insira o nome da equipe.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim()
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">Nova Equipe</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Equipe *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Desenvolvimento Frontend"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o propósito e responsabilidades da equipe..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.descricao.length}/500 caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.nome.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Criando...' : 'Criar Equipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTeamForm;