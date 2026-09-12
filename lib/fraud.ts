import prisma from './prisma';

export interface FraudEvaluationResult {
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  requiresReview: boolean;
  shouldBlock: boolean;
}

export async function evaluateTransactionRisk(params: {
  userId: string;
  amount: number;
  walletBalance: number;
  type: string;
  ipAddress?: string;
  device?: string;
}): Promise<FraudEvaluationResult> {
  const { userId, amount, walletBalance, type } = params;
  const reasons: string[] = [];
  let scorePoints = 0;

  // Rule 1: High Transaction Amount relative to balance
  if (walletBalance > 0 && amount > walletBalance * 0.75 && amount > 1000) {
    scorePoints += 35;
    reasons.push(`Unusually large volume: Transferring >75% of total wallet balance ($${amount.toFixed(2)})`);
  }

  // Rule 2: Absolute high amount threshold
  if (amount >= 5000) {
    scorePoints += 30;
    reasons.push(`High single-transaction amount ($${amount.toFixed(2)})`);
  }

  // Rule 3: Velocity Check (Transfers created in the last 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentTransfersCount = await prisma.transaction.count({
    where: {
      userId,
      createdAt: { gte: tenMinutesAgo },
    },
  });

  if (recentTransfersCount >= 3) {
    scorePoints += 40;
    reasons.push(`High transfer velocity: ${recentTransfersCount} operations within 10 minutes`);
  }

  // Rule 4: Recent Failed Logins Check
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const failedLoginsCount = await prisma.securityLog.count({
    where: {
      userId,
      event: 'FAILED_LOGIN',
      createdAt: { gte: oneHourAgo },
    },
  });

  if (failedLoginsCount >= 3) {
    scorePoints += 25;
    reasons.push(`Multiple recent failed authentication attempts (${failedLoginsCount} failed in last hour)`);
  }

  // Compute Risk Classification
  let riskScore: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (scorePoints >= 60) {
    riskScore = 'HIGH';
  } else if (scorePoints >= 30) {
    riskScore = 'MEDIUM';
  }

  const requiresReview = riskScore === 'HIGH' || riskScore === 'MEDIUM';
  const shouldBlock = riskScore === 'HIGH' && scorePoints >= 80;

  // Automatically record Fraud Alert if flagged
  if (requiresReview) {
    await prisma.fraudAlert.create({
      data: {
        userId,
        ruleTriggered: reasons[0] || 'HEURISTIC_RISK_THRESHOLD_EXCEEDED',
        riskScore,
        details: reasons.join(' | '),
        status: 'OPEN',
      },
    });
  }

  return {
    riskScore,
    reasons,
    requiresReview,
    shouldBlock,
  };
}

export async function logSecurityEvent(params: {
  userId: string;
  event: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
}) {
  try {
    return await prisma.securityLog.create({
      data: {
        userId: params.userId,
        event: params.event,
        ipAddress: params.ipAddress || '127.0.0.1',
        userAgent: params.userAgent || 'Web Browser',
        device: params.device || 'Desktop',
        browser: params.browser || 'Chrome',
        os: params.os || 'Windows',
        location: params.location || 'San Francisco, US',
        riskLevel: params.riskLevel || 'LOW',
        status: params.status || 'SUCCESS',
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
