# Migration Checklist: Fix get_user_role 2BP01 Error

## Pre-Migration Validation
- [ ] Backup current database
- [ ] Identify all policies using `get_user_role`
- [ ] Document current function signature and behavior
- [ ] Test current RLS policies are working

## Migration Steps (Execute in Order)

### 1. Fix Function (Preferred Approach - No DROP needed)
```sql
\i supabase/migrations/fix_get_user_role_function.sql
```
- [ ] Function replaced successfully without errors
- [ ] No 2BP01 or 42P13 errors occurred
- [ ] Function maintains exact same signature: `get_user_role(user_uuid uuid)`

### 2. Validate Policies
```sql
\i supabase/migrations/validate_rls_policies_after_function_fix.sql
```
- [ ] All policies still reference function correctly
- [ ] Function has SECURITY DEFINER and STABLE properties
- [ ] Permissions granted to authenticated users

### 3. Test Role Access
```sql
\i supabase/migrations/test_user_roles_access.sql
```
- [ ] Admin can access salary_history
- [ ] RH can access salary_history  
- [ ] Gestor can access managed profiles
- [ ] Colaborador can only access own data
- [ ] No unauthorized access granted

## Post-Migration Validation

### Function Properties Check
- [ ] Function exists: `SELECT * FROM pg_proc WHERE proname = 'get_user_role'`
- [ ] Security definer enabled: `prosecdef = true`
- [ ] Volatility is STABLE: `provolatile = 's'`
- [ ] Correct search_path set

### RLS Policies Check
Run this query to verify all policies are intact:
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE qual LIKE '%get_user_role%' OR with_check LIKE '%get_user_role%'
ORDER BY schemaname, tablename;
```
- [ ] All expected policies are listed
- [ ] No policies show as broken or missing

### Application Testing
- [ ] Login as admin - can access all data
- [ ] Login as RH - can access HR data and salary info
- [ ] Login as gestor - can access team member data
- [ ] Login as colaborador - can only access own data
- [ ] No infinite loading or permission errors

## Rollback Plan (If Needed)

If issues occur, execute rollback:
```sql
\i supabase/migrations/rollback_get_user_role.sql
```

### Rollback Steps:
1. [ ] Backup function created successfully
2. [ ] Original function behavior restored
3. [ ] All policies working as before
4. [ ] Application functionality restored

## Success Criteria
- [ ] ✅ No 2BP01 errors when replacing function
- [ ] ✅ No 42P13 errors (parameter names unchanged)
- [ ] ✅ All RLS policies remain functional
- [ ] ✅ No CASCADE operations used
- [ ] ✅ Role-based access tests pass
- [ ] ✅ Application works normally for all user types

## Notes
- Function signature kept identical to avoid policy updates
- SECURITY DEFINER ensures proper privilege escalation
- STABLE marking improves query performance
- Proper error handling with safe defaults
- Rollback plan available if needed

## Approval
- [ ] Database Admin Review
- [ ] Security Review  
- [ ] Application Testing Complete
- [ ] Ready for Production