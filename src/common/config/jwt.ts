export const JWTAccessOptions = {
    secret: process.env.ACCESS_SECRET_KEY,
    expiresIn: '1h' as const,
};

export const JWTRefreshOptions = {
    secret: process.env.REFRESH_SECRET_KEY,
    expiresIn: '7d' as const,
};
