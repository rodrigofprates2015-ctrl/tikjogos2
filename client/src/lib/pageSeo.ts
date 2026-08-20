type PageSeo = {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
};

export function setPageSeo({ title, description, canonical, keywords }: PageSeo) {
  document.title = title;

  let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!descriptionTag) {
    descriptionTag = document.createElement('meta');
    descriptionTag.name = 'description';
    document.head.appendChild(descriptionTag);
  }
  descriptionTag.content = description;

  let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.rel = 'canonical';
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.href = canonical;

  if (keywords) {
    let keywordsTag = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (!keywordsTag) {
      keywordsTag = document.createElement('meta');
      keywordsTag.name = 'keywords';
      document.head.appendChild(keywordsTag);
    }
    keywordsTag.content = keywords;
  }
}
