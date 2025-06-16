import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLS_DIR = path.join(__dirname, "tools");
const LOG_DIR = path.join(__dirname, "../logs");

if (!fs.existsSync(TOOLS_DIR)) {
  fs.mkdirSync(TOOLS_DIR, { recursive: true });
}
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const DEFAULT_CODE = (userCode = "") => `${userCode}`;

function safeLog(toolId, error) {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  const logFile = path.join(LOG_DIR, `${toolId}.log`);
  const message = `---\n[${new Date().toISOString()}] ${error.stack || error}\n`;
  fs.appendFileSync(logFile, message);
}

function createTool(toolId, code, description = "", params = "") {
  try {
    const dir = path.join(TOOLS_DIR, toolId);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
    fs.mkdirSync(dir, { recursive: true });

    // Use the new template
    const toolCode = DEFAULT_CODE(
      toolId,
      description,
      params,
      code && code.trim() ? code : ""
    );
    fs.writeFileSync(path.join(dir, "index.js"), toolCode);
    return { success: true, code: toolCode };
  } catch (e) {
    safeLog(toolId, e);
    return { success: false, error: e.message };
  }
}

function deleteTool(toolId) {
  try {
    const dir = path.join(TOOLS_DIR, toolId);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
    return { success: true };
  } catch (e) {
    safeLog(toolId, e);
    return { success: false, error: e.message };
  }
}

function updateTool(toolId, newCode) {
  try {
    const filePath = path.join(TOOLS_DIR, toolId, "index.js");
    if (!fs.existsSync(filePath)) throw new Error("Tool does not exist");
    fs.writeFileSync(filePath, newCode);
    return { success: true };
  } catch (e) {
    safeLog(toolId, e);
    return { success: false, error: e.message };
  }
}

function getTool(toolId) {
  try {
    const filePath = path.join(TOOLS_DIR, toolId, "index.js");
    if (!fs.existsSync(filePath)) throw new Error("Tool not found");
    const code = fs.readFileSync(filePath, "utf-8");
    return { success: true, code };
  } catch (e) {
    safeLog(toolId, e);
    return { success: false, error: e.message };
  }
}

// Export code for download/export
function exportTool(toolId) {
  try {
    const filePath = path.join(TOOLS_DIR, toolId, "index.js");
    if (!fs.existsSync(filePath)) throw new Error("Tool not found");
    const code = fs.readFileSync(filePath, "utf-8");
    return { success: true, code };
  } catch (e) {
    safeLog(toolId, e);
    return { success: false, error: e.message };
  }
}

// NOTE: You must update executeTool to use dynamic import for ESM tools if you want to execute them!

export default {
  createTool,
  deleteTool,
  updateTool,
  getTool,
  exportTool
  // executeTool (update this for ESM if needed)
};
