import { api } from "./client";
import type {
    CreateCustomRewardRequest,
    GetCoinsRequest,
    GetCoinsResponse,
    CustomReward,
    ListCustomRewardsRequest,
    // ListCustomRewardsResponse,
    RedeemCustomRewardRequest,
    RedeemCustomRewardResponse,
    SpendCoinsRequest,
    SpendCoinsResponse
} from "./types";

//Get number of coins for current child
export async function getNumCoins(
    data: GetCoinsRequest
): Promise<GetCoinsResponse> {
    const response = await api.get<GetCoinsResponse>(`/child/${data.child_id}/coins`)
    return response.data;
}

export async function spendCoins(
    data: SpendCoinsRequest
): Promise<SpendCoinsResponse> {
    const response = await api.post<SpendCoinsResponse>('/child/spend-coins', data)
    return response.data;
}


//Create a new custom reward
export async function createCustomReward(
    data: CreateCustomRewardRequest
): Promise<CustomReward> {
    const response = await api.post<CustomReward>("custom-rewards", data)
    return response.data
}

//List custom rewards
export async function listCustomRewards(
    data: ListCustomRewardsRequest
): Promise<CustomReward[]> {
    const response = await api.get<CustomReward[]>(`/child/${data.child_id}/custom-rewards`)
    return response.data
}

//Redeem a custom reward
export async function redeemCustomReward(
    data: RedeemCustomRewardRequest
): Promise<RedeemCustomRewardResponse> {
    const response = await api.post<RedeemCustomRewardResponse>(`/custom-rewards/redeem`, data)
    return response.data
}