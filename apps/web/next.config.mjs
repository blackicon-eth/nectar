/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@nectar/config",
    "@nectar/domain",
    "@nectar/arkiv",
    "@nectar/swarm",
    "@nectar/db",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force the pure-HTTP libsql client so no native binding is bundled.
      // drizzle-orm/libsql imports the default "@libsql/client" (node) entry,
      // which pulls in the native "libsql" package.
      "@libsql/client$": "@libsql/client/web",
      // These are optional native/logger dependencies pulled in by wallet SDKs.
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    config.module.exprContextCritical = false;
    return config;
  },
};

export default nextConfig;
