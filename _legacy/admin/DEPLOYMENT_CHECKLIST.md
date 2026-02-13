# Deployment Checklist - Destinations Manager

Follow this checklist to ensure the Destinations Management Interface is properly deployed and functional.

## Pre-Deployment

### 1. Supabase Configuration
- [ ] Supabase project created
- [ ] Database schema deployed (see `/supabase/schema.sql`)
- [ ] Storage bucket `media` created
- [ ] Storage bucket is set to **public**
- [ ] RLS policies configured (if using auth)
- [ ] Credentials updated in `/supabase-client.js`:
  - [ ] `SUPABASE_URL` set
  - [ ] `SUPABASE_ANON_KEY` set

### 2. Database Setup
- [ ] `destinations` table exists
- [ ] `themes` table exists with seed data
- [ ] `media` table exists
- [ ] Sample data loaded (optional)

### 3. File Structure
- [ ] `/admin/destinations.html` exists
- [ ] `/admin/admin.css` exists
- [ ] `/admin/components/map-picker.js` exists
- [ ] `/supabase-client.js` exists in root

### 4. Dependencies Check
All CDN resources accessible:
- [ ] Supabase JS Client: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- [ ] Leaflet JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
- [ ] Leaflet CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`

## Testing Checklist

### Initial Load
- [ ] Page loads without errors
- [ ] No console errors
- [ ] "Loading destinations..." appears initially
- [ ] Destinations load and display in table
- [ ] Themes load in form

### Search & Filter
- [ ] Search box filters in real-time
- [ ] Category filter works
- [ ] Status filter (all/published/draft) works
- [ ] Multiple filters work together
- [ ] Empty state shows when no results

### Add Destination
- [ ] "Add New Destination" button opens modal
- [ ] Form is empty/reset
- [ ] Title auto-generates slug
- [ ] Map displays centered on Sweden
- [ ] Click map places marker
- [ ] Coordinates update when clicking map
- [ ] Manual coordinate entry works
- [ ] Marker is draggable
- [ ] Image upload area visible
- [ ] Themes checkboxes display
- [ ] Season checkboxes display
- [ ] Required fields marked with asterisk
- [ ] Save button enabled

### Image Upload
- [ ] Click upload area opens file picker
- [ ] Drag-and-drop works
- [ ] Preview displays after selection
- [ ] Remove image button works
- [ ] File type validation works (reject non-images)
- [ ] File size validation works (reject > 10MB)
- [ ] Progress indicator shows during upload
- [ ] Image uploads to Supabase Storage
- [ ] Public URL is returned

### Save Destination
- [ ] Validation prevents empty required fields
- [ ] Success message appears on save
- [ ] Modal closes after save
- [ ] New destination appears in table
- [ ] All fields saved correctly:
  - [ ] Title
  - [ ] Slug
  - [ ] Description
  - [ ] Category
  - [ ] Latitude/Longitude
  - [ ] Image URL
  - [ ] Theme IDs
  - [ ] Seasons
  - [ ] Published status

### Edit Destination
- [ ] Click row opens edit modal
- [ ] Edit button (pencil) opens modal
- [ ] All fields pre-filled with current data
- [ ] Image preview shows if image exists
- [ ] Map shows marker at correct location
- [ ] Theme checkboxes show correct selections
- [ ] Season checkboxes show correct selections
- [ ] Changes save correctly
- [ ] Table updates after save

### Delete Destination
- [ ] Delete button (trash) opens confirmation
- [ ] Confirmation shows destination name
- [ ] Cancel button closes dialog without deleting
- [ ] Delete button removes destination
- [ ] Success message appears
- [ ] Table updates (destination removed)

### Modal Behavior
- [ ] ESC key closes modal
- [ ] Click outside modal closes it
- [ ] Close button (X) works
- [ ] Map refreshes when modal opens
- [ ] Multiple modals don't stack

### Responsive Design
- [ ] Desktop layout works (> 1024px)
- [ ] Tablet layout works (768px - 1024px)
- [ ] Mobile layout works (< 768px)
- [ ] Table scrolls horizontally on mobile
- [ ] Form stacks properly on mobile
- [ ] Map remains usable on mobile

## Performance Testing

- [ ] Page loads in < 2 seconds
- [ ] Search/filter responds instantly
- [ ] Map initializes quickly
- [ ] Image upload shows progress
- [ ] No memory leaks (check DevTools)
- [ ] Map destroys properly when modal closes

## Browser Compatibility

Test in these browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Security Checklist

- [ ] Authentication required (implement if needed)
- [ ] Authorization checks in place
- [ ] Input validation on client side
- [ ] Input validation on server side (Supabase RLS)
- [ ] XSS protection (no innerHTML with user data)
- [ ] File upload restrictions enforced
- [ ] Storage bucket has correct permissions
- [ ] HTTPS enabled in production
- [ ] API keys not exposed in client code

## Accessibility

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Form labels properly associated
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG standards
- [ ] Images have alt text
- [ ] Error messages are clear

## Production Readiness

### Configuration
- [ ] Supabase URL points to production
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)

### Performance
- [ ] Images optimized before upload
- [ ] CDN links use integrity hashes
- [ ] No console.log in production (optional)

### Documentation
- [ ] README.md reviewed
- [ ] QUICK_START.md available for users
- [ ] Team trained on usage
- [ ] Backup/restore process documented

### Monitoring
- [ ] Error logging in place
- [ ] Usage metrics tracked (optional)
- [ ] Uptime monitoring configured

## Post-Deployment

### Immediate Checks (within 1 hour)
- [ ] Test add/edit/delete in production
- [ ] Verify image uploads work
- [ ] Check all filters work
- [ ] Monitor for errors

### Day 1 Checks
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Verify data integrity

### Week 1 Checks
- [ ] Review usage patterns
- [ ] Identify any pain points
- [ ] Plan improvements based on feedback

## Common Issues & Solutions

### Map not displaying
**Solution**: Ensure modal is fully visible before initializing map. Call `mapPicker.refresh()` after modal opens.

### Images not uploading
**Solution**:
1. Check Storage bucket exists and is public
2. Verify CORS settings in Supabase
3. Check file size < 10MB
4. Verify internet connection

### Destinations not loading
**Solution**:
1. Check Supabase credentials
2. Verify database schema matches expected structure
3. Check browser console for errors
4. Test Supabase connection manually

### Performance slow with many destinations
**Solution**:
1. Implement pagination (future enhancement)
2. Add database indexes
3. Optimize images
4. Enable caching

## Rollback Plan

If issues occur:
1. Note the specific error
2. Check error logs
3. Verify recent changes
4. Restore from backup if needed
5. Revert to previous working version

## Success Criteria

Deployment is successful when:
- [ ] All tests pass
- [ ] No critical errors in console
- [ ] Users can perform all CRUD operations
- [ ] Images upload successfully
- [ ] Data persists correctly
- [ ] Performance is acceptable
- [ ] Mobile experience is smooth

## Sign-Off

- [ ] Developer tested: _________________ Date: _______
- [ ] QA tested: _________________ Date: _______
- [ ] Client approved: _________________ Date: _______
- [ ] Deployed to production: _________________ Date: _______

---

**Version**: 1.0.0
**Last Updated**: October 2024
**Maintained By**: Development Team
