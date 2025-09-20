import express, { ErrorRequestHandler} from "express";
import path from "path";
import router from "./api/router";

const app = express();
const PORT = 3000;

const clientDir = path.join(__dirname, "../client");
console.log("STATIC DIR:", clientDir);

app.use(express.static(clientDir));
app.use(express.json());
app.use("/api", router);
app.use("/api/recipes");


// Fallback only for non-file GETs (no dot) – avoids path-to-regexp "*"
app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.includes(".")) {
            console.log("FALLBACK -> index.html for:", req.path);
            return res.sendFile(path.join(clientDir, "index.html"));
    }
    next();
});


app.get("/", (req, res) => {
    res.send("hi");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err?.stack ?? err);

    res.status((err as any)?.status || 500).json({
        success: false,
        message: (err as any)?.message || "Internal Server Error",
    });
};

app.use(errorHandler);