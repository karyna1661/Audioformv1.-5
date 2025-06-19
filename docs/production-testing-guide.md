# 🚀 Production Testing Guide

## Pre-Deployment Checklist

### 1. Environment Variables Verification
Ensure all required environment variables are set in Vercel:

\`\`\`bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://voxera.vercel.app
\`\`\`

### 2. Build Verification
\`\`\`bash
# Test local build
npm run build
npm run start

# Verify no build errors
npm run lint
npm run type-check
\`\`\`

## Deployment Steps

### 1. Deploy to Vercel
\`\`\`bash
# Using Vercel CLI
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
\`\`\`

### 2. Verify Deployment Status
- Check Vercel dashboard for successful deployment
- Verify domain is accessible: https://voxera.vercel.app
- Check deployment logs for any errors

## Post-Deployment Testing

### 1. System Health Check
Visit: https://voxera.vercel.app/system-health
- Run comprehensive health checks
- Verify all systems show "success" status
- Address any errors or warnings

### 2. Core Functionality Testing

#### A. Survey Creation Flow
1. Navigate to: https://voxera.vercel.app/surveys/new
2. Create a test survey with multiple questions
3. Verify survey is created successfully
4. Note the survey ID for further testing

#### B. Direct Response Link Testing
1. Copy the generated response link
2. Verify URL format: `https://voxera.vercel.app/respond/[survey-id]`
3. Open link in new browser/incognito window
4. Verify survey loads without 404 error
5. Test on mobile device

#### C. Audio Recording Testing
1. Navigate to response page
2. Test audio recording functionality
3. Record responses for each question
4. Verify navigation between questions works
5. Submit complete survey

#### D. Real-time Response Counter
1. Open survey dashboard in one browser
2. Submit responses from another browser/device
3. Verify response counter updates in real-time
4. Check counter accuracy matches actual submissions

### 3. Performance Testing

#### A. Page Load Times
- Home page: < 2 seconds
- Survey creation: < 3 seconds
- Response page: < 2 seconds
- Dashboard: < 3 seconds

#### B. Audio Upload Performance
- Test with various audio lengths (30s, 1min, 2min)
- Verify upload progress indicators
- Check for timeout issues

### 4. Cross-Browser Testing

Test on:
- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Firefox (Desktop)
- ✅ Edge (Desktop)

### 5. Mobile Responsiveness
- Test on various screen sizes
- Verify touch interactions work
- Check audio recording on mobile
- Test navigation and buttons

### 6. Error Handling Testing

#### A. Invalid Survey IDs
- Test: https://voxera.vercel.app/respond/invalid-id
- Should show proper error message, not crash

#### B. Expired Surveys
- Create survey with past expiration date
- Verify proper expiration message

#### C. Network Issues
- Test with slow/intermittent connection
- Verify proper error messages and retry mechanisms

## Critical Test Cases

### Test Case 1: End-to-End Survey Flow
\`\`\`
1. Create survey → 2. Copy link → 3. Open in new browser → 
4. Record responses → 5. Submit → 6. Verify in dashboard
\`\`\`

### Test Case 2: Real-time Updates
\`\`\`
1. Open dashboard → 2. Submit response from mobile → 
3. Verify counter updates immediately
\`\`\`

### Test Case 3: URL Generation Accuracy
\`\`\`
1. Create multiple surveys → 2. Verify each generates unique, valid URLs → 
3. Test each URL accessibility
\`\`\`

## Monitoring & Alerts

### 1. Set up Vercel Analytics
- Monitor page views and performance
- Track error rates
- Set up alerts for high error rates

### 2. Database Monitoring
- Monitor Supabase dashboard
- Check for query performance issues
- Verify storage usage

### 3. Real-time Monitoring
- Test real-time subscriptions periodically
- Monitor WebSocket connections
- Check for subscription leaks

## Rollback Plan

If critical issues are found:

### 1. Immediate Rollback
\`\`\`bash
# Rollback to previous deployment
vercel rollback [deployment-url]
\`\`\`

### 2. Emergency Fixes
- Identify root cause
- Apply minimal fix
- Test in staging
- Deploy fix

## Success Criteria

Deployment is considered successful when:

- ✅ All health checks pass
- ✅ Survey creation works flawlessly
- ✅ Response URLs are accessible (no 404s)
- ✅ Real-time counter updates correctly
- ✅ Audio recording and upload works
- ✅ Cross-browser compatibility confirmed
- ✅ Mobile responsiveness verified
- ✅ Performance metrics meet targets
- ✅ Error handling works properly

## Post-Deployment Actions

1. **Update Documentation**: Record any deployment notes
2. **Monitor for 24 hours**: Watch for any issues
3. **User Communication**: Notify users of updates if needed
4. **Backup Verification**: Ensure data backup systems work
5. **Performance Baseline**: Record performance metrics

## Emergency Contacts

- **Technical Lead**: [Your contact]
- **DevOps**: [DevOps contact]
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com

---

## Quick Test Commands

\`\`\`bash
# Run deployment verification
npm run test:deployment

# Check build
npm run build

# Test locally
npm run dev

# Check logs
vercel logs [deployment-url]
