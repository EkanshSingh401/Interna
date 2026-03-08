const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const mustache = require('mustache');

const app = express();
app.use(express.json());

// --- 1. LaTeX Character Escaper ---
const escapeLatex = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&%$#_{}~^\\]/g, (match) => {
    return {
      '&': '\\&',
      '%': '\\%',
      '$': '\\$',
      '#': '\\#',
      '_': '\\_',
      '{': '\\{',
      '}': '\\}',
      '~': '\\textasciitilde{}',
      '^': '\\textasciicircum{}',
      '\\': '\\textbackslash{}',
    }[match];
  });
};

const cleanData = (obj) => {
  if (Array.isArray(obj)) return obj.map(cleanData);
  if (typeof obj === 'object' && obj !== null) {
    const cleaned = {};
    for (const key in obj) {
      cleaned[key] = cleanData(obj[key]);
    }
    return cleaned;
  }
  return escapeLatex(obj);
};

const cleanup = (files) => {
  files.forEach(file => { if (fs.existsSync(file)) fs.unlinkSync(file); });
};

// --- 2. The Generation Route ---
app.post('/generate', async (req, res) => {
  try {
    const { templateName, data } = req.body;
    const sanitizedData = cleanData(data);
    
    const jobId = Math.random().toString(36).substring(7);
    const tempDir = os.tmpdir(); 
    const inputPath = path.join(tempDir, `${jobId}.tex`);
    const outputPath = path.join(tempDir, `${jobId}.pdf`);
    const templatePath = path.join(__dirname, 'templates', `${templateName}.tex`);
    
    if (!fs.existsSync(templatePath)) {
        return res.status(404).send('Template file not found.');
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // --- THE CRITICAL FIX ---
    // We pass tags: ['[[', ']]'] so Mustache ignores LaTeX's { } curly braces.
    const latexContent = mustache.render(templateContent, sanitizedData, {}, ['[[', ']]']);

    fs.writeFileSync(inputPath, latexContent);

    const cmd = `pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${inputPath}`;

    exec(cmd, (error, stdout, stderr) => {
      if (fs.existsSync(outputPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        const fileStream = fs.createReadStream(outputPath);
        fileStream.pipe(res);
        fileStream.on('close', () => {
          cleanup([
            inputPath, outputPath, 
            path.join(tempDir, `${jobId}.aux`), 
            path.join(tempDir, `${jobId}.log`),
            path.join(tempDir, `${jobId}.out`)
          ]);
        });
      } else {
        console.error("Fatal LaTeX Error Output:", stdout);
        cleanup([inputPath]);
        res.status(500).send('LaTeX Compilation failed. No PDF produced.');
      }
    });
  } catch (err) { 
    console.error('Server side error:', err);
    res.status(500).send('Internal Server Error'); 
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`LaTeX engine online on port ${PORT}`);
});