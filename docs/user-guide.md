# Audioform User Documentation

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Creating a Demo Survey](#creating-a-demo-survey)
- [Responding to a Survey](#responding-to-a-survey)
- [Managing Your Demo](#managing-your-demo)
- [Analyzing Responses](#analyzing-responses)
- [Demo Expiration](#demo-expiration)
- [System Architecture Overview](#system-architecture-overview)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Troubleshooting](#troubleshooting)

## Introduction

Audioform is a platform that allows you to create audio-based surveys and collect voice responses from participants. The demo feature lets you try out the platform without creating an account, with surveys that automatically expire after 24 hours.

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone access for recording responses
- Internet connection

### Accessing the Platform

1. Visit [audioform.app](https://audioform.app)
2. Click "Try Demo" to create a demo survey without signing up

## Creating a Demo Survey

1. Navigate to the demo creation page at `/demo`
2. Enter a title for your survey
3. Add questions by clicking the "Add Question" button
4. (Optional) Enter your email to receive notifications about responses
5. Click "Create Demo Survey"
6. You'll be redirected to your demo dashboard

### Demo Limitations

- Demo surveys expire after 24 hours
- Limited to 10 questions per survey
- Audio responses are limited to 60 seconds each

## Responding to a Survey

1. Open the survey link provided by the creator
2. Read the question displayed on screen
3. Click the microphone button to start recording
4. Speak your response
5. Click the stop button when finished
6. Review your response by playing it back
7. Click "Submit" to send your response or "Re-record" to try again
8. Continue to the next question until complete

### Tips for Quality Responses

- Find a quiet environment
- Speak clearly and at a normal pace
- Position yourself 6-12 inches from the microphone
- Test your microphone before starting

## Managing Your Demo

The demo dashboard allows you to:

- View your survey questions
- See responses as they come in
- Share your survey via link or QR code
- Track time remaining before expiration
- Download responses (audio files)

### Sharing Your Survey

1. From your dashboard, click "Share Survey"
2. Copy the link provided or download the QR code
3. Share with your participants via email, messaging, or social media

## Analyzing Responses

1. Access the "Responses" tab in your dashboard
2. Listen to individual responses by clicking the play button
3. View response metadata (timestamp, duration)
4. (Premium feature) View automated transcriptions and sentiment analysis

## Demo Expiration

Demo surveys automatically expire after 24 hours. You'll see:

- A countdown timer on your dashboard
- Email notifications (if provided) at 6 hours and 1 hour before expiration
- Option to sign up for a full account to preserve your data

### Extending Your Demo

To preserve your demo survey and responses beyond 24 hours:

1. Click "Sign Up" before expiration
2. Create a full account
3. Your demo will be automatically converted to a standard survey

## System Architecture Overview

### Frontend Response Flow

When a user submits the demo creation form, here's how the frontend responds:

#### 1. Form Submission
- **Initial State**: User fills out the form with title, questions, and optional email
- **Validation**: Client-side validation checks for required fields before submission
- **Submit Button**: Changes to "Saving..." with a loading spinner

#### 2. During API Call
- **Loading State**: Show a loading indicator (spinner or progress bar)
- **Disable Form**: Prevent multiple submissions by disabling the form
- **Optional**: Show a toast notification "Creating your demo..."

#### 3. Success Response
- **Toast Notification**: "Demo survey created successfully!"
- **Redirect**: Automatically navigate to `/demo?demoId=${demoId}`
- **Dashboard View**: Show the newly created survey with:
  - Survey title and questions
  - Expiration countdown
  - Share button for distributing the survey
  - Empty response section (since no responses yet)

#### 4. Error Response
- **Toast Notification**: Show error message from API or fallback message
- **Form Recovery**: Re-enable the form for editing
- **Error Details**: Optionally show more details for debugging
- **Retry Button**: Allow user to try again

#### 5. Micro Interactions
- **Button Feedback**: Subtle animation when clicking submit
- **Form Field Validation**: Real-time validation with color changes
- **Question Addition**: Smooth animation when adding new questions
- **Toast Notifications**: Slide in/out animations
- **Loading States**: Pulsing animations or progress indicators

### Complete Build Overview

#### 1. Database Architecture

##### Tables
- **surveys**: Stores survey metadata and questions
  - `id`: UUID primary key
  - `title`: Survey title
  - `questions`: JSONB array of questions
  - `type`: Enum ('standard', 'demo')
  - `created_at`: Timestamp
  - `expires_at`: Timestamp for demo expiration
  - `user_id`: Foreign key to users (null for demos)

- **responses**: Stores survey responses
  - `id`: UUID primary key
  - `survey_id`: Foreign key to surveys
  - `question_id`: Question identifier
  - `audio_path`: Path to audio file in storage
  - `email`: Respondent email (optional)
  - `created_at`: Timestamp

- **demo_sessions**: Tracks demo usage
  - `id`: UUID primary key
  - `survey_id`: Foreign key to surveys
  - `expires_at`: Timestamp
  - `email`: Creator email (optional)
  - `notified`: Boolean for expiration notification
  - `created_at`: Timestamp

- **analytics_events**: Tracks user interactions
  - `id`: UUID primary key
  - `event_name`: Event identifier
  - `properties`: JSONB of event properties
  - `survey_id`: Related survey (optional)
  - `session_id`: Browser session
  - `created_at`: Timestamp

##### RLS Policies
- **Demo Survey Creation**: Allows anonymous users to create demo surveys
- **Demo Response Creation**: Allows anonymous users to submit responses
- **Demo Survey Reading**: Allows creators to view their demos
- **Analytics Tracking**: Allows anonymous event tracking

#### 2. Backend Architecture

##### API Routes
- **/api/demo-create**: Creates demo surveys
  - Handles form submission
  - Creates survey record
  - Creates demo session
  - Tracks analytics event

- **/api/surveys/[id]**: Manages existing surveys
  - GET: Retrieves survey details
  - PUT: Updates survey
  - DELETE: Removes survey

- **/api/responses**: Handles survey responses
  - POST: Creates new response with audio

##### Server Actions
- **demo-fallback.ts**: Alternative method for demo creation
- **demo-sessions.ts**: Manages demo session lifecycle
- **analytics.ts**: Tracks user events
- **survey-responses.ts**: Processes survey responses

##### Storage
- **demo-audio/**: Bucket for audio recordings
  - Organized by survey ID
  - Automatic expiration after 24 hours

#### 3. Frontend Architecture

##### Pages
- **/demo**: Demo creation and management
  - Creation form
  - Dashboard view with responses
  - Expiration notifications

- **/respond/demo/[id]**: Response collection
  - Question display
  - Audio recording interface
  - Email capture
  - Submission confirmation

##### Components

###### Survey Creation
- **DemoCreateForm**: Form for creating demo surveys
  - Title input
  - Email input (optional)
  - Dynamic question fields
  - Submit button with loading state

###### Survey Response
- **RecordButton**: Audio recording interface
  - Recording visualization
  - Start/stop controls
  - Processing indicator

- **PlayPauseButton**: Audio playback
  - Waveform visualization
  - Progress indicator
  - Volume control

###### Dashboard
- **DemoDashboard**: Survey management interface
  - Response listing
  - Share functionality
  - Expiration status

- **ExpirationStatus**: Shows time remaining
  - Countdown timer
  - Color-coded status indicators

- **ExpirationNotification**: Alerts for expiring demos
  - Waitlist signup option
  - Extension prompts

#### 4. State Management & Data Flow

##### Client-Side
- **React State**: Local component state
- **Context API**: For analytics and shared state
- **localStorage**: For session persistence

##### Server-Side
- **Supabase Client**: Database and storage access
- **Environment Variables**: Configuration management
- **Server Actions**: Server-side logic

#### 5. Authentication & Security

##### Anonymous Access
- **Demo Mode**: No login required
- **RLS Policies**: Secure data access
- **Email Collection**: Optional for notifications

##### Service Role Access
- **Admin Functions**: Using service role key
- **Fallback Mechanisms**: When service role unavailable

#### 6. Analytics & Tracking

##### Events Tracked
- **demo_form_viewed**: User views creation form
- **demo_submission_started**: User begins submission
- **demo_submission_completed**: Demo successfully created
- **demo_submission_error**: Creation failed
- **demo_viewed**: Dashboard viewed
- **demo_shared**: Survey link shared
- **responses_received**: First response received
- **audio_played**: Response audio played

##### Conversion Funnel
- Form View → Creation → Sharing → Responses → Waitlist

#### 7. Micro Interactions & UX Details

##### Form Interactions
- **Question Addition**: Smooth slide-down animation
- **Field Validation**: Real-time feedback with color changes
- **Submit Button**: State changes (idle → loading → success/error)

##### Audio Recording
- **Microphone Access**: Permission request with clear instructions
- **Recording Indicator**: Pulsing red dot during recording
- **Waveform Visualization**: Real-time audio visualization
- **Processing Indicator**: Shows when audio is being processed

##### Navigation
- **Mobile Swipe**: Swipe between questions on mobile
- **Progress Indicators**: Shows completion status
- **Breadcrumbs**: Clear navigation path

##### Notifications
- **Toast Messages**: Non-intrusive notifications
- **Expiration Alerts**: Increasingly urgent as deadline approaches
- **Success Animations**: Subtle celebration on completion

##### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Clear focus indicators

## Frequently Asked Questions

### General Questions

**Q: Is my data secure?**
A: Yes, all data is encrypted in transit and at rest. Demo surveys are automatically deleted after 24 hours.

**Q: Do I need to create an account?**
A: No, the demo feature allows you to create surveys without an account. However, to preserve your data beyond 24 hours, you'll need to sign up.

**Q: How many responses can I collect?**
A: Demo surveys can collect up to 100 responses within the 24-hour period.

### Technical Questions

**Q: Which browsers are supported?**
A: Audioform works on Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of Chrome.

**Q: Can I use Audioform on mobile devices?**
A: Yes, Audioform is fully responsive and works on mobile devices. Respondents can record answers directly from their smartphones.

**Q: What happens if I lose my survey link?**
A: If you provided an email during creation, you can request the link to be resent. Otherwise, you'll need to create a new demo survey.

## Troubleshooting

### Common Issues

#### Microphone Access

If respondents can't record audio:

1. Check browser permissions for microphone access
2. Ensure no other applications are using the microphone
3. Try refreshing the page
4. Try a different browser

#### Survey Creation Failures

If you encounter errors when creating a demo:

1. Check your internet connection
2. Ensure all required fields are filled out
3. Try using a simpler title (avoid special characters)
4. Clear browser cache and try again

#### Playback Issues

If audio doesn't play back correctly:

1. Check device volume and unmute
2. Try using headphones
3. Ensure the audio file was successfully uploaded
4. Try a different browser

### Getting Help

For additional support:

- Email: support@audioform.app
- Twitter: @AudioformApp
- Live chat available on the website during business hours
