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
-- Users can manage their own profile (view and update)
CREATE POLICY "users_can_manage_own_profile" ON profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Manager Access (Non-Recursive)
```sql
-- Managers can view their direct reports using foreign key relationship
CREATE POLICY "managers_can_view_direct_reports" ON profiles
  FOR SELECT USING (gestor_id = auth.uid());
```

### Team Relationship Access
```sql
-- Team members can view related profiles (manager, direct reports)
CREATE POLICY "team_members_can_view_related_profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id = (SELECT gestor_id FROM profiles WHERE user_id = auth.uid() LIMIT 1) OR
    gestor_id = auth.uid()
  );
```

### Important: Avoiding Infinite Recursion

**CRITICAL:** Never create RLS policies that query the same table they're protecting within the policy condition. This causes infinite recursion.

**❌ BAD - Causes Infinite Recursion:**
```sql
-- This will cause infinite recursion!
CREATE POLICY "bad_policy" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
  );
```

**✅ GOOD - Uses Direct Relationships:**
```sql
-- This uses direct foreign key relationships
CREATE POLICY "good_policy" ON profiles
  FOR SELECT USING (gestor_id = auth.uid());
```

### HR and Admin Access

For HR and Admin roles that need full access, consider these approaches:

1. **Custom JWT Claims (Recommended):**
   - Store user role as a custom claim in the JWT
   - Use `auth.jwt() ->> 'app_role'` in policies

2. **Application-Level Logic:**
   - Handle admin operations in your application code
   - Use service role key for admin-only operations

3. **Separate Admin Interface:**
   - Create admin-specific endpoints that bypass RLS

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