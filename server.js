import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import toolRoutes from "./toolRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLS_DIR = path.join(__dirname, "tools");
const LOGS_DIR = path.join(__dirname, "logs");

// Ensure tools and logs directories exist
if (!fs.existsSync(TOOLS_DIR)) fs.mkdirSync(TOOLS_DIR, { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/tool", toolRoutes);

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// Dynamically import and register all tools
function registerAllTools(server) {
  if (!fs.existsSync(TOOLS_DIR)) return;
  fs.readdirSync(TOOLS_DIR).forEach((toolId) => {
    const toolPath = path.join(TOOLS_DIR, toolId, "index.js");
    if (fs.existsSync(toolPath)) {
      import(pathToFileURL(toolPath).href)
        .then((toolModule) => {
          const tool = toolModule.default;
          if (tool && tool.name && typeof tool.run === "function") {
            console.log(`Registering tool: ${tool.name}`);
            server.tool(
              tool.name,
              tool.description || "",
              tool.params || {},
              tool.run
            );
          }
        })
        .catch((err) => {
          console.error(`Failed to import tool ${toolId}:`, err);
        });
    }
  });
}

// Register all tools at startup
registerAllTools(server);

// --- SSE Tool Execution Support ---
const transports = {};

app.get("/mcp/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

// Global error logging
process.on("uncaughtException", (err) => {
  fs.appendFileSync(path.join(LOGS_DIR, "global.log"), `Uncaught: ${err.stack}\n`);
});

process.on("unhandledRejection", (reason) => {
  fs.appendFileSync(path.join(LOGS_DIR, "global.log"), `Unhandled Rejection: ${reason}\n`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
