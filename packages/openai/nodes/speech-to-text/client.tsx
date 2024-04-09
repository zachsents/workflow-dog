import { createClientNodeDefinition } from "@pkg/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbRobot } from "react-icons/tb"
import shared from "./shared"


const languages = [
    {
        "label": "Abkhazian",
        "code": "ab"
    },
    {
        "label": "Afar",
        "code": "aa"
    },
    {
        "label": "Afrikaans",
        "code": "af"
    },
    {
        "label": "Akan",
        "code": "ak"
    },
    {
        "label": "Albanian",
        "code": "sq"
    },
    {
        "label": "Amharic",
        "code": "am"
    },
    {
        "label": "Arabic",
        "code": "ar"
    },
    {
        "label": "Aragonese",
        "code": "an"
    },
    {
        "label": "Armenian",
        "code": "hy"
    },
    {
        "label": "Assamese",
        "code": "as"
    },
    {
        "label": "Avaric",
        "code": "av"
    },
    {
        "label": "Avestan",
        "code": "ae"
    },
    {
        "label": "Aymara",
        "code": "ay"
    },
    {
        "label": "Azerbaijani",
        "code": "az"
    },
    {
        "label": "Bambara",
        "code": "bm"
    },
    {
        "label": "Bashkir",
        "code": "ba"
    },
    {
        "label": "Basque",
        "code": "eu"
    },
    {
        "label": "Belarusian",
        "code": "be"
    },
    {
        "label": "Bengali",
        "code": "bn"
    },
    {
        "label": "Bislama",
        "code": "bi"
    },
    {
        "label": "Bosnian",
        "code": "bs"
    },
    {
        "label": "Breton",
        "code": "br"
    },
    {
        "label": "Bulgarian",
        "code": "bg"
    },
    {
        "label": "Burmese",
        "code": "my"
    },
    {
        "label": "Catalan, Valencian",
        "code": "ca"
    },
    {
        "label": "Chamorro",
        "code": "ch"
    },
    {
        "label": "Chechen",
        "code": "ce"
    },
    {
        "label": "Chichewa, Chewa, Nyanja",
        "code": "ny"
    },
    {
        "label": "Chinese",
        "code": "zh"
    },
    {
        "label": "Church Slavonic, Old Slavonic, Old Church Slavonic",
        "code": "cu"
    },
    {
        "label": "Chuvash",
        "code": "cv"
    },
    {
        "label": "Cornish",
        "code": "kw"
    },
    {
        "label": "Corsican",
        "code": "co"
    },
    {
        "label": "Cree",
        "code": "cr"
    },
    {
        "label": "Croatian",
        "code": "hr"
    },
    {
        "label": "Czech",
        "code": "cs"
    },
    {
        "label": "Danish",
        "code": "da"
    },
    {
        "label": "Divehi, Dhivehi, Maldivian",
        "code": "dv"
    },
    {
        "label": "Dutch, Flemish",
        "code": "nl"
    },
    {
        "label": "Dzongkha",
        "code": "dz"
    },
    {
        "label": "English",
        "code": "en"
    },
    {
        "label": "Esperanto",
        "code": "eo"
    },
    {
        "label": "Estonian",
        "code": "et"
    },
    {
        "label": "Ewe",
        "code": "ee"
    },
    {
        "label": "Faroese",
        "code": "fo"
    },
    {
        "label": "Fijian",
        "code": "fj"
    },
    {
        "label": "Finnish",
        "code": "fi"
    },
    {
        "label": "French",
        "code": "fr"
    },
    {
        "label": "Western Frisian",
        "code": "fy"
    },
    {
        "label": "Fulah",
        "code": "ff"
    },
    {
        "label": "Gaelic, Scottish Gaelic",
        "code": "gd"
    },
    {
        "label": "Galician",
        "code": "gl"
    },
    {
        "label": "Ganda",
        "code": "lg"
    },
    {
        "label": "Georgian",
        "code": "ka"
    },
    {
        "label": "German",
        "code": "de"
    },
    {
        "label": "Greek, Modern (1453–)",
        "code": "el"
    },
    {
        "label": "Kalaallisut, Greenlandic",
        "code": "kl"
    },
    {
        "label": "Guarani",
        "code": "gn"
    },
    {
        "label": "Gujarati",
        "code": "gu"
    },
    {
        "label": "Haitian, Haitian Creole",
        "code": "ht"
    },
    {
        "label": "Hausa",
        "code": "ha"
    },
    {
        "label": "Hebrew",
        "code": "he"
    },
    {
        "label": "Herero",
        "code": "hz"
    },
    {
        "label": "Hindi",
        "code": "hi"
    },
    {
        "label": "Hiri Motu",
        "code": "ho"
    },
    {
        "label": "Hungarian",
        "code": "hu"
    },
    {
        "label": "Icelandic",
        "code": "is"
    },
    {
        "label": "Ido",
        "code": "io"
    },
    {
        "label": "Igbo",
        "code": "ig"
    },
    {
        "label": "Indonesian",
        "code": "id"
    },
    {
        "label": "Interlingua (International Auxiliary Language Association)",
        "code": "ia"
    },
    {
        "label": "Interlingue, Occidental",
        "code": "ie"
    },
    {
        "label": "Inuktitut",
        "code": "iu"
    },
    {
        "label": "Inupiaq",
        "code": "ik"
    },
    {
        "label": "Irish",
        "code": "ga"
    },
    {
        "label": "Italian",
        "code": "it"
    },
    {
        "label": "Japanese",
        "code": "ja"
    },
    {
        "label": "Javanese",
        "code": "jv"
    },
    {
        "label": "Kannada",
        "code": "kn"
    },
    {
        "label": "Kanuri",
        "code": "kr"
    },
    {
        "label": "Kashmiri",
        "code": "ks"
    },
    {
        "label": "Kazakh",
        "code": "kk"
    },
    {
        "label": "Central Khmer",
        "code": "km"
    },
    {
        "label": "Kikuyu, Gikuyu",
        "code": "ki"
    },
    {
        "label": "Kinyarwanda",
        "code": "rw"
    },
    {
        "label": "Kirghiz, Kyrgyz",
        "code": "ky"
    },
    {
        "label": "Komi",
        "code": "kv"
    },
    {
        "label": "Kongo",
        "code": "kg"
    },
    {
        "label": "Korean",
        "code": "ko"
    },
    {
        "label": "Kuanyama, Kwanyama",
        "code": "kj"
    },
    {
        "label": "Kurdish",
        "code": "ku"
    },
    {
        "label": "Lao",
        "code": "lo"
    },
    {
        "label": "Latin",
        "code": "la"
    },
    {
        "label": "Latvian",
        "code": "lv"
    },
    {
        "label": "Limburgan, Limburger, Limburgish",
        "code": "li"
    },
    {
        "label": "Lingala",
        "code": "ln"
    },
    {
        "label": "Lithuanian",
        "code": "lt"
    },
    {
        "label": "Luba-Katanga",
        "code": "lu"
    },
    {
        "label": "Luxembourgish, Letzeburgesch",
        "code": "lb"
    },
    {
        "label": "Macedonian",
        "code": "mk"
    },
    {
        "label": "Malagasy",
        "code": "mg"
    },
    {
        "label": "Malay",
        "code": "ms"
    },
    {
        "label": "Malayalam",
        "code": "ml"
    },
    {
        "label": "Maltese",
        "code": "mt"
    },
    {
        "label": "Manx",
        "code": "gv"
    },
    {
        "label": "Maori",
        "code": "mi"
    },
    {
        "label": "Marathi",
        "code": "mr"
    },
    {
        "label": "Marshallese",
        "code": "mh"
    },
    {
        "label": "Mongolian",
        "code": "mn"
    },
    {
        "label": "Nauru",
        "code": "na"
    },
    {
        "label": "Navajo, Navaho",
        "code": "nv"
    },
    {
        "label": "North Ndebele",
        "code": "nd"
    },
    {
        "label": "South Ndebele",
        "code": "nr"
    },
    {
        "label": "Ndonga",
        "code": "ng"
    },
    {
        "label": "Nepali",
        "code": "ne"
    },
    {
        "label": "Norwegian",
        "code": "no"
    },
    {
        "label": "Norwegian Bokmål",
        "code": "nb"
    },
    {
        "label": "Norwegian Nynorsk",
        "code": "nn"
    },
    {
        "label": "Sichuan Yi, Nuosu",
        "code": "ii"
    },
    {
        "label": "Occitan",
        "code": "oc"
    },
    {
        "label": "Ojibwa",
        "code": "oj"
    },
    {
        "label": "Oriya",
        "code": "or"
    },
    {
        "label": "Oromo",
        "code": "om"
    },
    {
        "label": "Ossetian, Ossetic",
        "code": "os"
    },
    {
        "label": "Pali",
        "code": "pi"
    },
    {
        "label": "Pashto, Pushto",
        "code": "ps"
    },
    {
        "label": "Persian",
        "code": "fa"
    },
    {
        "label": "Polish",
        "code": "pl"
    },
    {
        "label": "Portuguese",
        "code": "pt"
    },
    {
        "label": "Punjabi, Panjabi",
        "code": "pa"
    },
    {
        "label": "Quechua",
        "code": "qu"
    },
    {
        "label": "Romanian, Moldavian, Moldovan",
        "code": "ro"
    },
    {
        "label": "Romansh",
        "code": "rm"
    },
    {
        "label": "Rundi",
        "code": "rn"
    },
    {
        "label": "Russian",
        "code": "ru"
    },
    {
        "label": "Northern Sami",
        "code": "se"
    },
    {
        "label": "Samoan",
        "code": "sm"
    },
    {
        "label": "Sango",
        "code": "sg"
    },
    {
        "label": "Sanskrit",
        "code": "sa"
    },
    {
        "label": "Sardinian",
        "code": "sc"
    },
    {
        "label": "Serbian",
        "code": "sr"
    },
    {
        "label": "Shona",
        "code": "sn"
    },
    {
        "label": "Sindhi",
        "code": "sd"
    },
    {
        "label": "Sinhala, Sinhalese",
        "code": "si"
    },
    {
        "label": "Slovak",
        "code": "sk"
    },
    {
        "label": "Slovenian",
        "code": "sl"
    },
    {
        "label": "Somali",
        "code": "so"
    },
    {
        "label": "Southern Sotho",
        "code": "st"
    },
    {
        "label": "Spanish, Castilian",
        "code": "es"
    },
    {
        "label": "Sundanese",
        "code": "su"
    },
    {
        "label": "Swahili",
        "code": "sw"
    },
    {
        "label": "Swati",
        "code": "ss"
    },
    {
        "label": "Swedish",
        "code": "sv"
    },
    {
        "label": "Tagalog",
        "code": "tl"
    },
    {
        "label": "Tahitian",
        "code": "ty"
    },
    {
        "label": "Tajik",
        "code": "tg"
    },
    {
        "label": "Tamil",
        "code": "ta"
    },
    {
        "label": "Tatar",
        "code": "tt"
    },
    {
        "label": "Telugu",
        "code": "te"
    },
    {
        "label": "Thai",
        "code": "th"
    },
    {
        "label": "Tibetan",
        "code": "bo"
    },
    {
        "label": "Tigrinya",
        "code": "ti"
    },
    {
        "label": "Tonga (Tonga Islands)",
        "code": "to"
    },
    {
        "label": "Tsonga",
        "code": "ts"
    },
    {
        "label": "Tswana",
        "code": "tn"
    },
    {
        "label": "Turkish",
        "code": "tr"
    },
    {
        "label": "Turkmen",
        "code": "tk"
    },
    {
        "label": "Twi",
        "code": "tw"
    },
    {
        "label": "Uighur, Uyghur",
        "code": "ug"
    },
    {
        "label": "Ukrainian",
        "code": "uk"
    },
    {
        "label": "Urdu",
        "code": "ur"
    },
    {
        "label": "Uzbek",
        "code": "uz"
    },
    {
        "label": "Venda",
        "code": "ve"
    },
    {
        "label": "Vietnamese",
        "code": "vi"
    },
    {
        "label": "Volapük",
        "code": "vo"
    },
    {
        "label": "Walloon",
        "code": "wa"
    },
    {
        "label": "Welsh",
        "code": "cy"
    },
    {
        "label": "Wolof",
        "code": "wo"
    },
    {
        "label": "Xhosa",
        "code": "xh"
    },
    {
        "label": "Yiddish",
        "code": "yi"
    },
    {
        "label": "Yoruba",
        "code": "yo"
    },
    {
        "label": "Zhuang, Chuang",
        "code": "za"
    },
    {
        "label": "Zulu",
        "code": "zu"
    }
]


export default createClientNodeDefinition(shared, {
    icon: TbRobot,
    color: "#000000",
    tags: ["ChatGPT", "OpenAI", "AI", "Whisper"],
    inputs: {
        audio: {},
    },
    outputs: {
        transcription: {},
    },
    renderBody: () => {
        const [language, setLanguage] = useNodeProperty(undefined, "data.state.language")
        return (
            <div className="mt-1 self-stretch">
                <p className="text-xs font-medium text-left">Language</p>
                <Select onValueChange={setLanguage} defaultValue={language || "en"}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pick one..." />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang =>
                            <SelectItem value={lang.code} key={lang.code}>
                                {lang.label}
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
        )
    },
})


