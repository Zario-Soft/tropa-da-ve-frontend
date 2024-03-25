export interface ChallengesResponse {
    items: ChallengesResponseItem[]
  }
  
  export type ChallengeType = 'Fixo' | 'Variavel';
  export interface ChallengesResponseItem {
    id: number,
    name: string,
    description: string,
    duration: string,
    type: ChallengeType,
    begin: Date,
    end: Date,
    price: number,
  }
  