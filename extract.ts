import fs from 'fs';
import path from 'path';

// Using require or relative imports
import { coursesData } from './data/courses';
import { initialTeam as teamData, initialSiteContent as defaultSiteContent, initialVisibility as defaultVisibility } from './store/useStore';

const outDir = path.join(__dirname, 'server', 'initialData');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'courses.json'), JSON.stringify(coursesData, null, 2));
fs.writeFileSync(path.join(outDir, 'team.json'), JSON.stringify(teamData, null, 2));
fs.writeFileSync(path.join(outDir, 'siteContent.json'), JSON.stringify(defaultSiteContent, null, 2));
fs.writeFileSync(path.join(outDir, 'visibility.json'), JSON.stringify(defaultVisibility, null, 2));

console.log('✅ Initial data successfully extracted to JSON files in server/initialData');
