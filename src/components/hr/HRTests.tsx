import React, { useState, useEffect } from 'react';
import { FileText, Play, BarChart3, User, AlertCircle, CheckCircle } from 'lucide-react';
import Badge from '../common/Badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface HRTest {
  id: string;
  user_id: string;
  nome_teste: string;
  resultado: any;
  solicitado_por: string;
  realizado_em: string | null;
  created_at: string;
  display_name?: string;
  confidential?: boolean;
  status: 'pending' | 'completed';
}

interface HRTestsProps {
  onRefresh?: () => void;
}

const HRTests: React.FC<HRTestsProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const [tests, setTests] = useState<HRTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableTests = [
    { id: 'burnout', name: 'Teste de Burnout', color: 'bg-red-500', description: 'Avalia sinais de esgotamento profissional' },
    { id: 'stress', name: 'Avaliação de Estresse', color: 'bg-yellow-500', description: 'Mede níveis de estresse no trabalho' },
    { id: 'wellbeing', name: 'Questionário de Bem-estar', color: 'bg-green-500', description: 'Avalia bem-estar geral e satisfação' },
    { id: 'satisfaction', name: 'Escala de Satisfação', color: 'bg-blue-500', description: 'Mede satisfação com o trabalho e ambiente' }
  ];

  useEffect(() => {
    if (user) {
      fetchTests();
    }
  }, [user]);

  const fetchTests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('hr_tests')
        .select('*')
        .order('created_at', { ascending: false });

      // If not HR, only show user's own tests
      if (user.role !== 'rh') {
        query = query.eq('user_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Enrich with user names and status
      const enrichedTests = await Promise.all(
        (data || []).map(async (test) => {
          let displayName = 'Paciente Confidencial';
          
          // Show real names for HR users or if it's the user's own test
          if (user.role === 'rh' || test.user_id === user.id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('nome')
              .eq('user_id', test.user_id)
              .single();
            
            if (userData) {
              displayName = userData.nome;
            }
          }

          return {
            ...test,
            display_name: displayName,
            confidential: user.role !== 'rh' && test.user_id !== user.id,
            status: test.realizado_em ? 'completed' as const : 'pending' as const
          };
        })
      );

      setTests(enrichedTests);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Erro ao carregar testes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testType: string, testName: string) => {
    if (!user) return;

    try {
      // Create a new test record
      const { data, error } = await supabase
        .from('hr_tests')
        .insert({
          user_id: user.id,
          nome_teste: testName,
          resultado: null,
          solicitado_por: user.id
        })
        .select()
        .single();

      if (error) throw error;

      alert(`${testName} iniciado! Em uma implementação real, você seria redirecionado para o questionário.`);
      fetchTests();
      onRefresh?.();
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Erro ao iniciar teste. Tente novamente.');
    }
  };

  const handleCompleteTest = async (testId: string) => {
    if (!user) return;

    try {
      // Simulate test completion with mock results
      const mockResults = {
        score: Math.floor(Math.random() * 10) + 1,
        responses: {
          q1: Math.floor(Math.random() * 5) + 1,
          q2: Math.floor(Math.random() * 5) + 1,
          q3: Math.floor(Math.random() * 5) + 1
        },
        interpretation: 'Resultado dentro da normalidade',
        recommendations: ['Manter práticas de autocuidado', 'Continuar monitoramento']
      };

      const { error } = await supabase
        .from('hr_tests')
        .update({
          resultado: mockResults,
          realizado_em: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) throw error;

      alert('Teste concluído com sucesso!');
      fetchTests();
      onRefresh?.();
    } catch (error) {
      console.error('Error completing test:', error);
      alert('Erro ao concluir teste. Tente novamente.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreInterpretation = (score: number) => {
    if (score <= 3) return 'Baixo risco';
    if (score <= 6) return 'Atenção necessária';
    return 'Alto risco';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando testes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTests}
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
      {/* Available Tests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ferramentas Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableTests.map((test) => (
            <div key={test.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{test.name}</h4>
                <button
                  onClick={() => handleStartTest(test.id, test.name)}
                  className={`${test.color} text-white px-3 py-1 rounded text-sm hover:opacity-90 transition-opacity flex items-center space-x-1`}
                >
                  <Play className="w-3 h-3" />
                  <span>Iniciar</span>
                </button>
              </div>
              <p className="text-sm text-gray-600">{test.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {user?.role === 'rh' ? 'Resultados Recentes' : 'Seus Testes'}
        </h3>
        
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{test.nome_teste}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{test.display_name}</span>
                      {test.confidential && (
                        <span className="text-red-500">(Confidencial)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={test.status === 'completed' ? 'success' : 'warning'}>
                    {test.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                  {test.status === 'pending' && test.user_id === user?.id && (
                    <button
                      onClick={() => handleCompleteTest(test.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>

              {test.status === 'completed' && test.resultado && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 rounded-lg p-3">
                  <div>
                    <span className="text-gray-600">Pontuação:</span>
                    <div className={`font-medium ${getScoreColor(test.resultado.score)}`}>
                      {test.resultado.score}/10
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Interpretação:</span>
                    <div className="font-medium text-gray-900">
                      {test.resultado.interpretation || getScoreInterpretation(test.resultado.score)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Realizado em:</span>
                    <div className="font-medium text-gray-900">
                      {test.realizado_em ? new Date(test.realizado_em).toLocaleDateString('pt-BR') : 'N/A'}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500">
                Criado em {new Date(test.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}

          {tests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>Nenhum teste encontrado.</p>
              <p className="text-sm">Inicie um teste usando as ferramentas acima.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRTests;