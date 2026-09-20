// export interface GeneratePreviewInput {
//   userImageUrl: string;
//   ssDesignUrl: string;
//   promptInstruction?: string;
// }

export interface GeneratePreviewInput {
  userImageUrl: string;
  ssDesignUrl: string;
  promptInstruction?: string;
  category: string;
}

export interface GeneratePreviewResponse {
  generatedUrl: string;
  subscriptionId?: string;
  totalCredit?: number;
  usedCredit?: number;
  remainingCredit?: number;
  freeAiImageCount?: number;
  freeAiImageLimit?: number;
  unlimited?: boolean;
}