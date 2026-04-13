const { json, methodNotAllowed, ok } = require('./_lib/response');
const { getFirestore } = require('./_lib/firebaseAdmin');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET']);
  }

  try {
    const snapshot = await getFirestore().collection('artJobs').orderBy('updatedAt', 'desc').limit(50).get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return ok({
      items
    });
  } catch (error) {
    return json(500, {
      error: error.message || 'Failed to list art jobs.'
    });
  }
};
