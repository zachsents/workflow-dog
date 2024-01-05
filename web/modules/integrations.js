import { FcGoogle } from "react-icons/fc"
import { TbBrandAirtable, TbBrandDiscordFilled, TbBrandLinkedin, TbBrandStripe, TbBrandXFilled } from "react-icons/tb"
import { INTEGRATION_SERVICE, INTEGRATION_INFO as SHARED_INTEGRATION_INFO } from "shared/integrations"


export const INTEGRATION_INFO = {
    [INTEGRATION_SERVICE.GOOGLE]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.GOOGLE],
        icon: FcGoogle,
        color: "blue",
    },
    [INTEGRATION_SERVICE.LINKEDIN]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.LINKEDIN],
        icon: TbBrandLinkedin,
        color: "blue",
    },
    [INTEGRATION_SERVICE.X]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.X],
        icon: TbBrandXFilled,
        color: "gray",
        shade: 900,
    },
    [INTEGRATION_SERVICE.DISCORD]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.DISCORD],
        icon: TbBrandDiscordFilled,
        color: "violet",
    },
    [INTEGRATION_SERVICE.STRIPE]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.STRIPE],
        icon: TbBrandStripe,
        color: "purple",
    },
    [INTEGRATION_SERVICE.AIRTABLE]: {
        ...SHARED_INTEGRATION_INFO[INTEGRATION_SERVICE.AIRTABLE],
        icon: TbBrandAirtable,
        color: "yellow",
        shade: 400,
    },
}