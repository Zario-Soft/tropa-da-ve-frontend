import { ChallengeType } from "../challenges"

export interface ControlsResponse {
    items: ControlsResponseItem[]
}

export interface ControlsResponseItem {
    studentName: string,
    studentPhone: string,
    controlId: number,
    studentId: number,
    challengeId: number,
    challengeName: string,
    challengeDuration: string,
    challengeType: ChallengeType,
    challengeEnd: Date,
    amountPaid: number,
    begin: Date,
    active: boolean,
  }

  export interface ControlsRequest {
    id?: number,
    challengeId: number,
    studentId: number,
    amountPaid: number,
    begin: Date,
    active: boolean
  }