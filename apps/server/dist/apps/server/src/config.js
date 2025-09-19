import 'dotenv/config';
function required(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env: ${name}`);
    return v;
}
export const config = {
    port: Number(process.env.PORT || 3001),
    dbUrl: required('DATABASE_URL'),
    jwtSecret: required('JWT_SECRET'),
};
//# sourceMappingURL=config.js.map