import api from "./client";
import { ENDPOINTS } from "./endpoints";

export const feedbackService={
  submitFeedback:async(findingId,feedbackData)=>{
    const response=await api.post(ENDPOINTS.FEEDBACK.SUBMIT(findingId),feedbackData)
    return response.data
  },
  getFeedbackStats: async (repoId) => {
    const response = await api.get(ENDPOINTS.REPOSITORIES.FEEDBACK_STATS(repoId));
    return response.data;
  }
}