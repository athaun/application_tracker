import express from 'express';
import JobApplication from '../models/JobApplication.js';

const router = express.Router();

// Get all job applications
router.get('/', async (req, res) => {
  try {
    const jobs = await JobApplication.find();
    jobs.sort((a, b) => new Date(b._id.getTimestamp()) - new Date(a._id.getTimestamp()));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new job application
router.post('/', async (req, res) => {
  const { company, position, date, status, jobCode, posting, contact, notes } = req.body;

  const newJob = new JobApplication({
    company,
    position,
    date,
    status,
    jobCode,
    posting,
    contact,
    notes,
  });

  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single job application by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update a job application (PUT)
router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await JobApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a job application (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const deletedJob = await JobApplication.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export { router as jobRoutes };