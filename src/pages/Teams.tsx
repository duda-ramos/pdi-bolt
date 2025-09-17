import React, { useState, useEffect } from 'react';
import { Users, Plus, Calendar, FileText, MessageSquare, Star, Award, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import NewTeamForm from '../components/teams/NewTeamForm';
import Header from '../components/Layout/Header';

interface Team {
  id: string;
  nome: string;
  descricao: string | null;
  created_by: string;
  created_at: string;
  leader_name?: string;
  member_count?: number;
}

interface TeamMember {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  role: string;
  time_id: string | null;
  team_name?: string;
}

const Teams: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setError(null);
      
      // Single query with joins to get teams, leaders, and member counts
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          nome,
          descricao,
          created_by,
          created_at,
          profiles!teams_created_by_fkey(nome)
        `)
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Get member counts for all teams in a single query
      const teamIds = (teamsData || []).map(team => team.id);
      const { data: memberCounts } = await supabase
        .from('profiles')
        .select('time_id')
        .in('time_id', teamIds)
        .not('time_id', 'is', null);

      // Count members by team
      const memberCountsByTeam = (memberCounts || []).reduce((acc, member) => {
        acc[member.time_id] = (acc[member.time_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Process teams with leader names and member counts
      const teamsWithLeaders = (teamsData || []).map(team => ({
        ...team,
        leader_name: team.profiles?.nome || 'Não informado',
        member_count: memberCountsByTeam[team.id] || 0
      }));

      setTeams(teamsWithLeaders);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Erro ao carregar equipes');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Single query with join to get members and their team names
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          nome,
          email,
          role,
          time_id,
          teams!profiles_time_id_fkey(nome)
        `)
        .not('time_id', 'is', null);

      if (membersError) throw membersError;

      // Process members with team names from the join
      const membersWithTeams = (membersData || []).map(member => ({
        ...member,
        team_name: member.teams?.nome || 'Equipe não encontrada'
      }));

      setTeamMembers(membersWithTeams);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Erro ao carregar membros das equipes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamData: { nome: string; descricao: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          nome: teamData.nome,
          descricao: teamData.descricao,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de equipes
      await fetchTeams();
      setShowNewTeamForm(false);
      alert('Equipe criada com sucesso!');
    } catch (err) {
      console.error('Error creating team:', err);
      alert('Erro ao criar equipe. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div>
        <Header 
          title="Gestão de Equipes"
          subtitle="Gerencie suas equipes e acompanhe o desempenho"
        />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando equipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Gestão de Equipes"
        subtitle="Gerencie suas equipes e acompanhe o desempenho"
      />
      
      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Suas Equipes</h2>
            <p className="text-gray-600 mt-1">Total de {teams.length} equipe{teams.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowNewTeamForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Equipe</span>
          </button>
        </div>

        {/* Teams Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{team.nome}</h3>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Líder:</span> {team.leader_name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Membros:</span> {team.member_count}
                </p>
                {team.descricao && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Descrição:</span> {team.descricao}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Criada em {new Date(team.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
          
          {teams.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma equipe encontrada</p>
              <button
                onClick={() => setShowNewTeamForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Criar Primeira Equipe
              </button>
            </div>
          )}
        </div>

        {/* Team Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações da Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                alert('Agendando reunião 1:1...');
              }}
              className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Agendar 1:1</span>
            </button>
            <button
              onClick={() => {
                alert('Abrindo revisão de PDIs...');
              }}
              className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-green-500" />
              <span>Revisar PDIs</span>
            </button>
            <button
              onClick={() => {
                alert('Abrindo sistema de feedback...');
              }}
              className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <span>Dar Feedback</span>
            </button>
            <button
              onClick={() => {
                alert('Abrindo avaliação de performance...');
              }}
              className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Avaliar Performance</span>
            </button>
          </div>
        </div>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Membros das Equipes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Equipe</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {member.nome.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{member.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{member.email}</td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{member.role}</td>
                      <td className="py-3 px-4 text-gray-600">{member.team_name}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              alert(`Visualizando perfil de ${member.nome}...`);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Ver Perfil
                          </button>
                          <button
                            onClick={() => {
                              alert(`Editando informações de ${member.nome}...`);
                            }}
                            className="text-green-500 hover:text-green-700 text-sm"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights de Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Equipes Ativas</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{teams.length}</p>
              <p className="text-sm text-gray-600">Total de equipes criadas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Membros Ativos</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{teamMembers.length}</p>
              <p className="text-sm text-gray-600">Colaboradores em equipes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Média por Equipe</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {teams.length > 0 ? Math.round(teamMembers.length / teams.length) : 0}
              </p>
              <p className="text-sm text-gray-600">Membros por equipe</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Team Form Modal */}
      {showNewTeamForm && (
        <NewTeamForm
          onSubmit={handleCreateTeam}
          onCancel={() => setShowNewTeamForm(false)}
        />
      )}
    </div>
  );
};

export default Teams;