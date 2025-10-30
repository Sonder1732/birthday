// 使用与record-visit.js相同的存储
const visitsData = {};

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { visitorId } = req.query;
    
    if (!visitorId) {
      return res.status(400).json({ error: 'Missing visitorId parameter' });
    }

    const visitorData = visitsData[visitorId];
    
    if (!visitorData) {
      return res.status(404).json({ 
        success: false,
        error: 'No data found for this visitor' 
      });
    }

    const stats = {
      firstVisit: visitorData.firstVisit,
      lastVisit: visitorData.lastVisit,
      totalVisits: visitorData.totalVisits,
      blessingOpens: visitorData.actions['blessings_opened'] || 0,
      wishCount: visitorData.actions['wish_made'] || 0,
      recentVisits: visitorData.visits.slice(-5) // 最近5次访问
    };

    res.status(200).json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}