import type { Metadata } from "next";
import { PageHero } from "@/components/site";
import { MediaGallery } from "@/components/public/media-gallery";
import { mediaService } from "@/Services/media.service";
import { voiceService } from "@/Services/voice.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Media",
  description: "Photos, videos, publications and voices of support from ICAADA's community action against drug abuse.",
};

export default async function Media() {
  const [items, voices] = await Promise.all([
    mediaService.listPublished(),
    voiceService.listPublished(),
  ]);
  return (
    <>
      <PageHero
        eyebrow="Media"
        title="People. Community. Action. Hope."
        description="A media experience designed to communicate community mobilisation, youth engagement, learning, advocacy, research and locally led action without making drug-use imagery the visual identity of ICAADA."
      />
      <section className="section-pad">
        <div className="container-wide">
          <MediaGallery items={items} voices={voices} />
        </div>
      </section>
    </>
  );
}
