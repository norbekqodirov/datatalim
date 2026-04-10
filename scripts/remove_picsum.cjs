const fs = require('fs');
const files = ['store/useStore.ts', 'data/courses.ts'];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/"https:\/\/picsum\.photos[^"]*"/g, '""');
    content = content.replace(/'https:\/\/picsum\.photos[^']*'/g, '""');
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
});
