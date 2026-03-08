"use server"

import { getSubscriptionStatus } from "@/lib/subscription"

export async function getUserSubscriptionData(userId: string) {
  return await getSubscriptionStatus(userId)
}