import express from 'express';
import mongoose from 'mongoose';
import { jobRoutes } from './routes/jobs.js';
import JobApplication from './models/JobApplication.js';
import methodOverride from 'method-override';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // To handle PUT & DELETE from forms
app.use(express.static('public')); // Serve static files
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect('mongodb://localhost/jobTracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use('/api/jobs', jobRoutes);

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
