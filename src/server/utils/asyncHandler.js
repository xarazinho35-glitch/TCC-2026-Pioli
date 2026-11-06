// Garante que erros de funções async cheguem ao errorHandler (funciona em Express 4 e 5)
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
