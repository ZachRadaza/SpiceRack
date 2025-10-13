// to start local backend: brew services start postgresql
// to stop lcoal backend: brew services stop postgresql

import express, { ErrorRequestHandler} from "express";
import { Request, Response, NextFunction } from "express";
import path from "path";
import router from "./api/router";
import { attachUser } from "./lib/session";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

const clientDir = path.join(__dirname, "../client");
console.log("STATIC DIR:", clientDir);

app.use(express.static(clientDir));
app.use(express.json());
app.use(logger);
app.use(cookieParser());
app.use(attachUser);

app.use("/api", router);


// Fallback only for non-file GETs (no dot) – avoids path-to-regexp "*"
app.use((req, res, next) => {
    if(req.method === "GET" && !req.path.includes(".")) {
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

//logger
function logger(req: Request, res: Response, next: NextFunction){
    const startTime = Date.now();

    res.on("finish", () => {
        const finalTime = Date.now() - startTime;

        console.log(`
            ${req.method} ${req.originalUrl} ${res.statusCode} - ${finalTime}ms    
        `);
    });

    next();
}

//error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err?.stack ?? err);

    res.status((err as any)?.status || 500).json({
        success: false,
        message: (err as any)?.message || "Internal Server Error",
    });
};

app.use(errorHandler);