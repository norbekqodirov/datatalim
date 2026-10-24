import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

// Asosiy domen (datatalim_nginx.conf server_name bilan bir xil)
export const SITE_URL = 'https://datatalim.uz';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const LOGO_URL = `${SITE_URL}/apple-touch-icon.png`;

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'course';
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    /** true bo'lsa sahifa qidiruv indeksidan chiqariladi (dublikat / texnik sahifalar uchun) */
    noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description = "Zamonaviy kasblarni biz bilan o'rganing. Dasturlash, Muhandislik, Grafik Dizayn va boshqa dolzarb sohalar.",
    keywords = "IT kurslar, dasturlash o'rganish, IT akademiya, grafik dizayn, python, frontend, data talim",
    image = DEFAULT_OG_IMAGE,
    url,
    type = 'website',
    jsonLd,
    noindex = false,
}) => {
    // index.html'dagi statik (data-seo-static) meta teglar bosh sahifa uchun yozilgan; <SEO> o'z teglarini
    // bergach ular DOM'da ikkilanib qolmasligi uchun olib tashlanadi (Helmet ularni o'zi o'chira olmaydi).
    useEffect(() => {
        document.querySelectorAll('[data-seo-static]').forEach((el) => el.remove());
    }, []);

    // JSON-LD'ni Helmet orqali emas, to'g'ridan-to'g'ri <head>'ga yozamiz: react-helmet-async
    // <script> tegini (ayniqsa kurs ma'lumoti keyin kelganda) ikki marta qo'shib yuborar edi.
    const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';
    useEffect(() => {
        if (!jsonLdText) return;
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.setAttribute('data-seo-jsonld', '');
        el.text = jsonLdText;
        document.head.appendChild(el);
        return () => el.remove();
    }, [jsonLdText]);

    // Sarlavhada brend allaqachon bo'lsa, "… | DATA | DATA Ta'lim Stansiyasi" kabi ikkilanish bo'lmasin
    const fullTitle = /DATA\s+Ta['ʼ’]lim/i.test(title) ? title : `${title} | DATA Ta'lim Stansiyasi`;
    // url berilmasa joriy sahifaning kanonik manzili (query, hash va oxirgi "/" siz) ishlatiladi
    const canonicalUrl =
        url ||
        (typeof window !== 'undefined'
            ? `${SITE_URL}${window.location.pathname.replace(/\/+$/, '') || '/'}`
            : SITE_URL);
    // 'course' Open Graph'da mavjud tur emas, 'website' sifatida beriladi
    const ogType = type === 'course' ? 'website' : type;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />
            <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content="DATA Ta'lim Stansiyasi" />
            <meta property="og:locale" content="uz_UZ" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

        </Helmet>
    );
};

// --- JSON-LD Schema Helpers ---

export function organizationSchema(): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: "DATA Ta'lim Stansiyasi",
        url: SITE_URL,
        logo: LOGO_URL,
        description:
            "Zamonaviy kasblarni biz bilan o'rganing. Dasturlash, Muhandislik, Grafik Dizayn va boshqa dolzarb sohalar.",
        sameAs: [],
    };
}

export function courseSchema(course: {
    name: string;
    description: string;
    provider?: string;
    url?: string;
    image?: string;
    price?: number;
    currency?: string;
}): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.name,
        description: course.description,
        provider: {
            '@type': 'EducationalOrganization',
            name: course.provider || "DATA Ta'lim Stansiyasi",
            url: SITE_URL,
        },
        ...(course.url && { url: course.url }),
        ...(course.image && { image: course.image }),
        ...(course.price != null && {
            offers: {
                '@type': 'Offer',
                price: course.price,
                priceCurrency: course.currency || 'UZS',
                availability: 'https://schema.org/InStock',
            },
        }),
    };
}

export function faqSchema(
    faqs: { question: string; answer: string }[]
): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export function breadcrumbSchema(
    items: { name: string; url: string }[]
): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function articleSchema(post: {
    title: string;
    description: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    authorName?: string;
}): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        url: post.url,
        ...(post.image && { image: post.image }),
        datePublished: post.datePublished,
        dateModified: post.dateModified || post.datePublished,
        author: {
            '@type': 'Person',
            name: post.authorName || "DATA Ta'lim",
        },
        publisher: {
            '@type': 'Organization',
            name: "DATA Ta'lim Stansiyasi",
            logo: {
                '@type': 'ImageObject',
                url: LOGO_URL,
            },
        },
    };
}
