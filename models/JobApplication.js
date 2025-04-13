import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  jobCode: {
    type: String,
  },
  posting: { // URL of the job posting
    type: String,
  },
  contact: {
    type: String,
  },
  notes: {
    type: String,
  },
  requirements: {
    type: [String],
  },
  description: {
    type: String,
  },
  skills: {
    type: [String],
  },
  location: {
    type: String,
  },
  salary: {
    type: String,
  },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
