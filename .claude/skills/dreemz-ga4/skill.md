---
name: dreemz-ga4
description: |
  Dreemz GA4 analytics via Dream Tools (GA4 API + BigQuery). Use this skill when:
  (1) Analyzing user behavior with GA4 events/screens
  (2) Building funnels or user journeys
  (3) Using topScreens, topEvents, userJourney, funnel, etc.
  (4) Tracking screen flows or event patterns
  Triggers: "GA4", "BigQuery", "funnel", "user journey", "screen flow", "events", "analytics", "topScreens", "topEvents"
---

# Dreemz GA4 Analytics

## REFERENCE DOCS

Load as needed:
- `references/DOCUMENTATION.md` - Full API reference
- `references/QUICK_REFERENCE.md` - Quick examples
- `references/GUIDE.md` - Usage guide

## TOOLS OVERVIEW

### GA4 Data API (Free)

| Tool | Use For |
|------|---------|
| `topScreens` | Most viewed screens |
| `topEvents` | Most triggered events |
| `screenFlow` | Screen transitions |
| `screenEvents` | Events on a screen |
| `eventDrill` | Event deep dive |

### BigQuery (~$0.001-0.005/query)

| Tool | Use For |
|------|---------|
| `topUsers` | Most active users |
| `userJourney` | User's event timeline |
| `userProfile` | User summary stats |
| `funnel` | Conversion funnels |
| `findUsers` | Find users by event/screen |

## KEY SCREENS

| Screen | Purpose |
|--------|---------|
| `HomePage` | Main feed |
| `AddNewDreamTitlePage` | Dream creation |
| `TakeVideoPage` | Record video |
| `ChallengeMapPage` | Daily challenges |
| `AIChatPage` | AI coach |
| `ProfileOwnerPage` | User profile |

## KEY EVENTS (drmz_*)

| Event | Meaning |
|-------|---------|
| `drmz_swap_post` | Swiped in feed |
| `drmz_registration_6_success` | Completed registration |
| `drmz_upload_video_success` | Video uploaded |
| `drmz_dream_add` | Dream created |
| `drmz_comment_add` | Added comment |
| `drmz_follow_user` | Followed user |

## COMMON FUNNELS

**Onboarding:**
```
OnboardingVideoPage → PhoneLoginPage → VerifyCodePage → RegistrationPage → HomePage
```

**Dream Creation:**
```
HomePage → AddNewDreamTitlePage → MilestonesAiSuggestionPage → TakeVideoPage → ReviewVideoPage
```

## USAGE

```javascript
// Funnel analysis
await funnel({
  screens: ['PhoneLoginPage', 'RegistrationPage', 'HomePage'],
  days: 30,
  includeUsers: true
});

// User journey
await userJourney({ userId: 'username', days: 7 });

// Top screens
await topScreens({ days: 7, limit: 10 });
```
