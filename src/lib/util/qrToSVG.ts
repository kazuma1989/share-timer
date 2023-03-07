import { wrap } from "comlink"
import type { qrToSVG as qrToSVGType } from "./qrToSVG.worker"
import QRToSVGWorker from "./qrToSVG.worker?worker&inline"

export const qrToSVG = wrap<typeof qrToSVGType>(new QRToSVGWorker())
