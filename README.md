<h1 align="center">DailyPP</h1>
<p align="center">
	Daily osu! map recommendation web service
</p>
<div align="center">
  <img src="https://github.com/user-attachments/assets/f8fb0208-c39b-4d30-96e6-1c2f15b6118f" alt="DailyPP Landing Page"/>
</div>

<h2 align="left">Key Features</h2>

<h3 align="left">1. Personalized Beatmap Recommendations</h3>

- User PP-based difficulty adjustment
- Tiered recommendations (Easy, Normal, Hard)
- Beatmap filtering (planned)

<h3 align="left">2. Daily Challenges</h3>

- 3 beatmaps per difficulty level
- Clear by achieving S rank or higher
- Detailed information (difficulty, BPM, length, estimated PP)

<h3 align="left">3. Statistics & Progress</h3>

- Daily/weekly challenge completion rates
- Completion streak tracking
- PP growth graph
- Difficulty-based clear statistics

<h3 align="left">4. Demo Mode (/demo)</h3>

Preview service features without login
- Challenge system preview
- Dashboard and statistics experience

<h2 align="left">Recommendation Algorithm</h2>

Difficulty is calculated using:
```
difficulty_range = stable_top_play_stars + offset ± margin
```

<h3 align="left">Difficulty Settings</h3>

- **Easy**: Base - 1.0 ± 0.25
- **Normal**: Base - 0.25 ± 0.25
- **Hard**: Base + 0.45 ± 0.25

<h2 align="left">Tech Stack</h2>

<h3 align="left">Frontend</h3>

- SvelteKit
- TailwindCSS
- TypeScript
- Chart.js

<h3 align="left">Backend</h3>

- MongoDB
- mongoose
- osu! OAuth
- JWT authentication

<h2 align="left">Development Setup</h2>

1. Clone repository and install dependencies
```bash
git clone https://github.com/root39293/dailypp.git
cd dailypp
npm install
```

2. Set environment variables (.env)
```bash
VITE_MONGODB_URI="mongodb_uri"
OSU_CLIENT_ID="your_osu_client_id"
OSU_CLIENT_SECRET="your_osu_client_secret"
PUBLIC_BASE_URL="your_vercel_url"
```

3. Run development server
```bash
npm run dev
```

<h2 align="left">License</h2>

MIT License
