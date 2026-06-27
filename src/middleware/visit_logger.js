/**
 * 访问记录中间件
 * 自动记录所有 API 请求到 visit_log 表
 */

import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';

/**
 * 生成雪花算法 ID（简化版）
 * @returns {string} 唯一 ID
 */
function generateSnowflakeId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const random2 = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${random}-${random2}`;
}

/**
 * 获取客户端真实 IP
 * @param {Request} request 
 * @param {Object} env
 * @returns {string}
 */
function getClientIP(request, env) {
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
  
  // 返回空或默认值
  return 'unknown';
}

/**
 * 访问记录中间件
 * @param {Object} env - Cloudflare 环境对象
 */
export async function visitLogger(env) {
  return async (c, next) => {
    const startTime = Date.now();
    
    // 继续处理请求
    await next();
    
    try {
      // 获取请求信息
      const request = c.req.raw;
      const url = new URL(request.url);
      
      // 生成访问 ID
      const visitId = generateSnowflakeId();
      
      // 获取会话 ID（从 Cookie）
      const sessionId = c.req.header('Cookie')?.match(/session_id=([^;]+)/)?.[1] || null;
      
      // 获取用户 ID（从请求头或 Cookie，实际项目中从认证系统获取）
      const userId = c.req.header('X-User-ID') || 
                     c.req.header('Authorization')?.split(' ')[1] || 
                     null;
      
      // 获取 Referer
      const referrer = request.headers.get('Referer');
      
      // 获取 User-Agent
      const userAgent = request.headers.get('User-Agent');
      
      // 获取 IP 和端口
      const remoteIP = getClientIP(request, env);
      const remotePort = parseInt(request.headers.get('X-Forwarded-Port') || '0');
      
      // 服务器信息
      const serverIP = url.hostname;
      const serverPort = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
      
      // 响应状态码
      const statusCode = c.res.status;
      
      // 响应时间
      const responseTime = Date.now() - startTime;
      
      // 插入访问记录
      const db = env.DB;
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
      
    } catch (error) {
      // 记录失败不阻断主流程
      console.error('访问记录失败:', error);
    }
  };
}

export default visitLogger;
