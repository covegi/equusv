import { PushDrop } from '@bsv/sdk'
import type { CreateActionResult, WalletInterface } from '@bsv/sdk'
import { Horse } from "@/types/horse"

export const createHorseToken = async (horse: Horse, uhrpUrl: string | null, wallet: WalletInterface): Promise<CreateActionResult> => {
    const pushdrop = new PushDrop(wallet)

    const VERSION = '1'

    const fields = [
        VERSION,
        horse.name,
        horse.breed,
        horse.birthDate,
        horse.sex,
        horse.color,
        horse.ueln,
        horse.chip,
        horse.owner,
        horse.location,
        horse.organisation,
        horse.issuedDate,
        horse.foodChainStatus,
        uhrpUrl ?? ''
    ].map(field => Array.from(Buffer.from(field ?? '', 'utf-8')))

    const lockingScript = await pushdrop.lock(
        fields,
        [2, 'equusv horse journal'],
        horse.ueln!,
        'self',
        true,
    )

    const result = await wallet.createAction({
        description: 'Create horse journal',
        outputs: [
            {
                lockingScript: lockingScript.toHex(),
                satoshis: 10,
                outputDescription: `Horse journal for ${horse.name}`,
                basket: 'My Horses',
                customInstructions: JSON.stringify({ type: 'horse-journal' })
            }
        ]
    })

    return result
}