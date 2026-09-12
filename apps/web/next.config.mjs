/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@nectar/config",
    "@nectar/domain",
    "@nectar/arkiv",
    "@nectar/swarm",
    "@nectar/db",
  ],
  serverExternalPackages: ["@libsql/client", "libsql", "@libsql/isomorphic-ws"],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // These are optional native/logger dependencies pulled in by wallet SDKs.
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    config.module.exprContextCritical = false;

    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals];
      config.externals = [
        ...externals.filter(Boolean),
        ({ request }, callback) => {
          if (
            request === "@libsql/client" ||
            request === "libsql" ||
            request === "@libsql/isomorphic-ws"
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
