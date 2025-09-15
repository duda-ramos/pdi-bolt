import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import Badge from '../common/Badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { mockHRRecords } from '../../services/supabase/mockData';

interface HRRecord {
  id: string;
  user_id: string;
  titulo: string;
  conteudo: string;
  tipo: string;
  data_sessao: string | null;
  created_by: string;
  created_at: string;
  display_name?: string;
  confidential?: boolean;
}

interface HRAppointmentsProps {
  onRefresh?: () => void;
}

const HRAppointments: React.FC<HRAppointmentsProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const { useMockData, setUseFallback } = useFeatureFlags();
  const [appointments, setAppointments] = useState<HRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    titulo: '',
    conteudo: '',
    data_sessao: '',
    user_id: user?.id || ''
  });

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    if (useMockData) {
      setAppointments(mockHRRecords);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('hr_records')
        .select('*')
        .eq('tipo', 'sessao')
        .order('data_sessao', { ascending: true, nullsFirst: false });

      // If not HR, only show user's own appointments
      if (user.role !== 'rh') {
        query = query.eq('user_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Enrich with user names
      const enrichedAppointments = await Promise.all(
        (data || []).map(async (appointment) => {
          let displayName = 'Paciente Confidencial';
          
          // Show real names for HR users or if it's the user's own appointment
          if (user.role === 'rh' || appointment.user_id === user.id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('nome')
              .eq('user_id', appointment.user_id)
              .single();
            
            if (userData) {
              displayName = userData.nome;
            }
          }

          return {
            ...appointment,
            display_name: displayName,
            confidential: user.role !== 'rh' && appointment.user_id !== user.id
          };
        })
      );

      setAppointments(enrichedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setUseFallback(true);
      setAppointments(mockHRRecords);
      setError('Erro ao carregar consultas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newAppointment.titulo || !newAppointment.data_sessao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hr_records')
        .insert({
          user_id: user.role === 'rh' ? newAppointment.user_id : user.id,
          titulo: newAppointment.titulo,
          conteudo: newAppointment.conteudo,
          tipo: 'sessao',
          data_sessao: newAppointment.data_sessao,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      alert('Consulta agendada com sucesso!');
      setShowNewForm(false);
      setNewAppointment({
        titulo: '',
        conteudo: '',
        data_sessao: '',
        user_id: user.id
      });
      
      fetchAppointments();
      onRefresh?.();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Erro ao agendar consulta. Tente novamente.');
    }
  };

  const getStatusFromDate = (dateString: string | null) => {
    if (!dateString) return 'scheduled';
    
    const appointmentDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) return 'completed';
    if (appointmentDate.getTime() === today.getTime()) return 'scheduled';
    return 'scheduled';
  };

  const statusConfig = {
    scheduled: { label: 'Agendado', variant: 'info' as const },
    completed: { label: 'Concluído', variant: 'success' as const },
    cancelled: { label: 'Cancelado', variant: 'error' as const }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando consultas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAppointments}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {user?.role === 'rh' ? 'Agenda do Dia' : 'Suas Consultas'}
        </h3>
        <button 
          onClick={() => setShowNewForm(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Consulta</span>
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => {
          const status = getStatusFromDate(appointment.data_sessao);
          const config = statusConfig[status];
          
          return (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {appointment.data_sessao ? new Date(appointment.data_sessao).toLocaleDateString('pt-BR') : 'Data não definida'}
                    </span>
                  </div>
                  {appointment.confidential && (
                    <Shield className="w-4 h-4 text-red-500" title="Confidencial" />
                  )}
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">{appointment.titulo}</h4>
                
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{appointment.display_name}</span>
                </div>
                
                {appointment.conteudo && (
                  <p className="text-sm text-gray-600">{appointment.conteudo}</p>
                )}
                
                <p className="text-xs text-gray-500">
                  Criado em {new Date(appointment.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consulta agendada</h3>
            <p className="text-gray-600 mb-6">Agende sua primeira consulta para começar o acompanhamento</p>
            <button 
              onClick={() => setShowNewForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Agendar Primeira Consulta
            </button>
          </div>
        )}
      </div>

      {/* New Appointment Form Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Consulta</h3>
              
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newAppointment.titulo}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Consulta Individual"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Sessão *
                  </label>
                  <input
                    type="date"
                    value={newAppointment.data_sessao}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, data_sessao: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={newAppointment.conteudo}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, conteudo: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações sobre a consulta..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAppointments;