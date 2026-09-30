const crypto = require("crypto");

const failedLogins = new Map();
const sessions = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 180;

const requestBuckets = new Map();

function getClientKey(req) {
    return (
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "unknown"
    ).toString();
}

function securityHeaders(req, res, next) {

    res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
    );

    res.setHeader(
        "X-Frame-Options",
        "SAMEORIGIN"
    );

    res.setHeader(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
    );

    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );

    res.setHeader(
        "Cross-Origin-Resource-Policy",
        "same-origin"
    );

    res.setHeader(
        "Cache-Control",
        "no-store"
    );

    next();
}

function rateLimit(req, res, next) {

    const key = getClientKey(req);
    const now = Date.now();

    let bucket = requestBuckets.get(key);

    if (!bucket || now - bucket.startedAt > WINDOW_MS) {
        bucket = {
            startedAt: now,
            count: 0
        };
    }

    bucket.count++;

    requestBuckets.set(key, bucket);

    if (bucket.count > MAX_REQUESTS) {
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        });
    }

    next();
}

function recordFailedLogin(username) {

    const key = String(username || "").toLowerCase();

    const existing = failedLogins.get(key) || {
        count: 0,
        firstAt: Date.now()
    };

    existing.count++;

    failedLogins.set(key, existing);
}

function clearFailedLogin(username) {

    failedLogins.delete(
        String(username || "").toLowerCase()
    );

}

function isLoginBlocked(username) {

    const item = failedLogins.get(
        String(username || "").toLowerCase()
    );

    if (!item) {
        return false;
    }

    if (Date.now() - item.firstAt > WINDOW_MS) {
        failedLogins.delete(
            String(username || "").toLowerCase()
        );
        return false;
    }

    return item.count >= 8;
}

function createSession(user) {

    const sessionId =
        crypto.randomBytes(32).toString("hex");

    sessions.set(sessionId, {
        sessionId,
        userId: user.id,
        hospitalId: user.hospitalId,
        role: user.role,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    });

    return sessionId;
}

function getSession(sessionId) {

    if (!sessionId) {
        return null;
    }

    const session = sessions.get(sessionId);

    if (!session) {
        return null;
    }

    session.lastActivity =
        new Date().toISOString();

    return session;
}

function revokeSession(sessionId) {

    if (sessionId) {
        sessions.delete(sessionId);
    }

}

function getSecurityStats() {

    return {
        activeSessions: sessions.size,
        trackedFailedAccounts: failedLogins.size,
        rateLimitBuckets: requestBuckets.size
    };

}

module.exports = {
    securityHeaders,
    rateLimit,
    recordFailedLogin,
    clearFailedLogin,
    isLoginBlocked,
    createSession,
    getSession,
    revokeSession,
    getSecurityStats
};
