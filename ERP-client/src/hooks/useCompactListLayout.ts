import useMediaQuery from '@mui/material/useMediaQuery'
import { COMPACT_LIST_MAX_WIDTH_PX } from '../lib/listBreakpoints'

export function useCompactListLayout(): boolean {
  return useMediaQuery(`(max-width:${COMPACT_LIST_MAX_WIDTH_PX}px)`, { noSsr: true })
}
