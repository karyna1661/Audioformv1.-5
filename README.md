# Audioform

Audioform is a platform that allows you to create audio-based surveys and collect voice responses from participants.

## Features

- Create audio-based surveys
- Collect voice responses from participants
- Demo mode with 24-hour expiration
- Response analysis and management
- Share surveys via link or QR code

## Documentation

For detailed documentation, see the [User Guide](./docs/user-guide.md).

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
- **responses**: Stores survey responses
- **demo_sessions**: Tracks demo usage
- **analytics_events**: Tracks user interactions

##### RLS Policies
- **Demo Survey Creation**: Allows anonymous users to create demo surveys
- **Demo Response Creation**: Allows anonymous users to submit responses
- **Demo Survey Reading**: Allows creators to view their demos
- **Analytics Tracking**: Allows anonymous event tracking

#### 2. Backend Architecture

##### API Routes
- **/api/demo-create**: Creates demo surveys
- **/api/surveys/[id]**: Manages existing surveys
- **/api/responses**: Handles survey responses

##### Server Actions
- **demo-fallback.ts**: Alternative method for demo creation
- **demo-sessions.ts**: Manages demo session lifecycle
- **analytics.ts**: Tracks user events
- **survey-responses.ts**: Processes survey responses

#### 3. Frontend Architecture

##### Pages
- **/demo**: Demo creation and management
- **/respond/demo/[id]**: Response collection

##### Components
- **DemoCreateForm**: Form for creating demo surveys
- **RecordButton**: Audio recording interface
- **PlayPauseButton**: Audio playback
- **DemoDashboard**: Survey management interface
- **ExpirationStatus**: Shows time remaining
- **ExpirationNotification**: Alerts for expiring demos

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/audioform.git
cd audioform
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`
Edit `.env.local` with your Supabase credentials.

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
