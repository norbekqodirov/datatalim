import { Client } from 'ssh2';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

const nginxConfig = `
server {
    server_name datatalim.uz www.datatalim.uz;

    root /var/www/datatalim/dist;
    index index.html index.htm;

    # Force strict no-cache for index.html so the browser always fetches the latest JS chunk paths
    location ~* \\.html$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (JS, CSS, images) aggressively, since Vite uses content hashes
    location ~* \\.(?:css|js|webp|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/datatalim.uz/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/datatalim.uz/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.datatalim.uz) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = datatalim.uz) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name datatalim.uz www.datatalim.uz;
    return 404; # managed by Certbot
}
`;

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const stream = sftp.createWriteStream('/etc/nginx/sites-available/datatalim');
        stream.write(nginxConfig);
        stream.end(() => {
            log('Nginx config updated!');
            conn.exec('systemctl restart nginx', (e, s) => {
                s.on('close', () => { log('Nginx Restarted!'); conn.end(); });
            });
        });
    });
}).connect({
    host: '188.225.74.65',
    port: 22,
    username: 'root',
    password: 'y,Qx9i6-dWMNCi'
});
