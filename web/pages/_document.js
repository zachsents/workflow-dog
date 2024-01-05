import { additionalCSSVariables } from "@web/theme"
import { Head, Html, Main, NextScript } from "next/document"
import siteInfo from "@web/site-info.json"


export default function Document() {

    return (
        <Html lang="en">
            <Head>
                {/* Setup */}
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

                {/* Meta Description */}
                <meta
                    name="description"
                    content={siteInfo.description}
                    key="description"
                />

                {/* Favicon & other icons */}
                <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
                <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
                <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
                <link rel="manifest" href="/assets/site.webmanifest" />

                {/* OpenGraph */}
                <meta
                    property="og:title"
                    content={siteInfo.name}
                    key="ogtitle"
                />
                <meta
                    property="og:description"
                    content={siteInfo.description}
                    key="ogdescription"
                />
                <meta property="og:image" content="/assets/og.png" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={siteInfo.name} />
                <meta name="twitter:creator" content="@Zach_Sents" />
                <meta name="twitter:image" content="/assets/og.png" />
                <meta name="twitter:description" content={siteInfo.description} />

                {/* Assets */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=JetBrains+Mono:wght@300;400;500;600&family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />

                {/* Global Styles */}
                <style>
                    {`html { ${additionalCSSVariables} }`}
                </style>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}