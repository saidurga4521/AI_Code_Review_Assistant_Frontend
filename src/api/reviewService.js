import api from "./client";
import { ENDPOINTS } from "./endpoints";

export const reviewService={
  submitReview:async(repoId,reviewData)=>{
    const response=await api.post(ENDPOINTS.REVIEWS.CREATE_REVIEW(repoId),reviewData)
    return response.data
  },
  getReviewsByRepo: async (repoId) => {
    const response = await api.get(ENDPOINTS.REVIEWS.LIST_BY_REPO(repoId));
    return response.data;
  },
  getReviewById: async (reviewId) => {
    const response = await api.get(ENDPOINTS.REVIEWS.DETAIL(reviewId));
    return response.data;
  },
}