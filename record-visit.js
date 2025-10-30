// 简单的内存存储（生产环境建议使用数据库）
let visitsData = {};

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { visitorId, action, timestamp, userAgent, referrer, screenSize, language, timezone } = req.body;
        
        if (!visitorId) {
            return res.status(400).json({ error: 'Missing visitorId' });
        }
        
        // 初始化访问者数据
        if (!visitsData[visitorId]) {
            visitsData[visitorId] = {
                firstVisit: timestamp,
                lastVisit: timestamp,
                totalVisits: 0,
                actions: {},
                userInfo: {
                    userAgent,
                    referrer,
                    screenSize,
                    language,
                    timezone
                }
            };
        }
        
        // 更新访问数据
        const visitor = visitsData[visitorId];
        visitor.lastVisit = timestamp;
        visitor.totalVisits++;
        
        // 记录具体动作
        if (!visitor.actions[action]) {
            visitor.actions[action] = 0;
        }
        visitor.actions[action]++;
        
        console.log(`Recorded visit: ${visitorId}, action: ${action}`);
        
        res.status(200).json({ 
            success: true, 
            message: 'Visit recorded successfully',
            data: {
                visitorId,
                action,
                timestamp
            }
        });
        
    } catch (error) {
        console.error('Error recording visit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}