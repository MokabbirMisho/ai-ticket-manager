import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        status: "fail",
        message: "Title, content and category are required",
      });
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        content,
        category,
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = typeof req.query.search === "string" ? req.query.search : "";

    const where = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              category: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

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
    const article = await prisma.knowledgeArticle.findUnique({
      where: {
        id: req.params.id,
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
    const article = await prisma.knowledgeArticle.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        isActive: req.body.isActive,
      },
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
    await prisma.knowledgeArticle.delete({
      where: {
        id: req.params.id,
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
