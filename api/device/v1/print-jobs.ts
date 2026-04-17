
import { getNextJob } from '../../_store';

export default function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-device-token'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const token = req.headers['x-device-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const job = getNextJob();
    
    if (job) {
      return res.status(200).json({
        has_job: true,
        ...job
      });
    } else {
      return res.status(200).json({
        has_job: false
      });
    }
  } catch (e: any) {
    console.error("Print Jobs Error:", e);
    return res.status(500).json({ error: e.message });
  }
}
