import mongoose from 'mongoose';
import JobApplication from '../models/JobApplication.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost/jobTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Connection error:", err));

const cleanupStatuses = async () => {
    try {
        // Get all job applications
        const applications = await JobApplication.find({});
        
        for (const application of applications) {
            let newStatus = application.status;
            let statusChanged = false;
            
            // Convert status to lowercase for consistent comparison
            const currentStatus = application.status.toLowerCase();
            
            // Handle rejected/denied cases
            if (currentStatus === 'denied' || currentStatus === 'rejected') {
                newStatus = 'Rejected';
                statusChanged = true;
            }
            // Handle interview cases
            else if (currentStatus.toLowerCase().includes('interview')) {
                newStatus = 'Interview';
                statusChanged = true;
            }
            
            if (statusChanged) {
                // Update the application
                await JobApplication.updateOne(
                    { _id: application._id },
                    { $set: { status: newStatus } }
                );
                console.log(`Updated ${application.company} - ${application.position}`);
                console.log(`Status changed from "${application.status}" to "${newStatus}"`);
            } else {
                // Log applications that weren't changed
                console.log(`Unchanged status for ${application.company}: "${application.status}"`);
            }
        }
        
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

cleanupStatuses();