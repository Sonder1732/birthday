// 使用更稳定的存储方式
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { visitorId, action, timestamp } = req.body;
    
    if (!visitorId) {
      return res.status(400).json({ error: 'Missing visitorId' });
    }

    // 在实际项目中，这里应该连接数据库
    // 现在使用简单的内存存储（重启会丢失数据）
    const currentTime = new Date().toISOString();
    
    if (!visitsData[visitorId]) {
      visitsData[visitorId] = {
        firstVisit: currentTime,
        lastVisit: currentTime,
        totalVisits: 1,
        actions: { [action]: 1 },
        visits: [{
          timestamp: currentTime,
          action: action,
          userAgent: req.body.userAgent || '',
          referrer: req.body.referrer || ''
        }]
      };
    } else {
      const data = visitsData[visitorId];
      data.lastVisit = currentTime;
      data.totalVisits += 1;
      data.actions[action] = (data.actions[action] || 0) + 1;
      data.visits.push({
        timestamp: currentTime,
        action: action,
        userAgent: req.body.userAgent || '',
        referrer: req.body.referrer || ''
      });
    }

    console.log(`Visit recorded: ${visitorId} - ${action}`);

    res.status(200).json({
      success: true,
      message: 'Visit recorded',
      visitorId: visitorId,
      action: action,
      timestamp: currentTime
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}