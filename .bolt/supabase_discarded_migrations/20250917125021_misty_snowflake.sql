/*
  # Test User Roles Access After Function Fix

  This script tests that RLS policies work correctly for different user roles
  after updating the get_user_role function.
*/

-- Create test function to simulate different user roles
CREATE OR REPLACE FUNCTION test_role_access()
RETURNS TABLE(
    test_name text,
    role_tested user_role,
    table_tested text,
    access_granted boolean,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_user_id uuid;
    admin_user_id uuid;
    rh_user_id uuid;
    gestor_user_id uuid;
    colaborador_user_id uuid;
    record_count integer;
BEGIN
    -- Create test users for each role (if they don't exist)
    
    -- Admin user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), 'test-admin@example.com', 'encrypted', now(), now(), now())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO admin_user_id;
    
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'test-admin@example.com';
    END IF;
    
    INSERT INTO profiles (user_id, nome, email, role, status)
    VALUES (admin_user_id, 'Test Admin', 'test-admin@example.com', 'admin', 'ativo')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin', status = 'ativo';
    
    -- RH user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), 'test-rh@example.com', 'encrypted', now(), now(), now())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO rh_user_id;
    
    IF rh_user_id IS NULL THEN
        SELECT id INTO rh_user_id FROM auth.users WHERE email = 'test-rh@example.com';
    END IF;
    
    INSERT INTO profiles (user_id, nome, email, role, status)
    VALUES (rh_user_id, 'Test RH', 'test-rh@example.com', 'rh', 'ativo')
    ON CONFLICT (user_id) DO UPDATE SET role = 'rh', status = 'ativo';
    
    -- Gestor user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), 'test-gestor@example.com', 'encrypted', now(), now(), now())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO gestor_user_id;
    
    IF gestor_user_id IS NULL THEN
        SELECT id INTO gestor_user_id FROM auth.users WHERE email = 'test-gestor@example.com';
    END IF;
    
    INSERT INTO profiles (user_id, nome, email, role, status)
    VALUES (gestor_user_id, 'Test Gestor', 'test-gestor@example.com', 'gestor', 'ativo')
    ON CONFLICT (user_id) DO UPDATE SET role = 'gestor', status = 'ativo';
    
    -- Colaborador user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), 'test-colaborador@example.com', 'encrypted', now(), now(), now())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO colaborador_user_id;
    
    IF colaborador_user_id IS NULL THEN
        SELECT id INTO colaborador_user_id FROM auth.users WHERE email = 'test-colaborador@example.com';
    END IF;
    
    INSERT INTO profiles (user_id, nome, email, role, status)
    VALUES (colaborador_user_id, 'Test Colaborador', 'test-colaborador@example.com', 'colaborador', 'ativo')
    ON CONFLICT (user_id) DO UPDATE SET role = 'colaborador', status = 'ativo';
    
    -- Test admin access to salary_history
    BEGIN
        -- Simulate admin context
        PERFORM set_config('request.jwt.claims', json_build_object('sub', admin_user_id)::text, true);
        SELECT COUNT(*) INTO record_count FROM salary_history;
        
        RETURN QUERY SELECT 
            'Admin access to salary_history'::text,
            'admin'::user_role,
            'salary_history'::text,
            true::boolean,
            'Success'::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'Admin access to salary_history'::text,
            'admin'::user_role,
            'salary_history'::text,
            false::boolean,
            SQLERRM::text;
    END;
    
    -- Test RH access to salary_history
    BEGIN
        -- Simulate RH context
        PERFORM set_config('request.jwt.claims', json_build_object('sub', rh_user_id)::text, true);
        SELECT COUNT(*) INTO record_count FROM salary_history;
        
        RETURN QUERY SELECT 
            'RH access to salary_history'::text,
            'rh'::user_role,
            'salary_history'::text,
            true::boolean,
            'Success'::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'RH access to salary_history'::text,
            'rh'::user_role,
            'salary_history'::text,
            false::boolean,
            SQLERRM::text;
    END;
    
    -- Test colaborador access to salary_history (should be restricted)
    BEGIN
        -- Simulate colaborador context
        PERFORM set_config('request.jwt.claims', json_build_object('sub', colaborador_user_id)::text, true);
        SELECT COUNT(*) INTO record_count FROM salary_history WHERE user_id = colaborador_user_id;
        
        RETURN QUERY SELECT 
            'Colaborador own salary access'::text,
            'colaborador'::user_role,
            'salary_history'::text,
            true::boolean,
            'Success - own data only'::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'Colaborador own salary access'::text,
            'colaborador'::user_role,
            'salary_history'::text,
            false::boolean,
            SQLERRM::text;
    END;
    
    -- Test gestor access to managed users
    BEGIN
        -- Simulate gestor context
        PERFORM set_config('request.jwt.claims', json_build_object('sub', gestor_user_id)::text, true);
        SELECT COUNT(*) INTO record_count FROM profiles WHERE gestor_id = gestor_user_id;
        
        RETURN QUERY SELECT 
            'Gestor access to managed profiles'::text,
            'gestor'::user_role,
            'profiles'::text,
            true::boolean,
            'Success'::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'Gestor access to managed profiles'::text,
            'gestor'::user_role,
            'profiles'::text,
            false::boolean,
            SQLERRM::text;
    END;
    
    -- Reset context
    PERFORM set_config('request.jwt.claims', '', true);
    
END;
$$;

-- Run the tests
SELECT * FROM test_role_access();

-- Clean up test function
DROP FUNCTION test_role_access();