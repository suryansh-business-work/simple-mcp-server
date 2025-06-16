import express from "express";
import toolService from "./toolService.js";

const router = express.Router();

router.post("/create", (req, res) => {
  const { toolId, code } = req.body;
  const result = toolService.createTool(toolId, code);
  res.json(result);
});

router.post("/update", (req, res) => {
  const { toolId, code } = req.body;
  const result = toolService.updateTool(toolId, code);
  res.json(result);
});

router.post("/delete", (req, res) => {
  const { toolId } = req.body;
  const result = toolService.deleteTool(toolId);
  res.json(result);
});

router.get("/get/:toolId", (req, res) => {
  const result = toolService.getTool(req.params.toolId);
  res.json(result);
});

// Export tool code
router.get("/export/:toolId", (req, res) => {
  const result = toolService.exportTool(req.params.toolId);
  if (result.success) {
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.toolId}.js"`);
    res.type('application/javascript').send(result.code);
  } else {
    res.status(404).json(result);
  }
});

// Execute tool code
router.post("/execute/:toolId", async (req, res) => {
  const input = req.body.input || "";
  const result = await toolService.executeTool(req.params.toolId, input);
  res.json(result);
});

export default router;
