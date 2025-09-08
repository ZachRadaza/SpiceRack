import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

const clientDir = path.join(__dirname, "../client");
console.log("STATIC DIR:", clientDir);

app.use(express.static(clientDir));

// Fallback only for non-file GETs (no dot) – avoids path-to-regexp "*"
app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.includes(".")) {
            console.log("FALLBACK -> index.html for:", req.path);
            return res.sendFile(path.join(clientDir, "index.html"));
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
