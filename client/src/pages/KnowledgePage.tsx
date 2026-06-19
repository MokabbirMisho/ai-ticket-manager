import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

type KnowledgeArticle = {
  id: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  totalArticles: number;
  totalPages: number;
};

export function KnowledgePage() {
  const { user } = useAuth();

  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalArticles: 0,
    totalPages: 1,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchArticles = async (page = pagination.page) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/knowledge", {
        params: {
          page,
          limit: pagination.limit,
          search: search || undefined,
        },
      });

      setArticles(response.data.data.articles);
      setPagination(response.data.data.pagination);
    } catch {
      setError("Failed to load knowledge articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, [search]);

  const resetCreateForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
  };

  const handleCreateArticle = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setIsCreating(true);
      setError("");
      setSuccess("");

      await api.post("/knowledge", {
        title,
        content,
        category,
      });

      setSuccess(
        "Knowledge article added successfully. AI can now use it for better support suggestions.",
      );
      resetCreateForm();
      await fetchArticles(1);
    } catch {
      setError("Failed to create article");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (article: KnowledgeArticle) => {
    setEditingId(article.id);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategory(article.category);
    setEditIsActive(article.isActive);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditCategory("");
    setEditIsActive(true);
  };

  const handleUpdateArticle = async (articleId: string) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(`/knowledge/${articleId}`, {
        title: editTitle,
        content: editContent,
        category: editCategory,
        isActive: editIsActive,
      });

      setSuccess("Knowledge article updated successfully.");
      cancelEdit();
      await fetchArticles(pagination.page);
    } catch {
      setError("Failed to update article");
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      setError("");
      setSuccess("");

      await api.delete(`/knowledge/${articleId}`);

      setSuccess("Knowledge article deleted successfully");
      await fetchArticles(pagination.page);
    } catch {
      setError("Failed to delete article");
    }
  };

  const goToPreviousPage = () => {
    if (pagination.page > 1) {
      fetchArticles(pagination.page - 1);
    }
  };

  const goToNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      fetchArticles(pagination.page + 1);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="mt-2 text-slate-500">
          Manage support articles that will later help AI generate more accurate
          replies.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section
          id="create-knowledge-article"
          className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-1"
        >
          <h2 className="text-lg font-bold text-slate-900">Create Article</h2>

          <form onSubmit={handleCreateArticle} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Refund Policy"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Category
              </label>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Billing"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Content
              </label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={8}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Write the support policy or guide here..."
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Article"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Articles</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {articles.length} of {pagination.totalArticles}{" "}
                  articles
                </p>
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Search title or category..."
              />
            </div>
          </div>

          {isLoading && (
            <div className="p-6 text-sm text-slate-500">
              Loading articles...
            </div>
          )}

          {!isLoading && articles.length === 0 && (
            <EmptyState
              title="No knowledge articles yet"
              message="Add support knowledge so AI can suggest better replies and summaries."
              actionLabel="Add Knowledge Article"
              onAction={() =>
                document
                  .getElementById("create-knowledge-article")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            />
          )}

          {!isLoading && articles.length > 0 && (
            <>
              <div className="divide-y divide-slate-100">
                {articles.map((article) => {
                  const isEditing = editingId === article.id;

                  return (
                    <div key={article.id} className="p-5">
                      {!isEditing ? (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {article.title}
                              </h3>

                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {article.category}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  article.isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {article.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {article.content}
                            </p>

                            <p className="mt-3 text-xs text-slate-400">
                              Created:{" "}
                              {new Date(article.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => startEdit(article)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteArticle(article.id)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <input
                              value={editTitle}
                              onChange={(event) =>
                                setEditTitle(event.target.value)
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                              placeholder="Title"
                            />

                            <input
                              value={editCategory}
                              onChange={(event) =>
                                setEditCategory(event.target.value)
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                              placeholder="Category"
                            />
                          </div>

                          <textarea
                            value={editContent}
                            onChange={(event) =>
                              setEditContent(event.target.value)
                            }
                            rows={6}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          />

                          <select
                            value={editIsActive ? "active" : "inactive"}
                            onChange={(event) =>
                              setEditIsActive(event.target.value === "active")
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateArticle(article.id)}
                              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                            >
                              Save
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={pagination.page <= 1}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={goToNextPage}
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
