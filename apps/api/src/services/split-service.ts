import { SplitType } from "@prisma/client";
import { distributeRemainder } from "../utils/money";

type ParticipantInput = {
  userId: string;
  weight?: number | null;
  share?: number | null;
  fixedAmount?: number | null;
  percent?: number | null;
};

export interface SplitResultItem {
  userId: string;
  amount: number;
}

export class SplitService {
  constructor(private readonly precision: number) {}

  compute(splitType: SplitType, amount: number, participants: ParticipantInput[]): SplitResultItem[] {
    switch (splitType) {
      case SplitType.EQUAL:
        return this.equalSplit(amount, participants);
      case SplitType.WEIGHTED:
        return this.weightedSplit(amount, participants);
      case SplitType.SHARES:
        return this.sharesSplit(amount, participants);
      case SplitType.FIXED:
        return this.fixedSplit(amount, participants);
      case SplitType.PERCENT:
        return this.percentSplit(amount, participants);
      default:
        throw new Error(`Unsupported split type: ${splitType}`);
    }
  }

  private equalSplit(amount: number, participants: ParticipantInput[]): SplitResultItem[] {
    const rawShare = amount / participants.length;
    const distributed = distributeRemainder(
      participants.map(() => rawShare),
      amount,
      this.precision
    );
    return participants.map((participant, index) => ({
      userId: participant.userId,
      amount: distributed[index],
    }));
  }

  private weightedSplit(amount: number, participants: ParticipantInput[]): SplitResultItem[] {
    const totalWeight = participants.reduce((sum, participant) => sum + (participant.weight ?? 0), 0);
    if (totalWeight <= 0) {
      throw new Error("Sum of weights must be greater than zero");
    }

    const raw = participants.map((participant) =>
      amount * ((participant.weight ?? 0) / totalWeight)
    );
    const distributed = distributeRemainder(raw, amount, this.precision);
    return participants.map((participant, index) => ({
      userId: participant.userId,
      amount: distributed[index],
    }));
  }

  private sharesSplit(amount: number, participants: ParticipantInput[]): SplitResultItem[] {
    const totalShares = participants.reduce((sum, participant) => sum + (participant.share ?? 0), 0);
    if (totalShares <= 0) {
      throw new Error("Sum of shares must be greater than zero");
    }
    const raw = participants.map((participant) =>
      amount * ((participant.share ?? 0) / totalShares)
    );
    const distributed = distributeRemainder(raw, amount, this.precision);
    return participants.map((participant, index) => ({
      userId: participant.userId,
      amount: distributed[index],
    }));
  }

  private fixedSplit(amount: number, participants: ParticipantInput[]): SplitResultItem[] {
    const fixedTotal = participants.reduce((sum, participant) => sum + (participant.fixedAmount ?? 0), 0);
    if (fixedTotal > amount + 1e-6) {
      throw new Error("Fixed amounts exceed total expense");
    }

    const remaining = amount - fixedTotal;
    const remainingParticipants = participants.filter((participant) => !participant.fixedAmount);
    const equalRemainder = remainingParticipants.length
      ? distributeRemainder(
          remainingParticipants.map(() => remaining / remainingParticipants.length),
          remaining,
          this.precision
        )
      : [];

    const results: SplitResultItem[] = [];
    let remainderIndex = 0;
    for (const participant of participants) {
      if (participant.fixedAmount) {
        results.push({ userId: participant.userId, amount: participant.fixedAmount });
      } else {
        results.push({ userId: participant.userId, amount: equalRemainder[remainderIndex++] ?? 0 });
      }
    }

    return results.map((entry) => ({
      ...entry,
      amount: parseFloat(entry.amount.toFixed(this.precision)),
    }));
  }

  private percentSplit(amount: number, participants: ParticipantInput[]): SplitResultItem[] {
    const totalPercent = participants.reduce((sum, participant) => sum + (participant.percent ?? 0), 0);
    if (Math.round(totalPercent) !== 100) {
      throw new Error("Percentages must add up to 100");
    }

    const raw = participants.map((participant) => amount * ((participant.percent ?? 0) / 100));
    const distributed = distributeRemainder(raw, amount, this.precision);
    return participants.map((participant, index) => ({
      userId: participant.userId,
      amount: distributed[index],
    }));
  }
}
