import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, User, Mail, Award, TrendingUp, Edit3, Save, X, Camera } from 'lucide-react';
import Badge from '../components/common/Badge';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: user?.nome || '',
    bio: user?.bio || '',
    localizacao: user?.localizacao || '',
    formacao: user?.formacao || '',
    avatar: user?.avatar || ''
  });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleEdit = () => {
    setEditForm({
      nome: user.nome,
      bio: user.bio || '',
      localizacao: user.localizacao || '',
      formacao: user.formacao || '',
      avatar: user.avatar || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      nome: user.nome,
      bio: user.bio || '',
      localizacao: user.localizacao || '',
      formacao: user.formacao || '',
      avatar: user.avatar || ''
    });
  };

  const calculateTenure = () => {
    if (!user.data_admissao) return 'Não informado';
    
    const admissionDate = new Date(user.data_admissao);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - admissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''}, ${months} mes${months !== 1 ? 'es' : ''}`;
    }
    return `${months} mes${months !== 1 ? 'es' : ''}`;
  };

  const salaryHistory = [
    { date: user?.data_admissao || '2021-06-01', amount: 4000, type: 'Contratação', description: 'Salário inicial' }
  ];

  return (
    <div>
      <Header 
        title="Meu Perfil"
        subtitle="Informações pessoais e profissionais"
      />
      
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img 
                      src={user.avatar}
                      alt={user.nome}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                    />
                    {isEditing && (
                      <button
                        onClick={() => {
                          const newAvatar = prompt('URL da nova foto de perfil:', editForm.avatar);
                          if (newAvatar !== null) {
                            setEditForm(prev => ({ ...prev, avatar: newAvatar }));
                          }
                        }}
                        className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.nome}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
                        className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 bg-transparent focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">{user.nome}</h2>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="info">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                      <Badge variant={user.status === 'ativo' ? 'success' : 'error'}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Edit Button */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar Perfil</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.localizacao}
                        onChange={(e) => setEditForm(prev => ({ ...prev, localizacao: e.target.value }))}
                        placeholder="Sua localização"
                        className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span>{user.localizacao || 'Não informado'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Contratado em {user.data_admissao ? new Date(user.data_admissao).toLocaleDateString('pt-BR') : 'Não informado'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Biografia</h4>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Conte um pouco sobre você..."
                      rows={3}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{user.bio || 'Não informado'}</p>
                  )}
                  
                  <h4 className="font-medium text-gray-900 mt-4 mb-2">Formação</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.formacao}
                      onChange={(e) => setEditForm(prev => ({ ...prev, formacao: e.target.value }))}
                      placeholder="Sua formação acadêmica"
                      className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{user.formacao || 'Não informado'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Salary History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico Salarial</h3>
              
              <div className="space-y-4">
                {salaryHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          R$ {entry.amount.toLocaleString('pt-BR')}
                        </span>
                        <Badge variant={entry.type === 'Promoção' ? 'success' : 'info'}>
                          {entry.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tempo na empresa</span>
                  <span className="font-medium text-gray-900">{calculateTenure()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Último feedback</span>
                  <span className="font-medium text-gray-900">
                    {user.updated_at ? `${Math.floor((Date.now() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24))} dias atrás` : 'Nunca'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Próxima avaliação</span>
                  <span className="font-medium text-gray-900">Em 2 semanas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Perfil atualizado</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Career Goal */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Próximo Objetivo</h3>
              </div>
              <p className="text-blue-100 mb-4">
                Evoluir para <span className="font-semibold text-white">Desenvolvedor Sênior</span>
              </p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-sm text-blue-100 mb-2">Competências necessárias:</p>
                <ul className="text-sm space-y-1">
                  <li>• Liderança técnica (6/10)</li>
                  <li>• Arquitetura de software (5/10)</li>
                  <li>• Mentoria (4/10)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;