const IMAGES_BY_AUDIENCE = {
  foretag: [
    "/images/gbp/gavle-project-housing-living-room.jpg",
    "/images/gbp/gavle-company-housing-kitchen.jpg",
    "/images/gbp/gavle-project-housing-hallway.jpg",
  ],
  husagare: [
    "/images/gbp/gavle-company-housing-exterior.jpg",
    "/images/gbp/gavle-company-housing-kitchen.jpg",
  ],
  bada: [
    "/images/gbp/gavle-corporate-housing-bedroom.jpg",
    "/images/gbp/gavle-project-housing-living-room.jpg",
  ],
};

export function buildArticleGbpPost(topic, today = new Date().toISOString().slice(0, 10)) {
  const audience = IMAGES_BY_AUDIENCE[topic.audience] ? topic.audience : "bada";
  const imagePool = IMAGES_BY_AUDIENCE[audience];
  const imageIndex = [...topic.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % imagePool.length;

  return {
    id: `blog-${topic.slug}`,
    lane: "article",
    publishAfter: today,
    languageCode: "sv-SE",
    summary: `Ny guide: ${topic.titleSv}\n\n${topic.descSv}\n\nVi har samlat det viktigaste för företag och bostadsägare som planerar personalboende, projektboende eller företagsuthyrning. Bilden visar ett exempel på möblerat företagsboende i Gävle.`,
    targetPath: `/blogg/${topic.slug}`,
    image: imagePool[imageIndex],
    imageDescription: "Exempel på möblerat företagsboende i Gävle.",
    callToAction: "LEARN_MORE",
  };
}

export function appendArticleGbpPost(queue, topic, today = new Date().toISOString().slice(0, 10)) {
  if (!Array.isArray(queue.posts)) throw new Error("Invalid GBP post queue");

  const post = buildArticleGbpPost(topic, today);
  if (queue.posts.some((queuedPost) => queuedPost.id === post.id)) {
    return { added: false, post, queue };
  }

  return {
    added: true,
    post,
    queue: {
      ...queue,
      updatedAt: today,
      posts: [...queue.posts, post],
    },
  };
}
