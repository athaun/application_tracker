import express from 'express';
import ollama from 'ollama';
import puppeteer from 'puppeteer';

const router = express.Router();

// Parses a job posting URL and extracts details
router.post('/parse', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract the meaningful text content instead of full HTML
    const extractedText = await page.evaluate(() => {
      function cleanText(text) {
        return text.replace(/\s+/g, ' ').trim(); // Normalize spaces
      }

      function isValidText(text) {
        return text.length > 10 && !/^\s*$/.test(text); // Remove short/unnecessary text
      }

      function isDuplicate(existingTexts, newText) {
        return existingTexts.some(text => text.includes(newText) || newText.includes(text));
      }

      const uniqueText = [];

      document.body.querySelectorAll('p, h1, h2, h3, li, span, div').forEach(el => {
        if (el.offsetParent !== null) { // Only visible elements
          const text = cleanText(el.innerText);
          if (isValidText(text) && !isDuplicate(uniqueText, text)) {
            uniqueText.push(text);
          }
        }
      });

      const titleElements = document.querySelectorAll('h1, h2, .job-title, .position-title');
      let title = '';
      for (const el of titleElements) {
        const text = cleanText(el.textContent);
        if (text.length > 3 && text.length < 100) {
          title = text;
          break;
        }
      }

      const companyElements = document.querySelectorAll('.company-name, .employer, [itemprop="hiringOrganization"]');
      let company = '';
      for (const el of companyElements) {
        const text = cleanText(el.textContent);
        if (text.length > 0) {
          company = text;
          break;
        }
      }

      const locationElements = document.querySelectorAll('.location, [itemprop="jobLocation"]');
      let location = '';
      for (const el of locationElements) {
        const text = cleanText(el.textContent);
        if (text.length > 0) {
          location = text;
          break;
        }
      }

      return {
        fullText: uniqueText.join('\n\n'),
        title,
        company,
        location
      };
    });

    await browser.close();

    // Use Ollama to parse the job application details with more focused input
    const prompt = `
    >>> begin job posting
    ${extractedText.fullText}
    >>> end job posting
    If the job posting text is empty or malformed, data is not available, the posting indicates there was an error, or if the URL provided does not work, return an error message with the key 'error' and an appropriate message like 'Job posting text is empty or malformed.'

    You are now in JSON output mode. You must return ONLY a valid JSON object without any explanation, preamble, or additional text. Ensure that all fields are populated based on the information in the job posting. Use "Not found" for missing information, and be sure to return a valid structure even if some details are not available.

    The JSON object must contain these fields, and each must follow the instructions closely:
    {
      "title": "Extract the exact job title from the posting. If not explicitly stated, use the most relevant title you can infer.",
      "jobCode": "Look for any reference code, job ID, requisition code or code related to the job. If no code is found, use 'Not found'.",
      "requirements": ["Extract and list the qualifications and education required for the position. This is not a list of skills, technlogies or programming languages. These should be directly mentioned in the job posting, and should be in array format. If not found, list as 'Not found'."],
      "description": "Provide a brief summary of the job responsibilities. Extract the most important and relevant points from the description section of the posting. If unavailable, return 'Not found'.",
      "skills": ["List relevant technologies, software, tools, or languages mentioned in the job posting. Focus on skills typically listed on resumes, such as programming languages, platforms, standards, or certifications. If no skills are listed, return 'Not found'. Use one to two words per skill, separated by commas."],
      "company": "Provide the full company name as listed in the posting. If the company name is not available, return 'Not found'. Avoid acronyms unless they are explicitly used.",
      "location": "Indicate the job location, whether it's remote, a specific city, or another type of location. If not found, use 'Not found'.",
      "salary": "Extract any information related to salary, compensation, or benefits. If not found, use 'Not found'."
    }

    Do not include vague terms like 'various', 'multiple', or 'other'. Be specific and concise. If the information is not available for any field, ensure that you return 'Not found' for that field.

    If information is not available for any field, ensure that you return 'Not found' for that field.

    I repeat: DO NOT MAKE UP ANY DATA. DO NOT INCLUDE EXPLANATIONS OR PREAMBLES. JUST PROVIDE THE JSON.

    Here are the details I found, they may be incomplete - Ensure that the text makes sense and is not some accidentally scraped HTML or other content. If it does not make sense in the context of this posting, come up with a reasonable title, location and/or salary, or mark as not found.
    ${extractedText.company ? `Company: ${extractedText.company}` : ''}
    ${extractedText.location ? `Location: ${extractedText.location}` : ''}
    ${extractedText.title ? `Title: ${extractedText.title}` : ''}
    Url: ${url}

    DO NOT MAKE UP ANY DATA, explicitly use only the information provided in the job posting text or mark it as 'Not found'.
`;


    console.log('Prompt sent to LLM:', prompt);

    const response = await ollama.chat({
      model: 'gemma3:4b',
      messages: [
        { role: 'system', content: prompt }
      ],
      temperature: 0.1, // Lower temperature for more deterministic outputs
    });

    // Log response for debugging


    let responseContent = response.message.content;
    if (responseContent.startsWith('```json')) {
      responseContent = responseContent.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(responseContent);
      console.log('Parsed JSON response:', parsedResponse);

      return res.json(parsedResponse);
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      // If all attempts fail, return a standardized error response
      return res.status(422).json({
        message: 'Failed to parse LLM response into JSON',
        rawResponse: response.message.content
      });
    }
  } catch (error) {
    console.error('Error parsing job details:', error);
    res.status(500).json({ message: 'Failed to parse job details', error: error.message });
  }
});

export { router as llmRoutes };