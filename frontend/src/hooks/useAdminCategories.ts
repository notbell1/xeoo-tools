import { useCallback, useState } from "react";

import { showConfirm, showError, showSuccess } from "../alert";
import { BACKEND_URL } from "../config/backend";
import { DEFAULT_CATEGORY_FORM, normalizeSlug } from "../lib/adminCategories";

import type {
  AdminCategory,
  CategoriesResponse,
  CategoryForm,
} from "../types/admin";

const CATEGORY_REFRESH_KEY = "categories_updated";

type LoadCategoriesOptions = {
  showLoading?: boolean;
  showErrorMessage?: boolean;
};

type UseAdminCategoriesOptions = {
  onUnauthorized: () => void;
  refreshTools: () => Promise<void>;
  onCategoryDeleted?: (category: AdminCategory) => void;
};

export function useAdminCategories({
  onUnauthorized,
  refreshTools,
  onCategoryDeleted,
}: UseAdminCategoriesOptions) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState<
    "create" | "edit" | null
  >(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(
    DEFAULT_CATEGORY_FORM,
  );
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryDeletingId, setCategoryDeletingId] = useState<number | null>(
    null,
  );

  const loadCategories = useCallback(
    async (options?: LoadCategoriesOptions) => {
      const showLoading = options?.showLoading ?? false;
      const showErrorMessage = options?.showErrorMessage ?? true;

      if (showLoading) {
        setCategoryLoading(true);
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/categories.php?_=${Date.now()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (response.status === 401) {
          onUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result: CategoriesResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to retrieve categories data.");
        }

        setCategories(result.data ?? []);
      } catch (error) {
        console.error("Load categories error:", error);

        if (showErrorMessage) {
          await showError(
            "Failed to load categories",
            error instanceof Error
              ? error.message
              : "Categories data could not be retrieved from the server.",
          );
        }
      } finally {
        if (showLoading) {
          setCategoryLoading(false);
        }
      }
    },
    [onUnauthorized],
  );

  const openCreateCategory = useCallback(() => {
    setEditingCategoryId(null);
    setCategoryForm(DEFAULT_CATEGORY_FORM);
    setCategoryDialog("create");
  }, []);

  const openEditCategory = useCallback((category: AdminCategory) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "wrench",
      color: category.color || "blue",
    });
    setCategoryDialog("edit");
  }, []);

  const closeCategoryDialog = useCallback(() => {
    if (categorySaving) {
      return;
    }

    setCategoryDialog(null);
    setEditingCategoryId(null);
    setCategoryForm(DEFAULT_CATEGORY_FORM);
  }, [categorySaving]);

  const saveCategory = useCallback(async () => {
    if (categorySaving) {
      return;
    }

    const mode = categoryDialog;
    const name = categoryForm.name.trim();
    const slug = normalizeSlug(categoryForm.slug || name);
    const description = categoryForm.description.trim();
    const icon = categoryForm.icon.trim() || "wrench";
    const color = categoryForm.color || "blue";

    if (!name) {
      await showError(
        "Category name is empty",
        "Please enter a category name first.",
      );
      return;
    }

    if (!slug) {
      await showError(
        "Category slug is empty",
        "Category slug cannot be empty.",
      );
      return;
    }

    setCategorySaving(true);

    try {
      const body = new URLSearchParams();

      body.append("action", mode === "edit" ? "update" : "create");

      if (mode === "edit" && editingCategoryId !== null) {
        body.append("category_id", String(editingCategoryId));
      }

      body.append("name", name);
      body.append("slug", slug);
      body.append("description", description);
      body.append("icon", icon);
      body.append("color", color);

      const response = await fetch(`${BACKEND_URL}/api/categories.php`, {
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

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to save category.");
      }

      await Promise.all([
        loadCategories({
          showLoading: false,
          showErrorMessage: false,
        }),
        refreshTools(),
      ]);

      localStorage.setItem(CATEGORY_REFRESH_KEY, String(Date.now()));

      closeCategoryDialog();

      await showSuccess(
        mode === "edit" ? "Category updated" : "Category added",
        `${name} was saved successfully.`,
      );
    } catch (error) {
      console.error("Save category error:", error);

      await showError(
        "Failed to save category",
        error instanceof Error
          ? error.message
          : "The category could not be saved.",
      );
    } finally {
      setCategorySaving(false);
    }
  }, [
    categoryDialog,
    categoryForm,
    categorySaving,
    closeCategoryDialog,
    editingCategoryId,
    loadCategories,
    onUnauthorized,
    refreshTools,
  ]);

  const deleteCategory = useCallback(
    async (category: AdminCategory) => {
      if (categoryDeletingId !== null) {
        return;
      }

      if (category.tool_count > 0) {
        await showError(
          "Category in use",
          `${category.name} still contains ${category.tool_count} tools. Please reassign or remove these tools first.`,
        );
        return;
      }

      const confirmed = await showConfirm(
        `Delete category "${category.name}"?`,
        "The category will be permanently removed from the database.",
      );

      if (!confirmed) {
        return;
      }

      setCategoryDeletingId(category.id);

      try {
        const body = new URLSearchParams();

        body.append("action", "delete");
        body.append("category_id", String(category.id));

        const response = await fetch(`${BACKEND_URL}/api/categories.php`, {
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

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to delete category.");
        }

        setCategories((currentCategories) =>
          currentCategories.filter(
            (currentCategory) => currentCategory.id !== category.id,
          ),
        );

        localStorage.setItem(CATEGORY_REFRESH_KEY, String(Date.now()));

        onCategoryDeleted?.(category);

        await showSuccess(
          "Category deleted",
          `${category.name} was successfully removed.`,
        );
      } catch (error) {
        console.error("Delete category error:", error);

        await showError(
          "Failed to delete category",
          error instanceof Error
            ? error.message
            : "The category could not be deleted.",
        );
      } finally {
        setCategoryDeletingId(null);
      }
    },
    [categoryDeletingId, onCategoryDeleted, onUnauthorized],
  );

  const updateCategoryForm = useCallback((patch: Partial<CategoryForm>) => {
    setCategoryForm((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  return {
    categories,
    categoryLoading,
    categoryDialog,
    categoryForm,
    categorySaving,
    categoryDeletingId,
    loadCategories,
    openCreateCategory,
    openEditCategory,
    closeCategoryDialog,
    saveCategory,
    deleteCategory,
    updateCategoryForm,
  };
}
