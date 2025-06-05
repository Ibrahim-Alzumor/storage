export interface ClearanceLevel {
  level: number;
  name: string;
  description?: string;
  allowedFunctions: string[];
}

export interface FunctionPermission {
  id: string;
  name: string;
  description?: string;
  category: string;
}
