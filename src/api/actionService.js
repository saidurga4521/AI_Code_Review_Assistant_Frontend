import api from "./client";
import { ENDPOINTS } from "./endpoints";

export const actionService={
  getPendingActions: async () => {
    const response = await api.get(ENDPOINTS.ACTIONS.PENDING);
    return response.data;
  },
  approveAction:async(actionId,approvalData)=>{
    const response=await api.post(ENDPOINTS.ACTIONS.APPROVE(actionId),approvalData)
    return response.data
  },
  rejectAction: async (actionId, rejectionData) => {
    //rejectionData:{resolved_by,comment}
    const response = await api.post(ENDPOINTS.ACTIONS.REJECT(actionId), rejectionData);
    return response.data;
  },
}