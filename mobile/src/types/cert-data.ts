export type CertData = {
    certType: string,
    holderName: string,
    certifier: string,
    verificationState: 'self-declared' | 'unverified' | 'verified'
    serialNumber: string
}