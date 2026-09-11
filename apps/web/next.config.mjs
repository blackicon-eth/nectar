/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@nectar/config",
    "@nectar/domain",
    "@nectar/arkiv",
    "@nectar/swarm",
    "@nectar/db",
  ],
};

export default nextConfig;
