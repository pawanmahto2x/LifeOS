import { JournalAnalysisRepository } from '../repositories/journal-analysis.repository';
import {
  JournalTheme,
  IJournalAnalysis,
  IDataConnection,
  IRecurringThemesResponse,
  IRecurringThemeItem,
} from '../types/journal-analysis.types';
import { NotFoundError } from '../utils/errors';
import { Journal } from '../models/journal.model';
import { Task } from '../models/task.model';
import { FocusSession } from '../models/focus-session.model';
import { SleepLog } from '../models/sleep-log.model';
import { WaterLog } from '../models/water-log.model';

export class JournalAnalysisService {
  constructor(private repo: JournalAnalysisRepository = new JournalAnalysisRepository()) {}

  private static THEME_KEYWORDS: Record<JournalTheme, string[]> = {
    productivity: [
      'productive',
      'accomplished',
      'finished',
      'completed',
      'done',
      'shipped',
      'delivered',
      'progress',
      'achieved',
    ],
    procrastination: [
      'procrastinat',
      'delayed',
      'avoided',
      'put off',
      'distracted',
      'wasted time',
      'scrolling',
      "couldn't start",
      'lazy',
      'unmotivated',
    ],
    sleep: [
      'sleep',
      'slept',
      'tired',
      'exhausted',
      'insomnia',
      'nap',
      'rest',
      'fatigue',
      'drowsy',
      'woke up',
      'bedtime',
    ],
    stress: [
      'stress',
      'overwhelm',
      'anxious',
      'pressure',
      'deadline',
      'worried',
      'tense',
      'burnout',
      'overload',
    ],
    motivation: [
      'motivat',
      'inspired',
      'driven',
      'excited',
      'enthusiastic',
      'passionate',
      'determined',
      'pumped',
      'energized',
    ],
    accomplishment: [
      'proud',
      'achievement',
      'milestone',
      'success',
      'won',
      'celebrate',
      'breakthrough',
      'nailed',
    ],
    difficulty: [
      'struggle',
      'hard',
      'difficult',
      'challenge',
      'problem',
      'stuck',
      'confused',
      'frustrated',
      'fail',
    ],
    goals: [
      'goal',
      'target',
      'plan',
      'objective',
      'aim',
      'aspir',
      'dream',
      'ambition',
      'vision',
      'milestone',
    ],
    energy: [
      'energy',
      'energetic',
      'drained',
      'exhausted',
      'vigor',
      'lethargic',
      'active',
      'sluggish',
    ],
    social: [
      'friend',
      'family',
      'colleague',
      'team',
      'meeting',
      'conversation',
      'social',
      'people',
      'relationship',
    ],
    health: [
      'health',
      'sick',
      'doctor',
      'medicine',
      'pain',
      'headache',
      'exercise',
      'workout',
      'gym',
      'water',
      'hydrat',
    ],
    exercise: [
      'exercise',
      'workout',
      'gym',
      'run',
      'walk',
      'yoga',
      'fitness',
      'training',
      'physical',
    ],
    work: [
      'work',
      'project',
      'task',
      'assignment',
      'job',
      'office',
      'meeting',
      'deadline',
      'presentation',
    ],
    learning: [
      'learn',
      'study',
      'course',
      'read',
      'book',
      'lecture',
      'tutorial',
      'skill',
      'practice',
    ],
    gratitude: ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate', 'gratitude'],
    anxiety: ['anxious', 'anxiety', 'nervous', 'panic', 'worry', 'fear', 'dread', 'uneasy'],
    focus: ['focus', 'concentrate', 'attention', 'distract', 'deep work', 'flow', 'zone'],
    relationships: [
      'partner',
      'girlfriend',
      'boyfriend',
      'spouse',
      'parent',
      'sibling',
      'love',
      'argument',
      'support',
    ],
  };

  private static MOOD_KEYWORDS: Record<string, string[]> = {
    positive: [
      'happy',
      'great',
      'wonderful',
      'amazing',
      'good',
      'fantastic',
      'joyful',
      'content',
      'peaceful',
      'excited',
      'proud',
      'grateful',
    ],
    negative: [
      'sad',
      'angry',
      'frustrated',
      'disappointed',
      'upset',
      'terrible',
      'awful',
      'miserable',
      'depressed',
      'anxious',
      'stressed',
    ],
    neutral: ['okay', 'fine', 'alright', 'normal', 'average', 'so-so'],
  };

  private extractThemes(content: string): JournalTheme[] {
    const lowerContent = content.toLowerCase();
    const foundThemes = new Set<JournalTheme>();

    for (const [theme, keywords] of Object.entries(JournalAnalysisService.THEME_KEYWORDS)) {
      if (keywords.some((kw) => lowerContent.includes(kw))) {
        foundThemes.add(theme as JournalTheme);
      }
    }
    return Array.from(foundThemes);
  }

  private extractMood(content: string): string | null {
    const lowerContent = content.toLowerCase();
    for (const [mood, keywords] of Object.entries(JournalAnalysisService.MOOD_KEYWORDS)) {
      if (keywords.some((kw) => lowerContent.includes(kw))) {
        return mood;
      }
    }
    return null;
  }

  private extractEnergy(content: string): 'high' | 'medium' | 'low' | null {
    const lowerContent = content.toLowerCase();
    const highKeywords = ['energetic', 'active', 'pumped', 'energized', 'vigorous'];
    const lowKeywords = ['tired', 'exhausted', 'drained', 'lethargic', 'sluggish', 'fatigue'];

    const hasHigh = highKeywords.some((kw) => lowerContent.includes(kw));
    const hasLow = lowKeywords.some((kw) => lowerContent.includes(kw));

    if (hasHigh && !hasLow) return 'high';
    if (hasLow && !hasHigh) return 'low';
    return null;
  }

