import Database from 'better-sqlite3';

const db = new Database('./server/data.db');

const cleanKey = (key) => {
    const row = db.prepare("SELECT value FROM app_data WHERE key = ?").get(key);
    if (!row) return;

    let data;
    try {
        data = JSON.parse(row.value);
    } catch (e) {
        return;
    }

    let modified = false;

    if (Array.isArray(data)) {
        data = data.map(item => {
            if (item.coverImage && (item.coverImage.startsWith('data:image') || item.coverImage.includes('picsum.photos'))) {
                item.coverImage = '';
                modified = true;
                console.log(`Cleaned coverImage for item ID: ${item.id} in ${key}`);
            }
            if (item.image && (item.image.startsWith('data:image') || item.image.includes('picsum.photos'))) {
                item.image = '';
                modified = true;
                console.log(`Cleaned image for item ID: ${item.id} in ${key}`);
            }
            return item;
        });
    } else if (typeof data === 'object') {
        const checkObject = (obj) => {
            for (const k in obj) {
                if (typeof obj[k] === 'string' && (obj[k].startsWith('data:image') || obj[k].includes('picsum.photos'))) {
                    obj[k] = '';
                    modified = true;
                    console.log(`Cleaned field ${k} in ${key}`);
                } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                    checkObject(obj[k]);
                }
            }
        };
        checkObject(data);
    }

    if (modified) {
        db.prepare("UPDATE app_data SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?").run(JSON.stringify(data), key);
        console.log(`Successfully cleaned DB ${key}`);
    } else {
        console.log(`No cleaning needed for DB ${key}`);
    }
};

['courses', 'team', 'site_content'].forEach(cleanKey);
