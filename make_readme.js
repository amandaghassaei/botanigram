const fs = require('fs');

const header = fs.readFileSync('./src/markdown/readme_header.md', 'utf8');
const about = fs.readFileSync('./src/markdown/about.md', 'utf8');
const instructions = fs.readFileSync('./src/markdown/instructions.md', 'utf8');

let readme = `${header}\n\n${about}\n\n\n## Instructions\n\n${instructions}`;
readme = readme.replace(/data-src="https:\/\/raw.githubusercontent.com\/amandaghassaei\/botanigram\/main\//g, 'src="');

fs.writeFileSync('README.md', readme);