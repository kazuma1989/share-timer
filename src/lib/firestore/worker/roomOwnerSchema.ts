import * as s from "superstruct"

export interface RoomOwner extends s.Infer<typeof roomOwnerSchema> {}

export const roomOwnerSchema = /*@__PURE__*/ (() =>
  s.type({
    owner: s.string(),
  }))()
