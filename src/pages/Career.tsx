import React, { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import CareerProgress from '../components/career/CareerProgress';
import { Award, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { mockCareerTrack, mockCareerStages, mockCompetencies } from '../services/supabase/mockData';

interface CareerTrack {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
}

interface CareerStage {
  id: string;
  trilha_id: string;
  nome: string;
  ordem: number;
  etapa: 'desenvolvimento' | 'especializacao';
  salario_min: number | null;
  salario_max: number | null;
  flexivel_salario: boolean | null;
  created_at: string;
}

interface Competency {
  id: string;
  stage_id: string;
  nome: string;
  descricao: string | null;
  tipo: 'hard_skill' | 'soft_skill';
  peso: number | null;
  created_at: string;
}

interface UserCompetencyScore {
  competency_id: string;
  self_score: number;
  manager_score: number;
}

const Career: React.FC = () => {
  const { user } = useAuth();
  const { useMockData, setUseFallback } = useFeatureFlags();
  const [careerTrack, setCareerTrack] = useState<CareerTrack | null>(null);
  const [stages, setStages] = useState<CareerStage[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [userScores, setUserScores] = useState<UserCompetencyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCareerData();
    }
  }, [user]);

  const fetchCareerData = async () => {
    if (!user) return;

    if (useMockData) {
      setCareerTrack(mockCareerTrack);
      setStages(mockCareerStages);
      setCompetencies(mockCompetencies.map(comp => ({
        id: comp.id,
        stage_id: 'mock-stage-1',
        nome: comp.name,
        descricao: comp.description,
        tipo: comp.type === 'Hard' ? 'hard_skill' : 'soft_skill',
        peso: 1.0,
        created_at: '2023-01-01T10:00:00Z'
      })));
      setUserScores([
        { competency_id: 'mock-comp-1', self_score: 7, manager_score: 6 },
        { competency_id: 'mock-comp-2', self_score: 8, manager_score: 8 }
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Buscar trilha do usuário
      let userTrackId = user.trilha_id;
      
      // Se o usuário não tem trilha definida, buscar a primeira trilha disponível
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

      // 2. Buscar dados da trilha
      const { data: trackData, error: trackError } = await supabase
        .from('career_tracks')
        .select('*')
        .eq('id', userTrackId)
        .single();

      if (trackError) throw trackError;
      setCareerTrack(trackData);

      // 3. Buscar estágios da trilha
      const { data: stagesData, error: stagesError } = await supabase
        .from('career_stages')
        .select('*')
        .eq('trilha_id', userTrackId)
        .order('ordem', { ascending: true });

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

      // 4. Buscar competências de todos os estágios
      if (stagesData && stagesData.length > 0) {
        const stageIds = stagesData.map(stage => stage.id);
        const { data: competenciesData, error: competenciesError } = await supabase
          .from('competencies')
          .select('*')
          .in('stage_id', stageIds);

        if (competenciesError) throw competenciesError;
        setCompetencies(competenciesData || []);

        // 5. Buscar pontuações do usuário
        if (competenciesData && competenciesData.length > 0) {
          const competencyIds = competenciesData.map(comp => comp.id);
          const { data: scoresData, error: scoresError } = await supabase
            .from('assessments')
            .select('competency_id, nota, tipo')
            .eq('avaliado_id', user.id)
            .in('competency_id', competencyIds);

          if (scoresError) {
            console.warn('Erro ao buscar pontuações:', scoresError);
          } else {
            // Processar pontuações (self vs manager)
            const processedScores: UserCompetencyScore[] = [];
            const scoresByCompetency = (scoresData || []).reduce((acc, score) => {
              if (!acc[score.competency_id]) {
                acc[score.competency_id] = { self: 0, manager: 0 };
              }
              if (score.tipo === 'self') {
                acc[score.competency_id].self = score.nota;
              } else if (score.tipo === 'manager') {
                acc[score.competency_id].manager = score.nota;
              }
              return acc;
            }, {} as Record<string, { self: number; manager: number }>);

            Object.entries(scoresByCompetency).forEach(([competencyId, scores]) => {
              processedScores.push({
                competency_id: competencyId,
                self_score: scores.self,
                manager_score: scores.manager
              });
            });

            setUserScores(processedScores);
          }
        }
      }

    } catch (err) {
      console.error('Error fetching career data:', err);
      setUseFallback(true);
      
      // Use mock data as fallback
      setCareerTrack(mockCareerTrack);
      setStages(mockCareerStages);
      setCompetencies(mockCompetencies.map(comp => ({
        id: comp.id,
        stage_id: 'mock-stage-1',
        nome: comp.name,
        descricao: comp.description,
        tipo: comp.type === 'Hard' ? 'hard_skill' : 'soft_skill',
        peso: 1.0,
        created_at: '2023-01-01T10:00:00Z'
      })));
      setUserScores([
        { competency_id: 'mock-comp-1', self_score: 7, manager_score: 6 },
        { competency_id: 'mock-comp-2', self_score: 8, manager_score: 8 }
      ]);
      
      setError('Erro ao carregar dados da trilha de carreira. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStage = () => {
    // Lógica simples: assumir que o usuário está no primeiro estágio
    // Em uma implementação real, isso seria baseado em avaliações e aprovações
    return stages.length > 0 ? stages[0] : null;
  };

  const getCompetenciesForStage = (stageId: string) => {
    return competencies.filter(comp => comp.stage_id === stageId);
  };

  const getCompetencyScore = (competencyId: string) => {
    const score = userScores.find(s => s.competency_id === competencyId);
    return score || { competency_id: competencyId, self_score: 0, manager_score: 0 };
  };

  const calculateCompletedCompetencies = () => {
    const currentStage = getCurrentStage();
    if (!currentStage) return { completed: 0, total: 0 };

    const stageCompetencies = getCompetenciesForStage(currentStage.id);
    const completed = stageCompetencies.filter(comp => {
      const score = getCompetencyScore(comp.id);
      return score.manager_score >= 7; // Considerar competência dominada se >= 7
    }).length;

    return { completed, total: stageCompetencies.length };
  };

  const formatSalaryRange = (stage: CareerStage) => {
    if (stage.flexivel_salario) {
      return 'Flexível + Bônus';
    }
    if (stage.salario_min && stage.salario_max) {
      return `R$ ${stage.salario_min.toLocaleString()} - R$ ${stage.salario_max.toLocaleString()}`;
    }
    return 'Não informado';
  };

  if (loading) {
    return (
      <div>
        <Header 
          title="Trilha de Carreira"
          subtitle="Acompanhe sua evolução profissional"
        />
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando trilha de carreira...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header 
          title="Trilha de Carreira"
          subtitle="Acompanhe sua evolução profissional"
        />
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
            <button
              onClick={fetchCareerData}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStage = getCurrentStage();
  const competencyStats = calculateCompletedCompetencies();

  return (
    <div>
      <Header 
        title="Trilha de Carreira"
        subtitle={careerTrack ? careerTrack.nome : "Acompanhe sua evolução profissional"}
      />
      
      <div className="p-8 space-y-8">
        {/* Career Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Estágio Atual"
            value={currentStage ? currentStage.nome : "Não definido"}
            icon={Award}
            color="blue"
          />
          <StatCard
            title="Competências"
            value={`${competencyStats.completed}/${competencyStats.total}`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Faixa Salarial"
            value={currentStage ? formatSalaryRange(currentStage) : "Não informado"}
            icon={DollarSign}
            color="yellow"
          />
        </div>

        {/* Career Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CareerProgress 
            careerTrack={careerTrack}
            stages={stages}
            currentStageId={currentStage?.id}
          />
          
          {/* Competencies Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Competências do Estágio {currentStage ? `- ${currentStage.nome}` : ''}
            </h3>
            
            {currentStage ? (
              <div className="space-y-4">
                {getCompetenciesForStage(currentStage.id).map((competency) => {
                  const score = getCompetencyScore(competency.id);
                  const isCompleted = score.manager_score >= 7;
                  
                  return (
                    <div key={competency.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{competency.nome}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            competency.tipo === 'hard_skill' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {competency.tipo === 'hard_skill' ? 'Hard' : 'Soft'}
                          </span>
                        </div>
                        {competency.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{competency.descricao}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Auto: {score.self_score}/10
                          </div>
                          <div className="text-sm text-gray-600">
                            Gestor: {score.manager_score}/10
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                    </div>
                  );
                })}
                
                {getCompetenciesForStage(currentStage.id).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Nenhuma competência definida para este estágio.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">Nenhum estágio atual definido.</p>
              </div>
            )}
          </div>
        </div>

        {/* Track Description */}
        {careerTrack?.descricao && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Trilha</h3>
            <p className="text-gray-600">{careerTrack.descricao}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Career;