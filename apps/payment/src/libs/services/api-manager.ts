import { CheckApprovalResponse, StatusResponse } from "rango-sdk-basic";
import { ApiWrapper } from "./api-wrapper";

export class ApiManager {
  private static _instance: ApiManager;

  private constructor() { }

  public static get instance(): ApiManager {
    if (!ApiManager._instance) {
      ApiManager._instance = new ApiManager();
    }

    return ApiManager._instance;
  }

  public async checkApproval(baseUrlApi: string, requestId: string, txId: string): Promise<CheckApprovalResponse> {
    const request = ApiWrapper.instance.isApprovedRequest(requestId, txId)
    return await ApiWrapper.instance.send<CheckApprovalResponse>({
      ...request,
      url: request.url.replace('{baseUrlApi}', baseUrlApi)
    })
  }

  public async checkTransactionStatus(baseUrlApi: string, requestId: string, txId: string): Promise<StatusResponse> {
    const request = ApiWrapper.instance.statusRequest(requestId, txId)
    return await ApiWrapper.instance.send<StatusResponse>({
      ...request,
      url: request.url.replace('{baseUrlApi}', baseUrlApi)
    })
  }
}
