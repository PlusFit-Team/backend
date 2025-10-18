import { GeminiConfigOptions } from '@config';
import { GoogleGenAI } from '@google/genai';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma';
import { FoodEntryType } from '@prisma/client';
import { ICurrentUser } from '@type';
import axios from 'axios';

import { GetDailyNutritionResponseDto, NutritionResult } from './dto';
import { prompt } from './prompt';

@Injectable()
export class NutritionService {
  private gemeniAi: GoogleGenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const gemeniConfig = this.configService.get<GeminiConfigOptions>('gemeni');
    this.gemeniAi = new GoogleGenAI({ apiKey: gemeniConfig.key });
  }

  async getNutrition(
    user: ICurrentUser,
  ): Promise<GetDailyNutritionResponseDto> {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const yesterdayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      0,
      0,
      0,
      0,
    );

    const yesterdayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      23,
      59,
      59,
      999,
    );

    const [today, yesterday, todayUploads, yesterdayUploads] =
      await Promise.all([
        this.prisma.dailyNutritionLog.findUnique({
          where: {
            date_userId: {
              userId: user.id,
              date: todayStart,
            },
          },
          select: {
            calories: true,
            carbs: true,
            fat: true,
            protein: true,
            fiber: true,
            sugar: true,
            sodium: true,
          },
        }),
        this.prisma.dailyNutritionLog.findUnique({
          where: {
            date_userId: {
              userId: user.id,
              date: yesterdayStart,
            },
          },
          select: {
            calories: true,
            carbs: true,
            fat: true,
            protein: true,
            fiber: true,
            sugar: true,
            sodium: true,
          },
        }),
        this.prisma.foodNutrition.findMany({
          where: {
            userId: user.id,
            createdAt: {
              gte: todayStart,
              lt: todayEnd,
            },
          },
          select: {
            calories: true,
            fat: true,
            protein: true,
            carbs: true,
            fiber: true,
            sugar: true,
            sodium: true,
            image: true,
            mealName: true,
            createdAt: true,
            healthStatus: true,
            healthAlert: true,
            healthDetails: true,
            ingredients: {
              select: {
                name: true,
                portion: true,
                portionGrams: true,
                calories: true,
                carbs: true,
                protein: true,
                fat: true,
                fiber: true,
                sugar: true,
                sodium: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.foodNutrition.findMany({
          where: {
            userId: user.id,
            createdAt: {
              gte: yesterdayStart,
              lt: yesterdayEnd,
            },
          },
          select: {
            calories: true,
            fat: true,
            protein: true,
            carbs: true,
            fiber: true,
            sugar: true,
            sodium: true,
            image: true,
            mealName: true,
            createdAt: true,
            healthStatus: true,
            healthAlert: true,
            healthDetails: true,
            ingredients: {
              select: {
                name: true,
                portion: true,
                portionGrams: true,
                calories: true,
                carbs: true,
                protein: true,
                fat: true,
                fiber: true,
                sugar: true,
                sodium: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

    return {
      today: {
        calories: today?.calories || 0,
        carbs: today?.carbs || 0,
        fat: today?.fat || 0,
        protein: today?.protein || 0,
        fiber: today?.fiber || 0,
        sugar: today?.sugar || 0,
        sodium: today?.sodium || 0,
        recentlyUploaded: todayUploads,
      },
      yesterday: {
        calories: yesterday?.calories || 0,
        carbs: yesterday?.carbs || 0,
        fat: yesterday?.fat || 0,
        protein: yesterday?.protein || 0,
        fiber: yesterday?.fiber || 0,
        sugar: yesterday?.sugar || 0,
        sodium: yesterday?.sodium || 0,
        recentlyUploaded: yesterdayUploads,
      },
    };
  }

  private async fetchImageAsBase64(url: string) {
    const res = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(res.data as ArrayBuffer);
    const mimeType = (res.headers['content-type'] as string) || 'image/jpeg';
    return { base64: buffer.toString('base64'), mimeType };
  }

  async analyzeImageWithPrompt(
    link: string,
    prompt: string,
    userId?: string,
  ): Promise<NutritionResult> {
    const publicUrl = this.configService.get<string>('r2.publicUrl');
    if (!publicUrl) throw new Error('r2.publicUrl not configured');

    const url = publicUrl.replace(/\/$/, '') + '/' + link.replace(/^\//, '');

    const { base64, mimeType } = await this.fetchImageAsBase64(url);

    let finalPrompt = prompt;

    if (userId) {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );

      const todayNutrition = await this.prisma.dailyNutritionLog.findUnique({
        where: {
          date_userId: {
            userId,
            date: todayStart,
          },
        },
        select: {
          calories: true,
          carbs: true,
          fat: true,
          protein: true,
          fiber: true,
          sugar: true,
          sodium: true,
        },
      });

      finalPrompt += "\n\nUser's Daily Intake So Far (Today):\n";
      if (todayNutrition) {
        finalPrompt += `- Calories: ${todayNutrition.calories} kcal\n`;
        finalPrompt += `- Protein: ${todayNutrition.protein} g\n`;
        finalPrompt += `- Carbs: ${todayNutrition.carbs} g\n`;
        finalPrompt += `- Fat: ${todayNutrition.fat} g\n`;
        finalPrompt += `- Fiber: ${todayNutrition.fiber} g\n`;
        finalPrompt += `- Sugar: ${todayNutrition.sugar} g\n`;
        finalPrompt += `- Sodium: ${todayNutrition.sodium} mg\n`;
      } else {
        finalPrompt += 'No food consumed yet today.\n';
      }

      const healthConditions = await this.prisma.userHealthCondition.findMany({
        where: { userId, deletedAt: null },
        select: { name: true, description: true },
      });

      if (healthConditions.length > 0) {
        finalPrompt += '\n\nUser Health Conditions:\n';
        healthConditions.forEach((c) => {
          finalPrompt += `- ${c.name}`;
          if (c.description) finalPrompt += `: ${c.description}`;
          finalPrompt += '\n';
        });
      } else {
        finalPrompt += '\n\nUser has no specific health conditions.\n';
      }
    }

    finalPrompt += '\nReturn ONLY valid JSON.';

    const contents = [
      {
        role: 'user',
        parts: [
          { text: finalPrompt },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ];

    const response = await this.gemeniAi.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      ...({
        grounding: {
          tools: [{ type: 'google-search', params: { maxResults: 3 } }],
        },
      } as any),
    });

    const raw = (response.text ?? '').toString().trim();
    const s = raw.replace(/^```(?:\w+)?\s*/, '').replace(/\s*```$/, '');

    let result: NutritionResult;
    try {
      result = JSON.parse(s);
    } catch {
      throw new BadRequestException('Try again');
    }

    if (result.message) throw new BadRequestException(result.message);
    if (result.total && !result.total.imageUrl) result.total.imageUrl = url;

    return result;
  }

  async createFoodNutritionFromAI(
    result: NutritionResult,
    userId: string,
    imageUrl?: string,
  ) {
    if (!result.ingredients.length || !result.total) return null;

    return this.prisma.foodNutrition.create({
      data: {
        mealName: result.total.name,
        calories: result.total.calories,
        carbs: result.total.carbs,
        protein: result.total.protein,
        fat: result.total.fat,
        fiber: result.total.fiber,
        sugar: result.total.sugar,
        sodium: result.total.sodium,
        image: imageUrl,
        type: FoodEntryType.IMAGE,
        userId,
        healthStatus: result.healthAnalysis?.status,
        healthAlert: result.healthAnalysis?.alert,
        healthDetails: result.healthAnalysis?.details,
        ingredients: {
          create: result.ingredients.map((i) => ({
            name: i.name,
            portion: i.portion,
            portionGrams: i.portionGrams,
            calories: i.nutrition.calories,
            carbs: i.nutrition.carbs,
            protein: i.nutrition.protein,
            fat: i.nutrition.fat,
            fiber: i.nutrition.fiber,
            sugar: i.nutrition.sugar,
            sodium: i.nutrition.sodium,
          })),
        },
      },
    });
  }

  async recordDailyNutritionFromAI(
    result: NutritionResult,
    userId: string,
    imageLink?: string,
  ) {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    return this.prisma.dailyNutritionLog.upsert({
      where: { date_userId: { date: today, userId } },
      create: {
        date: today,
        userId,
        calories: Math.round(result.total.calories),
        carbs: Math.round(result.total.carbs),
        protein: Math.round(result.total.protein),
        fat: Math.round(result.total.fat),
        fiber: Math.round(result.total.fiber),
        sugar: Math.round(result.total.sugar),
        sodium: Math.round(result.total.sodium),
        link: imageLink,
      },
      update: {
        calories: { increment: Math.round(result.total.calories) },
        carbs: { increment: Math.round(result.total.carbs) },
        protein: { increment: Math.round(result.total.protein) },
        fat: { increment: Math.round(result.total.fat) },
        fiber: { increment: Math.round(result.total.fiber) },
        sugar: { increment: Math.round(result.total.sugar) },
        sodium: { increment: Math.round(result.total.sodium) },
      },
    });
  }

  async processImageNutrition(link: string, user: ICurrentUser) {
    const data = await this.analyzeImageWithPrompt(link, prompt, user.id);
    const imageUrl = data.total?.imageUrl ?? '';

    const [nutration] = await Promise.all([
      this.createFoodNutritionFromAI(data, user.id, imageUrl),
      this.recordDailyNutritionFromAI(data, user.id, link),
    ]);

    return { id: nutration.id, ...data };
  }
}
