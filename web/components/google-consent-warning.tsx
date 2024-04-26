import { Alert } from "./ui/alert"

export default function GoogleConsentWarning({ withWrapper = true }: { withWrapper?: boolean }) {
    const paragraphs = <>
        <p>
            WorkflowDog is a brand new app! We are still adding features, so our Google verification status is constantly changing. If Google warns you (and you feel comfortable), you can ignore it and continue using the app. <b>Your account is not at risk.</b>
        </p>
        <br />
        <p>
            For questions about our security, shoot me an email at <a href="mailto:zach@workflow.dog" className="font-bold hover:underline">zach@workflow.dog</a>.
        </p>
    </>

    return withWrapper ?
        <Alert variant="destructive">
            {paragraphs}
        </Alert>
        : paragraphs
}