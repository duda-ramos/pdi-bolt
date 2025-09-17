/*
  # Sample Data for DEA PDI System

  1. Career tracks and stages
  2. Competencies for each stage
  3. Sample teams
  4. Sample action groups
*/

-- =============================================
-- CAREER TRACKS
-- =============================================

INSERT INTO career_tracks (id, nome, descricao) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Desenvolvimento Frontend', 'Trilha focada em desenvolvimento de interfaces e experiência do usuário'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Desenvolvimento Backend', 'Trilha focada em desenvolvimento de APIs e sistemas backend'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Gestão e Liderança', 'Trilha para desenvolvimento de habilidades de gestão e liderança'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Recursos Humanos', 'Trilha especializada em gestão de pessoas e bem-estar organizacional');

-- =============================================
-- CAREER STAGES
-- =============================================

-- Frontend Track Stages
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Desenvolvedor Frontend Júnior', 1, 'desenvolvimento', 3000, 5000),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Desenvolvedor Frontend Pleno', 2, 'desenvolvimento', 5000, 8000),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Desenvolvedor Frontend Sênior', 3, 'especializacao', 8000, 12000),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Tech Lead Frontend', 4, 'especializacao', 12000, 18000);

-- Backend Track Stages
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max) VALUES
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Desenvolvedor Backend Júnior', 1, 'desenvolvimento', 3500, 5500),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Desenvolvedor Backend Pleno', 2, 'desenvolvimento', 5500, 8500),
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Desenvolvedor Backend Sênior', 3, 'especializacao', 8500, 13000),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Arquiteto de Software', 4, 'especializacao', 13000, 20000);

-- Management Track Stages
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max) VALUES
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Coordenador', 1, 'desenvolvimento', 6000, 9000),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Gerente', 2, 'especializacao', 9000, 15000),
  ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Diretor', 3, 'especializacao', 15000, 25000);

-- HR Track Stages
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max, flexivel_salario) VALUES
  ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 'Analista de RH', 1, 'desenvolvimento', 4000, 6000, false),
  ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Especialista em RH', 2, 'especializacao', 6000, 10000, false),
  ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'Coordenador de RH', 3, 'especializacao', 8000, 15000, true);

-- =============================================
-- COMPETENCIES
-- =============================================

-- Frontend Junior Competencies
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'HTML/CSS', 'Conhecimento básico de HTML5 e CSS3', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440001', 'JavaScript', 'Fundamentos de JavaScript ES6+', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440001', 'React Básico', 'Componentes funcionais e hooks básicos', 'hard_skill', 2),
  ('650e8400-e29b-41d4-a716-446655440001', 'Comunicação', 'Habilidade de comunicação clara e objetiva', 'soft_skill', 2),
  ('650e8400-e29b-41d4-a716-446655440001', 'Trabalho em Equipe', 'Colaboração efetiva com colegas', 'soft_skill', 2);

-- Frontend Pleno Competencies
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('650e8400-e29b-41d4-a716-446655440002', 'React Avançado', 'Context API, hooks customizados, performance', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440002', 'TypeScript', 'Tipagem estática e interfaces avançadas', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440002', 'Testes Frontend', 'Jest, Testing Library, testes unitários', 'hard_skill', 2),
  ('650e8400-e29b-41d4-a716-446655440002', 'Resolução de Problemas', 'Análise e solução de problemas complexos', 'soft_skill', 2),
  ('650e8400-e29b-41d4-a716-446655440002', 'Mentoria', 'Capacidade de orientar desenvolvedores júnior', 'soft_skill', 2);

-- Backend Junior Competencies
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('650e8400-e29b-41d4-a716-446655440005', 'Node.js', 'Desenvolvimento de APIs com Node.js', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440005', 'Banco de Dados', 'SQL básico e modelagem de dados', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440005', 'REST APIs', 'Criação e consumo de APIs RESTful', 'hard_skill', 2),
  ('650e8400-e29b-41d4-a716-446655440005', 'Organização', 'Capacidade de organizar tarefas e prioridades', 'soft_skill', 2),
  ('650e8400-e29b-41d4-a716-446655440005', 'Aprendizado Contínuo', 'Busca constante por conhecimento', 'soft_skill', 2);

-- Management Competencies
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('650e8400-e29b-41d4-a716-446655440009', 'Gestão de Pessoas', 'Liderança e desenvolvimento de equipes', 'soft_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440009', 'Planejamento Estratégico', 'Definição de objetivos e estratégias', 'soft_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440009', 'Gestão de Projetos', 'Metodologias ágeis e gestão de projetos', 'hard_skill', 2),
  ('650e8400-e29b-41d4-a716-446655440009', 'Comunicação Executiva', 'Apresentações e comunicação com stakeholders', 'soft_skill', 2);

-- HR Competencies
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('650e8400-e29b-41d4-a716-446655440012', 'Psicologia Organizacional', 'Conhecimentos de comportamento organizacional', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440012', 'Legislação Trabalhista', 'Conhecimento das leis trabalhistas', 'hard_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440012', 'Empatia', 'Capacidade de compreender e apoiar colaboradores', 'soft_skill', 3),
  ('650e8400-e29b-41d4-a716-446655440012', 'Confidencialidade', 'Manutenção de sigilo profissional', 'soft_skill', 2);

-- =============================================
-- SAMPLE TEAMS
-- =============================================

INSERT INTO teams (id, nome, descricao, created_by) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Desenvolvimento Frontend', 'Equipe responsável pelo desenvolvimento de interfaces', '00000000-0000-0000-0000-000000000000'),
  ('750e8400-e29b-41d4-a716-446655440002', 'Desenvolvimento Backend', 'Equipe responsável por APIs e sistemas backend', '00000000-0000-0000-0000-000000000000'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Recursos Humanos', 'Equipe de gestão de pessoas e bem-estar', '00000000-0000-0000-0000-000000000000'),
  ('750e8400-e29b-41d4-a716-446655440004', 'Gestão e Liderança', 'Equipe de coordenação e gestão estratégica', '00000000-0000-0000-0000-000000000000');

-- =============================================
-- SAMPLE ACTION GROUPS
-- =============================================

INSERT INTO action_groups (id, nome, descricao, status, created_by, data_inicio) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Melhoria de Processos', 'Grupo focado na otimização dos processos de desenvolvimento', 'ativo', '00000000-0000-0000-0000-000000000000', CURRENT_DATE),
  ('850e8400-e29b-41d4-a716-446655440002', 'Cultura Organizacional', 'Fortalecimento da cultura e valores da empresa', 'ativo', '00000000-0000-0000-0000-000000000000', CURRENT_DATE),
  ('850e8400-e29b-41d4-a716-446655440003', 'Inovação Tecnológica', 'Pesquisa e implementação de novas tecnologias', 'concluido', '00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '90 days');