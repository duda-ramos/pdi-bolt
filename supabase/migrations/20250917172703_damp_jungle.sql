/*
  # Sample Data for DEA PDI System

  1. Career tracks and stages
  2. Sample competencies
  3. Sample teams
  4. This data helps test the application functionality
*/

-- Insert sample career tracks
INSERT INTO career_tracks (id, nome, descricao) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Desenvolvimento Frontend', 'Trilha focada em desenvolvimento de interfaces e experiência do usuário'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Desenvolvimento Backend', 'Trilha focada em desenvolvimento de APIs e sistemas backend'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Gestão de Pessoas', 'Trilha focada em liderança e gestão de equipes'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Recursos Humanos', 'Trilha focada em gestão de pessoas e bem-estar organizacional');

-- Insert sample career stages for Frontend track
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Desenvolvedor Junior', 1, 'desenvolvimento', 3000, 5000),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Desenvolvedor Pleno', 2, 'desenvolvimento', 5000, 8000),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Desenvolvedor Senior', 3, 'especializacao', 8000, 12000),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Tech Lead', 4, 'especializacao', 12000, 18000);

-- Insert sample career stages for Backend track
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Desenvolvedor Backend Junior', 1, 'desenvolvimento', 3500, 5500),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Desenvolvedor Backend Pleno', 2, 'desenvolvimento', 5500, 8500),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Desenvolvedor Backend Senior', 3, 'especializacao', 8500, 13000),
  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', 'Arquiteto de Software', 4, 'especializacao', 13000, 20000);

-- Insert sample career stages for Management track
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', 'Coordenador', 1, 'desenvolvimento', 6000, 9000),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440003', 'Gerente', 2, 'especializacao', 9000, 15000),
  ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440003', 'Diretor', 3, 'especializacao', 15000, 25000);

-- Insert sample career stages for HR track
INSERT INTO career_stages (id, trilha_id, nome, ordem, etapa, salario_min, salario_max, flexivel_salario) VALUES
  ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440004', 'Analista de RH', 1, 'desenvolvimento', 4000, 6000, false),
  ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440004', 'Especialista em RH', 2, 'especializacao', 6000, 10000, true),
  ('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440004', 'Coordenador de RH', 3, 'especializacao', 10000, 15000, true);

-- Insert sample competencies for Frontend Junior stage
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'HTML/CSS', 'Conhecimento em HTML5 e CSS3, incluindo flexbox e grid', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440011', 'JavaScript Básico', 'Fundamentos de JavaScript ES6+', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440011', 'React Básico', 'Componentes funcionais e hooks básicos', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440011', 'Comunicação', 'Habilidade de comunicação clara e objetiva', 'soft_skill', 0.8),
  ('550e8400-e29b-41d4-a716-446655440011', 'Trabalho em Equipe', 'Colaboração efetiva com colegas', 'soft_skill', 0.8);

-- Insert sample competencies for Frontend Pleno stage
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('550e8400-e29b-41d4-a716-446655440012', 'React Avançado', 'Context API, custom hooks, performance optimization', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440012', 'TypeScript', 'Tipagem estática e interfaces avançadas', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440012', 'Testes Frontend', 'Jest, Testing Library, testes unitários e integração', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440012', 'Resolução de Problemas', 'Análise e solução de problemas complexos', 'soft_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440012', 'Mentoria', 'Capacidade de orientar desenvolvedores juniores', 'soft_skill', 0.9);

-- Insert sample competencies for Backend Junior stage
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'Node.js', 'Desenvolvimento de APIs com Node.js e Express', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440021', 'Banco de Dados', 'SQL básico e modelagem de dados', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440021', 'APIs REST', 'Criação e consumo de APIs RESTful', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440021', 'Organização', 'Capacidade de organizar tarefas e prioridades', 'soft_skill', 0.8),
  ('550e8400-e29b-41d4-a716-446655440021', 'Aprendizado Contínuo', 'Busca constante por conhecimento', 'soft_skill', 0.8);

-- Insert sample competencies for Management stages
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', 'Liderança', 'Capacidade de liderar e motivar equipes', 'soft_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440031', 'Gestão de Projetos', 'Planejamento e execução de projetos', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440031', 'Comunicação Executiva', 'Comunicação com stakeholders e diretoria', 'soft_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440032', 'Gestão Estratégica', 'Visão estratégica e planejamento de longo prazo', 'soft_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440032', 'Gestão de Pessoas', 'Desenvolvimento e retenção de talentos', 'soft_skill', 1.0);

-- Insert sample competencies for HR stages
INSERT INTO competencies (stage_id, nome, descricao, tipo, peso) VALUES
  ('550e8400-e29b-41d4-a716-446655440041', 'Recrutamento e Seleção', 'Processos de contratação e avaliação', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440041', 'Legislação Trabalhista', 'Conhecimento das leis trabalhistas', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440041', 'Empatia', 'Capacidade de compreender e apoiar colaboradores', 'soft_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440042', 'Psicologia Organizacional', 'Aplicação de conceitos psicológicos no trabalho', 'hard_skill', 1.0),
  ('550e8400-e29b-41d4-a716-446655440042', 'Desenvolvimento Organizacional', 'Estratégias de melhoria organizacional', 'soft_skill', 1.0);

-- Insert sample teams
INSERT INTO teams (id, nome, descricao, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440051', 'Desenvolvimento Frontend', 'Equipe responsável pelas interfaces do usuário', (SELECT id FROM auth.users LIMIT 1)),
  ('550e8400-e29b-41d4-a716-446655440052', 'Desenvolvimento Backend', 'Equipe responsável pelas APIs e sistemas backend', (SELECT id FROM auth.users LIMIT 1)),
  ('550e8400-e29b-41d4-a716-446655440053', 'Recursos Humanos', 'Equipe de gestão de pessoas e bem-estar', (SELECT id FROM auth.users LIMIT 1));

-- Insert sample action groups
INSERT INTO action_groups (nome, descricao, created_by) VALUES
  ('Melhoria de Processos', 'Grupo focado na otimização dos processos de desenvolvimento', (SELECT id FROM auth.users LIMIT 1)),
  ('Cultura Organizacional', 'Grupo dedicado ao fortalecimento da cultura da empresa', (SELECT id FROM auth.users LIMIT 1)),
  ('Inovação Tecnológica', 'Grupo para pesquisa e implementação de novas tecnologias', (SELECT id FROM auth.users LIMIT 1));