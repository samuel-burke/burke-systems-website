// Extra shapes for the logo carve, the same draw-in samuelburke.dev uses. Built on MARK_PATH; the mark itself is untouched.
import { MARK_PATH } from "./mark-path";

// MARK_PATH is the B's outline followed by the S cut out of it (even-odd fill).
const outlineEnd = MARK_PATH.indexOf("Z") + 1;
const OUTLINE = MARK_PATH.slice(0, outlineEnd);
export const S_CUT = MARK_PATH.slice(outlineEnd);

// The B with only its two holes cut (the S's round ends).
export const B_HOLES =
  OUTLINE +
  "M213.452,158.848L272.098,158.848A21.652,21.652 0 0 1 272.098,202.152L213.452,202.152A21.652,21.652 0 0 1 213.452,158.848Z" +
  "M213.452,300.848L292.548,300.848A21.652,21.652 0 0 1 292.548,344.152L213.452,344.152A21.652,21.652 0 0 1 213.452,300.848Z";

// A centerline along the S from the top hole to the bottom one. Stroked thick and clipped to S_CUT, it carves the S.
export const S_SPINE =
  "M210,190C209.5,215 211,236 232.8,250.5L255.4,262.3C272,273.5 280,287 280,312";
