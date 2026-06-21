const fs = require('fs');
const path = 'src/App.js';
let text = fs.readFileSync(path, 'utf8');
const oldStr = '<p style={{ fontFamily: "\'Raleway\', sans-serif", fontSize: 14, color: "#E4D5C1", fontWeight: 400, lineHeight: 1.9, maxWidth: 620, margin: "0 auto" }}>Students step inside the environments where leadership, capital, innovation, and performance are put into practice — meeting the people and institutions shaping the world beyond the classroom.</p>';
const newStr = '<p style={{ fontFamily: "Lora, serif", fontSize: 18, color: "#E4D5C1", fontWeight: 400, lineHeight: 1.9, maxWidth: 620, margin: "0 auto" }}>Students step inside the environments where leadership, capital, innovation, and performance are put into practice — meeting the people and institutions shaping the world beyond the classroom.</p>';
if (!text.includes(oldStr)) { throw new Error('old string missing'); }
text = text.replace(oldStr, newStr);
fs.writeFileSync(path, text);
