import type { NextConfig } from "next";

// Must match CLOUDINARY_CLOUD_NAME: the API only accepts media URLs on this
// cloud (src/Schemas/common.schema.ts → cloudinaryUrl), and next/image only
// serves this path.
const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME || 'dcvyjmflf';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: `/${cloudinaryCloud}/**`,
      },
    ],
  },
};

export default nextConfig;
