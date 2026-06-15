import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, category } = req.body;

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof category !== "string" ||
      !title.trim() ||
      !content.trim() ||
      !category.trim()
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Title, content and category are required",
      });
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
      },
    });

    return res.status(201).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    console.error("Create article error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to create article",
    });
  }
};

export const getArticles = async (req: Request, res: Response) => {
  try {
    const page =
      typeof req.query.page === "string" ? Number(req.query.page) || 1 : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) || 20 : 20;

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const where: Prisma.KnowledgeArticleWhereInput = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [articles, totalArticles] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.knowledgeArticle.count({
        where,
      }),
    ]);

    return res.status(200).json({
      status: "success",
      results: articles.length,
      data: {
        articles,
        pagination: {
          page,
          limit,
          totalArticles,
          totalPages: Math.ceil(totalArticles / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get articles error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to get articles",
    });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    const articleId = req.params.id;

    if (!articleId || Array.isArray(articleId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid article ID is required",
      });
    }

    const article = await prisma.knowledgeArticle.findUnique({
      where: {
        id: articleId,
      },
    });

    if (!article) {
      return res.status(404).json({
        status: "fail",
        message: "Article not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    console.error("Get article error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to get article",
    });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const articleId = req.params.id;

    if (!articleId || Array.isArray(articleId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid article ID is required",
      });
    }

    const { title, content, category, isActive } = req.body;

    const data: Prisma.KnowledgeArticleUpdateInput = {};

    if (typeof title === "string") {
      data.title = title.trim();
    }

    if (typeof content === "string") {
      data.content = content.trim();
    }

    if (typeof category === "string") {
      data.category = category.trim();
    }

    if (typeof isActive === "boolean") {
      data.isActive = isActive;
    }

    const article = await prisma.knowledgeArticle.update({
      where: {
        id: articleId,
      },
      data,
    });

    return res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    console.error("Update article error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update article",
    });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const articleId = req.params.id;

    if (!articleId || Array.isArray(articleId)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid article ID is required",
      });
    }

    await prisma.knowledgeArticle.delete({
      where: {
        id: articleId,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete article error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete article",
    });
  }
};