  private extractKeyPhrases(content: string): string[] {
    const sentences = content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const phrases = new Set<string>();

    const allKeywords = Object.values(JournalAnalysisService.THEME_KEYWORDS).flat();

    for (const sentence of sentences) {
      if (allKeywords.some((kw) => sentence.toLowerCase().includes(kw))) {
        if (phrases.size < 5) {
          phrases.add(sentence.substring(0, 100));
        }
      }
    }
    return Array.from(phrases);
  }

  private async buildDataConnections(
    userId: string,
    content: string,
    themes: JournalTheme[],
  ): Promise<IDataConnection[]> {
    const connections: IDataConnection[] = [];
    const lowerContent = content.toLowerCase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Sleep connection
    if (
      themes.includes('sleep') ||
      lowerContent.includes('tired') ||
      lowerContent.includes('exhausted')
    ) {
      const todaySleep = await SleepLog.findOne({
        userId,
        date: { $gte: today, $lt: tomorrow },
      }).exec();
      if (todaySleep) {
        connections.push({
          observation: 'You mentioned difficulty with sleep/tiredness',
          journalMention: 'sleep/tiredness mention',
          recordedData: `Your recorded sleep was ${todaySleep.get('duration') || 0} hours`,
          metric: 'sleep',
          comparison: 'Associated with sleep logs',
        });
      }
    }

    // Focus connection
    if (
      themes.includes('focus') ||
      lowerContent.includes('concentrate') ||
      lowerContent.includes('distracted')
    ) {
      const todayFocus = await FocusSession.find({
        userId,
        startTime: { $gte: today, $lt: tomorrow },
      }).exec();
      if (todayFocus && todayFocus.length > 0) {
        connections.push({
          observation: 'You mentioned focus or distraction',
          journalMention: 'focus mention',
          recordedData: `You recorded ${todayFocus.length} focus sessions today`,
          metric: 'focus',
        });
      }
    }

    // Productivity connection
    if (themes.includes('productivity') || themes.includes('accomplishment')) {
      const completedTasks = await Task.countDocuments({
        userId,
        status: 'Completed',
        updatedAt: { $gte: today, $lt: tomorrow },
      }).exec();
      if (completedTasks > 0) {
        connections.push({
          observation: 'You mentioned productivity',
          journalMention: 'productivity mention',
          recordedData: `You completed ${completedTasks} tasks today`,
          metric: 'productivity',
        });
      }
    }

    // Health connection
    if (themes.includes('health') || themes.includes('exercise')) {
      const todayWater = await WaterLog.findOne({
        userId,
        date: { $gte: today, $lt: tomorrow },
      }).exec();
      if (todayWater) {
        connections.push({
          observation: 'You mentioned health or exercise',
          journalMention: 'health mention',
          recordedData: `Your recorded water intake is ${todayWater.get('amount') || 0} ml`,
          metric: 'health',
        });
      }
    }

    return connections.slice(0, 5);
  }

  async analyzeEntry(userId: string, journalId: string): Promise<IJournalAnalysis> {
    const journal = await Journal.findOne({ _id: journalId, userId }).exec();
    if (!journal) {
      throw new NotFoundError('Journal entry not found');
    }

    const content = journal.get('content') || '';
    const themes = this.extractThemes(content);
    const mood = this.extractMood(content);
    const energy = this.extractEnergy(content);
    const keyPhrases = this.extractKeyPhrases(content);
    const dataConnections = await this.buildDataConnections(userId, content, themes);

    const doc = await this.repo.upsertAnalysis(userId, journalId, {
      themes,
      extractedMood: mood,
      extractedEnergy: energy,
      keyPhrases,
      dataConnections,
      analyzedAt: new Date(),
    });

    return doc.toObject() as IJournalAnalysis;
  }

  async getAnalysis(userId: string, journalId: string): Promise<IJournalAnalysis> {
    const doc = await this.repo.findByJournalId(userId, journalId);
    if (!doc) throw new NotFoundError('Journal analysis not found');
    return doc.toObject() as IJournalAnalysis;
  }

  async getRecurringThemes(userId: string, limit: number = 30): Promise<IRecurringThemesResponse> {
    const analyses = await this.repo.findRecentAnalyses(userId, limit);
    const totalEntriesAnalyzed = analyses.length;

    if (totalEntriesAnalyzed === 0) {
      return { themes: [], totalEntriesAnalyzed: 0, period: 'No data' };
    }

    const recentAnalyses = analyses.slice(0, 7);
    const themeCounts: Record<string, { count: number; recentMentions: number }> = {};

    analyses.forEach((analysis) => {
      analysis.themes.forEach((t) => {
        if (!themeCounts[t]) themeCounts[t] = { count: 0, recentMentions: 0 };
        themeCounts[t].count += 1;
      });
    });

    recentAnalyses.forEach((analysis) => {
      analysis.themes.forEach((t) => {
        if (themeCounts[t]) {
          themeCounts[t].recentMentions += 1;
        }
      });
    });

    const themes: IRecurringThemeItem[] = Object.entries(themeCounts).map(([theme, data]) => ({
      theme: theme as JournalTheme,
      count: data.count,
      percentage: Math.round((data.count / totalEntriesAnalyzed) * 100),
      recentMentions: data.recentMentions,
    }));

    themes.sort((a, b) => b.count - a.count);

    return {
      themes,
      totalEntriesAnalyzed,
      period: `Last ${totalEntriesAnalyzed} entries`,
    };
  }
}
