import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, Shield } from 'lucide-react';
import Badge from '../common/Badge';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  confidential: boolean;
  notes?: string;
}

const HRAppointments: React.FC = () => {
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      time: '09:00',
      patient: 'Colaborador A',
      type: 'Consulta Individual',
      status: 'scheduled',
      confidential: true
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Colaborador B',
      type: 'Acompanhamento',
      status: 'scheduled',
      confidential: true
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Equipe Tech',
      type: 'Dinâmica de Grupo',
      status: 'scheduled',
      confidential: false
    },
    {
      id: '4',
      time: '15:30',
      patient: 'Colaborador C',
      type: 'Consulta Individual',
      status: 'completed',
      confidential: true,
      notes: 'Sessão produtiva, próximo encontro em 2 semanas'
    }
  ]);

  const statusConfig = {
    scheduled: { label: 'Agendado', variant: 'info' as const },
    completed: { label: 'Concluído', variant: 'success' as const },
    cancelled: { label: 'Cancelado', variant: 'error' as const }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Agenda do Dia</h3>
        <button 
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            alert('Agendando nova consulta...');
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Nova Consulta</span>
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => {
          const config = statusConfig[appointment.status];
          
          return (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{appointment.time}</span>
                  </div>
                  {appointment.confidential && (
                    <Shield className="w-4 h-4 text-red-500" title="Confidencial" />
                  )}
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {appointment.confidential ? 'Paciente Confidencial' : appointment.patient}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{appointment.type}</p>
                
                {appointment.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HRAppointments;