/**
 * 访问记录中间件
 * 自动记录所有 API 请求到 visit_log 表
 */

/**
 * 生成唯一 ID（使用 crypto API）
 * @returns {string} 唯一 ID
 */
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const random1 = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  const random2 = crypto.randomUUID().replace(/-/g, '').substring(0, 4);
  return `${timestamp}-${random1}-${random2}`;
}

/**
 * 获取客户端真实 IP
 * @param {Request} request 
 * @returns {string}
 */
function getClientIP(request) {
  // 检查 X-Forwarded-For
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // 检查 CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get('CF-Connecting-IP');
  if (cfIP) {
    return cfIP;
  }
  
  return 'unknown';
}

/**
 * 创建访问记录中间件
 * @returns {Function} Hono 中间件函数
 */
export function createVisitMiddleware() {
  return async (c, next) => {
    const startTime = Date.now();
    
    // 继续处理请求
    await next();
    
    try {
      const request = c.req.raw;
      const url = new URL(request.url);
      
      // 只在 /api/ 路径下记录
      if (!url.pathname.startsWith('/api/')) {
        return;
      }
      
      const visitId = generateUniqueId();
      const sessionId = c.req.header('Cookie')?.match(/session_id=([^;]+)/)?.[1] || null;
      const userId = c.req.header('X-User-ID') || 
                     c.req.header('Authorization')?.split(' ')[1] || 
                     null;
      const referrer = request.headers.get('Referer');
      const userAgent = request.headers.get('User-Agent');
      const remoteIP = getClientIP(request);
      const remotePort = parseInt(request.headers.get('X-Forwarded-Port') || '0');
      const serverIP = url.hostname;
      const serverPort = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
      const statusCode = c.res.status;
      const responseTime = Date.now() - startTime;
      
      const db = c.env.DB;
      if (db) {
        await db.prepare(`
          INSERT INTO visit_log 
          (visit_id, visit_time, user_id, session_id, method, request_url, request_path, 
           query_string, referrer_url, user_agent, remote_ip, remote_port, 
           server_ip, server_port, status_code, response_time_ms)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          visitId,
          new Date().toISOString(),
          userId,
          sessionId,
          c.req.method,
          request.url,
          url.pathname,
          url.search.substring(1) || null,
          referrer,
          userAgent,
          remoteIP,
          remotePort || null,
          serverIP,
          serverPort,
          statusCode,
          responseTime
        ).run();
      }
    } catch (error) {
      console.error('访问记录失败:', error);
    }
  };
}

export default createVisitMiddleware;
