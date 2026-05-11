import { permanentRedirect } from 'next/navigation'

export default function IDLPage(): never {
	permanentRedirect('/dev-tools/idl-generator')
}
