import express from 'express';
import mongoose from 'mongoose';
import { jobRoutes } from './routes/jobs.js';
import { llmRoutes } from './routes/llm.js';
import { resumeRoutes } from './routes/resume.js';
import JobApplication from './models/JobApplication.js';
import methodOverride from 'method-override';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // To handle PUT & DELETE from forms
app.use(express.static('public')); // Serve static files
app.set('view engine', 'ejs');
app.use(morgan('combined'))

// Add this middleware before your routes
app.use(express.json({ 
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

// MongoDB Connection
mongoose.connect('mongodb://localhost/jobTracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/llm/', llmRoutes)
app.use('/api/resume/', resumeRoutes)

// Home Route (Render all jobs)
app.get('/', async (req, res) => {
  const jobs = await JobApplication.find();
  res.render('index', { jobs });
});

app.get('/edit/:id', async (req, res) => {
  const job = await JobApplication.findById(req.params.id);
  res.render('edit', { job });
});


// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
