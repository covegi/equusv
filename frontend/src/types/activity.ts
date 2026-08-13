export type Verifier = {
    name?: string;
    title: string;
    verified: boolean;
}

export type Activity = {
    category: string,
    name: string,
    description: string,
    creator?: string[],
    verifier: Verifier[] | null,
    fields: string[],
    mandatory: boolean,
    active: boolean
    url?: string | undefined,
    related?: string[] | undefined
}