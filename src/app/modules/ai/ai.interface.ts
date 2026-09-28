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

export interface GeneratePreviewSubmissionResponse {
  predictionId: string;
  status: string;
}

export interface GeneratePreviewStatusResponse {
  predictionId: string;
  status: string;
  generatedUrl?: string;
  error?: string;
}