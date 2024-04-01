import _ from "lodash"

import sharedDataTypesBasicString from "./basic/data-types/string/shared"
import serverDataTypesBasicString from "./basic/data-types/string/server"
import sharedDataTypesBasicBoolean from "./basic/data-types/boolean/shared"
import serverDataTypesBasicBoolean from "./basic/data-types/boolean/server"
import sharedDataTypesBasicAny from "./basic/data-types/any/shared"
import serverDataTypesBasicAny from "./basic/data-types/any/server"
import sharedDataTypesBasicObject from "./basic/data-types/object/shared"
import serverDataTypesBasicObject from "./basic/data-types/object/server"
import sharedDataTypesBasicNumber from "./basic/data-types/number/shared"
import serverDataTypesBasicNumber from "./basic/data-types/number/server"

export const serverDataTypes = {
    "https://data-types.workflow.dog/basic/string": _.merge({}, sharedDataTypesBasicString, serverDataTypesBasicString, { id: "https://data-types.workflow.dog/basic/string" }),
    "https://data-types.workflow.dog/basic/boolean": _.merge({}, sharedDataTypesBasicBoolean, serverDataTypesBasicBoolean, { id: "https://data-types.workflow.dog/basic/boolean" }),
    "https://data-types.workflow.dog/basic/any": _.merge({}, sharedDataTypesBasicAny, serverDataTypesBasicAny, { id: "https://data-types.workflow.dog/basic/any" }),
    "https://data-types.workflow.dog/basic/object": _.merge({}, sharedDataTypesBasicObject, serverDataTypesBasicObject, { id: "https://data-types.workflow.dog/basic/object" }),
    "https://data-types.workflow.dog/basic/number": _.merge({}, sharedDataTypesBasicNumber, serverDataTypesBasicNumber, { id: "https://data-types.workflow.dog/basic/number" }),
}