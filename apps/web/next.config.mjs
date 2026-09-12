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
