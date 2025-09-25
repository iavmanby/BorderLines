export const checkpoints = {
  benyakoni: { id: "53d94097-2b34-11ec-8467-ac1f6bf889c0", name: "Benyakoni" },
  "kamennii-log": { id: "b60677d4-8a00-4f93-a781-e129e1692a03", name: "Kamennii Log" }
};

export const baseUrl = "https://belarusborder.by/info";
export const tokenTest = "test";

/**
 * Возвращает статистику для указанного checkpointId
 * @param {string} checkpointId
 * @param {function} fetchFn - fetch (в браузере window.fetch, в Node.js импортированный fetch)
 */
export async function getCheckpointStatistics(checkpointId, fetchFn) {
  const url = `${baseUrl}/monitoring/statistics?token=${tokenTest}&checkpointId=${checkpointId}`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`Ошибка HTTP ${res.status}`);
  return await res.json();
}
