import _ from "lodash"

import sharedDataTypesBasicString from "./basic/data-types/string/shared"
import webDataTypesBasicString from "./basic/data-types/string/web"
import sharedDataTypesBasicBoolean from "./basic/data-types/boolean/shared"
import webDataTypesBasicBoolean from "./basic/data-types/boolean/web"
import sharedDataTypesBasicAny from "./basic/data-types/any/shared"
import webDataTypesBasicAny from "./basic/data-types/any/web"
import sharedDataTypesBasicObject from "./basic/data-types/object/shared"
import webDataTypesBasicObject from "./basic/data-types/object/web"
import sharedDataTypesBasicNumber from "./basic/data-types/number/shared"
import webDataTypesBasicNumber from "./basic/data-types/number/web"

export const webDataTypes = {
    "https://data-types.workflow.dog/basic/string": _.merge({}, sharedDataTypesBasicString, webDataTypesBasicString, { id: "https://data-types.workflow.dog/basic/string" }),
    "https://data-types.workflow.dog/basic/boolean": _.merge({}, sharedDataTypesBasicBoolean, webDataTypesBasicBoolean, { id: "https://data-types.workflow.dog/basic/boolean" }),
    "https://data-types.workflow.dog/basic/any": _.merge({}, sharedDataTypesBasicAny, webDataTypesBasicAny, { id: "https://data-types.workflow.dog/basic/any" }),
    "https://data-types.workflow.dog/basic/object": _.merge({}, sharedDataTypesBasicObject, webDataTypesBasicObject, { id: "https://data-types.workflow.dog/basic/object" }),
    "https://data-types.workflow.dog/basic/number": _.merge({}, sharedDataTypesBasicNumber, webDataTypesBasicNumber, { id: "https://data-types.workflow.dog/basic/number" }),
}