const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const teams = [
  { name: 'Alturos', score: 20313, logo: 'Alturos.jpg' },
  { name: 'Astrabyte', score: 19657, logo: 'Astrabyte.jpg' },
  { name: 'Catalysts', score: 18755, logo: 'Catalysts.jpg' },
  { name: 'Creators', score: 19666, logo: 'Creators.jpg' },
  { name: 'Fourth Dimension', score: 19312, logo: 'Fourth Dimension.jpg' },
  { name: 'Nexora', score: 21653, logo: 'Nexora.jpg' },
  { name: 'OctaCore', score: 17895, logo: 'OctaCore.jpg' },
  { name: 'Synergy Squad', score: 23527, logo: 'Synergy Squad.jpg' },
];

app.get('/api/teams', (req, res) => {
  res.json(teams);
});

app.post('/api/teams/update-score', (req, res) => {
  const { name, delta } = req.body;
  if (typeof name !== 'string' || typeof delta !== 'number') {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const team = teams.find(t => t.name === name);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  team.score += delta;
  res.json({ success: true, team });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
}); 