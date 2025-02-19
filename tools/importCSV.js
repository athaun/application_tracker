import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import JobApplication from '../models/JobApplication.js';

mongoose.connect('mongodb://localhost/jobTracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const filePath = './tools/Applications.csv';

const importCSV = async () => {
  const jobs = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Map CSV columns to schema fields
      jobs.push({
        company: row.Company,
        position: row.Position,
        date: new Date(row.Date),
        status: row.Status,
        jobCode: row.JobCode || '',
        posting: row.Posting || '',
        contact: row.Contact || '',
        notes: row.Notes || ''
      });
    })
    .on('end', async () => {
      try {
        await JobApplication.insertMany(jobs);
        console.log(`${jobs.length} job applications imported successfully!`);
        mongoose.connection.close();
      } catch (error) {
        console.error('Error inserting data:', error);
      }
    });
};

importCSV();
