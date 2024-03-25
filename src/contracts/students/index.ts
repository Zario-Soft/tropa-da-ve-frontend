export interface StudentsResponse {
    items: StudentsResponseItem[]
  }
  
  export interface StudentsResponseItem {
    id: number,
    name: string,
    age: number,
    telephone: string,
    email: string,
    city: string
  }
  