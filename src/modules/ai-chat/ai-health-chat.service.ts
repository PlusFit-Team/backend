import { GeminiConfigOptions } from '@config';
import { GoogleGenAI } from '@google/genai';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma';
import { ICurrentUser } from '@type';

import { GetUserChatsDto, SendMessageDto } from './dto';
import { healthChatSystemPrompt } from './prompt';

interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

@Injectable()
export class AiChatService {
  private gemeniAi: GoogleGenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const gemeniConfig = this.configService.get<GeminiConfigOptions>('gemeni');
    this.gemeniAi = new GoogleGenAI({ apiKey: gemeniConfig.key });
  }

  private async getOrCreateChat(chatId: string | undefined, userId: string) {
    if (chatId) {
      const chat = await this.prisma.healthChat.findFirst({
        where: { id: chatId, userId, deletedAt: null },
        select: {
          id: true,
          userId: true,
          history: true,
        },
      });
      if (chat) return chat;
    }

    return this.prisma.healthChat.create({
      data: {
        userId,
        history: [],
      },
      select: {
        id: true,
        userId: true,
        history: true,
      },
    });
  }

  private async getFoodNutritionContextById(
    foodNutritionId: string,
    userId: string,
  ) {
    const food = await this.prisma.foodNutrition.findFirst({
      where: { id: foodNutritionId, userId, deletedAt: null },
      select: {
        id: true,
        mealName: true,
        calories: true,
        carbs: true,
        protein: true,
        fat: true,
        fiber: true,
        sugar: true,
        sodium: true,
        healthStatus: true,
        healthAlert: true,
        healthDetails: true,
        createdAt: true,
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
    });

    if (!food) return '';

    const time = new Date(food.createdAt).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    let contextInfo =
      '\n\nSELECTED FOOD NUTRITION (User wants to discuss this meal):\n';
    contextInfo += `Food Nutrition ID: ${food.id}\n`;
    contextInfo += `Consumed at: ${time}\n`;
    contextInfo += `Meal Name: ${food.mealName || 'Unknown'}\n`;
    contextInfo += `Total Calories: ${food.calories} kcal\n`;
    contextInfo += `Carbs: ${food.carbs}g, Protein: ${food.protein}g, Fat: ${food.fat}g\n`;
    if (food.fiber) contextInfo += `Fiber: ${food.fiber}g\n`;
    if (food.sugar) contextInfo += `Sugar: ${food.sugar}g\n`;
    if (food.sodium) contextInfo += `Sodium: ${food.sodium}mg\n`;

    if (food.healthStatus) {
      contextInfo += `\nHealth Status: ${food.healthStatus}\n`;
    }
    if (food.healthAlert) {
      contextInfo += `Health Alert: ${food.healthAlert}\n`;
    }
    if (food.healthDetails) {
      contextInfo += `Health Details: ${food.healthDetails}\n`;
    }

    if (food.ingredients && food.ingredients.length > 0) {
      contextInfo += '\nIngredients:\n';
      food.ingredients.forEach((ingredient) => {
        contextInfo += `- ${ingredient.name}`;
        if (ingredient.portion) contextInfo += ` (${ingredient.portion})`;
        if (ingredient.portionGrams)
          contextInfo += ` [${ingredient.portionGrams}g]`;
        contextInfo += `: ${ingredient.calories} kcal, `;
        contextInfo += `${ingredient.carbs}g carbs, `;
        contextInfo += `${ingredient.protein}g protein, `;
        contextInfo += `${ingredient.fat}g fat`;
        if (ingredient.fiber) contextInfo += `, ${ingredient.fiber}g fiber`;
        if (ingredient.sugar) contextInfo += `, ${ingredient.sugar}g sugar`;
        if (ingredient.sodium) contextInfo += `, ${ingredient.sodium}mg sodium`;
        contextInfo += '\n';
      });
    }

    return contextInfo;
  }

  async getUserHealthContext(userId: string) {
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

    const [healthConditions, dailyNutrition] = await Promise.all([
      this.prisma.userHealthCondition.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          name: true,
        },
      }),
      this.prisma.dailyNutritionLog.findUnique({
        where: {
          date_userId: {
            userId,
            date: todayStart,
          },
        },
        select: {
          calories: true,
          carbs: true,
          protein: true,
          fat: true,
        },
      }),
    ]);

    let contextInfo = '';

    // Health conditions - only names
    contextInfo += '\n\nUSER HEALTH CONDITIONS:\n';
    if (healthConditions.length > 0) {
      const conditionNames = healthConditions.map((c) => c.name).join(', ');
      contextInfo += `${conditionNames}\n`;
    } else {
      contextInfo += 'None\n';
    }

    // Today's total nutrition - only main macros
    contextInfo += "\n\nTODAY'S TOTAL NUTRITION:\n";
    if (dailyNutrition) {
      contextInfo += `Calories: ${dailyNutrition.calories} kcal | `;
      contextInfo += `Carbs: ${dailyNutrition.carbs}g | `;
      contextInfo += `Protein: ${dailyNutrition.protein}g | `;
      contextInfo += `Fat: ${dailyNutrition.fat}g\n`;
    } else {
      contextInfo += 'No food logged yet today.\n';
    }

    return contextInfo;
  }

  async sendMessage(
    dto: SendMessageDto,
    user: ICurrentUser,
    onStreamChunk: (chunk: string, isDone: boolean) => void,
  ) {
    const chat = await this.getOrCreateChat(dto.chatId, user.id);

    const healthContext = await this.getUserHealthContext(user.id);

    // Only add specific food context if foodNutritionId is provided
    let foodContext = '';
    if (dto.foodNutritionId) {
      foodContext = await this.getFoodNutritionContextById(
        dto.foodNutritionId,
        user.id,
      );
    }

    const history = (chat.history as unknown as ChatMessage[]) || [];

    const systemInstruction =
      healthChatSystemPrompt + healthContext + foodContext;

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: dto.content.trim() }],
    };

    const contents = [...history, userMessage];

    try {
      const response = await this.gemeniAi.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      let fullResponse = '';

      for await (const chunk of response) {
        const text = chunk.text ?? '';
        fullResponse += text;
        onStreamChunk(text, false);
      }

      onStreamChunk('', true);

      const assistantMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: fullResponse }],
      };

      const updatedHistory = [...history, userMessage, assistantMessage];

      await this.prisma.healthChat.update({
        where: { id: chat.id },
        data: {
          history: updatedHistory as unknown as any,
          updatedAt: new Date(),
        },
      });

      return {
        chatId: chat.id,
        role: 'model',
        content: fullResponse,
      };
    } catch (error) {
      throw new Error('Failed to get response from AI');
    }
  }

  async getUserChats(dto: GetUserChatsDto, user: ICurrentUser) {
    return this.prisma.healthChat.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async deleteChat(chatId: string, user: ICurrentUser) {
    const chat = await this.prisma.healthChat.findUnique({
      where: { id: chatId, userId: user.id },
    });
    if (!chat) throw new NotFoundException('Chat not found');

    await this.prisma.healthChat.update({
      where: { id: chatId },
      data: { deletedAt: new Date() },
    });
  }

  async getChatMessages(
    chatId: string,
    user: ICurrentUser,
    onStreamChunk?: (message: any) => void,
  ) {
    const chat = await this.prisma.healthChat.findUnique({
      where: { id: chatId, userId: user.id },
      select: { history: true },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const history = (chat.history as unknown as ChatMessage[]) || [];

    const formattedMessages = history.map((msg, index) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.parts[0]?.text || '',
      messageIndex: index,
    }));

    if (onStreamChunk) {
      for (const message of formattedMessages) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        onStreamChunk(message);
      }
    }

    return formattedMessages;
  }
}
