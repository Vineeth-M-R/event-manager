# 🎨 Event Manager - Art Workshop Organizer

A beautiful, modern event management application for organizing art workshops with seamless Google Calendar integration and database storage.

## ✨ Features

### 📅 **Automatic Google Calendar Integration**
- **One-Click Calendar Events**: Automatically creates Google Calendar events when you submit a form
- **Smart Timezone Handling**: Converts IST (UTC+5:30) to UTC for accurate calendar entries
- **Pre-filled Event Details**: Populates title, date, time, venue, and description automatically
- **No Setup Required**: Uses Google Calendar deep links - no OAuth or API keys needed

### 💾 **Persistent Data Storage**
- **Supabase Integration**: All events are stored securely in a Supabase database
- **View Previous Events**: Access all past submissions in a beautiful table view
- **Real-time Updates**: Instantly see your saved events

### 🎯 **Smart Form Features**
- **Activity Types**: Support for Onesie, Fluid Art, and Canvas workshops
- **Date Validation**: Smart DD/MM format with automatic validation
- **Auto-hiding Messages**: Success notifications disappear after 3 seconds
- **Responsive Design**: Works beautifully on desktop and mobile devices

### 🎨 **Beautiful UI/UX**
- **Modern Dark Theme**: Sleek glassmorphism design with gradient backgrounds
- **Smooth Animations**: Micro-interactions and hover effects
- **Modal Overlay**: Clean table view for browsing previous events
- **Intuitive Layout**: Easy-to-use form with clear labels and validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier works great!)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd event-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema (see Database Setup below)
   - Copy your project URL and anon key

4. **Configure environment**
   
   Create `src/supabaseClient.js`:
   ```javascript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  host_details TEXT,
  participants_count INTEGER,
  per_person_charge NUMERIC(10, 2),
  venue TEXT,
  event_date TEXT NOT NULL,
  event_time TIME NOT NULL,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations
CREATE POLICY "Enable all access for events" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 📖 How to Use

1. **Fill in the Event Details**
   - Select activity type (Onesie, Fluid Art, or Canvas)
   - Enter host details and participant information
   - Add venue, date (DD/MM format), and time
   - Include any additional notes

2. **Submit the Form**
   - Click "Add to calendar"
   - Event is saved to database
   - Google Calendar opens automatically with pre-filled event
   - Success message appears and auto-hides after 3 seconds

3. **View Previous Events**
   - Click "View Responses" button at the top right
   - Browse all past events in a table
   - Click outside or × to close

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Vanilla CSS with modern design patterns
- **Database**: Supabase (PostgreSQL)
- **Calendar**: Google Calendar Deep Links
- **Build Tool**: Vite 7
- **Linting**: ESLint with React plugins

## 📁 Project Structure

```
event-manager/
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Styles and design system
│   ├── calendarUtils.js     # Google Calendar integration
│   ├── supabaseClient.js    # Supabase configuration
│   └── main.jsx             # Application entry point
├── public/                  # Static assets
├── index.html              # HTML template
└── package.json            # Dependencies and scripts
```

## 🎨 Features in Detail

### Google Calendar Integration
The app uses Google Calendar's deep link API to create events without requiring OAuth:
- Converts IST timezone to UTC automatically
- Sets 2-hour default duration
- Includes all event details in description
- Opens in new tab for easy confirmation

### Form Validation
- Required fields: Activity Type, Date, Time
- Date format validation (DD/MM)
- Day range: 01-31
- Month range: 01-12
- Real-time error messages

### Data Storage
All events are stored with:
- Activity type and host details
- Participant count and pricing
- Venue and timing information
- Additional notes
- Automatic timestamp

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

Built with ❤️ for organizing amazing art workshops!

---

**Note**: This app is designed for IST timezone. If you're in a different timezone, update the timezone offset in `calendarUtils.js`.
