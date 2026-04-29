export interface QuestionnaireResponse {
  id?: string;
  clientId: string;
  reponses: {
    questionId: string;
    reponse: string | number | boolean;
  }[];
  dateReponse: Date;
}

export interface RecommendationResult {
  id: string;
  clientId: string;
  questionnaireId: string;
  packsRecommandes: {
    packId: string;
    score: number;
    raisons: string[];
  }[];
  dateRecommendation: Date;
  statut: string;
}
