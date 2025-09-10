# Security Configuration Guide

## Environment Variables

### Development
Use `.env` file for development with your development Supabase project credentials.

### Production
Create `.env.production` file with your production Supabase project credentials:

```env
VITE_SUPABASE_URL=https://pbjwtnhpcwkplnyzkrtu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiand0bmhwY3drcGxueXprcnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDE3OTMsImV4cCI6MjA3MTg3Nzc5M30.yisHwRskz-2wpS4fbqarBxPdBSGxFxYiIfF-YOvinq0
```

## Row Level Security (RLS) Checklist

Ensure the following tables have RLS enabled and proper policies:

### Critical Tables (Must have RLS)
- [ ] `profiles` - User profile data
- [ ] `pdi_objectives` - Personal development objectives
- [ ] `assessments` - Competency assessments
- [ ] `hr_records` - HR consultation records
- [ ] `hr_tests` - Psychological tests and results
- [ ] `salary_history` - Salary information
- [ ] `touchpoints` - Manager-employee meetings
- [ ] `pdi_comments` - Comments on PDI objectives
- [ ] `achievements` - User achievements

### Standard Tables (Should have RLS)
- [ ] `teams` - Team information
- [ ] `career_tracks` - Career progression tracks
- [ ] `career_stages` - Career stages
- [ ] `competencies` - Competency definitions
- [ ] `action_groups` - Action groups
- [ ] `action_group_members` - Group membership
- [ ] `action_group_tasks` - Group tasks

## RLS Policy Examples

### User Profile Access
```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### Manager Access
```sql
-- Managers can view their team members' data
CREATE POLICY "Managers can view team data" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'gestor'
    AND gestor_id = auth.uid()
  );
```

### HR Access
```sql
-- HR can access all records
CREATE POLICY "HR full access" ON hr_records
  FOR ALL USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'rh'
  );
```

## Security Best Practices

1. **Never expose service_role keys** in frontend code
2. **Always use RLS** for user data tables
3. **Validate user permissions** in application logic
4. **Use HTTPS** in production
5. **Implement proper error handling** to avoid information leakage
6. **Regular security audits** of RLS policies
7. **Monitor access logs** in Supabase dashboard

## Verification Steps

1. Test RLS policies by attempting unauthorized access
2. Verify environment variables are correctly set
3. Check that no sensitive keys are exposed in client code
4. Ensure all API endpoints respect user permissions
5. Test authentication flows thoroughly

## Emergency Procedures

If a security breach is suspected:

1. Immediately revoke and regenerate API keys
2. Review and tighten RLS policies
3. Check access logs for suspicious activity
4. Update all environment variables
5. Notify affected users if necessary