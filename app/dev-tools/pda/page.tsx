import { permanentRedirect } from 'next/navigation'

export default function PDAPage(): never {
	permanentRedirect('/dev-tools/pda-brute-force')
}
