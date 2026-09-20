// export interface GeneratePreviewInput {
//   userImageUrl: string;
//   ssDesignUrl: string;
//   promptInstruction?: string;
// }

export interface GeneratePreviewInput {
  customerImageUrl: string;
  designImageUrl: string;
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
