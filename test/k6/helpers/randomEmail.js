// Função para gerar e-mail aleatório para registro de usuário
export function randomEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user_${timestamp}_${random}@example.com`;
}
