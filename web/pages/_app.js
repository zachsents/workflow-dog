// import Providers from "@web/components/Providers"
import siteInfo from "@web/site-info.json"
import "@web/styles/globals.css"
import { enableMapSet } from "immer"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import Head from "next/head"


export default function MyApp({ Component, pageProps }) {
    return (<>
        <Head>
            <title key="title">{`${siteInfo.name} | ${siteInfo.description}`}</title>
        </Head>
        {/* <Providers> */}
        {/* This wrapper makes the footer stick to the bottom of the page */}
        {/* <main className="light min-h-screen flex flex-col">
                <Component {...pageProps} />
            </main> */}
        {/* </Providers> */}
    </>)
}


let init = false
if (!init) {
    init = true
    TimeAgo.addDefaultLocale(en)
    enableMapSet()
}

