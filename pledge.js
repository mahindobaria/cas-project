const { randomUUID } = require('crypto');
const { getStore } = require('@netlify/blobs');

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

async function listPledgeRecords(store) {
  let cursor;
  let total = 0;

  do {
    const result = await store.list({ prefix: 'pledge-', cursor });
    total += result.blobs.length;
    cursor = result.cursor;
  } while (cursor);

  return total;
}

async function readLegacyCount(store) {
  const saved = await store.get('pledge-count', { type: 'json' });
  return Number(saved && saved.count ? saved.count : 0);
}

async function calculateTotalCount(store) {
  const recordCount = await listPledgeRecords(store);
  const legacyCount = await readLegacyCount(store);
  return Math.max(recordCount, legacyCount);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: jsonHeaders, body: '' };
  }

  const store = getStore('clean-rajkot-pledges');

  try {
    if (event.httpMethod === 'GET') {
      const count = await calculateTotalCount(store);
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ count })
      };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const name = String(body.name || 'Anonymous visitor').slice(0, 120);
      const locality = String(body.locality || 'Not provided').slice(0, 120);
      const pledges = Array.isArray(body.pledges) ? body.pledges.map(String).slice(0, 10) : [];

      const pledgeId = `pledge-${Date.now()}-${randomUUID()}`;
      await store.setJSON(pledgeId, {
        name,
        locality,
        pledges,
        createdAt: new Date().toISOString()
      });

      const count = await calculateTotalCount(store);
      await store.setJSON('pledge-count', {
        count,
        updatedAt: new Date().toISOString()
      });

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ count })
      };
    }

    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Server error', details: error.message })
    };
  }
};
