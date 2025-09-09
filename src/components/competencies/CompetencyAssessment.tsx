import React, { useState } from 'react';
import { Award, BarChart3, User, TrendingUp, Play, AlertCircle, CheckCircle } from 'lucide-react';
import Badge from '../common/Badge';
import AssessmentForm from '../assessment/AssessmentForm';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CompetencyWithScores {
  id: string;
  name: string;
  type: 'Hard' | 'Soft';
  selfScore: number;
  managerScore: number;
  divergence: number;
  description?: string;
  hasAssessments: boolean;
}

interface CompetencyAssessmentProps {
  competencies: CompetencyWithScores[];
  onRefresh: () => void;
}

const CompetencyAssessment: React.FC<CompetencyAssessmentProps> = ({ 
  competencies, 
  onRefresh 
}) => {
  const { user } = useAuth();
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyWithScores | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sampleQuestions = [
    {
      id: '1',
      text: 'Tenho domínio técnico suficiente para executar minhas tarefas com autonomia',
      type: 'scale' as const,
      required: true
    },
    {
      id: '2', 
      text: 'Consigo resolver problemas complexos relacionados à minha área',
      type: 'scale' as const,
      required: true
    },
    {
      id: '3',
      text: 'Me sinto confiante ao aplicar esta competência no dia a dia',
      type: 'scale' as const,
      required: true
    },
    {
      id: '4',
      text: 'Descreva uma situação onde você aplicou esta competência recentemente',
      type: 'text' as const,
      required: false
    }
  ];

  const handleStartAssessment = (competency: CompetencyWithScores) => {
    setSelectedCompetency(competency);
    setShowAssessment(true);
  };

  const handleSubmitAssessment = async (answers: Record<string, any>) => {
    if (!user || !selectedCompetency) return;

    setSubmitting(true);
    
    try {
      // Calcular pontuação baseada nas respostas de escala
      const scaleAnswers = Object.values(answers).filter(answer => typeof answer === 'number') as number[];
      const averageScore = scaleAnswers.length > 0 
        ? scaleAnswers.reduce((sum, score) => sum + score, 0) / scaleAnswers.length 
        : 0;

      // Combinar observações de texto
      const textAnswers = Object.entries(answers)
        .filter(([_, answer]) => typeof answer === 'string' && answer.trim())
        .map(([questionId, answer]) => `Q${questionId}: ${answer}`)
        .join('\n\n');

      // Verificar se já existe uma autoavaliação para esta competência
      const { data: existingAssessment, error: checkError } = await supabase
        .from('assessments')
        .select('id')
        .eq('competency_id', selectedCompetency.id)
        .eq('avaliado_id', user.id)
        .eq('avaliador_id', user.id)
        .eq('tipo', 'self')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAssessment) {
        // Atualizar avaliação existente
        const { error: updateError } = await supabase
          .from('assessments')
          .update({
            nota: Math.round(averageScore * 10) / 10, // Arredondar para 1 casa decimal
            observacoes: textAnswers || null
          })
          .eq('id', existingAssessment.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova avaliação
        const { error: insertError } = await supabase
          .from('assessments')
          .insert({
            competency_id: selectedCompetency.id,
            avaliado_id: user.id,
            avaliador_id: user.id,
            tipo: 'self',
            nota: Math.round(averageScore * 10) / 10,
            observacoes: textAnswers || null
          });

        if (insertError) throw insertError;
      }

      alert(`Avaliação ${existingAssessment ? 'atualizada' : 'concluída'} com sucesso!\nPontuação: ${Math.round(averageScore * 10) / 10}/10`);
      
      setShowAssessment(false);
      setSelectedCompetency(null);
      onRefresh(); // Atualizar dados na página pai

    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Erro ao salvar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAssessment(false);
    setSelectedCompetency(null);
  };

  if (showAssessment && selectedCompetency) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <AssessmentForm
            competencyName={selectedCompetency.name}
            questions={sampleQuestions}
            onSubmit={handleSubmitAssessment}
            onCancel={handleCancel}
            isSubmitting={submitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Suas Competências</h3>
        <div className="flex space-x-3">
          <button 
            onClick={() => alert('Relatórios detalhados serão implementados em breve.')}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ver Relatórios</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {competencies.map((competency) => (
          <div
            key={competency.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-gray-900">{competency.name}</h4>
                <Badge variant={competency.type === 'Hard' ? 'info' : 'success'}>
                  {competency.type}
                </Badge>
                {competency.hasAssessments && (
                  <CheckCircle className="w-4 h-4 text-green-500" title="Avaliada" />
                )}
              </div>
              
              <button
                onClick={() => handleStartAssessment(competency)}
                className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>{competency.hasAssessments ? 'Reavaliar' : 'Avaliar'}</span>
              </button>
            </div>

            {/* Description */}
            {competency.description && (
              <p className="text-sm text-gray-600 mb-3">{competency.description}</p>
            )}
            
            {/* Divergence Indicator */}
            {competency.hasAssessments && (
              <div className={`text-sm font-medium mb-3 ${
                competency.divergence === 0 ? 'text-green-600' :
                Math.abs(competency.divergence) <= 1 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {competency.divergence === 0 ? '✓ Alinhado com gestor' : 
                 `Divergência: ${competency.divergence > 0 ? '+' : ''}${competency.divergence.toFixed(1)} pontos`}
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-4">
                <span className="text-gray-600">
                  Autoavaliação: 
                  <span className={`font-medium ml-1 ${
                    competency.selfScore > 0 ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {competency.selfScore > 0 ? `${competency.selfScore}/10` : 'Não avaliada'}
                  </span>
                </span>
                <span className="text-gray-600">
                  Gestor: 
                  <span className={`font-medium ml-1 ${
                    competency.managerScore > 0 ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {competency.managerScore > 0 ? `${competency.managerScore}/10` : 'Não avaliada'}
                  </span>
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center space-x-2">
                {competency.managerScore >= 7 && (
                  <Badge variant="success" size="sm">Dominada</Badge>
                )}
                {competency.managerScore > 0 && competency.managerScore < 7 && (
                  <Badge variant="warning" size="sm">Em Desenvolvimento</Badge>
                )}
                {competency.managerScore === 0 && competency.selfScore > 0 && (
                  <Badge variant="info" size="sm">Aguardando Gestor</Badge>
                )}
                {!competency.hasAssessments && (
                  <Badge variant="neutral" size="sm">Não Avaliada</Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {competencies.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Nenhuma competência encontrada</p>
            <p className="text-sm text-gray-500">
              Entre em contato com o RH para configurar as competências da sua trilha.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyAssessment;