export namespace gmail_v1 {
    export interface Schema$AutoForwarding {
        disposition?: string | null
        emailAddress?: string | null
        enabled?: boolean | null
    }

    export interface Schema$BatchDeleteMessagesRequest {
        ids?: string[] | null
    }

    export interface Schema$BatchModifyMessagesRequest {
        addLabelIds?: string[] | null
        ids?: string[] | null
        removeLabelIds?: string[] | null
    }

    export interface Schema$CseIdentity {
        emailAddress?: string | null
        primaryKeyPairId?: string | null
        signAndEncryptKeyPairs?: Schema$SignAndEncryptKeyPairs
    }

    export interface Schema$CseKeyPair {
        disableTime?: string | null
        enablementState?: string | null
        keyPairId?: string | null
        pem?: string | null
        pkcs7?: string | null
        privateKeyMetadata?: Schema$CsePrivateKeyMetadata[]
        subjectEmailAddresses?: string[] | null
    }

    export interface Schema$CsePrivateKeyMetadata {
        hardwareKeyMetadata?: Schema$HardwareKeyMetadata
        kaclsKeyMetadata?: Schema$KaclsKeyMetadata
        privateKeyMetadataId?: string | null
    }

    export interface Schema$Delegate {
        delegateEmail?: string | null
        verificationStatus?: string | null
    }

    export interface Schema$DisableCseKeyPairRequest { }

    export interface Schema$Draft {
        id?: string | null
        message?: Schema$Message
    }

    export interface Schema$EnableCseKeyPairRequest { }

    export interface Schema$Filter {
        action?: Schema$FilterAction
        criteria?: Schema$FilterCriteria
        id?: string | null
    }

    export interface Schema$FilterAction {
        addLabelIds?: string[] | null
        forward?: string | null
        removeLabelIds?: string[] | null
    }

    export interface Schema$FilterCriteria {
        excludeChats?: boolean | null
        from?: string | null
        hasAttachment?: boolean | null
        negatedQuery?: string | null
        query?: string | null
        size?: number | null
        sizeComparison?: string | null
        subject?: string | null
        to?: string | null
    }

    export interface Schema$ForwardingAddress {
        forwardingEmail?: string | null
        verificationStatus?: string | null
    }

    export interface Schema$HardwareKeyMetadata {
        description?: string | null
    }

    export interface Schema$History {
        id?: string | null
        labelsAdded?: Schema$HistoryLabelAdded[]
        labelsRemoved?: Schema$HistoryLabelRemoved[]
        messages?: Schema$Message[]
        messagesAdded?: Schema$HistoryMessageAdded[]
        messagesDeleted?: Schema$HistoryMessageDeleted[]
    }

    export interface Schema$HistoryLabelAdded {
        labelIds?: string[] | null
        message?: Schema$Message
    }

    export interface Schema$HistoryLabelRemoved {
        labelIds?: string[] | null
        message?: Schema$Message
    }

    export interface Schema$HistoryMessageAdded {
        message?: Schema$Message
    }

    export interface Schema$HistoryMessageDeleted {
        message?: Schema$Message
    }

    export interface Schema$ImapSettings {
        autoExpunge?: boolean | null
        enabled?: boolean | null
        expungeBehavior?: string | null
        maxFolderSize?: number | null
    }

    export interface Schema$KaclsKeyMetadata {
        kaclsData?: string | null
        kaclsUri?: string | null
    }

    export interface Schema$Label {
        color?: Schema$LabelColor
        id?: string | null
        labelListVisibility?: string | null
        messageListVisibility?: string | null
        messagesTotal?: number | null
        messagesUnread?: number | null
        name?: string | null
        threadsTotal?: number | null
        threadsUnread?: number | null
        type?: string | null
    }

    export interface Schema$LabelColor {
        backgroundColor?: string | null
        textColor?: string | null
    }

    export interface Schema$LanguageSettings {
        displayLanguage?: string | null
    }

    export interface Schema$ListCseIdentitiesResponse {
        cseIdentities?: Schema$CseIdentity[]
        nextPageToken?: string | null
    }

    export interface Schema$ListCseKeyPairsResponse {
        cseKeyPairs?: Schema$CseKeyPair[]
        nextPageToken?: string | null
    }

    export interface Schema$ListDelegatesResponse {
        delegates?: Schema$Delegate[]
    }

    export interface Schema$ListDraftsResponse {
        drafts?: Schema$Draft[]
        nextPageToken?: string | null
        resultSizeEstimate?: number | null
    }

    export interface Schema$ListFiltersResponse {
        filter?: Schema$Filter[]
    }

    export interface Schema$ListForwardingAddressesResponse {
        forwardingAddresses?: Schema$ForwardingAddress[]
    }

    export interface Schema$ListHistoryResponse {
        history?: Schema$History[]
        historyId?: string | null
        nextPageToken?: string | null
    }

    export interface Schema$ListLabelsResponse {
        labels?: Schema$Label[]
    }

    export interface Schema$ListMessagesResponse {
        messages?: Schema$Message[]
        nextPageToken?: string | null
        resultSizeEstimate?: number | null
    }

    export interface Schema$ListSendAsResponse {
        sendAs?: Schema$SendAs[]
    }

    export interface Schema$ListSmimeInfoResponse {
        smimeInfo?: Schema$SmimeInfo[]
    }

    export interface Schema$ListThreadsResponse {
        nextPageToken?: string | null
        resultSizeEstimate?: number | null
        threads?: Schema$Thread[]
    }

    export interface Schema$Message {
        historyId?: string | null
        id?: string | null
        internalDate?: string | null
        labelIds?: string[] | null
        payload?: Schema$MessagePart
        raw?: string | null
        sizeEstimate?: number | null
        snippet?: string | null
        threadId?: string | null
    }

    export interface Schema$MessagePart {
        body?: Schema$MessagePartBody
        filename?: string | null
        headers?: Schema$MessagePartHeader[]
        mimeType?: string | null
        partId?: string | null
        parts?: Schema$MessagePart[]
    }

    export interface Schema$MessagePartBody {
        attachmentId?: string | null
        data?: string | null
        size?: number | null
    }

    export interface Schema$MessagePartHeader {
        name?: string | null
        value?: string | null
    }

    export interface Schema$ModifyMessageRequest {
        addLabelIds?: string[] | null
        removeLabelIds?: string[] | null
    }

    export interface Schema$ModifyThreadRequest {
        addLabelIds?: string[] | null
        removeLabelIds?: string[] | null
    }

    export interface Schema$ObliterateCseKeyPairRequest { }

    export interface Schema$PopSettings {
        accessWindow?: string | null
        disposition?: string | null
    }

    export interface Schema$Profile {
        emailAddress?: string | null
        historyId?: string | null
        messagesTotal?: number | null
        threadsTotal?: number | null
    }

    export interface Schema$SendAs {
        displayName?: string | null
        isDefault?: boolean | null
        isPrimary?: boolean | null
        replyToAddress?: string | null
        sendAsEmail?: string | null
        signature?: string | null
        smtpMsa?: Schema$SmtpMsa
        treatAsAlias?: boolean | null
        verificationStatus?: string | null
    }

    export interface Schema$SignAndEncryptKeyPairs {
        encryptionKeyPairId?: string | null
        signingKeyPairId?: string | null
    }

    export interface Schema$SmimeInfo {
        encryptedKeyPassword?: string | null
        expiration?: string | null
        id?: string | null
        isDefault?: boolean | null
        issuerCn?: string | null
        pem?: string | null
        pkcs12?: string | null
    }

    export interface Schema$SmtpMsa {
        host?: string | null
        password?: string | null
        port?: number | null
        securityMode?: string | null
        username?: string | null
    }

    export interface Schema$Thread {
        historyId?: string | null
        id?: string | null
        messages?: Schema$Message[]
        snippet?: string | null
    }

    export interface Schema$VacationSettings {
        enableAutoReply?: boolean | null
        endTime?: string | null
        responseBodyHtml?: string | null
        responseBodyPlainText?: string | null
        responseSubject?: string | null
        restrictToContacts?: boolean | null
        restrictToDomain?: boolean | null
        startTime?: string | null
    }

    export interface Schema$WatchRequest {
        labelFilterAction?: string | null
        labelFilterBehavior?: string | null
        labelIds?: string[] | null
        topicName?: string | null
    }

    export interface Schema$WatchResponse {
        expiration?: string | null
        historyId?: string | null
    }
}