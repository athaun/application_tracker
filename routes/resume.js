import express from 'express';
import path from 'path';
import pdfmake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
pdfmake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfmake.vfs;

const router = express.Router();

// Create PDF document and return as Buffer using a Promise
const createPdfBuffer = (docDefinition) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('Creating PDF document...');
            const pdfDoc = pdfMake.createPdf(docDefinition);

            console.log('Getting PDF buffer...');
            pdfDoc.getBuffer((buffer) => {
                console.log(`Buffer generated: ${buffer ? 'success' : 'null or undefined'}`);
                if (buffer) {
                    resolve(buffer);
                } else {
                    reject(new Error('PDF buffer is null or undefined'));
                }
            });
        } catch (err) {
            console.error('Error in createPdfBuffer:', err);
            reject(err);
        }
    });
};

// Generate a resume based on job details
router.post('/generate', async (req, res) => {
    const { jobDetails } = req.body;
    if (!jobDetails) {
        return res.status(400).json({ message: 'Job details are required' });
    }

    try {
        // Resume data structure - similar to your EJS template data
        const resumeData = {
            name: "Asher Haun",
            contact: {
                email: "asher.haun@outlook.com",
                location: "Fort Worth, Texas",
                phone: "(682) 444 5533",
                linkedin: "linkedin.com/in/athaun",
                github: "github.com/athaun",
                portfolio: "athaun.tech"
            },
            objective: "Software Engineer specializing in embedded software and GPGPU programming.",
            education: {
                degree: "Bachelor of Computer Science",
                honors: "Summa Cum Laude",
                university: "University of Texas Rio Grande Valley",
                gpa: "3.9",
            },
            skills: [
                "C++", "Cuda", "OpenGL", "Linux", "Git", "Python", "Java", ".NET",
                "Agile", "UDP, TCP, IP", "Data structures and algorithms"
            ],
            experience: [
                {
                    title: "Software Engineer",
                    company: "Idaho National Laboratory",
                    type: "Internship",
                    dates: "Summer 2024",
                    responsibilities: [
                        "Implemented complex features, fixed bugs, participated in beta testing, customer support and the application release cycle to track nuclear materials.",
                        "Employed Ruby on Rails and Typescript with Angular in a split architecture application."
                    ]
                },
                {
                    title: "Software Engineer",
                    company: "UTRGV",
                    type: "Contract",
                    dates: "2022-2024",
                    responsibilities: [
                        "Designed and developed an application to streamline grading system for professors and students saving hundreds of hours each week by automating reports. Chose JavaScript and MongoDB for their large developer base and future maintainability.",
                        "Responsible for application requirements, design, development, installation and testing."
                    ]
                },
                {
                    title: "Software Engineer",
                    company: "General Motors Financial",
                    type: "Internship",
                    dates: "Summer 2023",
                    responsibilities: [
                        "Gathered requirements for reporting system to automate manual processes.",
                        "Developed features for credit inquiry application front end and back end using .NET and SQL."
                    ]
                },
                {
                    title: "Research Assistant",
                    company: "UTRGV",
                    type: "Volunteer and Paid",
                    dates: "2022-present",
                    responsibilities: [
                        "Developing a performance focused, C++ and Vulkan GPGPU simulator."
                    ]
                },
                {
                    title: "Research Apprentice",
                    company: "TCU",
                    type: "Volunteer",
                    dates: "2019-2023",
                    responsibilities: [
                        "Part of a team that developed a massively parallel C++ and Nvidia Cuda simulation, achieving a 7,000 times speedup compared to the legacy python model.",
                        "Created Python tools using numpy and matplotlib to statistically analyze terabytes of simulation data."
                    ]
                },
                {
                    title: "Full Stack Web Developer",
                    company: "",
                    type: "Paid",
                    dates: "Summer 2022",
                    responsibilities: [
                        "Built custom web applications to meet specific customer requirements, focusing on responsive design and optimal user experience. Demonstrated ability to deliver complete solutions from concept to deployment."
                    ]
                }
            ],
            projects: [
                { name: "Voxel Graphics Engine", link: "https://github.com/athaun/voxel-engine" },
                { name: "Stellar Assault (Unity Game)", link: "https://github.com/athaun/stellar_assault_rts" },
                { name: "Azurite Game Engine", link: "https://github.com/azurite-engine/azurite" },
                { name: "Multiplayer Chess Game", link: "https://github.com/azurite-engine/Azurite" }
            ]
        };

        console.log('Starting PDF generation process');

        const docDefinition = {
            content: [
                // Header with name
                {
                    text: resumeData.name.toUpperCase(),
                    style: 'header',
                    margin: [0, 0, 0, 10]
                },

                // Contact information line
                {
                    columns: [
                        {
                            width: 'auto',
                            text: [
                                { text: resumeData.contact.linkedin + '\n', link: 'https://' + resumeData.contact.linkedin },
                                { text: resumeData.contact.github + '\n', link: 'https://' + resumeData.contact.github },
                                { text: resumeData.contact.portfolio + ' (Portfolio)', link: 'https://' + resumeData.contact.portfolio }
                            ],
                            margin: [0, 0, 15, 0]
                        },
                        {
                            width: '*',
                            text: [
                                resumeData.contact.email + '\n',
                                resumeData.contact.location + '\n',
                                resumeData.contact.phone
                            ],
                            alignment: 'right'
                        }
                    ],
                    margin: [0, 0, 0, 15]
                },

                // Objective
                {
                    text: 'OBJECTIVE',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 5]
                },
                {
                    text: resumeData.objective,
                    margin: [0, 0, 0, 15]
                },

                // Education
                {
                    text: 'EDUCATION',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 5]
                },
                {
                    text: [
                        { text: resumeData.education.degree + ' ', bold: true },
                        { text: resumeData.education.honors + '\n' },
                        { text: resumeData.education.university + ' ' },
                        { text: 'GPA ' + resumeData.education.gpa }
                    ],
                    margin: [0, 0, 0, 15]
                },

                // Skills
                {
                    text: 'SKILLS',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 5]
                },
                {
                    columns: generateSkillColumns(resumeData.skills),
                    margin: [0, 0, 0, 15]
                },

                // Experience
                {
                    text: 'EXPERIENCE',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 5]
                },
                ...generateExperienceItems(resumeData.experience),

                // Projects
                {
                    text: 'PERSONAL PROJECTS',
                    style: 'sectionHeader',
                    margin: [0, 15, 0, 5]
                },
                {
                    ul: resumeData.projects.map(project => ({
                        text: [
                            { text: project.name + ' - ', bold: false },
                            { text: project.link, link: project.link, color: 'blue' }
                        ],
                        margin: [0, 2, 0, 2]
                    }))
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                sectionHeader: {
                    fontSize: 11,
                    bold: true,
                    decoration: 'underline'
                },
                experienceTitle: {
                    fontSize: 11,
                    bold: true
                }
            },
            defaultStyle: {
                fontSize: 10
            }
        };


        const buffer = await createPdfBuffer(docDefinition);

        // Set headers and send response
        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=Asher_Haun_Resume.pdf");
        res.send(buffer);

    } catch (error) {
        console.error('Error generating resume:', error);
        res.status(500).json({
            message: 'Failed to generate resume',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Helper function to generate skill columns
function generateSkillColumns(skills) {
    // Break skills into three columns
    const columns = [[], [], []];
    const itemsPerColumn = Math.ceil(skills.length / 3);

    skills.forEach((skill, index) => {
        const columnIndex = Math.floor(index / itemsPerColumn);
        columns[columnIndex].push(skill);
    });

    return columns.map(columnSkills => ({
        width: '*',
        ul: columnSkills.map(skill => ({
            text: skill,
            margin: [0, 2, 0, 2]
        }))
    }));
}

// Helper function to generate experience items
function generateExperienceItems(experiences) {
    return experiences.map(exp => {
        const responsibilities = exp.responsibilities.map(resp => ({
            text: resp,
            margin: [0, 2, 0, 2]
        }));

        const experienceBlock = [
            {
                text: [
                    { text: exp.title + ' – ' + exp.company, style: 'experienceTitle' },
                    { text: exp.type ? ' | ' + exp.type : '' },
                    { text: '. ' + exp.dates }
                ],
                margin: [0, 3, 0, 3]
            },
            {
                ul: responsibilities,
                margin: [0, 0, 0, 10]
            }
        ];

        return experienceBlock;
    }).flat();
}

export { router as resumeRoutes };