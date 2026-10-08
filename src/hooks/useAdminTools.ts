import { useCallback, useState } from "react";

import { showConfirm, showError, showSuccess } from "../alert";
import { BACKEND_URL } from "../config/backend";
import { TOOLS_UPDATED_EVENT } from "./useTools";

import type {
  AdminCategory,
  AdminTool,
  ToolForm,
  ToolStatus,
  ToolsResponse,
} from "../types/admin";

const DEFAULT_TOOL_FORM: ToolForm = {
  name: "",
  slug: "",
  description: "",
  icon: "wrench",
  status: "ready",
  category_id: 0,
};

type UseAdminToolsOptions = {
  tools: AdminTool[];
  categories: AdminCategory[];
  onUnauthorized: () => void;
  refreshData: () => Promise<void>;
};

export function useAdminTools({
  tools,
  categories,
  onUnauthorized,
  refreshData,
}: UseAdminToolsOptions) {
  const [toolDialog, setToolDialog] = useState<"create" | "edit" | null>(null);
  const [editingToolId, setEditingToolId] = useState<number | null>(null);
  const [toolForm, setToolForm] = useState<ToolForm>(DEFAULT_TOOL_FORM);
  const [toolSaving, setToolSaving] = useState(false);
  const [toolSavingId, setToolSavingId] = useState<number | null>(null);
  const [toolDeletingId, setToolDeletingId] = useState<number | null>(null);

  const openCreateTool = useCallback(() => {
    setEditingToolId(null);
    setToolForm({
      ...DEFAULT_TOOL_FORM,
      category_id: categories[0]?.id ?? 0,
    });
    setToolDialog("create");
  }, [categories]);

  const openEditTool = useCallback((tool: AdminTool) => {
    setEditingToolId(tool.id);
    setToolForm({
      name: tool.name,
      slug: tool.slug,
      description: tool.description || "",
      icon: tool.icon || "wrench",
      status: tool.status,
      category_id: tool.category_id,
    });
    setToolDialog("edit");
  }, []);

  const closeToolDialog = useCallback(() => {
    setToolDialog(null);
    setEditingToolId(null);
    setToolForm(DEFAULT_TOOL_FORM);
  }, [toolSaving]);

  const updateToolForm = useCallback((patch: Partial<ToolForm>) => {
    setToolForm((current) => ({ ...current, ...patch }));
  }, []);

  const saveTool = useCallback(async () => {
    if (toolSaving) {
      return;
    }

    const name = toolForm.name.trim();
    const slug = toolForm.slug.trim();
    const description = toolForm.description.trim();
    const icon = toolForm.icon.trim();
    const categoryId = Number(toolForm.category_id);

    if (!name || !slug || !description || !icon || categoryId <= 0) {
      await showError(
        "Incomplete tool data",
        "Name, slug, description, icon, and category are required.",
      );
      return;
    }

    if (toolDialog === "edit" && !editingToolId) {
      await showError(
        "Tool not found",
        "The tool ID to edit is unavailable.",
      );
      return;
    }

    setToolSaving(true);

    try {
      const body = new URLSearchParams();
      const action = toolDialog === "edit" ? "update" : "create";

      body.append("action", action);

      if (toolDialog === "edit") {
        body.append("tool_id", String(editingToolId));
      }

      body.append("name", name);
      body.append("slug", slug);
      body.append("description", description);
      body.append("icon", icon);
      body.append("status", toolForm.status);
      body.append("category_id", String(categoryId));

      const response = await fetch(`${BACKEND_URL}/api/tools.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result: ToolsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to save tool.");
      }

      localStorage.setItem(TOOLS_UPDATED_EVENT, String(Date.now()));

      await refreshData();

      const savedName = name;
      closeToolDialog();

      await showSuccess(
        action === "update" ? "Tool updated" : "Tool added",
        `${savedName} was saved to the database.`,
      );
    } catch (error) {
      console.error("Save tool error:", error);

      await showError(
        "Failed to save tool",
        error instanceof Error ? error.message : "The tool could not be saved.",
      );
    } finally {
      setToolSaving(false);
    }
  }, [
    closeToolDialog,
    editingToolId,
    onUnauthorized,
    refreshData,
    toolDialog,
    toolForm,
    toolSaving,
  ]);

  const updateStatus = useCallback(
    async (toolId: number, status: ToolStatus) => {
      if (toolSavingId !== null || toolDeletingId !== null) {
        return;
      }

      const tool = tools.find((item) => item.id === toolId);

      if (!tool || tool.status === status) {
        return;
      }

      const labels: Record<ToolStatus, string> = {
        ready: "Ready",
        maintenance: "Maintenance",
        upcoming: "Upcoming",
      };

      const descriptions: Record<ToolStatus, string> = {
        ready: "Operational and ready for public use.",
        maintenance: "Temporarily unavailable for maintenance.",
        upcoming: "In development and coming soon.",
      };

      const confirmed = await showConfirm(
        `Change status of "${tool.name}"?`,
        `${descriptions[status]} New status: ${labels[status]}.`,
      );

      if (!confirmed) {
        return;
      }

      setToolSavingId(toolId);

      try {
        const body = new URLSearchParams();
        body.append("action", "update_status");
        body.append("tool_id", String(toolId));
        body.append("status", status);

        const response = await fetch(`${BACKEND_URL}/api/tools.php`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body,
        });

        if (response.status === 401) {
          onUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result: ToolsResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to update tool status.");
        }

        localStorage.setItem(TOOLS_UPDATED_EVENT, String(Date.now()));
        await refreshData();

        await showSuccess(
          "Status updated",
          `${tool.name} is now ${labels[status]}.`,
        );
      } catch (error) {
        console.error("Update tool status error:", error);

        await showError(
          "Failed to update status",
          error instanceof Error
            ? error.message
            : "The tool status could not be updated.",
        );
      } finally {
        setToolSavingId(null);
      }
    },
    [onUnauthorized, refreshData, toolDeletingId, toolSavingId, tools],
  );

  const deleteTool = useCallback(
    async (toolId: number) => {
      if (toolDeletingId !== null || toolSavingId !== null) {
        return;
      }

      const tool = tools.find((item) => item.id === toolId);

      if (!tool) {
        return;
      }

      const confirmed = await showConfirm(
        `Delete "${tool.name}"?`,
        "The tool will be permanently removed from the database and will no longer appear on the platform.",
      );

      if (!confirmed) {
        return;
      }

      setToolDeletingId(toolId);

      try {
        const body = new URLSearchParams();
        body.append("action", "delete");
        body.append("tool_id", String(toolId));

        const response = await fetch(`${BACKEND_URL}/api/tools.php`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body,
        });

        if (response.status === 401) {
          onUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result: ToolsResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to delete tool.");
        }

        localStorage.setItem(TOOLS_UPDATED_EVENT, String(Date.now()));
        await refreshData();

        await showSuccess(
          "Tool deleted",
          `${tool.name} was successfully removed from the database.`,
        );
      } catch (error) {
        console.error("Delete tool error:", error);

        await showError(
          "Failed to delete tool",
          error instanceof Error ? error.message : "The tool could not be deleted.",
        );
      } finally {
        setToolDeletingId(null);
      }
    },
    [onUnauthorized, refreshData, toolDeletingId, toolSavingId, tools],
  );

  return {
    toolDialog,
    toolForm,
    toolSaving,
    toolSavingId,
    toolDeletingId,
    openCreateTool,
    openEditTool,
    closeToolDialog,
    updateToolForm,
    saveTool,
    updateStatus,
    deleteTool,
  };
}
