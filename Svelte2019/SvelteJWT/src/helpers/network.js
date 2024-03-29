export const req = async (pURL, pFormData, pMethod = 'POST') => {
  const resp = await fetch(pURL, {
    method: pMethod,
    headers: {
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
    body: pFormData
  });
  return resp.json();
};
