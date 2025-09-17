import React, { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import NineBoxMatrix from '../components/assessment/NineBoxMatrix';
import CompetencyAssessment from '../components/competencies/CompetencyAssessment';
import { Play, BarChart3, FileText, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Competency {
  id: string;
  stage_id: string;
  nome: string;
  descricao: string | null;
  tipo: 'hard_skill' | 'soft_skill';
  peso: number | null;
  created_at: string;
}

interface Assessment {
  id: string;
  competency_id: string;
  avaliado_id: string;
  avaliador_id: string;
  tipo: 'self' | 'manager';
  nota: number;
  observacoes: string | null;
  created_at: string;
}

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

const Competencies: React.FC = () => {
  const { user } = useAuth();
  const [competencies, setCompetencies] = useState<CompetencyWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompetencies();
    }
  }, [user]);

  const fetchCompetencies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Buscar trilha do usuário
      let userTrackId = user.trilha_id;
      
      if (!userTrackId) {
        const { data: tracks, error: tracksError } = await supabase
          .from('career_tracks')
          .select('id')
          .limit(1);

        if (tracksError) throw tracksError;
        if (tracks && tracks.length > 0) {
          userTrackId = tracks[0].id;
        }
      }

      if (!userTrackId) {
        setError('Nenhuma trilha de carreira encontrada. Entre em contato com o RH.');
        return;
      }

      // 2. Single query to get competencies with stage information
      const { data: competenciesData, error: competenciesError } = await supabase
        .from('competencies')
        .select(`
          *,
          career_stages!competencies_stage_id_fkey(
            trilha_id
          )
        `)
        .eq('career_stages.trilha_id', userTrackId);

      if (competenciesError) throw competenciesError;

      if (!competenciesData || competenciesData.length === 0) {
        setError('Nenhuma competência encontrada para sua trilha de carreira.');
        return;
      }

      // 3. Single query to get all user assessments for these competencies
      const competencyIds = competenciesData.map(comp => comp.id);
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('avaliado_id', user.id)
        .in('competency_id', competencyIds);

      if (assessmentsError) {
        console.warn('Erro ao buscar avaliações:', assessmentsError);
      }

      // 4. Process data efficiently with lookups
      const assessmentsByCompetency = (assessments || []).reduce((acc, assessment) => {
        if (!acc[assessment.competency_id]) {
          acc[assessment.competency_id] = {};
        }
        acc[assessment.competency_id][assessment.tipo] = assessment;
        return acc;
      }, {} as Record<string, Record<string, any>>);

      const processedCompetencies: CompetencyWithScores[] = competenciesData.map(comp => {
        const compAssessments = assessmentsByCompetency[comp.id] || {};
        const selfAssessment = compAssessments.self;
        const managerAssessment = compAssessments.manager;
        
        const selfScore = selfAssessment ? selfAssessment.nota : 0;
        const managerScore = managerAssessment ? managerAssessment.nota : 0;
        
        return {
          id: comp.id,
          name: comp.nome,
          type: comp.tipo === 'hard_skill' ? 'Hard' : 'Soft',
          selfScore,
          managerScore,
          divergence: selfScore - managerScore,
          description: comp.descricao,
          hasAssessments: Object.keys(compAssessments).length > 0
        };
      });

      setCompetencies(processedCompetencies);

    } catch (err) {
      console.error('Error fetching competencies:', err);
      setError('Erro ao carregar competências. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAssessment = () => {
    alert('Iniciando nova avaliação de competências...\nEsta funcionalidade será implementada em breve.');
  };

  const handleViewReports = () => {
    alert('Abrindo relatórios de competências...\nEsta funcionalidade será implementada em breve.');
  };

  const handleScheduleTouchpoint = () => {
    alert('Agendando touchpoint com gestor...\nEsta funcionalidade será implementada em breve.');
  };

  // Calcular médias para a matriz 9-box
  const hardSkillsAvg = competencies
    .filter(c => c.type === 'Hard' && c.managerScore > 0)
    .reduce((acc, c) => acc + c.managerScore, 0) / 
    Math.max(1, competencies.filter(c => c.type === 'Hard' && c.managerScore > 0).length);
    
  const softSkillsAvg = competencies
    .filter(c => c.type === 'Soft' && c.managerScore > 0)
    .reduce((acc, c) => acc + c.managerScore, 0) / 
    Math.max(1, competencies.filter(c => c.type === 'Soft' && c.managerScore > 0).length);

  if (loading) {
    return (
      <div>
        <Header 
          title="Competências & Avaliações"
          subtitle="Desenvolva suas habilidades técnicas e comportamentais"
        />
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando competências...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header 
          title="Competências & Avaliações"
          subtitle="Desenvolva suas habilidades técnicas e comportamentais"
        />
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
            <button
              onClick={fetchCompetencies}
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
        title="Competências & Avaliações"
        subtitle="Desenvolva suas habilidades técnicas e comportamentais"
      />
      
      <div className="p-8 space-y-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleNewAssessment}
            className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Iniciar Nova Avaliação</span>
          </button>
          
          <button 
            onClick={handleViewReports}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Ver Relatórios</span>
          </button>
          
          <button 
            onClick={handleScheduleTouchpoint}
            className="flex items-center space-x-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Agendar Touchpoint</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Competências</p>
                <p className="text-2xl font-bold text-gray-900">{competencies.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                <Play className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competencies.filter(c => c.hasAssessments).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hard Skills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competencies.filter(c => c.type === 'Hard').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Soft Skills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competencies.filter(c => c.type === 'Soft').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Competencies List */}
          <CompetencyAssessment 
            competencies={competencies}
            onRefresh={fetchCompetencies}
          />
          
          {/* 9-Box Matrix */}
          <NineBoxMatrix 
            hardScore={hardSkillsAvg || 0} 
            softScore={softSkillsAvg || 0} 
          />
        </div>

        {/* No Competencies Message */}
        {competencies.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma Competência Encontrada</h3>
            <p className="text-gray-600 mb-4">
              Não foram encontradas competências para sua trilha de carreira.
            </p>
            <p className="text-sm text-gray-500">
              Entre em contato com o RH para configurar as competências da sua trilha.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Competencies;