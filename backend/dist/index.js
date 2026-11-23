import { app } from './app.js';
import { initDb } from './db.js';
const PORT = process.env.PORT || 5000;
async function start() {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log(`Maintenance Backend Server running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
start();
