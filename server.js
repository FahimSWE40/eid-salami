const express = require('express');
const shortid = require('shortid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let data = {};
try {
  data = JSON.parse(fs.readFileSync('data.json'));
} catch (err) {
  data = {};
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/send', (req, res) => {
  const name = req.body.name;
  const message = req.body.message || "Eid Mubarak! Here's your salami!";
  const id = shortid.generate();
  data[id] = { name, message, views: 0 };
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  const fullLink = `${req.protocol}://${req.get('host')}/s/${id}`;
  res.render('link', { link: fullLink });
});

app.get('/s/:id', (req, res) => {
  const id = req.params.id;
  const entry = data[id];
  if (!entry) return res.status(404).send('Invalid or expired link 😢');

  entry.views = (entry.views || 0) + 1;
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

  const notesDir = path.join(__dirname, 'public', 'images', 'tk-notes');
  const notes = fs.readdirSync(notesDir);
  const randomNote = notes[Math.floor(Math.random() * notes.length)];

  res.render('salami', {
    name: entry.name,
    message: entry.message,
    views: entry.views,
    note: `/images/tk-notes/${randomNote}`,
    song: '/audio/eid.mp3'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
