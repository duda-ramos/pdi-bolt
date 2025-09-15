import React, { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/supabase/profiles';
import AvatarUpload from '../components/common/AvatarUpload';
import { useToast } from '../components/common/Toast';
import { MapPin, Calendar, User, Mail, Award, TrendingUp, Edit3, Save, X, Camera } from 'lucide-react';
import Badge from '../components/common/Badge';

const Profile: React.FC = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [nextObjective, setNextObjective] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    nome: user?.nome || '',
    bio: user?.bio || '',
    localizacao: user?.localizacao || '',
    formacao: user?.formacao || '',
    trilha_id: user?.trilha_id || '',
    avatar: user?.avatar || ''
  });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load salary history
      const salaryData = await profileService.getSalaryHistory(user.id);
      setSalaryHistory(salaryData);
      
      // Load next objective
      const objective = await profileService.getNextObjective(user.id);
      setNextObjective(objective);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      showToast('error', 'Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      nome: user.nome,
      bio: user.bio || '',
      localizacao: user.localizacao || '',
      formacao: user.formacao || '',
      trilha_id: user.trilha_id || '',
      avatar: user.avatar || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(editForm, avatarFile || undefined);
      setIsEditing(false);
      setAvatarFile(null);
      showToast('success', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Erro ao atualizar perfil. Tente novamente.');
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
      trilha_id: user.trilha_id || '',
      avatar: user.avatar || ''
    });
    setAvatarFile(null);
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
                  {isEditing ? (
                    <AvatarUpload
                      currentAvatar={user.avatar}
                      onAvatarChange={setAvatarFile}
                      className="w-20 h-20"
                    />
                  ) : (
                    <img 
                      src={user.avatar}
                      alt={user.nome}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                    />
                  )}
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
                  
                  <h4 className="font-medium text-gray-900 mt-4 mb-2">Trilha de Carreira</h4>
                  {isEditing ? (
                    <select
                      value={editForm.trilha_id}
                      onChange={(e) => setEditForm(prev => ({ ...prev, trilha_id: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Selecionar trilha</option>
                      {/* Aqui você pode buscar as trilhas disponíveis */}
                    </select>
                  ) : (
                    <p className="text-gray-600 text-sm">{user.trilha_id || 'Não definida'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Salary History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico Salarial</h3>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
              <div className="space-y-4">
                {salaryHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          R$ {entry.valor.toLocaleString('pt-BR')}
                        </span>
                        <Badge variant="info">
                          Ajuste Salarial
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {entry.data_fim ? 'Período encerrado' : 'Salário atual'}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.data_inicio).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
                
                {salaryHistory.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>Nenhum histórico salarial encontrado.</p>
                  </div>
                )}
              </div>
              )}
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
              
              {nextObjective ? (
                <>
                  <p className="text-blue-100 mb-4">
                    <span className="font-semibold text-white">{nextObjective.titulo}</span>
                  </p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm text-blue-100 mb-2">Descrição:</p>
                    <p className="text-sm text-white">{nextObjective.descricao}</p>
                    {nextObjective.competencies && (
                      <p className="text-sm text-blue-100 mt-2">
                        Competência: {nextObjective.competencies.nome}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-blue-100">
                  Nenhum objetivo ativo encontrado. Crie um novo objetivo PDI para começar!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;