import React, { useState } from 'react';
import { Shield, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { runRLSTests, runSpecificRLSTest } from '../../services/supabase/rls-tests';
import { checkRLSStatus } from '../../lib/supabase-security';

interface TestResult {
  success: boolean;
  message: string;
  results?: any[];
}

const RLSTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [rlsStatus, setRlsStatus] = useState<any[]>([]);

  const tests = [
    { id: 'collaborator-isolation', name: 'Isolamento de Dados - Colaborador', description: 'Verifica se colaboradores veem apenas próprios dados' },
    { id: 'manager-hierarchy', name: 'Acesso Hierárquico - Gestor', description: 'Verifica se gestores veem apenas dados de liderados' },
    { id: 'admin-full-access', name: 'Acesso Total - Admin', description: 'Verifica se admins têm acesso a todos os dados' },
    { id: 'hr-wellness', name: 'Acesso RH - Bem-estar', description: 'Verifica se RH tem acesso aos dados de bem-estar' },
    { id: 'access-violation', name: 'Prevenção de Violação', description: 'Testa tentativas de acesso não autorizado' }
  ];

  const runTest = async (testId: string) => {
    setLoading(prev => ({ ...prev, [testId]: true }));
    
    try {
      const result = await runSpecificRLSTest(testId);
      setTestResults(prev => ({ ...prev, [testId]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testId]: { 
          success: false, 
          message: error instanceof Error ? error.message : 'Erro desconhecido' 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  const runAllTests = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    
    try {
      const result = await runRLSTests();
      setTestResults(prev => ({ ...prev, all: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        all: { 
          success: false, 
          message: error instanceof Error ? error.message : 'Erro desconhecido' 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const checkRLS = async () => {
    setLoading(prev => ({ ...prev, status: true }));
    
    try {
      const status = await checkRLSStatus();
      setRlsStatus(status);
    } catch (error) {
      console.error('Error checking RLS status:', error);
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const getResultIcon = (result?: TestResult) => {
    if (!result) return null;
    
    return result.success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getResultColor = (result?: TestResult) => {
    if (!result) return 'border-gray-200';
    return result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Testes de Segurança RLS</h3>
      </div>

      {/* Status Check */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Status das Políticas RLS</h4>
          <button
            onClick={checkRLS}
            disabled={loading.status}
            className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading.status ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            <span>Verificar RLS</span>
          </button>
        </div>
        
        {rlsStatus.length > 0 && (
          <div className="space-y-2">
            {rlsStatus.map((status, index) => (
              <div key={index} className={`p-3 rounded border ${status.hasError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{status.table}</span>
                  {status.hasError ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{status.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run All Tests */}
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={loading.all}
          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading.all ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          <span>Executar Todos os Testes</span>
        </button>
        
        {testResults.all && (
          <div className={`mt-3 p-3 rounded border ${getResultColor(testResults.all)}`}>
            <div className="flex items-center space-x-2">
              {getResultIcon(testResults.all)}
              <span className="font-medium">{testResults.all.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Individual Tests */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Testes Individuais</h4>
        
        {tests.map((test) => (
          <div key={test.id} className={`p-4 rounded border ${getResultColor(testResults[test.id])}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h5 className="font-medium text-gray-900">{test.name}</h5>
                <p className="text-sm text-gray-600">{test.description}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {getResultIcon(testResults[test.id])}
                <button
                  onClick={() => runTest(test.id)}
                  disabled={loading[test.id]}
                  className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading[test.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  <span>Testar</span>
                </button>
              </div>
            </div>
            
            {testResults[test.id] && (
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="text-sm">{testResults[test.id].message}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Aviso Importante</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Estes testes devem ser executados apenas em ambiente de desenvolvimento ou teste. 
              Certifique-se de que os usuários de teste existam no banco de dados antes de executar os testes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RLSTestPanel;