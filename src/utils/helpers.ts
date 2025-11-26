export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  export const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };