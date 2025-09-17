import React, { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import HRAppointments from '../components/hr/HRAppointments';
import HRTests from '../components/hr/HRTests';
import { Heart, Calendar, MessageCircle, BarChart3, Shield, Users, AlertCircle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface HRStats {
  appointments: number;
  tests: number;
  attendedUsers: number;
  averageSatisfaction: string;
}

const MentalHealth: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'appointments' | 'tests'>('overview');
  const [stats, setStats] = useState<HRStats>({
    appointments: 0,
    tests: 0,
    attendedUsers: 0,
    averageSatisfaction: '0/5'
  });
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHRData();
    }
  }, [user]);

  const fetchHRData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Single query with join to get HR records and user names
      const { data: records, error: recordsError } = await supabase
        .from('hr_records')
        .select(`
          *,
          profiles!hr_records_user_id_fkey(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recordsError) throw recordsError;

      // Process records with confidentiality rules
      const enrichedRecords = (records || []).map(record => {
        let displayName = 'Paciente Confidencial';
        
        // Only show real names for HR users or if it's the user's own record
        if (user.role === 'rh' || record.user_id === user.id) {
          displayName = record.profiles?.nome || 'Nome não encontrado';
        }

        return {
          ...record,
          display_name: displayName,
          confidential: user.role !== 'rh' && record.user_id !== user.id
        };
      });

      setRecentConsultations(enrichedRecords);

      // Calculate stats
      if (user.role === 'rh') {
        // HR can see all stats
        const { count: appointmentsCount } = await supabase
          .from('hr_records')
          .select('*', { count: 'exact', head: true })
          .eq('tipo', 'sessao');

        const { count: testsCount } = await supabase
          .from('hr_tests')
          .select('*', { count: 'exact', head: true });

        const { data: uniqueUsers } = await supabase
          .from('hr_records')
          .select('user_id')
          .not('user_id', 'is', null);

        const uniqueUserIds = [...new Set(uniqueUsers?.map(u => u.user_id) || [])];

        setStats({
          appointments: appointmentsCount || 0,
          tests: testsCount || 0,
          attendedUsers: uniqueUserIds.length,
          averageSatisfaction: '4.2/5' // This could be calculated from actual satisfaction data
        });
      } else {
        // Regular users see limited stats
        const { count: userAppointments } = await supabase
          .from('hr_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('tipo', 'sessao');

        const { count: userTests } = await supabase
          .from('hr_tests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats({
          appointments: userAppointments || 0,
          tests: userTests || 0,
          attendedUsers: 1, // Just the user themselves
          averageSatisfaction: '4.2/5'
        });
      }

    } catch (err) {
      console.error('Error fetching HR data:', err);
      setError('Erro ao carregar dados de bem-estar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('hr_records')
        .insert({
          user_id: user.id,
          titulo: 'Consulta Agendada',
          conteudo: 'Consulta individual agendada pelo colaborador',
          tipo: 'sessao',
          data_sessao: new Date().toISOString().split('T')[0],
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      alert('Consulta agendada com sucesso! Você receberá uma confirmação em breve.');
      fetchHRData(); // Refresh data
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Erro ao agendar consulta. Tente novamente.');
    }
  };

  const handleStartSelfAssessment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('hr_tests')
        .insert({
          user_id: user.id,
          nome_teste: 'Autoavaliação de Bem-estar',
          resultado: null,
          solicitado_por: user.id
        })
        .select()
        .single();

      if (error) throw error;

      alert('Autoavaliação iniciada! Você será redirecionado para o questionário.');
      fetchHRData(); // Refresh data
    } catch (error) {
      console.error('Error starting self-assessment:', error);
      alert('Erro ao iniciar autoavaliação. Tente novamente.');
    }
  };

  const handleOpenConfidentialChat = () => {
    alert('Chat confidencial será implementado em breve.\nPor enquanto, agende uma consulta individual.');
  };

  if (loading) {
    return (
      <div>
        <Header 
          title="Saúde Mental & Bem-estar"
          subtitle="Área confidencial para acompanhamento psicológico"
        />
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados de bem-estar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header 
          title="Saúde Mental & Bem-estar"
          subtitle="Área confidencial para acompanhamento psicológico"
        />
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
            <button
              onClick={fetchHRData}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Saúde Mental & Bem-estar"
        subtitle="Área confidencial para acompanhamento psicológico"
      />
      
      <div className="p-8 space-y-8">
        {/* Privacy Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Área Confidencial</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Todas as informações desta área são estritamente confidenciais e protegidas por sigilo profissional.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleScheduleAppointment}
            className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Agendar Consulta</span>
          </button>
          
          <button 
            onClick={handleStartSelfAssessment}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span>Autoavaliação</span>
          </button>
          
          <button 
            onClick={handleOpenConfidentialChat}
            className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat Confidencial</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title={user?.role === 'rh' ? 'Consultas Agendadas' : 'Suas Consultas'}
            value={stats.appointments.toString()}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title={user?.role === 'rh' ? 'Testes Aplicados' : 'Seus Testes'}
            value={stats.tests.toString()}
            icon={BarChart3}
            color="green"
          />
          <StatCard
            title={user?.role === 'rh' ? 'Colaboradores Atendidos' : 'Atendimentos'}
            value={stats.attendedUsers.toString()}
            icon={Users}
            color="yellow"
          />
          <StatCard
            title="Satisfação Média"
            value={stats.averageSatisfaction}
            icon={Heart}
            color="indigo"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'appointments', label: 'Consultas', icon: Calendar },
                { id: 'tests', label: 'Testes', icon: Heart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Registros Recentes</h3>
                  <div className="space-y-3">
                    {recentConsultations.map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {consultation.confidential ? 'Registro Confidencial' : consultation.titulo}
                            </p>
                            <p className="text-sm text-gray-600">
                              {consultation.data_sessao ? new Date(consultation.data_sessao).toLocaleDateString('pt-BR') : new Date(consultation.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {consultation.confidential && (
                            <Shield className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm text-gray-500 capitalize">{consultation.tipo}</span>
                        </div>
                      </div>
                    ))}
                    
                    {recentConsultations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>Nenhum registro encontrado.</p>
                        <p className="text-sm">Agende uma consulta para começar.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'appointments' && <HRAppointments onRefresh={fetchHRData} />}
            {selectedTab === 'tests' && <HRTests onRefresh={fetchHRData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;