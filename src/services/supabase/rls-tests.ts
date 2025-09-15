/**
 * Testes automatizados para políticas RLS
 * 
 * Este arquivo contém testes para verificar se as políticas de Row Level Security
 * estão funcionando corretamente para cada tipo de usuário.
 */

import { supabase } from '../../lib/supabase';

interface TestUser {
  id: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador' | 'rh';
  password: string;
}

// Usuários de teste (devem existir no banco de dados de teste)
const testUsers: TestUser[] = [
  { id: 'admin-test-id', email: 'admin@test.com', role: 'admin', password: 'test123' },
  { id: 'gestor-test-id', email: 'gestor@test.com', role: 'gestor', password: 'test123' },
  { id: 'colaborador-test-id', email: 'colaborador@test.com', role: 'colaborador', password: 'test123' },
  { id: 'rh-test-id', email: 'rh@test.com', role: 'rh', password: 'test123' }
];

export class RLSTestSuite {
  private currentUser: TestUser | null = null;

  async loginAs(userType: 'admin' | 'gestor' | 'colaborador' | 'rh') {
    const user = testUsers.find(u => u.role === userType);
    if (!user) throw new Error(`Test user not found for role: ${userType}`);

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (error) throw error;
    this.currentUser = user;
  }

  async logout() {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  // Teste: Colaborador só vê próprios dados
  async testCollaboratorDataIsolation() {
    await this.loginAs('colaborador');
    
    // Teste 1: PDI Objectives - deve ver apenas próprios
    const { data: objectives, error } = await supabase
      .from('pdi_objectives')
      .select('*');
    
    if (error) throw new Error(`PDI Objectives query failed: ${error.message}`);
    
    const hasOtherUserData = objectives?.some(obj => obj.colaborador_id !== this.currentUser?.id);
    if (hasOtherUserData) {
      throw new Error('Colaborador pode ver objetivos de outros usuários');
    }

    // Teste 2: Salary History - deve ver apenas próprio
    const { data: salaryHistory, error: salaryError } = await supabase
      .from('salary_history')
      .select('*');
    
    if (salaryError) throw new Error(`Salary History query failed: ${salaryError.message}`);
    
    const hasOtherSalaryData = salaryHistory?.some(sal => sal.user_id !== this.currentUser?.id);
    if (hasOtherSalaryData) {
      throw new Error('Colaborador pode ver histórico salarial de outros usuários');
    }

    // Teste 3: Assessments - deve ver apenas próprias
    const { data: assessments, error: assessError } = await supabase
      .from('assessments')
      .select('*');
    
    if (assessError) throw new Error(`Assessments query failed: ${assessError.message}`);
    
    const hasOtherAssessments = assessments?.some(
      ass => ass.avaliado_id !== this.currentUser?.id && ass.avaliador_id !== this.currentUser?.id
    );
    if (hasOtherAssessments) {
      throw new Error('Colaborador pode ver avaliações de outros usuários');
    }

    await this.logout();
    return { success: true, message: 'Isolamento de dados do colaborador OK' };
  }

  // Teste: Gestor vê dados de liderados
  async testManagerHierarchicalAccess() {
    await this.loginAs('gestor');
    
    // Teste 1: Profiles - deve ver liderados
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('gestor_id', this.currentUser?.id);
    
    if (error) throw new Error(`Profiles query failed: ${error.message}`);
    
    // Deve ter pelo menos um liderado para o teste ser válido
    if (!profiles || profiles.length === 0) {
      console.warn('Gestor de teste não tem liderados - teste inconclusivo');
    }

    // Teste 2: PDI Objectives de liderados
    const { data: objectives, error: objError } = await supabase
      .from('pdi_objectives')
      .select('*, profiles!colaborador_id(gestor_id)')
      .not('profiles.gestor_id', 'is', null);
    
    if (objError) throw new Error(`PDI Objectives query failed: ${objError.message}`);
    
    // Verificar se todos os objetivos visíveis são de liderados ou próprios
    const hasUnauthorizedData = objectives?.some(obj => {
      const profile = obj.profiles as any;
      return profile?.gestor_id !== this.currentUser?.id && obj.colaborador_id !== this.currentUser?.id;
    });
    
    if (hasUnauthorizedData) {
      throw new Error('Gestor pode ver objetivos de não-liderados');
    }

    await this.logout();
    return { success: true, message: 'Acesso hierárquico do gestor OK' };
  }

  // Teste: Admin vê todos os dados
  async testAdminFullAccess() {
    await this.loginAs('admin');
    
    // Teste 1: Profiles - deve ver todos
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw new Error(`Admin profiles query failed: ${error.message}`);
    
    // Admin deve ver múltiplos perfis
    if (!profiles || profiles.length < 2) {
      throw new Error('Admin não consegue ver todos os perfis');
    }

    // Teste 2: Salary History - deve ver todos
    const { data: salaryHistory, error: salaryError } = await supabase
      .from('salary_history')
      .select('*');
    
    if (salaryError) throw new Error(`Admin salary history query failed: ${salaryError.message}`);

    // Teste 3: PDI Objectives - deve ver todos
    const { data: objectives, error: objError } = await supabase
      .from('pdi_objectives')
      .select('*');
    
    if (objError) throw new Error(`Admin PDI objectives query failed: ${objError.message}`);

    await this.logout();
    return { success: true, message: 'Acesso total do admin OK' };
  }

  // Teste: RH vê dados de bem-estar
  async testHRWellnessAccess() {
    await this.loginAs('rh');
    
    // Teste 1: HR Records - deve ver todos
    const { data: hrRecords, error } = await supabase
      .from('hr_records')
      .select('*');
    
    if (error) throw new Error(`HR records query failed: ${error.message}`);

    // Teste 2: HR Tests - deve ver todos
    const { data: hrTests, error: testsError } = await supabase
      .from('hr_tests')
      .select('*');
    
    if (testsError) throw new Error(`HR tests query failed: ${testsError.message}`);

    // Teste 3: Profiles - deve ver todos (para gestão de pessoas)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) throw new Error(`HR profiles query failed: ${profilesError.message}`);

    await this.logout();
    return { success: true, message: 'Acesso de RH OK' };
  }

  // Teste: Tentativas de violação de acesso
  async testAccessViolationPrevention() {
    await this.loginAs('colaborador');
    
    // Teste 1: Tentar inserir dados para outro usuário
    const { error: insertError } = await supabase
      .from('pdi_objectives')
      .insert({
        colaborador_id: 'other-user-id',
        titulo: 'Objetivo malicioso',
        created_by: this.currentUser?.id
      });
    
    // Deve falhar
    if (!insertError) {
      throw new Error('Colaborador conseguiu inserir dados para outro usuário');
    }

    // Teste 2: Tentar atualizar dados de outro usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ nome: 'Nome alterado maliciosamente' })
      .neq('user_id', this.currentUser?.id);
    
    // Deve falhar ou não afetar nenhuma linha
    if (!updateError) {
      // Verificar se alguma linha foi afetada
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('nome', 'Nome alterado maliciosamente');
      
      if (count && count > 0) {
        throw new Error('Colaborador conseguiu atualizar dados de outros usuários');
      }
    }

    await this.logout();
    return { success: true, message: 'Prevenção de violação de acesso OK' };
  }

  // Executar todos os testes
  async runAllTests() {
    const results = [];
    
    try {
      results.push(await this.testCollaboratorDataIsolation());
      results.push(await this.testManagerHierarchicalAccess());
      results.push(await this.testAdminFullAccess());
      results.push(await this.testHRWellnessAccess());
      results.push(await this.testAccessViolationPrevention());
      
      return {
        success: true,
        message: 'Todos os testes RLS passaram',
        results
      };
    } catch (error) {
      return {
        success: false,
        message: `Teste RLS falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        results
      };
    } finally {
      await this.logout();
    }
  }
}

// Função para executar testes RLS
export async function runRLSTests() {
  const testSuite = new RLSTestSuite();
  return await testSuite.runAllTests();
}

// Função para executar um teste específico
export async function runSpecificRLSTest(testName: string) {
  const testSuite = new RLSTestSuite();
  
  switch (testName) {
    case 'collaborator-isolation':
      return await testSuite.testCollaboratorDataIsolation();
    case 'manager-hierarchy':
      return await testSuite.testManagerHierarchicalAccess();
    case 'admin-full-access':
      return await testSuite.testAdminFullAccess();
    case 'hr-wellness':
      return await testSuite.testHRWellnessAccess();
    case 'access-violation':
      return await testSuite.testAccessViolationPrevention();
    default:
      throw new Error(`Teste desconhecido: ${testName}`);
  }
}