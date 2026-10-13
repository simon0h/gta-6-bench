import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
// Original vector forms; exact fit, material and contents are specified in each PDP.
const forms={
 'dual-screen':'<rect x="49" y="25" width="162" height="99" rx="10"/><rect x="44" y="130" width="172" height="95" rx="10"/><rect x="77" y="39" width="106" height="72"/><rect x="80" y="142" width="100" height="70"/><path d="M61 157v31M47 172h28"/><circle cx="198" cy="164" r="4"/><circle cx="198" cy="184" r="4"/>',
 arcade:'<path d="M33 110h194l18 81H15z"/><path d="M62 144V77"/><circle cx="62" cy="64" r="21"/><circle cx="132" cy="136" r="11"/><circle cx="167" cy="127" r="11"/><circle cx="204" cy="134" r="11"/><circle cx="149" cy="171" r="11"/><circle cx="187" cy="170" r="11"/>',
 joystick:'<path d="M31 177h198v38H31zM102 175l-12-80q0-31 31-31h37l-4 46-16 66z"/><rect x="117" y="68" width="30" height="17" rx="5"/>',
 throttle:'<path d="M37 155h186v60H37zM77 155V74h25v81M156 155V74h25v81"/><rect x="56" y="51" width="65" height="34" rx="8"/><rect x="137" y="51" width="65" height="34" rx="8"/>',
 yoke:'<path d="M40 50v80h180V50M40 90h45v40M220 90h-45v40M118 130v52h24v-52M82 182h96v33H82z"/>',
 keypad:'<rect x="65" y="40" width="130" height="175" rx="9"/><path d="M80 70h100M80 105h100M80 140h100M80 175h100M110 55v135M145 55v135"/>',
 earphones:'<path d="M76 70v80q0 55 50 55t50-55V70" fill="none"/><path d="M52 45h45v40H52zM165 45h45v40h-45z"/>',
 handheld:'<rect x="21" y="65" width="218" height="130" rx="20"/><rect x="65" y="80" width="130" height="100"/><path d="M42 108v30M27 123h30"/><circle cx="217" cy="112" r="5"/><circle cx="217" cy="140" r="5"/>',
 console:'<rect x="53" y="33" width="154" height="165" rx="12"/><path d="M65 65h130M65 80h90M65 164h130"/><circle cx="181" cy="181" r="6"/>',
 case:'<rect x="28" y="63" width="204" height="131" rx="18"/><path d="M95 63V43h70v20M44 82h172v93H44z"/>',
 stand:'<path d="M44 192h172l-32-17H88l63-114-24-13-72 127z"/>',
 cover:'<path d="M45 53h170l18 145H27z"/><path d="M59 68h142M64 83h132M57 53l-5 132M203 53l5 132"/>',
 controller:'<path d="M75 70h110q32 0 44 94q3 38-36 12l-29-25H96l-29 25q-39 26-36-12q12-94 44-94z"/><path d="M76 93v36M58 111h36"/><circle cx="178" cy="99" r="5"/><circle cx="194" cy="116" r="5"/><circle cx="163" cy="116" r="5"/><circle cx="178" cy="132" r="5"/><circle cx="105" cy="141" r="12"/><circle cx="143" cy="141" r="12"/>',
 headphones:'<path d="M54 145V101a76 76 0 0 1 152 0v44"/><rect x="36" y="115" width="40" height="75" rx="15"/><rect x="184" y="115" width="40" height="75" rx="15"/><path d="M204 181q-13 35-60 23"/>',
 keyboard:'<rect x="21" y="69" width="218" height="122" rx="9"/><path d="M32 90h196M32 113h196M32 136h196M42 158h172M50 81v68M80 81v68M110 81v68M140 81v68M170 81v68M200 81v68"/>',
 mouse:'<path d="M83 102q0-70 47-70t47 70v65q0 48-47 48t-47-48z"/><path d="M130 33v76M84 109h92"/><rect x="124" y="60" width="12" height="24" rx="5"/>',
 speakers:'<rect x="28" y="45" width="85" height="155" rx="8"/><rect x="147" y="45" width="85" height="155" rx="8"/><circle cx="70" cy="140" r="27"/><circle cx="189" cy="140" r="27"/><circle cx="70" cy="78" r="12"/><circle cx="189" cy="78" r="12"/>',
 ssd:'<rect x="45" y="65" width="170" height="125" rx="12"/><path d="M62 79h137M65 167h65M185 169h13"/><rect x="77" y="95" width="105" height="52" rx="4"/>',
 cable:'<path d="M69 69c123-39 146 131 31 128-102-3-83-134-10-99s15 80 51 72" fill="none" stroke-width="12"/><rect x="42" y="47" width="41" height="30" rx="4"/><rect x="134" y="154" width="39" height="26" rx="4"/>',
 desk:'<path d="M25 80h210v83H25zM25 163l17 31h176l17-31M46 101h168M46 139h168"/>',
}
const dir=fileURLToPath(new URL('./public/catalog500/',import.meta.url));mkdirSync(dir,{recursive:true})
for(const [name,shape] of Object.entries(forms)){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" role="img"><title>${name} product-form illustration</title><rect width="260" height="260" fill="#f6f6f4"/><g fill="#dce1e3" stroke="#3c4851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${shape}</g><text x="130" y="240" font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="#65717a">Illustration · see product specifications</text></svg>`
 writeFileSync(`${dir}${name}.svg`,svg+'\n')
}
