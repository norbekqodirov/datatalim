import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    const css = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n` + styleMatch[1];
    fs.writeFileSync('index.css', css);
    console.log('Created index.css');
}

// Remove tailwind CDN
html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*<script>[\s\S]*?<\/script>/, '');
// Remove inline style
html = html.replace(/<style>[\s\S]*?<\/style>/, '');
// Remove importmap
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');

fs.writeFileSync('index.html', html);
console.log('Cleaned index.html');
