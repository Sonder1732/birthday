// 使用与record-visit.js相同的存储
let visitsData = {};

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { visitorId } = req.query;
        
        if (!visitorId) {
            return res.status(400).json({ error: 'Missing visitorId parameter' });
        }
        
        const visitor = visitsData[visitorId];
        
        if (!visitor) {
            return res.status(404).json({ error: 'Visitor not found' });
        }
        
        const stats = {
            firstVisit: visitor.firstVisit,
            lastVisit: visitor.lastVisit,
            totalVisits: visitor.totalVisits,
            blessingOpens: visitor.actions['blessings_opened'] || 0,
            wishCount: visitor.actions['wish_made'] || 0,
            userInfo: visitor.userInfo
        };
        
        res.status(200).json({ 
            success: true, 
            stats 
        });
        
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}